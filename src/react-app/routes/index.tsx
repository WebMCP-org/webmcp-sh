import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Container } from '@/components/ui/container'
import { Badge } from '@/components/ui/badge'
import {
  Database,
  Network,
  Terminal,
  Brain,
  ArrowRight,
  Github,
  ExternalLink,
  BookOpen,
  Code2,
  Table2,
  Navigation,
  ChevronRight,
} from 'lucide-react'

export const Route = createFileRoute('/')({
  component: HomePage,
})

const CODE_EXAMPLES = {
  useWebMCP: `// From useMCPNavigationTool.ts
useWebMCP({
  name: 'navigate',
  description: 'Navigate to a different route in the application',
  inputSchema: {
    to: z.string().describe('The route path to navigate to'),
    params: z.record(z.string(), z.any()).optional(),
    search: z.record(z.string(), z.any()).optional(),
  },
  handler: async (input) => {
    await router.navigate({ to: input.to, params: input.params });
    return \`Navigated to \${input.to}\`;
  },
});`,

  sqlTool: `// From useMCPSQLTool.ts
useWebMCP({
  name: 'sql_query',
  description: 'Execute SQL queries against the database',
  inputSchema: {
    query: z.string().describe('The SQL query to execute'),
  },
  handler: async (input) => {
    const analysis = analyzeQuery(input.query);
    if (analysis.isDangerous) {
      throw new Error(\`Blocked: \${analysis.reason}\`);
    }
    const result = await pg_lite.query(input.query);
    return JSON.stringify(result.rows, null, 2);
  },
});`,

  tableTool: `// From useMCPTableTools.ts
useWebMCP({
  name: \`table_\${tableName}\`,
  description: 'Control table UI: filter, sort, group, paginate',
  inputSchema: {
    operation: z.enum(['filter_column', 'sort', 'search',
                       'group_by', 'paginate', 'select']),
    column: z.string().optional(),
    value: z.unknown().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  },
  handler: async (input) => {
    // Manipulates React state to update UI in real-time
    if (input.operation === 'filter_column') {
      setColumnFilters(prev => [...prev, { id: input.column, value: input.value }]);
    }
    // ... other operations
  },
});`,

  graphTool: `// From useMCPGraphTools.ts
useWebMCP({
  name: 'graph_query_entities',
  description: 'Query entities and highlight them in the graph',
  inputSchema: {
    where_clause: z.string().describe('SQL WHERE clause'),
    zoom_to_results: z.boolean().optional().default(true),
  },
  handler: async (input) => {
    const result = await pg_lite.query(
      \`SELECT * FROM memory_entities WHERE \${input.where_clause}\`
    );
    // Highlight matching nodes in React Flow
    reactFlowInstance.setNodes(nodes.map(node => ({
      ...node,
      className: matchedIds.has(node.id) ? 'highlighted' : '',
    })));
  },
});`,
}

const TOOLS_DEMONSTRATED = [
  {
    category: 'Navigation',
    icon: Navigation,
    tools: [
      { name: 'navigate', description: 'Navigate to routes in the application' },
      { name: 'get_current_context', description: 'Get current route and page context' },
      { name: 'list_all_routes', description: 'List all available routes with descriptions' },
      { name: 'app_gateway', description: 'Primary entry point for understanding the app' },
    ],
  },
  {
    category: 'SQL Database',
    icon: Database,
    tools: [
      { name: 'sql_query', description: 'Execute SELECT, INSERT, UPDATE, DELETE queries' },
      { name: 'get_database_info', description: 'Get complete schema and query patterns' },
    ],
  },
  {
    category: 'Table Controls',
    icon: Table2,
    tools: [
      { name: 'table_*', description: 'Filter, sort, search, group, paginate any table' },
      { name: 'filter_column', description: 'Add column filters with various match types' },
      { name: 'batch_filter', description: 'Apply multiple filters at once' },
      { name: 'group_by', description: 'Group rows by one or more columns' },
    ],
  },
  {
    category: 'Knowledge Graph',
    icon: Network,
    tools: [
      { name: 'graph_query_entities', description: 'Query and highlight entities in the graph' },
      { name: 'graph_focus_entity', description: 'Focus view on a specific entity' },
      { name: 'graph_set_layout', description: 'Change graph layout algorithm' },
      { name: 'graph_3d_rotate', description: 'Control 3D graph rotation and zoom' },
    ],
  },
]

function HomePage() {
  return (
    <div className="min-h-screen bg-background overflow-auto">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <Container className="px-6 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-brand to-brand/80 flex items-center justify-center">
                <span className="text-white font-bold">W</span>
              </div>
              <span className="font-semibold text-lg">WebMCP Demo</span>
            </Link>
            <div className="flex items-center gap-3">
              <a
                href="https://docs.mcp-b.ai/introduction.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <BookOpen className="h-4 w-4" />
                Docs
              </a>
              <a
                href="https://docs.mcp-b.ai/packages/react-webmcp.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <Code2 className="h-4 w-4" />
                React Hooks
              </a>
              <a
                href="https://github.com/WebMCP-org/webmcp-sh"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-4 w-4" />
              </a>
              <Link to="/dashboard">
                <Button variant="brand" size="sm">
                  Open Demo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </nav>

      {/* Header */}
      <section className="border-b border-border py-12">
        <Container className="px-6">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-4">Kitchen Sink Demo</Badge>
            <h1 className="text-3xl font-bold mb-4">
              WebMCP Tools in Action
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              This application demonstrates how to expose website functionality to AI agents using{' '}
              <a href="https://docs.mcp-b.ai/introduction.md" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                WebMCP
              </a>
              . It's a complete example showing navigation tools, SQL database access, table controls,
              and graph visualization—all accessible through the{' '}
              <code className="text-sm bg-muted px-1.5 py-0.5 rounded">navigator.modelContext</code> API.
            </p>
            <div className="flex gap-3">
              <Link to="/dashboard">
                <Button variant="brand">
                  Explore the Demo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="https://docs.mcp-b.ai/quickstart.md" target="_blank" rel="noopener noreferrer">
                <Button variant="outline">
                  Quick Start Guide
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* What is WebMCP */}
      <section className="py-12 border-b border-border">
        <Container className="px-6">
          <h2 className="text-xl font-semibold mb-4">What is WebMCP?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4 text-muted-foreground">
              <p>
                WebMCP enables websites to expose structured tools that AI agents can discover and invoke.
                Instead of AI navigating UI elements or scraping pages, it calls well-defined functions
                with validated inputs and structured outputs.
              </p>
              <p>
                Tools are registered using the{' '}
                <a href="https://docs.mcp-b.ai/packages/react-webmcp.md" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                  @mcp-b/react-webmcp
                </a>{' '}
                package with the <code className="text-sm bg-muted px-1.5 py-0.5 rounded">useWebMCP</code> hook.
                Each tool defines its name, description, input schema (using Zod), and handler function.
              </p>
            </div>
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <pre className="text-xs overflow-x-auto"><code>{`import { useWebMCP } from '@mcp-b/react-webmcp';
import { z } from 'zod';

useWebMCP({
  name: 'my_tool',
  description: 'What this tool does',
  inputSchema: {
    param: z.string().describe('Parameter description'),
  },
  handler: async (input) => {
    // Tool implementation
    return 'Result for AI';
  },
});`}</code></pre>
              </CardContent>
            </Card>
          </div>
        </Container>
      </section>

      {/* Tools Demonstrated */}
      <section className="py-12 border-b border-border bg-muted/20">
        <Container className="px-6">
          <h2 className="text-xl font-semibold mb-6">Tools Demonstrated in This App</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {TOOLS_DEMONSTRATED.map((category) => (
              <Card key={category.category}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <category.icon className="h-5 w-5 text-brand" />
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    {category.tools.map((tool) => (
                      <li key={tool.name} className="flex items-start gap-2 text-sm">
                        <ChevronRight className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                            {tool.name}
                          </code>
                          <span className="text-muted-foreground ml-2">{tool.description}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Code Examples */}
      <section className="py-12 border-b border-border">
        <Container className="px-6">
          <h2 className="text-xl font-semibold mb-2">Code from This Demo</h2>
          <p className="text-muted-foreground mb-6">
            These are actual code snippets from the hooks used in this application.
          </p>

          <div className="space-y-6">
            {/* Navigation Tool */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Navigation className="h-4 w-4 text-brand" />
                <h3 className="font-medium">Navigation Tool</h3>
                <Badge variant="outline" className="text-xs">useMCPNavigationTool.ts</Badge>
              </div>
              <Card className="bg-zinc-950">
                <CardContent className="p-4">
                  <pre className="text-xs text-zinc-300 overflow-x-auto"><code>{CODE_EXAMPLES.useWebMCP}</code></pre>
                </CardContent>
              </Card>
            </div>

            {/* SQL Tool */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-brand" />
                <h3 className="font-medium">SQL Query Tool</h3>
                <Badge variant="outline" className="text-xs">useMCPSQLTool.ts</Badge>
              </div>
              <Card className="bg-zinc-950">
                <CardContent className="p-4">
                  <pre className="text-xs text-zinc-300 overflow-x-auto"><code>{CODE_EXAMPLES.sqlTool}</code></pre>
                </CardContent>
              </Card>
            </div>

            {/* Table Tool */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Table2 className="h-4 w-4 text-brand" />
                <h3 className="font-medium">Table Control Tool</h3>
                <Badge variant="outline" className="text-xs">useMCPTableTools.ts</Badge>
              </div>
              <Card className="bg-zinc-950">
                <CardContent className="p-4">
                  <pre className="text-xs text-zinc-300 overflow-x-auto"><code>{CODE_EXAMPLES.tableTool}</code></pre>
                </CardContent>
              </Card>
            </div>

            {/* Graph Tool */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Network className="h-4 w-4 text-brand" />
                <h3 className="font-medium">Graph Visualization Tool</h3>
                <Badge variant="outline" className="text-xs">useMCPGraphTools.ts</Badge>
              </div>
              <Card className="bg-zinc-950">
                <CardContent className="p-4">
                  <pre className="text-xs text-zinc-300 overflow-x-auto"><code>{CODE_EXAMPLES.graphTool}</code></pre>
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Pages in This Demo */}
      <section className="py-12 border-b border-border bg-muted/20">
        <Container className="px-6">
          <h2 className="text-xl font-semibold mb-6">Pages in This Demo</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { path: '/dashboard', icon: Brain, title: 'Dashboard', description: 'Memory overview with stats, charts, and audit logs' },
              { path: '/memory-blocks', icon: Brain, title: 'Memory Blocks', description: 'Manage always-in-context memory blocks' },
              { path: '/entities', icon: Database, title: 'Entities', description: 'Browse facts, preferences, skills, and more' },
              { path: '/graph', icon: Network, title: 'Knowledge Graph', description: '2D/3D visualization of entity relationships' },
              { path: '/sql-repl', icon: Terminal, title: 'SQL REPL', description: 'Execute queries against the in-browser database' },
              { path: '/sql-execution-log', icon: Terminal, title: 'Execution Log', description: 'View SQL query history and analytics' },
            ].map((page) => (
              <Link key={page.path} to={page.path}>
                <Card className="h-full hover:border-brand/50 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <page.icon className="h-4 w-4 text-brand" />
                      <span className="font-medium">{page.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{page.description}</p>
                    <code className="text-xs text-muted-foreground mt-2 block">{page.path}</code>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Documentation Links */}
      <section className="py-12 border-b border-border">
        <Container className="px-6">
          <h2 className="text-xl font-semibold mb-6">Learn More</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Introduction to WebMCP', url: 'https://docs.mcp-b.ai/introduction.md', description: 'What WebMCP is and how it works' },
              { title: 'Quick Start', url: 'https://docs.mcp-b.ai/quickstart.md', description: 'Add WebMCP to your website in minutes' },
              { title: 'React Hooks (@mcp-b/react-webmcp)', url: 'https://docs.mcp-b.ai/packages/react-webmcp.md', description: 'useWebMCP hook documentation' },
              { title: 'Tool Design Patterns', url: 'https://docs.mcp-b.ai/concepts/tool-design.md', description: 'Best practices for designing tools' },
              { title: 'Security Best Practices', url: 'https://docs.mcp-b.ai/security.md', description: 'Input validation and safety' },
              { title: 'Connecting Agents', url: 'https://docs.mcp-b.ai/connecting-agents.md', description: 'How AI agents connect to WebMCP' },
              { title: 'MCP-B Extension', url: 'https://docs.mcp-b.ai/extension/index.md', description: 'Browser extension for testing' },
              { title: 'Live Examples', url: 'https://docs.mcp-b.ai/live-tool-examples.md', description: 'Interactive tool demonstrations' },
              { title: 'Architecture Overview', url: 'https://docs.mcp-b.ai/concepts/architecture.md', description: 'How the pieces fit together' },
            ].map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Card className="h-full hover:border-brand/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{link.title}</span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">{link.description}</p>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="py-6 border-t border-border">
        <Container className="px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-brand/10 flex items-center justify-center">
                <span className="text-brand font-bold text-xs">W</span>
              </div>
              <span>WebMCP Kitchen Sink Demo</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://docs.mcp-b.ai" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                Documentation
              </a>
              <a href="https://github.com/WebMCP-org/webmcp-sh" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                Source Code
              </a>
              <a href="https://www.npmjs.com/package/@mcp-b/react-webmcp" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                NPM Package
              </a>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  )
}
