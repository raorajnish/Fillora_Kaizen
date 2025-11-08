from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.conf import settings
from .models import FormSubmission, AIModel, ChatHistory
from .serializers import UserSerializer, FormSubmissionSerializer, AIModelSerializer, ChatHistorySerializer
from .utils import generate_jwt_token, analyze_page_html, analyze_with_llm, get_ai_model_key, call_gemini_api, call_groq_api
import json
from urllib.parse import urlparse

User = get_user_model()


@api_view(['POST'])
@permission_classes([AllowAny])
def social_login(request):
    """Handle Google OAuth login"""
    token = request.data.get('token')
    access_token = request.data.get('access_token')
    user_info = request.data.get('user_info')
    
    # Support both ID token (from web) and access token (from Chrome extension)
    if token:
        # Traditional flow: ID token from Google Sign-In
        try:
            # Verify the token with Google
            idinfo = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID
            )
            
            # Extract user information
            google_id = idinfo.get('sub')
            email = idinfo.get('email')
            name = idinfo.get('name', '')
            picture = idinfo.get('picture', '')
            given_name = idinfo.get('given_name', '')
            family_name = idinfo.get('family_name', '')
            
        except ValueError as e:
            return Response({'error': f'Invalid token: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'Token verification failed: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
    
    elif access_token and user_info:
        # Chrome extension flow: access token + user info
        google_id = user_info.get('id')
        email = user_info.get('email')
        name = user_info.get('name', '')
        picture = user_info.get('picture', '')
        given_name = user_info.get('given_name', '')
        family_name = user_info.get('family_name', '')
        
        # Verify access token is valid by checking if we got user info
        if not email:
            return Response({'error': 'Email not provided by Google'}, status=status.HTTP_400_BAD_REQUEST)
    
    else:
        return Response({'error': 'Token or access_token with user_info is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not email:
        return Response({'error': 'Email not provided by Google'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Get or create user
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email,
                'google_id': google_id,
                'first_name': given_name,
                'last_name': family_name,
                'profile_picture': picture,
            }
        )
        
        # Update user if exists
        if not created:
            if google_id:
                user.google_id = google_id
            if given_name:
                user.first_name = given_name
            if family_name:
                user.last_name = family_name
            if picture:
                user.profile_picture = picture
            user.save()
        
        # Generate JWT token
        jwt_token = generate_jwt_token(user)
        
        # Prepare user data
        user_data = {
            'id': user.id,
            'email': user.email,
            'name': name or f"{user.first_name} {user.last_name}".strip() or user.email,
            'username': user.username,
            'profile_picture': user.profile_picture,
            'preferred_ai_model': user.preferred_ai_model,
        }
        
        return Response({
            'token': jwt_token,
            'user': user_data,
        })
    
    except Exception as e:
        return Response({'error': f'Authentication failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_page(request):
    """Analyze page HTML and return form field mappings (legacy endpoint - uses simple analysis)"""
    html = request.data.get('html')
    url = request.data.get('url')
    
    if not html or not url:
        return Response({'error': 'HTML and URL are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Prepare user data for form filling
    user_data = {
        'email': request.user.email,
        'name': f"{request.user.first_name} {request.user.last_name}".strip() or request.user.email,
        'username': request.user.username,
        'phone': '',  # Add phone field to User model if needed
    }
    
    # Analyze HTML and extract fields
    fields = analyze_page_html(html, user_data)
    
    return Response({
        'url': url,
        'fields': fields,
        'field_count': len(fields),
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_with_ai(request):
    """Analyze page HTML using LLM (Gemini or Groq) with chat history"""
    html = request.data.get('html')
    url = request.data.get('url')
    chat_history = request.data.get('chat_history', [])
    
    if not html or not url:
        return Response({'error': 'HTML and URL are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Get user's preferred model
    model_name = request.user.preferred_ai_model or 'gemini'
    
    # Prepare user data
    user_data = {
        'email': request.user.email,
        'name': f"{request.user.first_name} {request.user.last_name}".strip() or request.user.email,
        'username': request.user.username,
    }
    
    try:
        # Analyze with LLM
        result = analyze_with_llm(html, chat_history, user_data, model_name)
        
        # Save assistant message to chat history
        website = urlparse(url).netloc
        ChatHistory.objects.create(
            user=request.user,
            role='assistant',
            message=result.get('message', 'Analysis complete'),
            website=website,
            url=url,
        )
        
        return Response({
            'url': url,
            'fields': result.get('fields', []),
            'message': result.get('message', ''),
            'model_used': model_name,
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def fill_form(request):
    """Save form filling submission to history"""
    website = request.data.get('website')
    url = request.data.get('url')
    fields = request.data.get('fields', [])
    
    if not website or not url or not fields:
        return Response({'error': 'Website, URL, and fields are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Create form submission record
    submission = FormSubmission.objects.create(
        user=request.user,
        website=website,
        url=url,
        fields={'fields': fields},  # Store as JSON
    )
    
    serializer = FormSubmissionSerializer(submission)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def history(request):
    """Get form filling history for the authenticated user"""
    user_id = request.query_params.get('user_id')
    
    # Ensure user can only access their own history
    if user_id and str(user_id) != str(request.user.id):
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
    
    submissions = FormSubmission.objects.filter(user=request.user)
    
    # Parse fields from JSON
    results = []
    for submission in submissions:
        fields_data = submission.fields.get('fields', []) if isinstance(submission.fields, dict) else []
        results.append({
            'id': submission.id,
            'website': submission.website,
            'url': submission.url,
            'fields': fields_data,
            'created_at': submission.created_at,
        })
    
    return Response({'results': results})


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def model_settings(request):
    """Get or update user's preferred AI model"""
    if request.method == 'GET':
        # Get available models
        models = AIModel.objects.filter(is_active=True)
        serializer = AIModelSerializer(models, many=True)
        return Response({
            'available_models': serializer.data,
            'current_model': request.user.preferred_ai_model,
        })
    
    elif request.method == 'POST':
        # Update user's preferred model
        model_name = request.data.get('model_name')
        if model_name not in ['gemini', 'groq']:
            return Response({'error': 'Invalid model name. Must be "gemini" or "groq"'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Check if model is available
        try:
            ai_model = AIModel.objects.get(model_name=model_name, is_active=True)
        except AIModel.DoesNotExist:
            return Response({'error': f'Model {model_name} is not configured or inactive'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Update user preference
        request.user.preferred_ai_model = model_name
        request.user.save()
        
        return Response({
            'message': f'Model preference updated to {model_name}',
            'current_model': model_name,
        })


@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def chat(request):
    """Handle chat messages and return AI responses"""
    if request.method == 'POST':
        # Save user message
        message = request.data.get('message')
        url = request.data.get('url', '')
        website = urlparse(url).netloc if url else None
        
        if not message:
            return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Save user message to history
        ChatHistory.objects.create(
            user=request.user,
            role='user',
            message=message,
            website=website,
            url=url if url else None,
        )
        
        # Get chat history for context
        recent_chats = ChatHistory.objects.filter(user=request.user).order_by('-created_at')[:20]
        chat_history = [
            {'role': chat.role, 'message': chat.message}
            for chat in reversed(recent_chats)
        ]
        
        # Get user's preferred model
        model_name = request.user.preferred_ai_model or 'gemini'
        api_key = get_ai_model_key(model_name)
        
        if not api_key:
            return Response({'error': f'API key not configured for {model_name}'}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Prepare prompt for general chat
        user_context = f"""
User Information:
- Name: {request.user.first_name} {request.user.last_name}
- Email: {request.user.email}
- Username: {request.user.username}
"""
        
        prompt = f"""You are a helpful AI assistant for a form filling Chrome extension. 
You help users fill forms intelligently and answer questions about form filling.

{user_context}

Recent conversation:
{chr(10).join([f"{msg['role'].capitalize()}: {msg['message']}" for msg in chat_history[-10:]])}

User: {message}
Assistant:"""
        
        try:
            # Call appropriate API
            if model_name == 'gemini':
                response_text = call_gemini_api(prompt, api_key)
            elif model_name == 'groq':
                response_text = call_groq_api(prompt, api_key)
            else:
                response_text = "I'm sorry, I don't understand."
            
            # Save assistant response to history
            ChatHistory.objects.create(
                user=request.user,
                role='assistant',
                message=response_text,
                website=website,
                url=url if url else None,
            )
            
            return Response({
                'message': response_text,
                'model_used': model_name,
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    elif request.method == 'GET':
        # Get chat history
        limit = int(request.query_params.get('limit', 50))
        chats = ChatHistory.objects.filter(user=request.user).order_by('-created_at')[:limit]
        serializer = ChatHistorySerializer(reversed(chats), many=True)
        return Response({'history': serializer.data})

