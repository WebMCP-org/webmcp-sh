import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Toaster } from '@/components/ui/sonner'
import { PGliteProvider } from '@electric-sql/pglite-react'
import { pg_lite } from '@/lib/db/database'
import { PGliteWithLive } from '@electric-sql/pglite/live'
import { PWAUpdatePrompt } from '@/components/pwa-update-prompt'
import { PWAInstallPrompt } from '@/components/pwa-install-prompt'
import { useMCPNavigationTool } from '@/hooks/useMCPNavigationTool'
import { useMCPDataTools } from '@/hooks/useMCPDataTools'
import { ThemeProvider } from '@/components/theme-provider'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  // Register MCP tools at the root level so they're always available
  useMCPNavigationTool();
  useMCPDataTools();

  return (
    <ThemeProvider defaultTheme="system" storageKey="webmcp-ui-theme">
      <PGliteProvider db={pg_lite as unknown as PGliteWithLive}>
        <Outlet />
        <Toaster />
        <PWAUpdatePrompt />
        <PWAInstallPrompt />
        {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-right" />}
      </PGliteProvider>
    </ThemeProvider>
  )
}
