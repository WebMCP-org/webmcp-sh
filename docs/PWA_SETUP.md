# PWA Setup with Migrations

Your Vite React PGLite application is now configured as a Progressive Web App (PWA) with automatic database migrations on updates.

## What Was Implemented

### 1. PWA Plugin Configuration
- **File**: [vite.config.ts](vite.config.ts#L21)
- Configured `vite-plugin-pwa` with:
  - `registerType: 'prompt'` - Shows update dialog to users
  - Service worker with offline support
  - Auto-cleanup of outdated caches
  - Development mode enabled for testing

### 2. Enhanced Migration System
- **File**: [src/react-app/lib/db/migrate.ts](src/react-app/lib/db/migrate.ts)
- Features:
  - Tracks executed migrations in `drizzle_migrations` table
  - Prevents duplicate migration runs
  - Executes only pending migrations
  - Provides detailed logging
  - Returns count of migrations executed

### 3. PWA Update Component
- **File**: [src/react-app/components/pwa-update-prompt.tsx](src/react-app/components/pwa-update-prompt.tsx)
- Features:
  - Detects when new service worker is available
  - Shows user-friendly update dialog
  - Automatically runs pending migrations before updating
  - Shows toast notifications for migration status
  - Handles offline-ready notifications

### 4. Integration
- **File**: [src/react-app/routes/__root.tsx](src/react-app/routes/__root.tsx#L75)
- PWA update prompt added to root layout
- Toaster component for notifications

## How It Works

### Update Flow
1. User opens app, service worker checks for updates
2. When new version detected, update dialog appears
3. User clicks "Update Now"
4. System runs any pending database migrations
5. Service worker updates to new version
6. Page reloads with new code and migrated database

### Migration Flow
1. On app start, migrations run automatically
2. On PWA update, migrations run before reload
3. Migration tracking prevents duplicate runs
4. Each migration is hashed and recorded in database

## Testing

### In Development
```bash
pnpm dev
```

The PWA is enabled in development mode, so you can test:
- Service worker registration
- Update prompts (when you rebuild)
- Migration execution

### Testing Updates
1. Run `pnpm dev`
2. Make a change to your code
3. Rebuild the app (`pnpm build`)
4. The update prompt should appear
5. Click "Update Now" to test migration + update flow

### Testing Migrations
1. Add new migrations: `pnpm db:generate`
2. The migration system will automatically detect and run them
3. Check browser console for migration logs

## Production Build
```bash
pnpm build
```

This creates:
- Optimized production bundle
- Service worker (`sw.js`)
- Web manifest (`manifest.webmanifest`)
- Precached assets

## PWA Icons

⚠️ **Important**: You need to add PWA icons to the `public/` directory:
- `pwa-192x192.png` (192x192 pixels)
- `pwa-512x512.png` (512x512 pixels)

See [public/PWA_ICONS_README.md](public/PWA_ICONS_README.md) for instructions.

## Key Files

| File | Purpose |
|------|---------|
| [vite.config.ts](vite.config.ts) | PWA plugin configuration |
| [src/react-app/lib/db/migrate.ts](src/react-app/lib/db/migrate.ts) | Migration system with tracking |
| [src/react-app/lib/db/database.ts](src/react-app/lib/db/database.ts) | Database utilities |
| [src/react-app/lib/db/migrations.json](src/react-app/lib/db/migrations.json) | Compiled migrations |
| [src/react-app/components/pwa-update-prompt.tsx](src/react-app/components/pwa-update-prompt.tsx) | Update UI component |
| [src/react-app/routes/__root.tsx](src/react-app/routes/__root.tsx) | Root layout with PWA integration |

## Console Messages

You'll see these logs in the browser console:

```
[PWA] Service Worker registered
[DB] Starting migration check...
[DB] Found X pending migration(s)
[DB] Executing migration: <hash>
[DB] Successfully completed migration: <hash>
[DB] All X migration(s) completed successfully
```

## Features

✅ Progressive Web App functionality
✅ Install to home screen
✅ Offline support via service worker
✅ Automatic update detection
✅ User-prompted updates
✅ Automatic migration execution on updates
✅ Migration tracking to prevent duplicates
✅ Toast notifications for user feedback
✅ Development mode for testing

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Partial support (iOS requires Add to Home Screen)

## Next Steps

1. Add PWA icons to `public/` directory (see PWA_ICONS_README.md)
2. Customize the app name, theme colors in [vite.config.ts](vite.config.ts#L24)
3. Test the update flow in development
4. Deploy and test on mobile devices
5. Consider adding a "Check for Updates" button in your UI

## Troubleshooting

### Service Worker Not Updating
- Clear browser cache and hard reload (Cmd+Shift+R / Ctrl+Shift+F5)
- Check browser DevTools > Application > Service Workers
- Unregister old service workers manually

### Migrations Not Running
- Check browser console for error messages
- Verify migrations.json exists and is valid
- Check IndexedDB for `drizzle_migrations` table

### Update Dialog Not Appearing
- Ensure there are actual code changes
- Check that `registerType: 'prompt'` is set
- Verify service worker is registered in DevTools
