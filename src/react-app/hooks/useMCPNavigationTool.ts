import { z } from 'zod';
import { useWebMCP } from '@mcp-b/react-webmcp';
import { useRouter } from '@tanstack/react-router';
import { useMemo } from 'react';
import { toast } from 'sonner';
import type { FileRoutesByTo } from '../routeTree.gen';

// Type-safe route paths from the generated route tree
type RoutePath = keyof FileRoutesByTo;

interface RouteInfo {
  path: RoutePath;
  description: string;
  params?: string[];
  searchParams?: string[];
  capabilities: string[];
}

/**
 * Route definitions describing what users can do at each location.
 * When you navigate to a route, context-specific tools become available.
 */
const ROUTE_DEFINITIONS: RouteInfo[] = [
  {
    path: '/',
    description: 'Landing page - WebMCP demo overview and documentation',
    capabilities: [
      'View overview of WebMCP capabilities',
      'See tool code examples',
      'Quick navigation to demo pages'
    ]
  },
  {
    path: '/dashboard',
    description: 'Dashboard - Memory overview with stats, charts, and quick access',
    capabilities: [
      'View memory blocks and entities counts',
      'See token usage charts by category and tier',
      'Browse audit log of database changes',
      'Quick create memory blocks and entities',
      'Get an overview of the entire memory system'
    ]
  },
  {
    path: '/entities',
    description: 'Entities page - Browse and manage all memory entities',
    searchParams: ['filter', 'page', 'search'],
    capabilities: [
      'View all entities in a searchable table',
      'Filter by category (fact, preference, skill, person, project, goal)',
      'Create, edit, and delete entities',
      'Search entities by name or description',
      'Sort and group entities'
    ]
  },
  {
    path: '/entities/$entityId',
    description: 'Entity detail page - View and edit a specific entity',
    params: ['entityId'],
    capabilities: [
      'View full entity details and metadata',
      'Edit entity properties',
      'See related entities and relationships',
      'Delete the entity'
    ]
  },
  {
    path: '/graph',
    description: 'Knowledge graph - Visualize entity relationships',
    searchParams: ['nodeId', 'depth', 'filter'],
    capabilities: [
      'View entities as an interactive 2D or 3D graph',
      'Explore connections between entities',
      'Focus on specific nodes and highlight paths',
      'Run visual effects like camera tours and particle bursts',
      'Analyze graph patterns and statistics',
      'Execute SQL queries directly'
    ]
  },
  {
    path: '/memory-blocks',
    description: 'Memory blocks - Manage always-in-context core memories',
    capabilities: [
      'View all memory blocks in a table',
      'Create new memory blocks',
      'Edit block content, labels, and priority',
      'Delete memory blocks',
      'Filter by block type (user_profile, agent_persona, current_goals, context)'
    ]
  },
  {
    path: '/sql-repl',
    description: 'SQL REPL - Execute direct database queries',
    capabilities: [
      'Run SQL queries against the in-browser database',
      'Explore database schema and tables',
      'View formatted query results',
      'Access full database capabilities'
    ]
  },
  {
    path: '/sql-execution-log',
    description: 'SQL log - View query execution history',
    capabilities: [
      'Browse complete SQL execution history',
      'See query performance metrics',
      'Track errors and issues',
      'Filter by source (AI vs manual)'
    ]
  },
  {
    path: '/about',
    description: 'About page - Technology stack and architecture info',
    capabilities: [
      'Learn about the technology stack',
      'View architecture documentation'
    ]
  },
  {
    path: '/showcase',
    description: 'Showcase - UI component demos',
    capabilities: [
      'Browse UI component library',
      'See interactive component demos'
    ]
  }
] as const;

/**
 * Format route information for AI consumption
 */
function formatRouteList(): string {
  let output = '=== WEBMCP APPLICATION NAVIGATION ===\n\n';

  output += 'ABOUT THIS APP\n';
  output += '──────────────\n';
  output += 'WebMCP is a memory and knowledge management system with:\n';
  output += '• Memory blocks for persistent, always-in-context data\n';
  output += '• Entities for structured knowledge (facts, preferences, skills, etc.)\n';
  output += '• Knowledge graph for visualizing relationships\n';
  output += '• Direct SQL access for advanced queries\n\n';

  output += 'IMPORTANT: When you navigate to a route, context-specific tools become available.\n';
  output += 'For example, entity CRUD tools appear on /entities, graph tools appear on /graph, etc.\n\n';

  output += 'AVAILABLE ROUTES\n';
  output += '────────────────\n\n';

  ROUTE_DEFINITIONS.forEach(route => {
    output += `${route.path}\n`;
    output += `  ${route.description}\n`;

    if (route.capabilities.length > 0) {
      output += `  What you can do here:\n`;
      route.capabilities.forEach(cap => {
        output += `    • ${cap}\n`;
      });
    }

    if (route.params && route.params.length > 0) {
      output += `  Required params: ${route.params.map(p => `$${p}`).join(', ')}\n`;
    }

    output += '\n';
  });

  output += 'NAVIGATION EXAMPLES\n';
  output += '───────────────────\n\n';
  output += '{ "to": "/entities" }                                    // Go to entities page\n';
  output += '{ "to": "/entities/$entityId", "params": { "entityId": "abc-123" } }  // View entity\n';
  output += '{ "to": "/graph" }                                       // Open knowledge graph\n';
  output += '{ "to": "/memory-blocks" }                               // Manage memory blocks\n';

  return output;
}

/**
 * Check if a route path is valid
 */
function isValidRoute(path: string): boolean {
  return ROUTE_DEFINITIONS.some(r => r.path === path);
}

/**
 * Hook to register navigation MCP tools
 *
 * Allows AI agents to navigate through the application using TanStack Router.
 */
export function useMCPNavigationTool() {
  const router = useRouter();

  // Generate route documentation
  const routeListDescription = useMemo(() => formatRouteList(), []);

  // Main navigation tool
  useWebMCP({
    name: 'navigate',
    description: `Navigate to a different route in the application using TanStack Router.

${routeListDescription}

The tool will navigate the user to the specified route and return a confirmation message.`,
    inputSchema: {
      to: z.string()
        .min(1, 'Route path cannot be empty')
        .describe('The route path to navigate to (e.g., "/entities", "/graph")'),
      params: z.record(z.string(), z.any())
        .optional()
        .describe('Route parameters (e.g., { "entityId": "uuid-here" }) for dynamic routes'),
      search: z.record(z.string(), z.any())
        .optional()
        .describe('URL search/query parameters (e.g., { "filter": "skills", "page": "2" })'),
      hash: z.string()
        .optional()
        .describe('URL hash fragment (e.g., "section-1")'),
      replace: z.boolean()
        .optional()
        .default(false)
        .describe('If true, replaces current history entry instead of pushing new one'),
    },
    annotations: {
      title: 'Navigate',
      readOnlyHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    handler: async (input) => {
      const { to, params, search, hash, replace } = input;

      // Validate route exists
      if (!isValidRoute(to)) {
        throw new Error(`Invalid route: "${to}". Use the "list_routes" tool to see available routes.`);
      }

      // Build navigation options
      const navOptions: any = { to };
      if (params) navOptions.params = params;
      if (search) navOptions.search = search;
      if (hash) navOptions.hash = hash;
      if (replace) navOptions.replace = true;

      try {
        // Perform navigation
        await router.navigate(navOptions);

        // Build response message
        let message = `✓ Navigated to ${to}`;
        if (params && Object.keys(params).length > 0) {
          message += `\n  Params: ${JSON.stringify(params)}`;
        }
        if (search && Object.keys(search).length > 0) {
          message += `\n  Search: ${JSON.stringify(search)}`;
        }
        if (hash) {
          message += `\n  Hash: #${hash}`;
        }

        toast.success(`Navigated to ${to}`);
        return message;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast.error('Navigation failed', {
          description: errorMessage,
        });
        throw new Error(`Navigation failed: ${errorMessage}`);
      }
    },
    formatOutput: (output) => output,
  });

  // Current context tool
  useWebMCP({
    name: 'get_current_context',
    description: `Get the current application context including route, pathname, and search params.

Useful for understanding where the user is and providing context-aware responses.`,
    inputSchema: {},
    annotations: {
      title: 'Get Current Context',
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
    handler: async () => {
      const location = router.state.location;

      return {
        pathname: location.pathname,
        search: location.search || {},
        hash: location.hash || '',
        href: location.href,
      };
    },
  });

  // List all routes tool
  useWebMCP({
    name: 'list_all_routes',
    description: 'Get a detailed list of all available routes in the application with their descriptions and parameters.',
    inputSchema: {},
    annotations: {
      title: 'List All Routes',
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
    handler: async () => {
      return formatRouteList();
    },
  });

  // Gateway tool - Primary navigation and app overview
  useWebMCP({
    name: 'app_gateway',
    description: `Application gateway - Get an overview of the app and available routes.

Use this tool to understand what areas of the app exist and what you can do in each.
When you navigate to a route, context-specific tools will become available automatically.`,
    inputSchema: {
      query: z.string()
        .optional()
        .describe('Optional: Search for a specific area (e.g., "graph", "memory", "sql")')
    },
    annotations: {
      title: 'App Gateway',
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
    handler: async (input) => {
      const { query } = input;

      let output = formatRouteList();

      if (query) {
        output += '\n\nSEARCH RESULTS\n';
        output += '──────────────\n\n';

        const queryLower = query.toLowerCase();

        const relevantRoutes = ROUTE_DEFINITIONS.filter(route => {
          const matchesPath = route.path.toLowerCase().includes(queryLower);
          const matchesDescription = route.description.toLowerCase().includes(queryLower);
          const matchesCapabilities = route.capabilities.some(c => c.toLowerCase().includes(queryLower));

          return matchesPath || matchesDescription || matchesCapabilities;
        });

        if (relevantRoutes.length > 0) {
          output += `Found ${relevantRoutes.length} relevant sections for "${query}":\n\n`;

          relevantRoutes.forEach(route => {
            output += `${route.path} - ${route.description}\n`;
          });
        } else {
          output += `No sections found for "${query}". See routes above.\n`;
        }
      }

      // Add current location
      const location = router.state.location;
      output += '\n\nCURRENT LOCATION: ' + location.pathname + '\n';

      return output;
    },
  });
}
