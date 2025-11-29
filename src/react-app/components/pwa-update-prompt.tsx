import { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { runMigrations } from '@/lib/db/migrate';
import { toast } from 'sonner';

const OFFLINE_READY_DISMISSED_KEY = 'pwa-offline-ready-dismissed';

/**
 * PWA Update Prompt Component
 *
 * Handles service worker updates and runs database migrations
 * when new versions are available
 */
export function PWAUpdatePrompt() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showOfflineDialog, setShowOfflineDialog] = useState(false);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  // Only show offline dialog if it hasn't been dismissed before
  useEffect(() => {
    if (offlineReady) {
      const wasDismissed = localStorage.getItem(OFFLINE_READY_DISMISSED_KEY);
      if (!wasDismissed) {
        setShowOfflineDialog(true);
      }
    }
  }, [offlineReady]);

  const handleUpdate = async () => {
    setIsUpdating(true);

    try {
      // Run any pending migrations first
      const migrationsRun = await runMigrations();

      if (migrationsRun > 0) {
        toast.success(`Applied ${migrationsRun} database migration(s)`);
      }

      // Update the service worker
      await updateServiceWorker(true);

      toast.success('App updated successfully!');
    } catch {
      toast.error('Failed to update app. Please refresh manually.');
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  const handleOfflineDialogClose = () => {
    // Persist that user has seen the offline ready message
    localStorage.setItem(OFFLINE_READY_DISMISSED_KEY, 'true');
    setShowOfflineDialog(false);
    setOfflineReady(false);
  };

  return (
    <>
      {/* Update Available Dialog */}
      <AlertDialog open={needRefresh} onOpenChange={(open) => !open && handleClose()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Available</AlertDialogTitle>
            <AlertDialogDescription>
              A new version of the app is available. The update includes the latest features and improvements.
              {isUpdating && ' Running migrations and updating...'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>
              Later
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Now'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Offline Ready Dialog */}
      <AlertDialog open={showOfflineDialog} onOpenChange={(open) => !open && handleOfflineDialogClose()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>App Ready for Offline Use</AlertDialogTitle>
            <AlertDialogDescription>
              The app is now cached and ready to work offline!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleOfflineDialogClose}>
              Got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
