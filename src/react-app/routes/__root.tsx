import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Home, Brain, Database, Network, Terminal, ScrollText } from 'lucide-react'
import { Toaster } from '@/components/ui/sonner'
import { PGliteProvider } from '@electric-sql/pglite-react'
import { pg_lite } from '@/lib/db/database'
import { PGliteWithLive } from '@electric-sql/pglite/live'
import { motion } from 'motion/react'
import { PWAUpdatePrompt } from '@/components/pwa-update-prompt'
import { PWAInstallPrompt } from '@/components/pwa-install-prompt'
import { useMCPNavigationTool } from '@/hooks/useMCPNavigationTool'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  // Register navigation tools at the root level so they're always available
  useMCPNavigationTool();

  return (
    <PGliteProvider db={pg_lite as unknown as PGliteWithLive}>
      <div className="h-screen flex overflow-hidden bg-background">
        {/* Compact Sidebar */}
        <aside className="w-14 border-r border-border bg-card flex flex-col items-center py-3 gap-1.5">
          {/* Logo */}
          <Link to="/" className="mb-2 group">
            <motion.div
              whileHover={{ scale: 1.15, rotate: 360 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="h-9 w-9 rounded-lg bg-gradient-to-br from-brand to-brand/80 flex items-center justify-center shadow-lg"
            >
              <span className="text-white font-bold text-sm">W</span>
            </motion.div>
          </Link>

          {/* Navigation - More Compact */}
          <nav className="flex flex-col gap-1.5 w-full px-1.5">
            {[
              { to: '/', icon: Home, title: 'Dashboard' },
              { to: '/memory-blocks', icon: Brain, title: 'Memory Blocks' },
              { to: '/entities', icon: Database, title: 'Entities' },
              { to: '/graph', icon: Network, title: 'Graph' },
              { to: '/sql-repl', icon: Terminal, title: 'SQL REPL' },
              { to: '/sql-execution-log', icon: ScrollText, title: 'SQL Execution Log' },
            ].map((item, idx) => (
              <Link key={item.to} to={item.to}>
                {({ isActive }) => (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    whileHover={{ scale: 1.1, x: 2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all duration-150 ${
                      isActive
                        ? 'bg-brand text-white shadow-md'
                        : 'hover:bg-muted text-muted-foreground hover:text-brand'
                    }`}
                    title={item.title}
                  >
                    <item.icon className="h-4 w-4" />
                  </motion.div>
                )}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content Area - Dashboard */}
        <main className="flex-1 overflow-hidden bg-background">
          <Outlet />
        </main>

        {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-right" />}
      </div>

      {/* Toast Notifications */}
      <Toaster />

      {/* PWA Components */}
      <PWAUpdatePrompt />
      <PWAInstallPrompt />
    </PGliteProvider>
  )
}
