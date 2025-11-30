import * as React from "react"
import { Link, useRouterState } from "@tanstack/react-router"
import {
  IconBrain,
  IconChartPie,
  IconDatabase,
  IconNetwork,
  IconSettings,
  IconTerminal,
  IconFileText,
  IconHelp,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconChartPie,
    },
    {
      title: "Memory Blocks",
      url: "/memory-blocks",
      icon: IconBrain,
    },
    {
      title: "Entities",
      url: "/entities",
      icon: IconDatabase,
    },
    {
      title: "Graph",
      url: "/graph",
      icon: IconNetwork,
    },
    {
      title: "SQL REPL",
      url: "/sql-repl",
      icon: IconTerminal,
    },
    {
      title: "SQL Log",
      url: "/sql-execution-log",
      icon: IconFileText,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "https://mcp-b.ai",
      icon: IconHelp,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link to="/">
                <div className="h-6 w-6 rounded-md bg-gradient-to-br from-brand to-brand/80 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">W</span>
                </div>
                <span className="text-base font-semibold">WebMCP</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} currentPath={currentPath} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  )
}
