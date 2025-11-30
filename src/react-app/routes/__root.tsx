import { createRootRoute, Outlet, useRouterState } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Toaster } from '@/components/ui/sonner'
import { PGliteProvider } from '@electric-sql/pglite-react'
import { pg_lite } from '@/lib/db/database'
import { PGliteWithLive } from '@electric-sql/pglite/live'
import { PWAUpdatePrompt } from '@/components/pwa-update-prompt'
import { PWAInstallPrompt } from '@/components/pwa-install-prompt'
import { useMCPNavigationTool } from '@/hooks/useMCPNavigationTool'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { ThemeProvider } from '@/components/theme-provider'

// JSX type declaration for the webmcp-agent custom element
declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'webmcp-agent': {
        'app-id'?: string
        'api-base'?: string
        'token-endpoint'?: string
        'auto-connect-local'?: boolean
        'view-mode'?: 'pill' | 'modal'
        children?: React.ReactNode
      }
    }
  }
}

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  // Register navigation tools at the root level so they're always available
  useMCPNavigationTool();

  // Check if we're on the home page (landing page)
  const routerState = useRouterState();
  const isHomePage = routerState.location.pathname === '/';

  // If on the landing page, render without sidebar
  if (isHomePage) {
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
    );
  }

  // For all other pages, render with new dashboard sidebar layout
  return (
    <ThemeProvider defaultTheme="system" storageKey="webmcp-ui-theme">
      <PGliteProvider db={pg_lite as unknown as PGliteWithLive}>
        <SidebarProvider
          style={
            {
              "--sidebar-width": "calc(var(--spacing) * 72)",
              "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
          }
        >
          <AppSidebar variant="inset" />
          <SidebarInset>
            <SiteHeader />
            <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
              <Outlet />
            </div>
          </SidebarInset>
        </SidebarProvider>

        {/* Toast Notifications */}
        <Toaster />

        {/* PWA Components */}
        <PWAUpdatePrompt />
        <PWAInstallPrompt />

        {/* WebMCP Embedded Agent */}
        <webmcp-agent
          app-id="playground-webmcp"
          api-base="https://webmcp-agent-playground.alexmnahas.workers.dev"
          view-mode="pill"
        />

        {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-right" />}
      </PGliteProvider>
    </ThemeProvider>
  )
}
