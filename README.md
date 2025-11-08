# Fillora Extension

A Chrome extension with voice-powered form filling, built with React frontend and Django backend.

## Features

- 🔐 **Google OAuth Login** - Secure authentication with Google
- 🎤 **Voice Commands** - Control form filling with voice
- 🤖 **AI-Powered Analysis** - Intelligent form field detection
- 📝 **Auto-Fill Forms** - Automatically fill detected form fields
- 📊 **History Tracking** - View all your form filling history
- 🌙 **Dark Mode UI** - Beautiful dark theme with blue accents

## Project Structure

```
fillora-extension/
├── frontend/          # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   ├── MainApp.jsx
│   │   │   ├── VoiceAgent.jsx
│   │   │   └── History.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── backend/           # Django REST API
│   ├── api/
│   │   ├── models.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── fillora_backend/
│   └── manage.py
├── content.js         # Content script for page interaction
├── background.js      # Background service worker
└── manifest.json      # Extension manifest
```

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

5. Run migrations:
```bash
python manage.py migrate
```

6. Start the server:
```bash
python manage.py runserver
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

4. Build the extension:
```bash
npm run build
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized JavaScript origins:
   - `http://localhost:8000`
6. Copy Client ID to both frontend and backend `.env` files

### Loading the Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the root directory of this project
5. The extension should now be loaded

## Usage

1. Click the extension icon
2. Sign in with Google
3. Click the microphone button
4. Say "Fill this form" or "Fill form"
5. Confirm when prompted
6. The form will be automatically filled
7. View your history in the History tab

## Development

### Frontend Development
```bash
cd frontend
npm run dev
```

### Backend Development
```bash
cd backend
python manage.py runserver
```

## API Endpoints

- `POST /api/social-login/` - Google OAuth login
- `POST /api/analyze-page/` - Analyze page HTML for form fields
- `POST /api/fill-form/` - Save form filling submission
- `GET /api/history/` - Get form filling history

## Technologies

- **Frontend**: React, Vite, react-speech-recognition, @react-oauth/google
- **Backend**: Django, Django REST Framework, Google Auth
- **Extension**: Chrome Extension Manifest V3

## License

MIT

