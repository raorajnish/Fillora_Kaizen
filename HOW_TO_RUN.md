# How to Run Fillora Extension - Complete Guide

## Prerequisites

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **Python** (3.8 or higher) - [Download](https://www.python.org/downloads/)
- **Google Cloud Console** account (for OAuth setup)
- **Chrome Browser** (for extension)

## Quick Start (Step-by-Step)

### Step 1: Backend Setup

1. **Navigate to backend directory:**

   ```bash
   cd backend
   ```

2. **Create and activate virtual environment:**

   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # Mac/Linux
   python -m venv venv
   source venv/bin/activate
   ```

3. **Install Python dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Create `.env` file:**

   ```bash
   # Windows
   copy .env.example .env

   # Mac/Linux
   cp .env.example .env
   ```

5. **Update `.env` file with your values:**

   - Open `backend/.env` in a text editor
   - Update `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (get from Google Cloud Console - see Step 3)
   - Keep dummy values for now if you haven't set up Google OAuth yet

6. **Run database migrations:**

   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

7. **Create a superuser (optional, for admin panel):**

   ```bash
   python manage.py createsuperuser
   ```

8. **Start the Django server:**

   ```bash
   python manage.py runserver
   ```

   The backend should now be running at `http://localhost:8000`

### Step 2: Frontend Setup

1. **Open a NEW terminal window** (keep backend running)

2. **Navigate to frontend directory:**

   ```bash
   cd frontend
   ```

3. **Install Node.js dependencies:**

   ```bash
   npm install
   ```

4. **Create `.env` file:**

   ```bash
   # Windows
   copy .env.example .env

   # Mac/Linux
   cp .env.example .env
   ```

5. **Update `.env` file:**

   - Open `frontend/.env` in a text editor
   - Set `VITE_API_BASE_URL=http://localhost:8000`
   - Set `VITE_GOOGLE_CLIENT_ID` (same as backend - see Step 3)

6. **Build the extension:**

   ```bash
   npm run build
   ```

   This creates the `dist` folder` with the built extension files.

### Step 3: Google OAuth Setup

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**

2. **Create or select a project**

3. **Enable Google Identity API:**

   - Go to "APIs & Services" > "Library"
   - Search for "Google Identity API"
   - Click "Enable"

4. **Configure OAuth Consent Screen:**

   - Go to "APIs & Services" > "OAuth consent screen"
   - Select "External" user type
   - Fill in app name, support email, developer email
   - Click "Save and Continue"
   - Add scopes: `email`, `profile`, `openid`
   - Add test users (your email) if needed
   - Click "Save and Continue"

5. **Create OAuth 2.0 Credentials:**

   - Go to "APIs & Services" > "Credentials"
   - Click "+ CREATE CREDENTIALS" > "OAuth client ID"
   - Application type: "Web application"
   - Name: "Fillora Extension"
   - **Authorized JavaScript origins:**
     - `http://localhost:8000`
     - `http://localhost:5173`
   - Click "CREATE"

6. **Copy credentials:**
   - Copy the **Client ID**
   - Copy the **Client Secret** (if shown)
   - Add both to `backend/.env`:
     ```
     GOOGLE_CLIENT_ID=your-client-id-here
     GOOGLE_CLIENT_SECRET=your-client-secret-here
     ```
   - Add Client ID to `frontend/.env`:
     ```
     VITE_GOOGLE_CLIENT_ID=your-client-id-here
     ```

### Step 4: Create Extension Icons (Optional)

Create an `icons` folder in the root directory with:

- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

**Note:** The extension will work without icons, but Chrome may show warnings.

### Step 5: Set Up AI Model API Keys (Required for Voice Agent)

1. **Get API keys:**

   - **Gemini:** [Google AI Studio](https://makersuite.google.com/app/apikey)
   - **Groq:** [Groq Console](https://console.groq.com/)

2. **Add API keys using management command:**
   ```bash
   cd backend
   python manage.py update_aimodel gemini YOUR_GEMINI_API_KEY
   python manage.py update_aimodel groq YOUR_GROQ_API_KEY
   ```

### Step 6: Build and Load Extension in Chrome

**⚠️ IMPORTANT: You MUST build the frontend BEFORE loading the extension!**

1. **Build the extension first:**

   ```bash
   cd frontend
   npm run build
   ```

   This creates the `dist` folder with compiled files. Wait for "built successfully" message.

2. **Verify build succeeded:**

   - Check that `dist/popup.html` exists in the root directory
   - Check that `dist/assets/` folder exists

3. **Open Chrome** and go to `chrome://extensions/`

4. **Enable Developer mode** (toggle in top-right corner)

5. **Click "Load unpacked"**

6. **Select the ROOT directory** of this project (NOT frontend, NOT dist):

   ```
   C:\Users\rajni\OneDrive\Desktop\fillora-extension
   ```

7. **The extension should appear** in your extensions list

8. **If you see errors:**
   - Make sure `dist` folder exists (run `npm run build` in frontend)
   - Check that `manifest.json` points to `dist/popup.html`
   - Verify you selected the ROOT folder, not frontend or dist folder
   - Check the error message in Chrome extensions page

### Step 7: Rebuilding After Code Changes

**After you make changes to the frontend code, you need to rebuild:**

1. **Rebuild the extension:**

   ```bash
   cd frontend
   npm run build
   ```

2. **Reload the extension in Chrome:**

   - Go to `chrome://extensions/`
   - Find your "Fillora" extension
   - Click the **refresh/reload icon** (↻ circular arrow) on the extension card
   - OR remove it and load it again

3. **Test your changes:**
   - Click the extension icon
   - Your changes should now be visible

**💡 Pro Tip:** For faster development, use watch mode:

```bash
cd frontend
npm run watch
```

This automatically rebuilds when you save files. Then just reload the extension in Chrome after each rebuild.

### Step 7: Test the Extension

1. **Click the extension icon** in Chrome toolbar

2. **You should see the login screen**

3. **Click "Sign in with Google"**

4. **After login:**

   - You'll see the Voice Agent tab
   - The agent will greet you automatically

5. **Test voice commands:**

   - Click the microphone button
   - Say "Analyze this page" or "Fill this form"
   - The agent will scrape the page, analyze with AI, and show detected fields

6. **Test field editing:**
   - After analysis, you'll see detected fields
   - Click "Update Field" or "Create New Field" to modify
   - Speak your changes (e.g., "Update email to john@example.com")
   - Click "Fill Form" when ready

## Running in Development Mode

### Backend (Terminal 1)

```bash
cd backend
venv\Scripts\activate  # Windows
python manage.py runserver
```

### Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

**Note:** For extension development, you still need to build:

```bash
cd frontend
npm run build
```

Then reload the extension in Chrome after each build.

## Troubleshooting

### Backend Issues

**Migration errors:**

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

**Module not found errors:**

```bash
# Make sure virtual environment is activated
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

**CORS errors:**

- Check that `django-cors-headers` is in `INSTALLED_APPS`
- Verify `CORS_ALLOWED_ORIGINS` in `settings.py`

**Google OAuth errors:**

- Verify Client ID matches in both `.env` files
- Check that Google Identity API is enabled
- Ensure authorized origins include `http://localhost:8000`

### Frontend Issues

**Build errors:**

```bash
cd frontend
rm -rf node_modules package-lock.json  # Mac/Linux
# or
rmdir /s node_modules  # Windows
npm install
npm run build
```

**Extension not loading:**

- Check that `dist/popup.html` exists
- Verify `manifest.json` points to `dist/popup.html`
- Check Chrome extension error page for details

**Speech recognition not working:**

- Make sure you're using Chrome (not Firefox/Edge)
- Check microphone permissions in Chrome settings
- Verify `react-speech-recognition` is installed

**API connection errors:**

- Verify backend is running on `http://localhost:8000`
- Check `VITE_API_BASE_URL` in `frontend/.env`
- Check browser console for CORS errors

### AI Model Issues

**"API key not found" error:**

```bash
cd backend
python manage.py update_aimodel gemini YOUR_KEY
python manage.py update_aimodel groq YOUR_KEY
```

**LLM not responding:**

- Verify API keys are correct
- Check backend logs for API errors
- Ensure you have credits/quota for Gemini/Groq

## File Structure

```
fillora-extension/
├── backend/              # Django backend
│   ├── .env              # Environment variables (create from .env.example)
│   ├── api/              # API app
│   ├── fillora_backend/  # Django project settings
│   └── manage.py         # Django management
├── frontend/             # React frontend
│   ├── .env              # Environment variables (create from .env.example)
│   ├── src/               # React source code
│   └── dist/              # Built extension (created after npm run build)
├── icons/                # Extension icons (create this folder)
├── manifest.json         # Extension manifest
└── README.md            # Project documentation
```

## Important Notes

1. **Always keep backend running** when using the extension
2. **Rebuild frontend** after making code changes: `npm run build`
3. **Reload extension** in Chrome after rebuilding
4. **Set up AI model keys** before using voice agent features
5. **Use Chrome browser** for best compatibility (speech recognition)

## Next Steps After Setup

1. ✅ Backend running on `http://localhost:8000`
2. ✅ Frontend built (`dist` folder exists)
3. ✅ Extension loaded in Chrome
4. ✅ Google OAuth configured
5. ✅ AI model API keys added
6. ✅ Test login and voice commands

## Support

If you encounter issues:

1. Check the browser console (F12) for errors
2. Check backend terminal for Django errors
3. Verify all environment variables are set correctly
4. Ensure all dependencies are installed

Happy coding! 🚀
