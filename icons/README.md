# Extension Icons

Place your extension icons in this folder:

- `icon16.png` - 16x16 pixels (toolbar icon)
- `icon48.png` - 48x48 pixels (extension management page)
- `icon128.png` - 128x128 pixels (Chrome Web Store)

## Creating Icons

You can create simple icons using:
- Online tools like [Favicon Generator](https://favicon.io/)
- Image editors (Photoshop, GIMP, etc.)
- Or use placeholder images for now

## After Adding Icons

Once you add the icon files, update `manifest.json` to include:

```json
"action": {
  "default_popup": "dist/popup.html",
  "default_icon": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
},
"icons": {
  "16": "icons/icon16.png",
  "48": "icons/icon48.png",
  "128": "icons/icon128.png"
}
```

The extension will work without icons, but Chrome may show warnings.
