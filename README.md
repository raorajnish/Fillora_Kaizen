# Fillora Extension

A Chrome extension with voice-powered form filling, built with React frontend and Django backend. Fillora uses AI to intelligently detect and fill form fields based on voice commands.

## 🚀 Features

- 🔐 **Google OAuth Login** - Secure authentication with Google
- 🎤 **Voice Commands** - Control form filling with voice
- 🤖 **AI-Powered Analysis** - Intelligent form field detection using Gemini or Groq
- 📝 **Auto-Fill Forms** - Automatically fill detected form fields
- 📊 **History Tracking** - View all your form filling history
- ⚙️ **AI Model Selection** - Choose between Gemini and Groq models
- 🌙 **Dark Mode UI** - Beautiful dark theme with blue accents

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **Chrome Browser** (for extension)
- **Google Cloud Account** (for OAuth and AI APIs)
- **Gemini API Key** or **Groq API Key** (for AI features)

## 🏗️ Project Structure

```
fillora-extension/
├── frontend/              # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   ├── MainApp.jsx
│   │   │   ├── VoiceAgent.jsx
│   │   │   ├── History.jsx
│   │   │   └── Settings.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── popup.html
│   ├── package.json
│   └── vite.config.js
├── backend/               # Django REST API
│   ├── api/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── utils.py
│   │   └── authentication.py
│   ├── fillora_backend/
│   │   ├── settings.py
│   │   └── urls.py
│   ├── manage.py
│   └── requirements.txt
├── dist/                  # Built extension files (generated)
├── manifest.json          # Extension manifest
└── README.md
```

## 🛠️ Setup Instructions

### 1. Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create `.env` file:**
   ```bash
   # Copy from example if available, or create new
   # Add the following variables:
   ```
   
   Create a `.env` file in the `backend/` directory with:
   ```env
   SECRET_KEY=your-django-secret-key-here
   DEBUG=True
   GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   JWT_SECRET=your-jwt-secret-key-here
   GEMINI_API_KEY=your-gemini-api-key
   GROQ_API_KEY=your-groq-api-key
   ```

5. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

6. **Create superuser (optional):**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start the server:**
   ```bash
   python manage.py runserver
   ```
   
   The backend will run on `http://localhost:8000`

### 2. Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   
   Create a `.env` file in the `frontend/` directory with:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   ```

4. **Build the extension:**
   ```bash
   npm run build
   ```
   
   This creates the `dist/` folder with the built extension files.

### 3. Google OAuth Setup

#### Step 1: Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable **Google Identity API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Identity API"
   - Click "Enable"

#### Step 2: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type
3. Fill in required information:
   - App name: Fillora
   - Support email: your-email@example.com
   - Developer contact: your-email@example.com
4. Add scopes: `email`, `profile`, `openid`
5. Add test users (your email) if needed
6. Save and continue

#### Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "+ CREATE CREDENTIALS" > "OAuth client ID"
3. Application type: **Web application**
4. Name: "Fillora Extension"
5. **Authorized JavaScript origins:**
   - `http://localhost:8000`
   - `http://localhost:5173` (for dev)
6. Click "CREATE"
7. Copy the **Client ID** and **Client Secret**

#### Step 4: Add Redirect URI for Chrome Extension

**⚠️ IMPORTANT:** This is required for the extension to work!

1. After loading the extension in Chrome, get your redirect URI:
   - Open extension popup
   - Right-click → "Inspect" (or F12)
   - Go to Console tab
   - Click "Sign in with Google"
   - Look for: `Redirect URI: https://<extension-id>.chromiumapp.org/`
   - Or run: `chrome.identity.getRedirectURL()`

2. Add redirect URI to Google Cloud Console:
   - Go to "APIs & Services" > "Credentials"
   - Click on your OAuth 2.0 Client ID
   - Scroll to "Authorized redirect URIs"
   - Click "+ ADD URI"
   - Paste: `https://<your-extension-id>.chromiumapp.org/`
   - **Important:** Include the trailing slash `/`
   - Click "SAVE"

3. **Note:** Extension ID changes when you reload in developer mode. You'll need to add the new redirect URI each time.

### 4. AI Model Setup

#### Option A: Gemini API

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add to backend `.env`: `GEMINI_API_KEY=your-key-here`
4. Add model in Django admin or via management command

#### Option B: Groq API

1. Go to [Groq Console](https://console.groq.com/)
2. Create an API key
3. Add to backend `.env`: `GROQ_API_KEY=your-key-here`
4. Add model in Django admin or via management command

### 5. Loading the Extension

1. **Build the extension** (if not already done):
   ```bash
   cd frontend
   npm run build
   ```

2. **Open Chrome Extensions:**
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)

3. **Load the extension:**
   - Click "Load unpacked"
   - Select the `fillora-extension` root directory (not the `dist` folder)
   - The extension should appear in your extensions list

4. **Verify:**
   - Click the extension icon
   - You should see the login screen

## 📖 Usage

### First Time Setup

1. **Click the extension icon** in Chrome toolbar
2. **Sign in with Google:**
   - Click "Sign in with Google"
   - Select your Google account
   - Grant permissions
3. **Configure AI Model** (in Settings tab):
   - Select your preferred AI model (Gemini or Groq)
   - Make sure API keys are configured in backend

### Using Voice Commands

1. **Navigate to a webpage** with a form
2. **Click the extension icon**
3. **Click the microphone button** in the Voice Agent tab
4. **Speak your command:**
   - "Fill this form"
   - "Fill the form with my information"
   - "Fill email and name fields"
5. **Review the detected fields** in the confirmation dialog
6. **Click "Fill Form"** to confirm
7. **The form will be automatically filled**

### Viewing History

1. Click the extension icon
2. Go to the **History** tab
3. View all your form filling submissions
4. Click on a submission to see details

## 🔧 Development

### Frontend Development

```bash
cd frontend
npm run dev        # Development server (for testing, not for extension)
npm run build      # Build for production
npm run watch      # Watch mode for building
```

**Note:** For extension development, use `npm run build` and reload the extension in Chrome.

### Backend Development

```bash
cd backend
python manage.py runserver          # Start development server
python manage.py makemigrations     # Create migrations
python manage.py migrate            # Apply migrations
python manage.py createsuperuser    # Create admin user
```

### Hot Reloading Extension

1. Make changes to frontend code
2. Run `npm run build` in frontend directory
3. Go to `chrome://extensions/`
4. Click the reload icon on your extension

## 📡 API Endpoints

### Authentication
- `POST /api/social-login/` - Google OAuth login
  - Body: `{ "access_token": "...", "user_info": {...} }` or `{ "token": "..." }`
  - Returns: `{ "token": "jwt-token", "user": {...} }`

### Form Analysis
- `POST /api/analyze-page/` - Analyze page HTML for form fields
  - Headers: `Authorization: Bearer <jwt-token>`
  - Body: `{ "html": "...", "chat_history": [...] }`
  - Returns: `{ "fields": [...], "message": "..." }`

### History
- `GET /api/history/` - Get form filling history
  - Headers: `Authorization: Bearer <jwt-token>`
  - Returns: `[{ "id": 1, "website": "...", "fields": [...], ... }]`

- `POST /api/fill-form/` - Save form filling submission
  - Headers: `Authorization: Bearer <jwt-token>`
  - Body: `{ "website": "...", "fields": [...] }`

### Settings
- `GET /api/models/` - Get available AI models
- `POST /api/models/<id>/select/` - Select AI model

## 🐛 Troubleshooting

### OAuth Issues

**Error: "redirect_uri_mismatch"**
- Make sure you've added the redirect URI to Google Cloud Console
- Check that the URI matches exactly (including trailing slash)
- Extension ID changes when reloaded - add the new URI
- See `OAUTH_SETUP.md` for detailed instructions

**Error: "Token is required"**
- Backend is expecting different token format
- Check that backend is running and accessible
- Verify `VITE_API_BASE_URL` in frontend `.env`

### Extension Not Loading

**Blank screen or dark background:**
- Check browser console for errors (right-click popup → Inspect)
- Make sure `npm run build` completed successfully
- Verify `dist/` folder exists with `popup.html` and `assets/`
- Check `manifest.json` points to correct paths

**React errors:**
- Clear browser cache
- Reload the extension
- Check console for specific error messages

### Backend Issues

**Error: "module 'jwt' has no attribute 'encode'"**
- Make sure PyJWT is installed: `pip install PyJWT==2.8.0`
- Restart the backend server
- Check that you're using the correct virtual environment

**CORS errors:**
- Verify `CORS_ALLOWED_ORIGINS` in `backend/fillora_backend/settings.py`
- Make sure `chrome-extension://*` is in allowed origins
- Restart backend server after changes

### Voice Recognition Not Working

- Check browser permissions for microphone
- Make sure you're using Chrome (best support)
- Check console for speech recognition errors
- Verify `react-speech-recognition` is installed

## 🔐 Environment Variables

### Backend (.env)
```env
SECRET_KEY=your-django-secret-key
DEBUG=True
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
JWT_SECRET=your-jwt-secret
GEMINI_API_KEY=your-gemini-key
GROQ_API_KEY=your-groq-key
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

## 🛠️ Technologies

- **Frontend:**
  - React 18
  - Vite
  - react-speech-recognition
  - axios
  - Chrome Extension Manifest V3

- **Backend:**
  - Django 4.2
  - Django REST Framework
  - PyJWT
  - google-auth
  - google-generativeai (Gemini)
  - groq (Groq API)
  - BeautifulSoup4

## 📝 Notes

- **Extension ID:** Changes when reloaded in developer mode. You'll need to update the redirect URI in Google Cloud Console.
- **Production:** For production, use the extension ID from Chrome Web Store.
- **API Keys:** Keep your API keys secure. Never commit `.env` files to version control.
- **CSP:** Chrome extensions have strict Content Security Policy. External scripts are blocked.

## 📚 Additional Documentation

- `OAUTH_SETUP.md` - Detailed OAuth setup instructions
- `QUICK_FIX_REDIRECT_URI.md` - Quick fix for redirect URI issues
- `backend/README.md` - Backend-specific documentation
- `frontend/README.md` - Frontend-specific documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License

## 🆘 Support

If you encounter issues:
1. Check the Troubleshooting section above
2. Review the console logs (extension popup → Inspect)
3. Check backend server logs
4. Verify all environment variables are set correctly
5. Ensure all dependencies are installed

---

**Made with ❤️ for intelligent form filling**
