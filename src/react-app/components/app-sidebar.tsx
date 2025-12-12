import * as React from "react"
import { Link, useRouterState } from "@tanstack/react-router"
import {
  IconBrain,
  IconChartPie,
  IconDatabase,
  IconNetwork,
  IconTerminal,
  IconFileText,
  IconHelp,
  IconSun,
  IconMoon,
  IconBook,
  IconCode,
  IconRocket,
  IconBrandGithub,
  IconMail,
  IconExternalLink,
  IconDots,
  IconMap,
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
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/theme-provider"

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
      title: "Map",
      url: "/map",
      icon: IconMap,
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
      title: "Get Help",
      url: "https://mcp-b.ai",
      icon: IconHelp,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("system")
    } else {
      setTheme("light")
    }
  }

  const getThemeLabel = () => {
    if (theme === "light") return "Light"
    if (theme === "dark") return "Dark"
    return "System"
  }

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
                <div className="h-6 w-6 rounded-md bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xs">W</span>
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
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Resources & Docs Dropdown */}
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="cursor-pointer">
                      <IconDots className="h-4 w-4" />
                      <span>Resources</span>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="top" align="start" className="w-56">
                    <DropdownMenuLabel>Documentation</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <a href="https://docs.mcp-b.ai/introduction" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 cursor-pointer">
                        <IconBook className="h-4 w-4" />
                        <span>Introduction</span>
                        <IconExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="https://docs.mcp-b.ai/quickstart" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 cursor-pointer">
                        <IconRocket className="h-4 w-4" />
                        <span>Quick Start</span>
                        <IconExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="https://docs.mcp-b.ai/packages/react-webmcp" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 cursor-pointer">
                        <IconCode className="h-4 w-4" />
                        <span>React Hooks</span>
                        <IconExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Connect</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <a href="https://github.com/WebMCP-org/webmcp-sh" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 cursor-pointer">
                        <IconBrandGithub className="h-4 w-4" />
                        <span>GitHub</span>
                        <IconExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="mailto:alex@mcp-b.ai" className="flex items-center gap-2 cursor-pointer">
                        <IconMail className="h-4 w-4" />
                        <span>Contact Us</span>
                        <span className="ml-auto text-xs text-muted-foreground">alex@mcp-b.ai</span>
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
              {/* Theme Toggle */}
              <SidebarMenuItem>
                <SidebarMenuButton onClick={toggleTheme}>
                  {theme === "dark" ? (
                    <IconMoon className="h-4 w-4" />
                  ) : (
                    <IconSun className="h-4 w-4" />
                  )}
                  <span>{getThemeLabel()}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  )
}
