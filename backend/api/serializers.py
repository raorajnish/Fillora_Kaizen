from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import FormSubmission, AIModel, ChatHistory

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'profile_picture', 'preferred_ai_model']
        read_only_fields = ['id']


class AIModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIModel
        fields = ['id', 'model_name', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ChatHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatHistory
        fields = ['id', 'role', 'message', 'website', 'url', 'created_at']
        read_only_fields = ['id', 'created_at']


class FormSubmissionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = FormSubmission
        fields = ['id', 'user', 'website', 'url', 'fields', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

