# How to Rebuild Extension After Loading in Chrome

## Quick Answer

**After loading the extension in Chrome, whenever you make code changes:**

1. **Rebuild:**

   ```bash
   cd frontend
   npm run build
   ```

2. **Reload in Chrome:**

   - Go to `chrome://extensions/`
   - Find "Fillora" extension
   - Click the **refresh icon** (↻) on the extension card

3. **Test:** Click extension icon to see your changes

That's it! No need to remove and re-add the extension.

## Detailed Steps

### Step 1: Make Your Code Changes

Edit any files in `frontend/src/`:

- `frontend/src/components/Login.jsx`
- `frontend/src/components/VoiceAgent.jsx`
- etc.

### Step 2: Build the Extension

Open terminal in the **project root** and run:

```bash
cd frontend
npm run build
```

Wait for the "✓ built successfully" message.

**Output location:** The build creates `dist/` folder in the **root directory** (not in frontend).

### Step 3: Reload Extension in Chrome

1. Open Chrome
2. Go to `chrome://extensions/`
3. Find "Fillora - Voice-Powered Form Filling"
4. Click the **circular refresh icon** (↻) on the extension card
5. Extension reloads with your changes

### Step 4: Test

1. Click the extension icon in Chrome toolbar
2. Your changes should be visible

## Watch Mode (Auto-Rebuild)

For faster development, use watch mode:

```bash
cd frontend
npm run watch
```

This automatically rebuilds when you save files. Then:

1. Save your file → Watch rebuilds automatically
2. Go to `chrome://extensions/`
3. Click refresh icon on extension
4. Test your changes

Press `Ctrl+C` to stop watch mode.

## Visual Guide

```
┌─────────────────────────────────────────┐
│  chrome://extensions/                    │
├─────────────────────────────────────────┤
│  Developer mode: ON                     │
├─────────────────────────────────────────┤
│  Fillora - Voice-Powered Form Filling   │
│  [Details] [Remove] [↻] ← Click this!   │
└─────────────────────────────────────────┘
```

## Common Workflow

```
1. Edit code in frontend/src/
   ↓
2. Save file
   ↓
3. Run: npm run build (or use watch mode)
   ↓
4. Go to chrome://extensions/
   ↓
5. Click refresh icon on extension
   ↓
6. Click extension icon to test
```

## Troubleshooting

### Changes Not Appearing?

1. **Check build completed:**

   - Look for "✓ built successfully" in terminal
   - Verify `dist/popup.html` exists

2. **Reload extension:**

   - Click refresh icon again
   - Close and reopen extension popup

3. **Clear cache:**

   - Extension → Details → Storage → Clear site data
   - Reload extension

4. **Check for errors:**
   - Open browser console (F12)
   - Check extension errors in `chrome://extensions/`

### Build Fails?

```bash
cd frontend
npm install  # Reinstall dependencies
npm run build
```

### Extension Shows Old Code?

1. Rebuild: `npm run build`
2. Reload extension in Chrome
3. Hard refresh: Close popup → Reload extension → Reopen popup

## Pro Tips

✅ **Use watch mode** for faster development  
✅ **Keep terminal open** to see build errors immediately  
✅ **Check browser console** (F12) for runtime errors  
✅ **One reload** is enough - no need to remove/re-add extension

## Summary

- **Initial load:** Build → Load unpacked → Select root folder
- **After changes:** Build → Click refresh icon → Test
- **Watch mode:** `npm run watch` → Auto-rebuild → Click refresh → Test

No need to remove and re-add the extension each time! 🎉
