/**
 * Metadata for 3D graph tools
 *
 * This is the single source of truth for tool information displayed in the UI.
 * The actual tool implementations are in src/react-app/hooks/useMCPGraph3DTools.ts
 *
 * @see src/react-app/hooks/useMCPGraph3DTools.ts - Tool implementations
 * @see src/react-app/components/graph/AIToolsPanel.tsx - UI display
 */

/** Tool metadata for display purposes */
export interface Graph3DToolMetadata {
  /** MCP tool name */
  name: string;
  /** Short display title */
  title: string;
  /** Brief description for users */
  description: string;
  /** Example usage (displayed as code) */
  example: string;
  /** Icon name from lucide-react */
  icon: 'Search' | 'Navigation' | 'PlusCircle' | 'Link2' | 'RotateCcw';
}

/**
 * Metadata for all 3D graph tools
 *
 * Used by AIToolsPanel to display available tools to users.
 * Keep in sync with tool implementations in useMCPGraph3DTools.ts
 */
export const GRAPH_3D_TOOLS: Graph3DToolMetadata[] = [
  {
    name: 'graph3d_query',
    icon: 'Search',
    title: 'Query',
    description: 'Find entities by SQL WHERE clause',
    example: `graph3d_query({ where_clause: "category = 'skill'" })`,
  },
  {
    name: 'graph3d_navigate',
    icon: 'Navigation',
    title: 'Navigate',
    description: 'Zoom to a specific entity by name',
    example: `graph3d_navigate({ name: "TypeScript" })`,
  },
  {
    name: 'graph3d_add_entity',
    icon: 'PlusCircle',
    title: 'Add Entity',
    description: 'Create a new entity in the graph',
    example: `graph3d_add_entity({ name: "React", category: "skill" })`,
  },
  {
    name: 'graph3d_add_connection',
    icon: 'Link2',
    title: 'Add Connection',
    description: 'Connect two entities',
    example: `graph3d_add_connection({ from: "React", to: "TypeScript", type: "uses" })`,
  },
  {
    name: 'graph3d_clear',
    icon: 'RotateCcw',
    title: 'Clear',
    description: 'Reset the view',
    example: `graph3d_clear()`,
  },
] as const;

/**
 * Example natural language prompts users can try
 */
export const GRAPH_3D_EXAMPLE_PROMPTS = [
  '"Where is TypeScript?"',
  '"Show me all skills"',
  '"Add a new project called WebMCP"',
] as const;
