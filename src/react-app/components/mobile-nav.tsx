import { Link, useRouterState } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import { Home, Brain, Database, Network, Terminal, ScrollText, Menu, X, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard', icon: Home, title: 'Dashboard', shortTitle: 'Home' },
  { to: '/memory-blocks', icon: Brain, title: 'Memory Blocks', shortTitle: 'Memory' },
  { to: '/entities', icon: Database, title: 'Entities', shortTitle: 'Entities' },
  { to: '/graph', icon: Network, title: 'Graph', shortTitle: 'Graph' },
  { to: '/sql-repl', icon: Terminal, title: 'SQL REPL', shortTitle: 'SQL' },
  { to: '/sql-execution-log', icon: ScrollText, title: 'SQL Log', shortTitle: 'Logs' },
] as const

// Mobile bottom navigation bar - shows on small screens
export function MobileBottomNav() {
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  // Show only first 5 items in bottom nav, rest accessible via menu
  const bottomNavItems = navItems.slice(0, 5)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {bottomNavItems.map((item) => {
          const isActive = currentPath === item.to || currentPath.startsWith(item.to + '/')
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex-1"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-colors",
                  isActive
                    ? "text-brand"
                    : "text-muted-foreground"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-lg transition-colors mb-0.5",
                  isActive && "bg-brand/10"
                )}>
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-medium truncate max-w-[60px]">
                  {item.shortTitle}
                </span>
              </motion.div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

// Mobile header with hamburger menu
export function MobileHeader({ onMenuOpen }: { onMenuOpen: () => void }) {
  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b border-border md:hidden">
      <div className="flex items-center justify-between h-14 px-4">
        <Link to="/" className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand to-brand/80 flex items-center justify-center shadow-md"
          >
            <span className="text-white font-bold text-sm">W</span>
          </motion.div>
          <span className="font-semibold text-base">WebMCP</span>
        </Link>
        <button
          onClick={onMenuOpen}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}

// Full-screen mobile menu drawer
export function MobileDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  // Close drawer when route changes
  useEffect(() => {
    if (isOpen) {
      onClose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPath])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-[280px] max-w-[85vw] bg-card z-50 shadow-xl md:hidden"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between h-14 px-4 border-b border-border">
              <span className="font-semibold">Menu</span>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="p-4 space-y-1">
              {navItems.map((item, idx) => {
                const isActive = currentPath === item.to || currentPath.startsWith(item.to + '/')
                return (
                  <motion.div
                    key={item.to}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link to={item.to}>
                      <div
                        className={cn(
                          "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors",
                          isActive
                            ? "bg-brand/10 text-brand"
                            : "hover:bg-muted text-foreground"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="flex-1 font-medium">{item.title}</span>
                        <ChevronRight className={cn(
                          "h-4 w-4 transition-opacity",
                          isActive ? "opacity-100" : "opacity-0"
                        )} />
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </nav>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
              <Link to="/">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                  <div className="h-6 w-6 rounded bg-brand/10 flex items-center justify-center">
                    <span className="text-brand font-bold text-xs">W</span>
                  </div>
                  <span className="text-sm">Back to Home</span>
                </div>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Combined mobile navigation provider
export function MobileNavigation() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <>
      <MobileHeader onMenuOpen={() => setIsDrawerOpen(true)} />
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      <MobileBottomNav />
    </>
  )
}
