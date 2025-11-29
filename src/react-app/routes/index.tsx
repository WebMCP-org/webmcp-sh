import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Container } from '@/components/ui/container'
import { Heading, SubHeading } from '@/components/ui/heading'
import { EnhancedBadge } from '@/components/ui/enhanced-badge'
import { Badge } from '@/components/ui/badge'
import { motion } from 'motion/react'
import {
  Database,
  Network,
  Terminal,
  Brain,
  Zap,
  Shield,
  Code,
  ArrowRight,
  Github,
  ExternalLink,
  Cpu,
  Layers,
  BarChart3,
} from 'lucide-react'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="min-h-screen bg-background overflow-auto">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <Container className="px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand to-brand/80 flex items-center justify-center shadow-lg"
              >
                <span className="text-white font-bold text-lg">W</span>
              </motion.div>
              <span className="font-bold text-xl">WebMCP.sh</span>
            </Link>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/WebMCP-org/webmcp-sh"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <Link to="/dashboard">
                <Button variant="brand" size="sm">
                  Open Playground
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-chart-2/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-chart-2/10 rounded-full blur-3xl" />

        <Container className="px-6 relative">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <EnhancedBadge text="MCP Development Playground" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Heading as="h1" className="mt-6">
                Build and Test <span className="text-brand">MCP Servers</span> in Your Browser
              </Heading>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <SubHeading className="mt-6 max-w-2xl mx-auto text-lg">
                A modern web-based playground for testing Model Context Protocol (MCP) servers,
                managing AI memory, and visualizing knowledge graphs—all running locally in your browser.
              </SubHeading>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 flex items-center justify-center gap-4"
            >
              <Link to="/dashboard">
                <Button variant="brand" size="xl">
                  Launch Playground
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <a
                href="https://mcp-b.ai"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="xl">
                  Learn About MCP
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </motion.div>

            {/* Tech badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-12 flex items-center justify-center gap-3 flex-wrap"
            >
              <Badge variant="secondary" className="text-xs">React 19</Badge>
              <Badge variant="secondary" className="text-xs">PostgreSQL (WASM)</Badge>
              <Badge variant="secondary" className="text-xs">TypeScript</Badge>
              <Badge variant="secondary" className="text-xs">WebSockets</Badge>
              <Badge variant="secondary" className="text-xs">PWA</Badge>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <Container className="px-6">
          <div className="text-center mb-16">
            <EnhancedBadge text="Features" />
            <Heading as="h2" className="mt-4 text-3xl md:text-4xl">
              Everything You Need for MCP Development
            </Heading>
            <SubHeading className="mt-4 max-w-2xl mx-auto">
              A complete toolkit for building, testing, and debugging MCP servers and clients
            </SubHeading>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Terminal,
                title: 'SQL REPL',
                description: 'Execute SQL queries directly against an in-browser PostgreSQL database powered by PGlite.',
                color: 'text-chart-2',
                bgColor: 'bg-chart-2/10',
              },
              {
                icon: Brain,
                title: 'Memory Management',
                description: 'Store and retrieve AI memory blocks with full CRUD operations and token tracking.',
                color: 'text-brand',
                bgColor: 'bg-brand/10',
              },
              {
                icon: Network,
                title: 'Knowledge Graph',
                description: 'Visualize entity relationships in interactive 2D and 3D graph views.',
                color: 'text-chart-3',
                bgColor: 'bg-chart-3/10',
              },
              {
                icon: Database,
                title: 'Entity Database',
                description: 'Manage entities with categories, memory tiers, and relationship tracking.',
                color: 'text-purple-500',
                bgColor: 'bg-purple-500/10',
              },
              {
                icon: Shield,
                title: 'Audit Logging',
                description: 'Track all database changes with detailed audit logs and operation history.',
                color: 'text-green-500',
                bgColor: 'bg-green-500/10',
              },
              {
                icon: Zap,
                title: 'Real-time Updates',
                description: 'Live queries automatically update the UI when data changes.',
                color: 'text-amber-500',
                bgColor: 'bg-amber-500/10',
              },
            ].map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-l-4 border-l-transparent hover:border-l-brand">
                  <CardContent className="p-6">
                    <div className={`h-12 w-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4`}>
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <Container className="px-6">
          <div className="text-center mb-16">
            <EnhancedBadge text="How It Works" />
            <Heading as="h2" className="mt-4 text-3xl md:text-4xl">
              Browser-Based MCP Testing
            </Heading>
            <SubHeading className="mt-4 max-w-2xl mx-auto">
              No server setup required—everything runs in your browser
            </SubHeading>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: '01',
                icon: Layers,
                title: 'Local Database',
                description: 'PGlite provides a full PostgreSQL database compiled to WebAssembly, running entirely in your browser.',
              },
              {
                step: '02',
                icon: Cpu,
                title: 'MCP Integration',
                description: 'Connect to MCP servers via WebSocket and test tool calls, resources, and prompts in real-time.',
              },
              {
                step: '03',
                icon: BarChart3,
                title: 'Visualize & Debug',
                description: 'Explore your data with interactive visualizations, SQL queries, and comprehensive audit logs.',
              },
            ].map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.15 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center mb-6">
                    <span className="text-6xl font-bold text-muted-foreground/20">{item.step}</span>
                  </div>
                  <div className="h-16 w-16 rounded-2xl bg-brand/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-8 w-8 text-brand" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-1/3 right-0 transform translate-x-1/2">
                    <ArrowRight className="h-6 w-6 text-muted-foreground/30" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20 bg-muted/30">
        <Container className="px-6">
          <div className="text-center mb-16">
            <EnhancedBadge text="Technology" />
            <Heading as="h2" className="mt-4 text-3xl md:text-4xl">
              Built with Modern Tools
            </Heading>
            <SubHeading className="mt-4 max-w-2xl mx-auto">
              Cutting-edge technologies for a seamless development experience
            </SubHeading>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { name: 'React 19', icon: Code, description: 'Latest React' },
              { name: 'PGlite', icon: Database, description: 'Browser PostgreSQL' },
              { name: 'Drizzle ORM', icon: Layers, description: 'Type-safe SQL' },
              { name: 'TanStack Router', icon: Network, description: 'File-based routing' },
              { name: 'Tailwind CSS', icon: Zap, description: 'Utility-first CSS' },
              { name: 'TypeScript', icon: Shield, description: 'Full type safety' },
              { name: 'Vite', icon: Zap, description: 'Fast builds' },
              { name: 'MCP SDK', icon: Cpu, description: 'Protocol support' },
            ].map((tech, idx) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                viewport={{ once: true }}
              >
                <Card className="text-center p-4 hover:shadow-md transition-shadow">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center mx-auto mb-3">
                    <tech.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <h4 className="font-semibold text-sm">{tech.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{tech.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-chart-2/5" />
        <Container className="px-6 relative">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Heading as="h2" className="text-3xl md:text-4xl">
                Ready to Start Building?
              </Heading>
              <SubHeading className="mt-4">
                Launch the playground and start testing MCP servers in your browser today.
              </SubHeading>
              <div className="mt-10 flex items-center justify-center gap-4">
                <Link to="/dashboard">
                  <Button variant="brand" size="xl">
                    Launch Playground
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <a
                  href="https://github.com/WebMCP-org/webmcp-sh"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="xl">
                    <Github className="h-5 w-5" />
                    View on GitHub
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <Container className="px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand to-brand/80 flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="text-sm text-muted-foreground">
                WebMCP.sh - MCP Development Playground
              </span>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="https://mcp-b.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                MCP-B.AI
              </a>
              <a
                href="https://github.com/WebMCP-org/webmcp-sh"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                GitHub
              </a>
              <a
                href="/about"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </a>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  )
}
