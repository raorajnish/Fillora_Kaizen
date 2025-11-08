# Testing and Rebuilding the Extension

## Initial Setup - First Time Loading

### Step 1: Build the Extension First

**Before loading in Chrome, you MUST build the frontend:**

```bash
cd frontend
npm install  # If not done already
npm run build
```

This creates the `dist` folder with all the compiled files.

### Step 2: Verify Build Output

Check that these files exist:

- `frontend/dist/popup.html`
- `frontend/dist/assets/` (folder with JS and CSS files)

### Step 3: Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **"Load unpacked"**
4. **IMPORTANT:** Select the **ROOT directory** of the project:

   ```
   C:\Users\rajni\OneDrive\Desktop\fillora-extension
   ```

   (NOT the frontend folder, NOT the dist folder - the ROOT folder)

5. The extension should appear in your list
6. You should see the extension icon in Chrome toolbar

### Step 4: Test the Extension

1. Click the extension icon
2. You should see the login screen
3. If you see errors, check the next section

## After Making Code Changes - Rebuilding

### Quick Rebuild Process

**Every time you make changes to the frontend code, follow these steps:**

1. **Stop the extension** (optional, but recommended):

   - Go to `chrome://extensions/`
   - Click the refresh/reload icon on the extension card

2. **Rebuild the frontend:**

   ```bash
   cd frontend
   npm run build
   ```

3. **Reload the extension in Chrome:**

   - Go to `chrome://extensions/`
   - Find your extension
   - Click the **refresh/reload icon** (circular arrow) on the extension card
   - OR remove and reload it

4. **Test your changes:**
   - Click the extension icon
   - Your changes should now be visible

## Development Workflow

### Option 1: Manual Rebuild (Current Setup)

**When you make changes:**

1. Edit code in `frontend/src/`
2. Run `npm run build` in frontend folder
3. Reload extension in Chrome
4. Test changes

**Pros:** Simple, works with extension
**Cons:** Manual rebuild each time

### Option 2: Watch Mode (Recommended for Development)

You can set up a watch script to auto-rebuild:

1. **Add a watch script to `frontend/package.json`:**

   ```json
   "scripts": {
     "dev": "vite",
     "build": "vite build",
     "watch": "vite build --watch",
     "preview": "vite preview"
   }
   ```

2. **Run watch mode:**

   ```bash
   cd frontend
   npm run watch
   ```

   This will automatically rebuild whenever you save changes.

3. **After each auto-rebuild:**
   - Go to `chrome://extensions/`
   - Click reload on the extension

## Common Issues and Solutions

### Issue: "Could not load extension"

**Causes:**

- `dist` folder doesn't exist → Run `npm run build`
- `manifest.json` has wrong path → Check it points to `dist/popup.html`
- Selected wrong folder → Must select ROOT folder, not frontend or dist

**Solution:**

```bash
cd frontend
npm run build
# Then reload extension
```

### Issue: Extension loads but shows blank/error

**Causes:**

- Build failed → Check terminal for errors
- Missing dependencies → Run `npm install`
- Wrong API URL → Check `frontend/.env`

**Solution:**

```bash
cd frontend
npm install
npm run build
# Check for errors in terminal
```

### Issue: Changes not appearing after rebuild

**Causes:**

- Extension not reloaded → Must click reload in Chrome
- Browser cache → Hard refresh (Ctrl+Shift+R)
- Build didn't complete → Check terminal

**Solution:**

1. Rebuild: `npm run build`
2. Go to `chrome://extensions/`
3. Click reload on extension
4. Close and reopen extension popup

### Issue: "popup.html not found"

**Causes:**

- `dist` folder missing → Run `npm run build`
- Wrong folder selected → Must select ROOT folder

**Solution:**

```bash
cd frontend
npm run build
# Verify dist/popup.html exists
# Reload extension
```

## Testing Checklist

After loading the extension, verify:

- [ ] Extension appears in `chrome://extensions/` without errors
- [ ] Extension icon appears in Chrome toolbar
- [ ] Clicking icon opens popup
- [ ] Login screen displays correctly
- [ ] Google login button works (after setting up OAuth)
- [ ] Voice agent tab appears after login
- [ ] Microphone button works
- [ ] Backend API calls work (check browser console)

## Quick Reference Commands

```bash
# Build extension
cd frontend
npm run build

# Watch mode (auto-rebuild on changes)
cd frontend
npm run watch

# Check if dist exists
ls frontend/dist  # Mac/Linux
dir frontend\dist  # Windows

# Reload extension
# Go to chrome://extensions/ and click reload icon
```

## Pro Tips

1. **Keep terminal open** to see build errors immediately
2. **Use browser console** (F12) to debug JavaScript errors
3. **Check extension errors** in `chrome://extensions/` → Details → Errors
4. **Hard refresh** extension popup: Close it, reload extension, reopen
5. **Clear storage** if needed: Extension → Details → Storage → Clear site data

## After Initial Load

Once loaded, you can:

- Make code changes
- Run `npm run build`
- Click reload in Chrome extensions page
- Test immediately

No need to remove and re-add the extension each time!
