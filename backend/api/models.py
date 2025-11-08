from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """Extended User model with Google OAuth support"""
    google_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    profile_picture = models.URLField(max_length=500, blank=True, null=True)
    preferred_ai_model = models.CharField(max_length=50, default='gemini', choices=[('gemini', 'Gemini'), ('groq', 'Groq')])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.email or self.username


class AIModel(models.Model):
    """Model to store AI API keys (Gemini, Groq, etc.)"""
    MODEL_CHOICES = [
        ('gemini', 'Google Gemini'),
        ('groq', 'Groq'),
    ]
    
    model_name = models.CharField(max_length=50, unique=True, choices=MODEL_CHOICES)
    api_key = models.CharField(max_length=500)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'AI Model'
        verbose_name_plural = 'AI Models'
        ordering = ['model_name']

    def __str__(self):
        return f"{self.get_model_name_display()} ({'Active' if self.is_active else 'Inactive'})"


class ChatHistory(models.Model):
    """Model to store chat history between user and AI agent"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_history')
    role = models.CharField(max_length=20, choices=[('user', 'User'), ('assistant', 'Assistant')])
    message = models.TextField()
    website = models.CharField(max_length=255, blank=True, null=True)
    url = models.URLField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.role} - {self.created_at}"


class UserProfile(models.Model):
    """Model to store custom user profile data (key-value pairs)"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile_data')
    data = models.JSONField(default=dict)  # Store custom fields as {field_name: field_value}
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'

    def __str__(self):
        return f"{self.user.email} - Profile Data"


class FormSubmission(models.Model):
    """Model to store form filling history"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='form_submissions')
    website = models.CharField(max_length=255)
    url = models.URLField(max_length=500)
    fields = models.JSONField(default=dict)  # Store field name-value pairs
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['website']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.website} - {self.created_at}"

