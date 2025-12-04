import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Code, Database, Rocket, Shield, Zap, CheckCircle2, Sparkles } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { Heading, SubHeading } from '@/components/ui/heading'
import { EnhancedBadge } from '@/components/ui/enhanced-badge'
import { DivideX } from '@/components/ui/divide'
import { Button } from '@/components/ui/button'
import { useMCPGlobalPrompts } from '@/hooks/prompts'

export const Route = createFileRoute('/_dashboard/about')({
  component: AboutComponent,
})

function AboutComponent() {
  // Register MCP prompts for this page
  useMCPGlobalPrompts()

  return (
    <div className="h-full flex flex-col overflow-auto bg-background">
      {/* Hero Header */}
      <div className="relative border-b border-divide bg-gradient-to-br from-white via-gray-50 to-gray-100">
        <Container className="px-6 py-16 text-center">
          <EnhancedBadge text="Technology Stack" />
          <Heading as="h1" className="mt-4">
            Built with <span className="text-primary">Modern Tools</span>
          </Heading>
          <SubHeading className="mx-auto mt-4 max-w-2xl">
            A cutting-edge stack featuring TanStack Router, Dexie.js, and the latest web technologies
          </SubHeading>
        </Container>
      </div>

      <DivideX />

      {/* Tech Stack Section */}
      <Container className="py-12 px-6">
        <div className="text-center mb-10">
          <Heading as="h2" className="text-3xl">
            Core Technologies
          </Heading>
          <SubHeading className="mt-3">
            Powerful tools working together seamlessly
          </SubHeading>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-primary hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Rocket className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">TanStack Router</CardTitle>
                  <p className="text-xs text-muted-foreground">File-based routing</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-3">
                Type-safe routing with automatic code-splitting
              </p>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">Type-safe</Badge>
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">Auto-split</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-chart-2 hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-chart-2/10 flex items-center justify-center">
                  <Database className="h-6 w-6 text-chart-2" />
                </div>
                <div>
                  <CardTitle className="text-lg">Dexie & Zod</CardTitle>
                  <p className="text-xs text-muted-foreground">Client DB + Validation</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-3">
                IndexedDB wrapper with runtime validation
              </p>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="text-xs bg-chart-2/10 text-chart-2">IndexedDB</Badge>
                <Badge variant="secondary" className="text-xs bg-chart-2/10 text-chart-2">Runtime</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-chart-3 hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-chart-3/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-chart-3" />
                </div>
                <div>
                  <CardTitle className="text-lg">Vite</CardTitle>
                  <p className="text-xs text-muted-foreground">Build tool</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-3">
                Lightning-fast builds and hot module replacement
              </p>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="text-xs bg-chart-3/10 text-chart-3">Fast HMR</Badge>
                <Badge variant="secondary" className="text-xs bg-chart-3/10 text-chart-3">ESM</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-chart-4 hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-chart-4/10 flex items-center justify-center">
                  <Code className="h-6 w-6 text-chart-4" />
                </div>
                <div>
                  <CardTitle className="text-lg">ShadCN UI</CardTitle>
                  <p className="text-xs text-muted-foreground">Component library</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-3">
                Accessible components built with Radix UI
              </p>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="text-xs bg-chart-4/10 text-chart-4">Accessible</Badge>
                <Badge variant="secondary" className="text-xs bg-chart-4/10 text-chart-4">Radix</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-primary hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">TypeScript</CardTitle>
                  <p className="text-xs text-muted-foreground">End-to-end types</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-3">
                Full type safety from routes to database
              </p>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">Type-safe</Badge>
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">v5.8</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-chart-2 hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-chart-2/10 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-chart-2" />
                </div>
                <div>
                  <CardTitle className="text-lg">Tailwind CSS</CardTitle>
                  <p className="text-xs text-muted-foreground">Utility framework</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-3">
                Modern utility-first CSS framework v4
              </p>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="text-xs bg-chart-2/10 text-chart-2">v4</Badge>
                <Badge variant="secondary" className="text-xs bg-chart-2/10 text-chart-2">JIT</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>

      <DivideX />

      {/* Key Features Section */}
      <div className="bg-muted py-12">
        <Container className="px-6">
          <div className="text-center mb-10">
            <Heading as="h2" className="text-3xl">
              Key Features
            </Heading>
            <SubHeading className="mt-3">
              Everything you need for modern web development
            </SubHeading>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 p-6 bg-card rounded-xl border border hover:border-primary transition-colors">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary mb-2">Full Type-Safety</h3>
                <p className="text-sm text-muted-foreground">
                  End-to-end type safety from routes to database with TypeScript and Zod validation
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-card rounded-xl border border hover:border-chart-2 transition-colors">
              <div className="h-12 w-12 rounded-xl bg-chart-2/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-6 w-6 text-chart-2" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary mb-2">Real-time Updates</h3>
                <p className="text-sm text-muted-foreground">
                  Live hooks automatically update the UI when data changes using Dexie's live queries
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-card rounded-xl border border hover:border-chart-3 transition-colors">
              <div className="h-12 w-12 rounded-xl bg-chart-3/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-6 w-6 text-chart-3" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary mb-2">Modern UI</h3>
                <p className="text-sm text-muted-foreground">
                  Beautiful, accessible components with smooth animations and modern design patterns
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-card rounded-xl border border hover:border-chart-4 transition-colors">
              <div className="h-12 w-12 rounded-xl bg-chart-4/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-6 w-6 text-chart-4" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary mb-2">Great Developer Experience</h3>
                <p className="text-sm text-muted-foreground">
                  Fast hot module replacement, excellent tooling, and comprehensive TypeScript support
                </p>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <DivideX />

      {/* Architecture Section */}
      <Container className="py-12 px-6">
        <div className="text-center mb-10">
          <Heading as="h2" className="text-3xl">
            Architecture Overview
          </Heading>
          <SubHeading className="mt-3">
            A well-structured, scalable application architecture
          </SubHeading>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="text-xl text-primary">Frontend</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  React 19
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  TanStack Router
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  Tailwind CSS v4
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  ShadCN Components
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-chart-2">
            <CardHeader>
              <CardTitle className="text-xl text-chart-2">Data Layer</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-chart-2"></div>
                  Dexie.js
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-chart-2"></div>
                  IndexedDB
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-chart-2"></div>
                  Live Queries
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-chart-2"></div>
                  Zod Validation
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-chart-3">
            <CardHeader>
              <CardTitle className="text-xl text-chart-3">Build Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-chart-3"></div>
                  Vite
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-chart-3"></div>
                  TypeScript
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-chart-3"></div>
                  ESLint
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-chart-3"></div>
                  Cloudflare Workers
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </Container>

      <DivideX />

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-16">
        <Container className="px-6 text-center">
          <Heading as="h2" className="text-3xl mb-4">
            Ready to explore?
          </Heading>
          <SubHeading className="mb-8 max-w-xl mx-auto">
            Check out the posts or explore the design system showcase
          </SubHeading>
          <div className="flex items-center justify-center gap-4">
            <Button variant="default" size="lg">
              View Posts
            </Button>
            <Button variant="brand" size="lg">
              Design System
            </Button>
          </div>
        </Container>
      </div>
    </div>
  )
}
