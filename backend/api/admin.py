from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model
from .models import FormSubmission, AIModel, ChatHistory, UserProfile

User = get_user_model()


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'username', 'first_name', 'last_name', 'google_id', 'preferred_ai_model', 'is_staff', 'date_joined']
    list_filter = ['is_staff', 'is_superuser', 'preferred_ai_model', 'date_joined']
    search_fields = ['email', 'username', 'first_name', 'last_name']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('AI Settings', {'fields': ('preferred_ai_model',)}),
    )


@admin.register(AIModel)
class AIModelAdmin(admin.ModelAdmin):
    list_display = ['model_name', 'is_active', 'created_at', 'updated_at']
    list_filter = ['is_active', 'model_name']
    search_fields = ['model_name']
    readonly_fields = ['created_at', 'updated_at']
    fields = ['model_name', 'api_key', 'is_active', 'created_at', 'updated_at']


@admin.register(ChatHistory)
class ChatHistoryAdmin(admin.ModelAdmin):
    list_display = ['user', 'role', 'website', 'created_at']
    list_filter = ['role', 'created_at', 'website']
    search_fields = ['user__email', 'message', 'website']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'


@admin.register(FormSubmission)
class FormSubmissionAdmin(admin.ModelAdmin):
    list_display = ['user', 'website', 'url', 'created_at']
    list_filter = ['created_at', 'website']
    search_fields = ['user__email', 'website', 'url']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'updated_at', 'created_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['user__email']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'

