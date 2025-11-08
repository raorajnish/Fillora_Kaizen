from django.core.management.base import BaseCommand
from api.models import AIModel


class Command(BaseCommand):
    help = 'Update or create AI model API keys. Usage: python manage.py update_aimodel <model_name> <api_key>'

    def add_arguments(self, parser):
        parser.add_argument('model_name', type=str, help='Model name (gemini or groq)')
        parser.add_argument('api_key', type=str, help='API key for the model')

    def handle(self, *args, **options):
        model_name = options['model_name'].lower()
        api_key = options['api_key']

        if model_name not in ['gemini', 'groq']:
            self.stdout.write(
                self.style.ERROR(f'Invalid model name: {model_name}. Must be "gemini" or "groq"')
            )
            return

        # Get or create the model
        ai_model, created = AIModel.objects.get_or_create(
            model_name=model_name,
            defaults={'api_key': api_key, 'is_active': True}
        )

        if not created:
            ai_model.api_key = api_key
            ai_model.is_active = True
            ai_model.save()
            self.stdout.write(
                self.style.SUCCESS(f'Successfully updated {model_name} API key')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f'Successfully created {model_name} API key')
            )
