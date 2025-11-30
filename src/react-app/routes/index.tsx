import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Container } from '@/components/ui/container'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'motion/react'
import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
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
  Sparkles,
  X,
  Keyboard,
} from 'lucide-react'

export const Route = createFileRoute('/')({
  component: HomePage,
})

// Tool code snippets - actual code from the hooks
const TOOL_CODE: Record<string, string> = {
  navigate: `useWebMCP({
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

  get_current_context: `useWebMCP({
  name: 'get_current_context',
  description: 'Get the current application context',
  inputSchema: {},
  annotations: { readOnlyHint: true },
  handler: async () => {
    const location = router.state.location;
    return {
      pathname: location.pathname,
      search: location.search || {},
      hash: location.hash || '',
    };
  },
});`,

  list_all_routes: `useWebMCP({
  name: 'list_all_routes',
  description: 'Get all available routes with descriptions',
  inputSchema: {},
  handler: async () => {
    return formatRouteList(); // Returns formatted route documentation
  },
});`,

  app_gateway: `useWebMCP({
  name: 'app_gateway',
  description: 'Primary entry point for understanding the app',
  inputSchema: {
    query: z.string().optional()
      .describe('Specific area to focus on')
  },
  handler: async (input) => {
    let output = formatRouteList();
    if (input.query) {
      // Filter routes based on query
      const relevant = ROUTE_DEFINITIONS.filter(route =>
        route.path.includes(input.query) ||
        route.availableTools?.some(t => t.includes(input.query))
      );
      output += formatRelevantRoutes(relevant);
    }
    return output;
  },
});`,

  sql_query: `useWebMCP({
  name: 'sql_query',
  description: 'Execute SQL queries against the database',
  inputSchema: {
    query: z.string().describe('The SQL query to execute'),
  },
  handler: async (input) => {
    // Safety check - block dangerous operations
    const analysis = analyzeQuery(input.query);
    if (analysis.isDangerous) {
      throw new Error(\`Blocked: \${analysis.reason}\`);
    }

    const result = await pg_lite.query(input.query);
    return JSON.stringify(result.rows, null, 2);
  },
});`,

  get_database_info: `useWebMCP({
  name: 'get_database_info',
  description: 'Get complete schema and query patterns',
  inputSchema: {},
  annotations: { readOnlyHint: true },
  handler: async () => {
    // Returns comprehensive database documentation:
    // - All table schemas with column types
    // - Record counts per table
    // - 7 powerful query patterns (JOINs, CTEs, etc.)
    // - Best practices for efficient querying
    return await getDatabaseInfo();
  },
});`,

  'table_*': `useWebMCP({
  name: \`table_\${tableName}\`,
  description: 'Control table UI in real-time',
  inputSchema: {
    operation: z.enum([
      'filter_column', 'batch_filter', 'clear_filter',
      'group_by', 'sort', 'search', 'paginate', 'select'
    ]),
    column: z.string().optional(),
    value: z.unknown().optional(),
    filterType: z.enum(['equals', 'contains', 'greaterThan', 'between']).optional(),
  },
  handler: async (input) => {
    // Directly manipulates React state for immediate UI updates
    if (input.operation === 'filter_column') {
      setColumnFilters(prev => [...prev, { id: input.column, value: input.value }]);
    }
    if (input.operation === 'sort') {
      setSorting([{ id: input.sortBy, desc: input.sortOrder === 'desc' }]);
    }
    // ... other operations update state similarly
  },
});`,

  filter_column: `// Part of table_* tool
case 'filter_column': {
  const { column, value, filterType = 'contains' } = params;

  if (setColumnFilters) {
    setColumnFilters(prev => {
      const existing = prev.filter(f => f.id !== column);
      return [...existing, { id: column, value }];
    });
    return { success: true, message: \`Filtered \${column}\` };
  }
}`,

  batch_filter: `// Apply multiple filters at once
case 'batch_filter': {
  const { filters } = params;

  const newFilters = filters
    .filter(f => f.value !== undefined)
    .map(f => ({ id: f.column, value: f.value }));

  setColumnFilters(newFilters);
  return { success: true, message: \`Applied \${newFilters.length} filters\` };
}`,

  group_by: `// Group rows by columns
case 'group_by': {
  const groupingColumns = Array.isArray(groupBy) ? groupBy : [groupBy];

  if (setGrouping) {
    setGrouping(groupingColumns);
    return { success: true, message: \`Grouped by: \${groupingColumns.join(', ')}\` };
  } else if (table) {
    table.setGrouping(groupingColumns);
  }
}`,

  graph_query_entities: `useWebMCP({
  name: 'graph_query_entities',
  description: 'Query and highlight entities in the graph',
  inputSchema: {
    where_clause: z.string().describe('SQL WHERE clause'),
    zoom_to_results: z.boolean().optional().default(true),
  },
  handler: async (input) => {
    // Execute SQL to find matching entities
    const result = await pg_lite.query(
      \`SELECT * FROM memory_entities WHERE \${input.where_clause}\`
    );
    const matchedIds = new Set(result.rows.map(e => e.id));

    // Highlight matching nodes in React Flow
    reactFlowInstance.setNodes(nodes.map(node => ({
      ...node,
      className: matchedIds.has(node.id) ? 'highlighted-node' : '',
    })));

    if (input.zoom_to_results) {
      reactFlowInstance.fitView({ nodes: matchedNodes, padding: 0.2 });
    }
  },
});`,

  graph_focus_entity: `useWebMCP({
  name: 'graph_focus_entity',
  description: 'Focus view on a specific entity',
  inputSchema: {
    entity_id: z.string().describe('Entity UUID to focus on'),
    show_connections: z.boolean().optional().default(true),
  },
  handler: async (input) => {
    const node = nodes.find(n => n.id === input.entity_id);
    if (!node) throw new Error('Entity not found in graph');

    // Center view on the node
    reactFlowInstance.setCenter(node.position.x, node.position.y, {
      zoom: 1.5,
      duration: 800,
    });

    // Highlight connections if requested
    if (input.show_connections) {
      const connectedEdges = edges.filter(
        e => e.source === input.entity_id || e.target === input.entity_id
      );
      // ... highlight logic
    }
  },
});`,

  graph_set_layout: `useWebMCP({
  name: 'graph_set_layout',
  description: 'Change graph layout algorithm',
  inputSchema: {
    layout: z.enum(['force', 'hierarchical', 'radial', 'grid']),
    animate: z.boolean().optional().default(true),
  },
  handler: async (input) => {
    const newPositions = calculateLayout(nodes, edges, input.layout);

    if (input.animate) {
      // Animate nodes to new positions
      animateNodes(nodes, newPositions, 800);
    } else {
      reactFlowInstance.setNodes(
        nodes.map(n => ({ ...n, position: newPositions[n.id] }))
      );
    }
  },
});`,

  graph_3d_rotate: `useWebMCP({
  name: 'graph_3d_rotate',
  description: 'Control 3D graph rotation and zoom',
  inputSchema: {
    action: z.enum(['rotate', 'zoom', 'reset', 'auto_rotate']),
    x: z.number().optional(),
    y: z.number().optional(),
    zoom: z.number().optional(),
  },
  handler: async (input) => {
    const controls = threeRef.current?.controls;

    if (input.action === 'rotate') {
      controls.rotateLeft(input.x * Math.PI / 180);
      controls.rotateUp(input.y * Math.PI / 180);
    }
    if (input.action === 'auto_rotate') {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 2;
    }
  },
});`,
}

const TOOLS_DEMONSTRATED = [
  {
    category: 'Navigation',
    icon: Navigation,
    color: 'blue',
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
    color: 'purple',
    tools: [
      { name: 'sql_query', description: 'Execute SELECT, INSERT, UPDATE, DELETE queries' },
      { name: 'get_database_info', description: 'Get complete schema and query patterns' },
    ],
  },
  {
    category: 'Table Controls',
    icon: Table2,
    color: 'green',
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
    color: 'amber',
    tools: [
      { name: 'graph_query_entities', description: 'Query and highlight entities in the graph' },
      { name: 'graph_focus_entity', description: 'Focus view on a specific entity' },
      { name: 'graph_set_layout', description: 'Change graph layout algorithm' },
      { name: 'graph_3d_rotate', description: 'Control 3D graph rotation and zoom' },
    ],
  },
]

const COLOR_CLASSES: Record<string, { card: string; icon: string; badge: string }> = {
  blue: {
    card: 'border-l-4 border-l-blue-500 hover:shadow-blue-500/10',
    icon: 'bg-blue-500/10 text-blue-500',
    badge: 'bg-blue-500/10 text-blue-600',
  },
  purple: {
    card: 'border-l-4 border-l-purple-500 hover:shadow-purple-500/10',
    icon: 'bg-purple-500/10 text-purple-500',
    badge: 'bg-purple-500/10 text-purple-600',
  },
  green: {
    card: 'border-l-4 border-l-green-500 hover:shadow-green-500/10',
    icon: 'bg-green-500/10 text-green-500',
    badge: 'bg-green-500/10 text-green-600',
  },
  amber: {
    card: 'border-l-4 border-l-amber-500 hover:shadow-amber-500/10',
    icon: 'bg-amber-500/10 text-amber-500',
    badge: 'bg-amber-500/10 text-amber-600',
  },
}

// Highlighted code component
function HighlightedCode({ code, language = 'typescript' }: { code: string; language?: string }) {
  return (
    <SyntaxHighlighter
      language={language}
      style={oneDark}
      customStyle={{
        margin: 0,
        padding: '0.75rem',
        fontSize: '0.65rem',
        borderRadius: 0,
        background: 'transparent',
        overflowX: 'auto',
      }}
      codeTagProps={{
        style: {
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
        }
      }}
      wrapLongLines={false}
    >
      {code}
    </SyntaxHighlighter>
  )
}

// Tool item with expandable code
function ToolItem({
  tool,
  color,
  isExpanded,
  onToggle
}: {
  tool: { name: string; description: string }
  color: string
  isExpanded: boolean
  onToggle: () => void
}) {
  const hasCode = TOOL_CODE[tool.name]
  const colors = COLOR_CLASSES[color]

  return (
    <div className="border-b border-border/50 last:border-0">
      <button
        onClick={hasCode ? onToggle : undefined}
        className={`w-full flex items-start gap-1.5 md:gap-2 text-xs md:text-sm p-2 rounded transition-colors text-left ${
          hasCode ? 'hover:bg-muted/50 cursor-pointer active:bg-muted/70' : 'cursor-default'
        }`}
      >
        {hasCode ? (
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="mt-0.5 flex-shrink-0"
          >
            <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
          </motion.div>
        ) : (
          <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground/30 mt-0.5 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <code className={`text-[10px] md:text-xs px-1 md:px-1.5 py-0.5 rounded font-mono ${colors.badge}`}>
            {tool.name}
          </code>
          <span className="text-muted-foreground ml-1 md:ml-2 text-[11px] md:text-sm">{tool.description}</span>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && hasCode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mx-1.5 md:mx-2 mb-2 rounded-lg bg-zinc-950 border border-zinc-800 overflow-x-auto">
              <HighlightedCode code={TOOL_CODE[tool.name]} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Code modal for mobile/full view
function CodeModal({
  toolName,
  onClose
}: {
  toolName: string | null
  onClose: () => void
}) {
  if (!toolName || !TOOL_CODE[toolName]) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-zinc-950 border border-zinc-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <code className="text-sm font-mono text-zinc-300">{toolName}</code>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-auto max-h-[60vh]">
          <HighlightedCode code={TOOL_CODE[toolName]} />
        </div>
      </motion.div>
    </motion.div>
  )
}

function HomePage() {
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set())
  const [modalTool, setModalTool] = useState<string | null>(null)

  const toggleTool = (toolName: string) => {
    setExpandedTools(prev => {
      const next = new Set(prev)
      if (next.has(toolName)) {
        next.delete(toolName)
      } else {
        next.add(toolName)
      }
      return next
    })
  }

  return (
    <div className="min-h-screen bg-background overflow-auto">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <Container className="px-4 md:px-6 py-3">
          <div className="flex items-center justify-between gap-2">
            <Link to="/" className="flex items-center gap-2 md:gap-3 min-w-0">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="h-8 w-8 md:h-9 md:w-9 rounded-lg bg-gradient-to-br from-brand to-brand/80 flex items-center justify-center shadow-lg flex-shrink-0"
              >
                <span className="text-white font-bold text-sm">W</span>
              </motion.div>
              <span className="font-semibold text-base md:text-lg truncate">WebMCP Demo</span>
            </Link>
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              <a
                href="https://docs.mcp-b.ai/introduction"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 hidden sm:flex"
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden md:inline">Docs</span>
              </a>
              <a
                href="https://docs.mcp-b.ai/packages/react-webmcp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 hidden md:flex"
              >
                <Code2 className="h-4 w-4" />
                <span className="hidden lg:inline">React Hooks</span>
              </a>
              <a
                href="https://github.com/WebMCP-org/webmcp-sh"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <Github className="h-4 w-4" />
              </a>
              <Link to="/dashboard">
                <Button variant="brand" size="sm" className="text-xs md:text-sm">
                  <span className="hidden sm:inline">Open Demo</span>
                  <span className="sm:hidden">Demo</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </nav>

      {/* Hero Section */}
      <section className="relative border-b border-border py-10 md:py-16 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-purple-500/5" />
        <div className="absolute top-0 left-1/4 w-48 md:w-96 h-48 md:h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-48 md:w-96 h-48 md:h-96 bg-purple-500/10 rounded-full blur-3xl" />

        <Container className="px-4 md:px-6 relative">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="secondary" className="mb-3 md:mb-4 gap-1 text-xs">
                <Sparkles className="h-3 w-3" />
                Kitchen Sink Demo
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4"
            >
              WebMCP Tools in Action
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base md:text-lg text-muted-foreground mb-5 md:mb-6"
            >
              This application demonstrates how to expose website functionality to AI agents using{' '}
              <a href="https://docs.mcp-b.ai/introduction" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                WebMCP
              </a>
              . Click on any tool below to see its implementation code.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Link to="/dashboard">
                <Button variant="brand" size="lg" className="w-full sm:w-auto">
                  Explore the Demo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="https://docs.mcp-b.ai/quickstart" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Quick Start Guide
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </motion.div>

            {/* Keyboard shortcut hint */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-6 md:mt-8"
            >
              <div className="inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 border border-primary/20">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/20">
                  <Keyboard className="h-4 w-4 text-primary" />
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Try the embedded WebMCP agent: </span>
                  <span className="inline-flex items-center gap-1 ml-1">
                    <kbd className="px-2 py-0.5 rounded bg-background border border-border text-xs font-mono font-medium">
                      <span className="hidden sm:inline">⌘</span>
                      <span className="sm:hidden">Cmd</span>
                    </kbd>
                    <span className="text-muted-foreground">+</span>
                    <kbd className="px-2 py-0.5 rounded bg-background border border-border text-xs font-mono font-medium">⇧</kbd>
                    <span className="text-muted-foreground">+</span>
                    <kbd className="px-2 py-0.5 rounded bg-background border border-border text-xs font-mono font-medium">K</kbd>
                  </span>
                  <span className="text-muted-foreground hidden md:inline ml-2">
                    (or <kbd className="px-1.5 py-0.5 rounded bg-background border border-border text-xs font-mono">Ctrl</kbd>+<kbd className="px-1.5 py-0.5 rounded bg-background border border-border text-xs font-mono">⇧</kbd>+<kbd className="px-1.5 py-0.5 rounded bg-background border border-border text-xs font-mono">K</kbd> on Windows/Linux)
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* What is WebMCP */}
      <section className="py-8 md:py-12 border-b border-border">
        <Container className="px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-lg md:text-xl font-semibold mb-4">What is WebMCP?</h2>
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-3 md:space-y-4 text-sm md:text-base text-muted-foreground">
                <p>
                  WebMCP enables websites to expose structured tools that AI agents can discover and invoke.
                  Instead of AI navigating UI elements or scraping pages, it calls well-defined functions
                  with validated inputs and structured outputs.
                </p>
                <p>
                  Tools are registered using the{' '}
                  <a href="https://docs.mcp-b.ai/packages/react-webmcp" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    @mcp-b/react-webmcp
                  </a>{' '}
                  package with the <code className="text-xs md:text-sm bg-muted px-1.5 py-0.5 rounded">useWebMCP</code> hook.
                  Each tool defines its name, description, input schema (using Zod), and handler function.
                </p>
              </div>
              <Card className="bg-zinc-950 border-zinc-800 overflow-hidden">
                <CardContent className="p-0 overflow-x-auto">
                  <HighlightedCode code={`import { useWebMCP } from '@mcp-b/react-webmcp';
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
});`} />
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Tools Demonstrated */}
      <section className="py-8 md:py-12 border-b border-border bg-muted/20">
        <Container className="px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4 md:mb-6 gap-2">
              <h2 className="text-lg md:text-xl font-semibold">Tools Demonstrated</h2>
              <Badge variant="outline" className="text-[10px] md:text-xs whitespace-nowrap">
                Tap to view code
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              {TOOLS_DEMONSTRATED.map((category, idx) => {
                const colors = COLOR_CLASSES[category.color]
                return (
                  <motion.div
                    key={category.category}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                  >
                    <Card className={`${colors.card} hover:shadow-lg transition-all duration-300`}>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-3 text-base">
                          <div className={`h-10 w-10 rounded-lg ${colors.icon} flex items-center justify-center`}>
                            <category.icon className="h-5 w-5" />
                          </div>
                          {category.category}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {category.tools.map((tool) => (
                          <ToolItem
                            key={tool.name}
                            tool={tool}
                            color={category.color}
                            isExpanded={expandedTools.has(tool.name)}
                            onToggle={() => toggleTool(tool.name)}
                          />
                        ))}
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Pages in This Demo */}
      <section className="py-8 md:py-12 border-b border-border">
        <Container className="px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Pages in This Demo</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {[
                { path: '/dashboard', icon: Brain, title: 'Dashboard', description: 'Memory overview with stats, charts, and audit logs', color: 'blue' },
                { path: '/memory-blocks', icon: Brain, title: 'Memory Blocks', description: 'Manage always-in-context memory blocks', color: 'purple' },
                { path: '/entities', icon: Database, title: 'Entities', description: 'Browse facts, preferences, skills, and more', color: 'green' },
                { path: '/graph', icon: Network, title: 'Knowledge Graph', description: '2D/3D visualization of entity relationships', color: 'amber' },
                { path: '/sql-repl', icon: Terminal, title: 'SQL REPL', description: 'Execute queries against the in-browser database', color: 'blue' },
                { path: '/sql-execution-log', icon: Terminal, title: 'Execution Log', description: 'View SQL query history and analytics', color: 'purple' },
              ].map((page, idx) => {
                const colors = COLOR_CLASSES[page.color]
                return (
                  <motion.div
                    key={page.path}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                  >
                    <Link to={page.path}>
                      <Card className={`h-full ${colors.card} hover:shadow-lg transition-all duration-300 cursor-pointer group`}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`h-8 w-8 rounded-lg ${colors.icon} flex items-center justify-center`}>
                              <page.icon className="h-4 w-4" />
                            </div>
                            <span className="font-medium">{page.title}</span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                          </div>
                          <p className="text-sm text-muted-foreground">{page.description}</p>
                          <code className="text-xs text-muted-foreground mt-2 block">{page.path}</code>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Documentation Links */}
      <section className="py-8 md:py-12 border-b border-border bg-muted/20">
        <Container className="px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Learn More</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {[
                { title: 'Introduction to WebMCP', url: 'https://docs.mcp-b.ai/introduction', description: 'What WebMCP is and how it works' },
                { title: 'Quick Start', url: 'https://docs.mcp-b.ai/quickstart', description: 'Add WebMCP to your website in minutes' },
                { title: 'React Hooks', url: 'https://docs.mcp-b.ai/packages/react-webmcp', description: 'useWebMCP hook documentation' },
                { title: 'Tool Design Patterns', url: 'https://docs.mcp-b.ai/concepts/tool-design', description: 'Best practices for designing tools' },
                { title: 'Security', url: 'https://docs.mcp-b.ai/security', description: 'Input validation and safety' },
                { title: 'Connecting Agents', url: 'https://docs.mcp-b.ai/connecting-agents', description: 'How AI agents connect to WebMCP' },
                { title: 'MCP-B Extension', url: 'https://docs.mcp-b.ai/extension/index', description: 'Browser extension for testing' },
                { title: 'Live Examples', url: 'https://docs.mcp-b.ai/live-tool-examples', description: 'Interactive tool demonstrations' },
                { title: 'Architecture', url: 'https://docs.mcp-b.ai/concepts/architecture', description: 'How the pieces fit together' },
              ].map((link, idx) => (
                <motion.a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                  className="block group"
                >
                  <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm group-hover:text-primary transition-colors">{link.title}</span>
                        <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <p className="text-xs text-muted-foreground">{link.description}</p>
                    </CardContent>
                  </Card>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="py-5 md:py-6 border-t border-border">
        <Container className="px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 md:h-6 md:w-6 rounded bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold text-[10px] md:text-xs">W</span>
              </div>
              <span>WebMCP Kitchen Sink Demo</span>
            </div>
            <div className="flex items-center gap-3 md:gap-4 flex-wrap justify-center">
              <a href="https://docs.mcp-b.ai" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                Docs
              </a>
              <a href="https://github.com/WebMCP-org/webmcp-sh" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                Source
              </a>
              <a href="https://www.npmjs.com/package/@mcp-b/react-webmcp" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                NPM
              </a>
            </div>
          </div>
        </Container>
      </footer>

      {/* Code Modal */}
      <AnimatePresence>
        {modalTool && <CodeModal toolName={modalTool} onClose={() => setModalTool(null)} />}
      </AnimatePresence>
    </div>
  )
}
