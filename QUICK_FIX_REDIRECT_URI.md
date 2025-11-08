# Quick Fix: Redirect URI Mismatch Error

## The Error
```
Error 400: redirect_uri_mismatch
redirect_uri=https://hijfpdebgoigcjhannhjnhbmlglagmdo.chromiumapp.org/
```

## Your Redirect URI
**Copy this EXACT URI (including the trailing slash):**
```
https://hijfpdebgoigcjhannhjnhbmlglagmdo.chromiumapp.org/
```

## Step-by-Step Fix

### 1. Open Google Cloud Console
Go to: **https://console.cloud.google.com/apis/credentials**

### 2. Select Your Project
- Make sure you're in the correct project (the one with your OAuth credentials)

### 3. Find Your OAuth 2.0 Client ID
- Look for the Client ID that matches your `VITE_GOOGLE_CLIENT_ID` from your `.env` file
- Click on it to edit

### 4. Add the Redirect URI
- Scroll down to **"Authorized redirect URIs"** section
- Click **"+ ADD URI"** button
- **Paste this EXACT URI:**
  ```
  https://hijfpdebgoigcjhannhjnhbmlglagmdo.chromiumapp.org/
  ```
- ⚠️ **IMPORTANT:** 
  - Include the trailing slash `/` at the end
  - Copy it exactly as shown above
  - No extra spaces or characters

### 5. Save
- Click **"SAVE"** button at the bottom

### 6. Wait for Propagation
- Changes usually take effect immediately
- Sometimes it can take 1-2 minutes
- If it doesn't work immediately, wait a minute and try again

### 7. Verify
- The URI should now appear in your "Authorized redirect URIs" list
- Try logging in to your extension again

## Common Mistakes to Avoid

❌ **Don't** add: `https://hijfpdebgoigcjhannhjnhbmlglagmdo.chromiumapp.org` (missing trailing slash)
❌ **Don't** add: `http://hijfpdebgoigcjhannhjnhbmlglagmdo.chromiumapp.org/` (wrong protocol)
❌ **Don't** add extra paths like `/callback` or `/auth`

✅ **Do** add: `https://hijfpdebgoigcjhannhjnhbmlglagmdo.chromiumapp.org/` (exact match)

## Still Not Working?

1. **Double-check the URI** - Make sure it matches exactly (including trailing slash)
2. **Check the Client ID** - Make sure you're editing the correct OAuth Client ID
3. **Wait longer** - Sometimes Google takes a few minutes to propagate changes
4. **Check the console** - Open the extension popup console to see the exact redirect URI being used
5. **Verify extension ID** - If you reloaded the extension, the ID might have changed

## Finding Your Current Redirect URI

If you're not sure what your redirect URI is:

1. Open your extension popup
2. Right-click → "Inspect" (or press F12)
3. Go to the Console tab
4. Look for the log message showing your redirect URI
5. Or run this command in the console:
   ```javascript
   chrome.identity.getRedirectURL()
   ```

## Note About Extension IDs

- In **developer mode**, the extension ID can change when you reload
- For **production**, use the extension ID from Chrome Web Store
- Each time the ID changes, you'll need to add the new redirect URI

