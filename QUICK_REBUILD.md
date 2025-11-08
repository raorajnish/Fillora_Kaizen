# Quick Guide: Rebuilding Extension After Loading

## The Process

Once your extension is loaded in Chrome, here's how to update it after making code changes:

### Method 1: Manual Rebuild (Standard)

1. **Make your code changes** in `frontend/src/`

2. **Rebuild:**
   ```bash
   cd frontend
   npm run build
   ```

3. **Reload extension in Chrome:**
   - Open `chrome://extensions/`
   - Find "Fillora - Voice-Powered Form Filling"
   - Click the **circular refresh icon** (↻) on the extension card
   - Done! Your changes are now live

4. **Test:**
   - Click the extension icon
   - Your changes should be visible

### Method 2: Watch Mode (Auto-Rebuild)

For faster development with automatic rebuilding:

1. **Start watch mode:**
   ```bash
   cd frontend
   npm run watch
   ```
   
   This will automatically rebuild whenever you save a file.

2. **After each auto-rebuild:**
   - Go to `chrome://extensions/`
   - Click the refresh icon on your extension
   - Test your changes

3. **Stop watch mode:**
   - Press `Ctrl+C` in the terminal

## Visual Guide

```
┌─────────────────────────────────────┐
│  chrome://extensions/                │
├─────────────────────────────────────┤
│  Fillora Extension                  │
│  [Details] [Remove] [↻ Reload]      │ ← Click this refresh icon
└─────────────────────────────────────┘
```

## Step-by-Step Example

**Scenario:** You changed the login button text

1. Edit `frontend/src/components/Login.jsx`
2. Save the file
3. Run `npm run build` in frontend folder
4. Go to `chrome://extensions/`
5. Click the refresh icon on Fillora extension
6. Click extension icon → See your changes!

## Common Questions

**Q: Do I need to remove and re-add the extension?**
A: No! Just click the refresh icon after rebuilding.

**Q: How often should I rebuild?**
A: After every code change, or use watch mode for automatic rebuilding.

**Q: What if changes don't appear?**
A: 
- Make sure build completed successfully
- Click the refresh icon again
- Close and reopen the extension popup
- Check browser console (F12) for errors

**Q: Can I use `npm run dev` for extension development?**
A: No, `npm run dev` is for web development. For extensions, use `npm run build` or `npm run watch`.

## Troubleshooting

**Build fails:**
```bash
cd frontend
npm install  # Reinstall dependencies
npm run build
```

**Extension shows old code:**
1. Rebuild: `npm run build`
2. Reload extension in Chrome
3. Hard refresh: Close popup, reload extension, reopen

**Changes not visible:**
- Check terminal for build errors
- Verify `dist/popup.html` was updated (check file timestamp)
- Clear extension storage: Extension → Details → Storage → Clear

## Quick Commands Reference

```bash
# Build once
cd frontend && npm run build

# Watch mode (auto-rebuild)
cd frontend && npm run watch

# Check if dist exists
dir frontend\dist  # Windows
ls frontend/dist   # Mac/Linux
```

## Workflow Summary

```
Edit Code → Build → Reload Extension → Test
   ↓          ↓           ↓              ↓
  Save    npm run    Click refresh   Click icon
          build      in Chrome
```

That's it! Simple 3-step process after initial setup.

