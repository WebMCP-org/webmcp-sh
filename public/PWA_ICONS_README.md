# PWA Icons Setup

This app requires PWA icons for full functionality. You need to add the following files to this `public/` directory:

## Required Icons

1. **pwa-192x192.png** - 192x192 pixels
2. **pwa-512x512.png** - 512x512 pixels

## How to Generate Icons

You can use any of these methods:

### Option 1: Online Tools
- [PWA Asset Generator](https://progressier.com/pwa-icons-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [Favicon.io](https://favicon.io/)

### Option 2: Using ImageMagick (if installed)
```bash
# Create a simple colored square as a placeholder
convert -size 512x512 xc:#4F46E5 -gravity center -pointsize 200 -fill white -annotate +0+0 "W" pwa-512x512.png
convert pwa-512x512.png -resize 192x192 pwa-192x192.png
```

### Option 3: Manual Creation
Create PNG images with the specified dimensions using any image editor (Photoshop, GIMP, Figma, etc.)

## Temporary Solution

Until you create proper icons, the app will show warnings in the console, but PWA functionality will still work. The manifest is configured to use these icons once they're available.
