# AI Model API Key Management

## Update AI Model API Keys

Use the Django management command to set or update API keys for AI models:

### Syntax
```bash
python manage.py update_aimodel <model_name> <api_key>
```

### Examples

**Update Gemini API Key:**
```bash
python manage.py update_aimodel gemini YOUR_GEMINI_API_KEY
```

**Update Groq API Key:**
```bash
python manage.py update_aimodel groq YOUR_GROQ_API_KEY
```

### Getting API Keys

**Gemini API Key:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key

**Groq API Key:**
1. Go to [Groq Console](https://console.groq.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the API key

### Verify Keys

After setting the keys, you can verify them in the Django admin panel:
1. Go to `http://localhost:8000/admin/`
2. Navigate to "AI Models"
3. Check that your models are listed and active

### Notes

- Keys are stored securely in the database
- Only active models can be selected by users
- You can deactivate a model by setting `is_active=False` in the admin panel
- The command will create the model entry if it doesn't exist, or update it if it does

