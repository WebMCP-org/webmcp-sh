import { Link, useRouterState } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { Home, Brain, Database, Network, Terminal, ScrollText } from 'lucide-react'
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

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
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

// Combined mobile navigation - bottom nav only
export function MobileNavigation() {
  return <MobileBottomNav />
}
