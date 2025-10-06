import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Download } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        console.log('User accepted the install prompt')
      } else {
        console.log('User dismissed the install prompt')
      }
    } catch (error) {
      console.error('Error showing install prompt:', error)
    } finally {
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Store dismissal in localStorage to not show again for some time
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  // Check if we should show the prompt based on previous dismissal
  useEffect(() => {
    const dismissedTime = localStorage.getItem('pwa-install-dismissed')
    if (dismissedTime) {
      const daysSinceDismissal = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24)
      if (daysSinceDismissal < 7) {
        setShowInstallPrompt(false)
      }
    }
  }, [])

  if (isInstalled || !showInstallPrompt || !deferredPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Alert className="border-primary/20 bg-background/95 backdrop-blur">
        <Download className="h-4 w-4" />
        <AlertTitle className="flex items-center justify-between">
          Install WebMCP
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 -mr-2"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertTitle>
        <AlertDescription className="space-y-3">
          <p>Install this app on your device for a better experience with offline access and faster loading.</p>
          <div className="flex gap-2">
            <Button onClick={handleInstallClick} size="sm" className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Install
            </Button>
            <Button onClick={handleDismiss} variant="outline" size="sm">
              Not now
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}