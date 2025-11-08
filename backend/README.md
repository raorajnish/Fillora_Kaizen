# Fillora Backend

Django REST API backend for Fillora Chrome Extension.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

4. Run migrations:
```bash
python manage.py migrate
```

5. Create a superuser (optional):
```bash
python manage.py createsuperuser
```

6. Run the development server:
```bash
python manage.py runserver
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized JavaScript origins:
   - `http://localhost:8000`
   - Your extension's origin (if needed)
6. Copy the Client ID to your `.env` file

## API Endpoints

- `POST /api/social-login/` - Google OAuth login
- `POST /api/analyze-page/` - Analyze page HTML for form fields
- `POST /api/fill-form/` - Save form filling submission
- `GET /api/history/` - Get form filling history

