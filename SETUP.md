# Fillora Extension - Quick Setup Guide

## Prerequisites

- Node.js (v16 or higher)
- Python 3.8 or higher
- Google Cloud Console account (for OAuth)

## Step-by-Step Setup

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env and add:
# - SECRET_KEY (generate a random string)
# - GOOGLE_CLIENT_ID (from Google Cloud Console)
# - GOOGLE_CLIENT_SECRET (from Google Cloud Console)
# - JWT_SECRET (can be same as SECRET_KEY)

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start server
python manage.py runserver
```

### 2. Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add:
# - VITE_API_BASE_URL=http://localhost:8000
# - VITE_GOOGLE_CLIENT_ID=your-google-client-id

# Build the extension
npm run build
```

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google+ API" or "Google Identity API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: "Web application"
6. Authorized JavaScript origins:
   - `http://localhost:8000`
   - `http://localhost:5173` (for dev)
7. Copy the Client ID to:
   - `backend/.env` as `GOOGLE_CLIENT_ID`
   - `frontend/.env` as `VITE_GOOGLE_CLIENT_ID`

### 4. Extension Icons

Create an `icons` folder in the root directory with:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

Or use placeholder icons for now.

### 5. Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the root directory of this project
5. The extension should appear in your extensions list

### 6. Test the Extension

1. Click the extension icon in Chrome toolbar
2. You should see the login screen
3. Click "Sign in with Google"
4. After login, you'll see the Voice Agent tab
5. Click the microphone button
6. Say "Fill this form" on a page with a form
7. Confirm the action
8. The form should be filled automatically

## Troubleshooting

### Backend Issues

- **Migration errors**: Make sure you're using the custom User model. Run `python manage.py makemigrations` first.
- **CORS errors**: Check that `django-cors-headers` is installed and configured in settings.py
- **Google OAuth errors**: Verify your Client ID is correct and the API is enabled

### Frontend Issues

- **Build errors**: Make sure all dependencies are installed with `npm install`
- **Speech recognition not working**: Chrome extensions need proper permissions. Make sure manifest.json has correct permissions.
- **API connection errors**: Check that backend is running and `VITE_API_BASE_URL` is correct

### Extension Issues

- **Extension not loading**: Check manifest.json for errors in Chrome's extension page
- **Content script not running**: Verify content.js is listed in manifest.json
- **Popup not showing**: Check that dist/popup.html exists after building

## Development Mode

### Backend (with auto-reload)
```bash
cd backend
python manage.py runserver
```

### Frontend (with hot-reload)
```bash
cd frontend
npm run dev
```

Note: For extension development, you'll need to rebuild after changes:
```bash
cd frontend
npm run build
```

Then reload the extension in Chrome.

## Production Deployment

1. Update `DEBUG=False` in backend `.env`
2. Set proper `ALLOWED_HOSTS` in `settings.py`
3. Use a production database (PostgreSQL recommended)
4. Set up HTTPS for backend
5. Update CORS settings for production domain
6. Build frontend: `npm run build`
7. Deploy backend to your hosting service
8. Update frontend `.env` with production API URL






Navigate to the Google Cloud Console:
Go to https://console.cloud.google.com/ .
Select or Create a Project:
At the top of the page, click on the project selector. You can either select an existing project or create a new one. Based on your current page, your Project ID is gen-lang-client-0184135401 , so you can proceed with that if it's the correct project.
Enable the Google Identity API:
In the Google Cloud Console, use the navigation menu (usually three horizontal lines) on the top left.
Go to APIs & Services > Library .
Search for "Google Identity API" (or "Google+ API" if the Identity API is not found, although the Identity API is the current recommendation).
Click on the API and then click Enable .
Create OAuth 2.0 Client ID Credentials:
From the navigation menu, go to APIs & Services > Credentials .
At the top of the Credentials page, click + CREATE CREDENTIALS .
From the dropdown menu, select OAuth client ID .
Configure the OAuth Consent Screen:
If this is your first time creating an OAuth client ID in this project, you will be prompted to configure the OAuth consent screen.
Click OAuth consent screen .
Select the user type (e.g., "External" for most applications).
Fill in the required information, such as the "Application name" (e.g., "My Application"), user support email, and developer contact information.
You may also need to provide links to your privacy policy and terms of service.
Click Save and Continue and complete any additional steps for scopes and test users.
Specify Application Type and Origins:
After configuring the consent screen (or if it was already configured), return to the Create OAuth client ID page.
For Application type , select Web application .
Provide a Name for your OAuth 2.0 client (e.g., "Web Client 1").
Under Authorized JavaScript origins , click + ADD URI and enter:
http://localhost:8000
Click + ADD URI again and enter: http://localhost:5173
You can leave Authorized redirect URIs blank unless your application specifically requires a redirect URI.
Create and Copy the Client ID:
Click CREATE .
A dialog box will appear displaying your Client ID . Copy this value.
You might also receive a Client Secret, but for the use case of frontend and backend environments as described, the Client ID is the primary requirement.
Integrate the Client ID into your Project:
Paste the copied Client ID into your backend/.env file as GOOGLE_CLIENT_ID .
Paste the copied Client ID into your frontend/.env file as VITE_GOOGLE_CLIENT_ID .