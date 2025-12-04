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
  availableTools?: string[];
  features?: string[];
}

/**
 * Hard-coded but type-safe route definitions
 * TypeScript will error if any of these paths don't exist in the route tree
 */
const ROUTE_DEFINITIONS: RouteInfo[] = [
  {
    path: '/',
    description: 'Landing page - WebMCP demo overview and tool documentation',
    features: [
      'Overview of WebMCP capabilities',
      'Tool code examples',
      'Quick navigation to demo pages',
      'Documentation links'
    ],
    availableTools: ['navigate', 'get_current_context', 'list_all_routes', 'app_gateway']
  },
  {
    path: '/dashboard',
    description: 'Dashboard - Memory overview with stats, charts, and data tables',
    features: [
      'Memory blocks and entities counts',
      'Token usage by category and tier charts',
      'Audit log of database changes',
      'Embedded memory blocks and entities tables',
      'Quick create dialogs for blocks and entities'
    ],
    availableTools: [
      'navigate',
      'list_memory_blocks',
      'create_memory_block',
      'update_memory_block',
      'list_entities',
      'create_entity',
      'table_memory_blocks',
      'table_entities'
    ]
  },
  {
    path: '/entities',
    description: 'Browse all memory entities (facts, preferences, skills, etc.)',
    searchParams: ['filter', 'page', 'search'],
    features: [
      'Searchable table of all entities',
      'Filter by category (fact, preference, skill, etc.)',
      'Sort by name, category, or importance',
      'Advanced filtering with multiple conditions',
      'Grouping and pagination'
    ],
    availableTools: [
      'table_entities',
      'list_entities',
      'search_entities',
      'create_entity',
      'update_entity',
      'delete_entity'
    ]
  },
  {
    path: '/entities/$entityId',
    description: 'View details of a specific entity',
    params: ['entityId'],
    features: [
      'Full entity details and metadata',
      'Related entities and relationships',
      'Edit capabilities',
      'Relationship management'
    ],
    availableTools: [
      'get_entity',
      'update_entity',
      'delete_entity',
      'get_entity_relationships',
      'create_relationship'
    ]
  },
  {
    path: '/graph',
    description: 'Knowledge graph visualization showing entity relationships',
    searchParams: ['nodeId', 'depth', 'filter'],
    features: [
      '2D and 3D force-directed graph visualization',
      'Interactive node exploration',
      'Query and highlight entities',
      'Visual effects: camera tour, particle burst, etc.',
      'Pattern detection and analysis'
    ],
    availableTools: [
      'sql_query',
      'get_database_info',
      'graph_query_entities',
      'graph_focus_entity',
      'graph_clear_highlights',
      'graph_statistics',
      'graph3d_camera_tour',
      'graph3d_category_wave',
      'graph3d_explode_view',
      'graph3d_particle_burst',
      'graph3d_activate_particle_flow',
      'graph3d_pattern_detection'
    ]
  },
  {
    path: '/memory-blocks',
    description: 'View and edit always-in-context memory blocks',
    features: [
      'Manage core memory blocks',
      'Edit block content and metadata',
      'Set block priority levels',
      'Filter and sort blocks',
      'Create, update, delete operations'
    ],
    availableTools: [
      'table_memory_blocks',
      'list_memory_blocks',
      'create_memory_block',
      'update_memory_block',
      'delete_memory_block'
    ]
  },
  {
    path: '/sql-repl',
    description: 'SQL REPL for executing direct database queries',
    features: [
      'Direct SQL query execution',
      'Schema exploration with get_database_info',
      'Query formatting and highlighting',
      'Results displayed in REPL',
      'Automatic query logging'
    ],
    availableTools: [
      'sql_query',
      'get_database_info'
    ]
  },
  {
    path: '/sql-execution-log',
    description: 'View SQL execution history and query logs',
    features: [
      'Complete SQL execution history',
      'Query performance metrics',
      'Error tracking',
      'Filter by source (AI vs manual)'
    ],
    availableTools: [
      'sql_query',
      'get_database_info'
    ]
  },
  {
    path: '/about',
    description: 'About this application and its technology stack',
    features: [
      'Technology stack overview',
      'Key features documentation',
      'Architecture information'
    ],
    availableTools: ['navigate']
  },
  {
    path: '/showcase',
    description: 'Component showcase and demo page for UI elements',
    features: [
      'UI component library',
      'Interactive demos',
      'Theming showcase'
    ],
    availableTools: ['navigate']
  }
] as const;

/**
 * Format route information for AI consumption with complete context
 */
function formatRouteList(): string {
  let output = '=== 🗺️ WEBMCP APPLICATION GATEWAY ===\n\n';

  output += '📱 APPLICATION OVERVIEW\n';
  output += '────────────────────────\n';
  output += 'WebMCP is a memory and knowledge management system with the following capabilities:\n';
  output += '• Memory block management for persistent context\n';
  output += '• Entity tracking for facts, preferences, and skills\n';
  output += '• Knowledge graph visualization for relationship mapping\n';
  output += '• Direct SQL access for advanced queries\n';
  output += '• Real-time data synchronization across tabs\n\n';

  output += '🧭 NAVIGATION MAP\n';
  output += '─────────────────\n\n';

  ROUTE_DEFINITIONS.forEach(route => {
    output += `📍 ${route.path}\n`;
    output += `   └─ ${route.description}\n`;

    if (route.features && route.features.length > 0) {
      output += `   \n   Features:\n`;
      route.features.forEach(feature => {
        output += `     • ${feature}\n`;
      });
    }

    if (route.availableTools && route.availableTools.length > 0) {
      output += `   \n   Available Tools When Here:\n`;
      route.availableTools.forEach(tool => {
        output += `     🔧 ${tool}\n`;
      });
    }

    if (route.params && route.params.length > 0) {
      output += `   \n   Required Params: ${route.params.map(p => `$${p}`).join(', ')}\n`;
    }

    if (route.searchParams && route.searchParams.length > 0) {
      output += `   Optional Search Params: ${route.searchParams.join(', ')}\n`;
    }

    output += '\n   ────────────────────────────────────\n\n';
  });

  output += '⚡ QUICK NAVIGATION GUIDE\n';
  output += '──────────────────────────\n\n';

  output += 'Common Tasks and Where to Go:\n\n';
  output += '📊 Data Management:\n';
  output += '  • View/Edit Memory → /memory-blocks\n';
  output += '  • Browse Entities → /entities\n';
  output += '  • SQL Queries → /sql-repl\n\n';

  output += '🔍 Analysis & Visualization:\n';
  output += '  • Knowledge Graph → /graph\n';
  output += '  • Entity Details → /entities/$entityId\n';
  output += '  • Query History → /sql-execution-log\n\n';

  output += '🏠 General:\n';
  output += '  • Landing Page → /\n';
  output += '  • Dashboard → /dashboard\n';
  output += '  • About → /about\n';
  output += '  • UI Components → /showcase\n\n';

  output += '🎯 NAVIGATION INSTRUCTIONS\n';
  output += '────────────────────────────\n\n';

  output += 'To navigate, use the navigate tool with a JSON object:\n\n';
  output += 'Required:\n';
  output += '  • "to": The route path (e.g., "/entities")\n\n';

  output += 'Optional:\n';
  output += '  • "params": Route parameters for dynamic segments\n';
  output += '  • "search": Query/search parameters\n';
  output += '  • "hash": URL hash fragment\n';
  output += '  • "replace": Replace history entry (default: false)\n\n';

  output += '📝 NAVIGATION EXAMPLES\n';
  output += '──────────────────────\n\n';

  output += '// Go to entities page\n';
  output += '{ "to": "/entities" }\n\n';

  output += '// View specific entity\n';
  output += '{ "to": "/entities/$entityId", "params": { "entityId": "abc-123" } }\n\n';

  output += '// Graph with filters\n';
  output += '{ "to": "/graph", "search": { "nodeId": "node-1", "depth": "2" } }\n\n';

  output += '// Entities with search\n';
  output += '{ "to": "/entities", "search": { "filter": "skills", "search": "python" } }\n\n';

  output += '💡 PRO TIPS\n';
  output += '────────────\n';
  output += '• Use get_current_context to see where you are\n';
  output += '• Each page activates specific tools for that context\n';
  output += '• The graph page has the most visualization tools\n';
  output += '• SQL REPL provides direct database access\n';
  output += '• Memory blocks are always-in-context data\n';

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
    description: `🗺️ PRIMARY APPLICATION GATEWAY TOOL

This is the main entry point for understanding and navigating the WebMCP application.
Use this tool FIRST when starting any task to understand the application structure and available tools.

This gateway provides:
• Complete application map and navigation
• List of all available tools per section
• Feature descriptions for each area
• Quick navigation guidance
• Context-aware tool activation info

ALWAYS use this tool when:
• Starting a new conversation
• Asked about app capabilities
• Unsure where to find something
• Need to know what tools are available
• Planning multi-step operations across different sections`,
    inputSchema: {
      query: z.string()
        .optional()
        .describe('Optional: Specific area or feature to focus on (e.g., "graph tools", "memory management", "sql features")')
    },
    annotations: {
      title: 'App Gateway & Navigation Hub',
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
    handler: async (input) => {
      const { query } = input;

      let output = formatRouteList();

      if (query) {
        output += '\n\n🔍 FOCUSED QUERY RESULTS\n';
        output += '───────────────────────\n\n';

        const queryLower = query.toLowerCase();

        // Filter routes based on query
        const relevantRoutes = ROUTE_DEFINITIONS.filter(route => {
          const matchesPath = route.path.toLowerCase().includes(queryLower);
          const matchesDescription = route.description.toLowerCase().includes(queryLower);
          const matchesFeatures = route.features?.some(f => f.toLowerCase().includes(queryLower));
          const matchesTools = route.availableTools?.some(t => t.toLowerCase().includes(queryLower));

          return matchesPath || matchesDescription || matchesFeatures || matchesTools;
        });

        if (relevantRoutes.length > 0) {
          output += `Found ${relevantRoutes.length} relevant sections for "${query}":\n\n`;

          relevantRoutes.forEach(route => {
            output += `📍 ${route.path} - ${route.description}\n`;
            if (route.availableTools && route.availableTools.length > 0) {
              output += `   Tools: ${route.availableTools.slice(0, 5).join(', ')}${route.availableTools.length > 5 ? '...' : ''}\n`;
            }
            output += '\n';
          });
        } else {
          output += `No specific sections found for "${query}".\n`;
          output += 'Try browsing the full navigation map above or use different search terms.\n';
        }
      }

      // Add current location context
      const location = router.state.location;
      output += '\n\n📍 CURRENT LOCATION\n';
      output += '──────────────────\n';
      output += `You are currently at: ${location.pathname}\n`;

      const currentRoute = ROUTE_DEFINITIONS.find(r => r.path === location.pathname || location.pathname.startsWith(r.path.split('$')[0]));
      if (currentRoute && currentRoute.availableTools) {
        output += '\nTools available at current location:\n';
        currentRoute.availableTools.forEach(tool => {
          output += `  🔧 ${tool}\n`;
        });
      }

      return output;
    },
  });
}
