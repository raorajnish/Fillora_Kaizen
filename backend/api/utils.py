import jwt as pyjwt
from django.conf import settings
from bs4 import BeautifulSoup
import re
import google.generativeai as genai
from groq import Groq
from .models import AIModel
import json


def generate_jwt_token(user):
    """Generate JWT token for user"""
    payload = {
        'user_id': user.id,
        'email': user.email,
    }
    token = pyjwt.encode(payload, settings.JWT_SECRET, algorithm='HS256')
    # In PyJWT 2.0+, encode returns a string, not bytes
    if isinstance(token, bytes):
        token = token.decode('utf-8')
    return token


def get_ai_model_key(model_name):
    """Get API key for specified AI model"""
    try:
        ai_model = AIModel.objects.get(model_name=model_name, is_active=True)
        return ai_model.api_key
    except AIModel.DoesNotExist:
        return None


def call_gemini_api(prompt, api_key):
    """Call Google Gemini API"""
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        raise Exception(f"Gemini API error: {str(e)}")


def call_groq_api(prompt, api_key):
    """Call Groq API"""
    try:
        client = Groq(api_key=api_key)
        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
        )
        return response.choices[0].message.content
    except Exception as e:
        raise Exception(f"Groq API error: {str(e)}")


def analyze_with_llm(html, chat_history, user_data, model_name='gemini'):
    """Analyze page HTML using LLM (Gemini or Groq)"""
    api_key = get_ai_model_key(model_name)
    if not api_key:
        raise Exception(f"API key not found for model: {model_name}")
    
    # Prepare chat history context
    chat_context = "\n".join([
        f"{msg['role'].capitalize()}: {msg['message']}" 
        for msg in chat_history[-10:]  # Last 10 messages
    ])
    
    # Prepare user data context (includes all profile fields)
    user_context = "User Information:\n"
    for key, value in user_data.items():
        user_context += f"- {key.replace('_', ' ').title()}: {value}\n"
    
    # Create prompt for LLM
    prompt = f"""You are an intelligent form filling assistant. Analyze the HTML page and chat history to provide form filling instructions.

{user_context}

Recent Chat History:
{chat_context}

HTML Page Content:
{html[:50000]}  # Limit to 50k chars

Task: Analyze the HTML and identify form fields that need to be filled. Return a JSON response with the following structure:
{{
    "fields": [
        {{
            "name": "field_name_or_id",
            "selector": "CSS selector or [name='field_name']",
            "value": "value to fill",
            "type": "email|text|tel|password|etc"
        }}
    ],
    "message": "A friendly message explaining what will be filled"
}}

Only include fields that you can confidently identify and fill. Return ONLY valid JSON, no additional text."""
    
    # Call appropriate API
    if model_name == 'gemini':
        response_text = call_gemini_api(prompt, api_key)
    elif model_name == 'groq':
        response_text = call_groq_api(prompt, api_key)
    else:
        raise Exception(f"Unsupported model: {model_name}")
    
    # Try to extract JSON from response
    try:
        # Remove markdown code blocks if present
        response_text = response_text.strip()
        if response_text.startswith('```json'):
            response_text = response_text[7:]
        if response_text.startswith('```'):
            response_text = response_text[3:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        result = json.loads(response_text)
        return result
    except json.JSONDecodeError:
        # If JSON parsing fails, try to extract fields manually
        return {
            "fields": [],
            "message": response_text
        }


def analyze_page_html(html, user_data):
    """Analyze HTML and extract form fields with suggested values (fallback method)"""
    soup = BeautifulSoup(html, 'lxml')
    fields = []
    
    # Find all input fields
    inputs = soup.find_all(['input', 'textarea', 'select'])
    
    for input_elem in inputs:
        field_name = input_elem.get('name') or input_elem.get('id', '')
        field_type = input_elem.get('type', 'text').lower()
        field_tag = input_elem.name.lower()
        
        if not field_name:
            continue
        
        # Determine value based on field name/type
        value = None
        field_lower = field_name.lower()
        
        # Email fields
        if 'email' in field_lower or field_type == 'email':
            value = user_data.get('email', '')
        
        # Name fields
        elif 'name' in field_lower or 'firstname' in field_lower or 'fname' in field_lower:
            value = user_data.get('name', '').split()[0] if user_data.get('name') else ''
        elif 'lastname' in field_lower or 'lname' in field_lower or 'surname' in field_lower:
            name_parts = user_data.get('name', '').split()
            value = name_parts[-1] if len(name_parts) > 1 else ''
        elif 'fullname' in field_lower or 'full_name' in field_lower:
            value = user_data.get('name', '')
        
        # Phone fields
        elif 'phone' in field_lower or 'tel' in field_lower or field_type == 'tel':
            value = user_data.get('phone', '')
        
        # Username fields
        elif 'username' in field_lower or 'user' in field_lower:
            value = user_data.get('username', '') or user_data.get('email', '').split('@')[0]
        
        # Address fields
        elif 'address' in field_lower:
            value = user_data.get('address', '')
        
        # City fields
        elif 'city' in field_lower:
            value = user_data.get('city', '')
        
        # State/Province fields
        elif 'state' in field_lower or 'province' in field_lower:
            value = user_data.get('state', '')
        
        # Zip/Postal code
        elif 'zip' in field_lower or 'postal' in field_lower:
            value = user_data.get('zip', '') or user_data.get('postal_code', '')
        
        # Country
        elif 'country' in field_lower:
            value = user_data.get('country', '')
        
        if value:
            selector = f'[name="{field_name}"]' if field_name else None
            fields.append({
                'name': field_name,
                'type': field_type,
                'value': value,
                'selector': selector,
            })
    
    return fields

