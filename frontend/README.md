# Fillora Extension Frontend

React frontend for Fillora Chrome Extension with voice-powered form filling.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

3. Update `.env` with:
   - `VITE_API_BASE_URL` - Your Django backend URL (default: http://localhost:8000)
   - `VITE_GOOGLE_CLIENT_ID` - Your Google OAuth Client ID

4. Build for production:
```bash
npm run build
```

The build output will be in the `dist` folder, which should be referenced in `manifest.json`.

## Development

Run the development server:
```bash
npm run dev
```

## Building for Extension

1. Run `npm run build`
2. The `dist` folder contains the built files
3. Update `manifest.json` to point to `dist/popup.html`
4. Load the extension in Chrome using the `dist` folder (or the root folder with dist)

## Features

- Google OAuth login
- Voice command recognition
- Form field detection and auto-filling
- History tracking of filled forms
- Dark mode UI with blue accent colors

