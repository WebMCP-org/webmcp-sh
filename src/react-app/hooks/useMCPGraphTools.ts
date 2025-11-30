import { z } from 'zod';
import { useWebMCP } from '@mcp-b/react-webmcp';
import { useReactFlow, useNodes, useEdges } from '@xyflow/react';
import { toast } from 'sonner';
import { pg_lite } from '@/lib/db';

/**
 * Hook to register MCP tools for React Flow graph manipulation
 *
 * These tools allow AI agents to interact with the knowledge graph visualization
 * by executing SQL queries and manipulating the graph display.
 */
export function useMCPGraphTools() {
  const reactFlowInstance = useReactFlow();
  const nodes = useNodes();
  const edges = useEdges();

  // Tool 1: Query and highlight entities in graph
  useWebMCP({
    name: 'graph_query_entities',
    description: `Execute SQL query to find entities and highlight them in the knowledge graph.

This tool allows you to:
- Search for entities using SQL WHERE conditions
- Highlight matching nodes in the graph
- Focus the view on the results
- Show relationships between matched entities

Example queries:
- Find all skills: "category = 'skill'"
- High importance facts: "category = 'fact' AND importance_score > 80"
- Recent entities: "last_mentioned > NOW() - INTERVAL '7 days'"
- Search by name: "name ILIKE '%python%'"
- By tags: "'programming' = ANY(tags)"

The graph will highlight matching nodes and optionally zoom to show them.`,
    inputSchema: {
      where_clause: z.string()
        .min(1)
        .describe('SQL WHERE clause to filter entities (e.g., "category = \'skill\' AND importance_score > 70")'),
      zoom_to_results: z.boolean()
        .optional()
        .default(true)
        .describe('Whether to zoom the graph to show highlighted nodes'),
      include_relationships: z.boolean()
        .optional()
        .default(true)
        .describe('Whether to also highlight relationships between matched entities'),
    },
    annotations: {
      title: 'Query & Highlight Graph Entities',
      readOnlyHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    handler: async (input) => {
      try {
        const { where_clause, zoom_to_results, include_relationships } = input;

        // Execute SQL query to find matching entities
        const query = `
          SELECT id, name, category, importance_score, description
          FROM memory_entities
          WHERE ${where_clause}
          ORDER BY importance_score DESC
          LIMIT 50
        `;

        const result = await pg_lite.query(query);
        const matchedEntities = result.rows as Array<{
          id: string;
          name: string;
          category: string;
          importance_score: number;
          description: string;
        }>;

        if (matchedEntities.length === 0) {
          toast.info('No entities found matching the query');
          return 'No entities found matching the query.';
        }

        // Get matching node IDs
        const matchedIds = new Set(matchedEntities.map(e => e.id));

        // Update nodes to highlight matches
        const updatedNodes = nodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            highlighted: matchedIds.has(node.id),
          },
          className: matchedIds.has(node.id) ? 'highlighted-node' : '',
        }));

        // If including relationships, find edges between matched entities
        let highlightedEdges = edges;
        if (include_relationships) {
          highlightedEdges = edges.map(edge => ({
            ...edge,
            animated: matchedIds.has(edge.source) && matchedIds.has(edge.target),
            className: matchedIds.has(edge.source) && matchedIds.has(edge.target) ? 'highlighted-edge' : '',
            style: {
              ...edge.style,
              stroke: matchedIds.has(edge.source) && matchedIds.has(edge.target)
                ? '#3b82f6'
                : edge.style?.stroke,
              strokeWidth: matchedIds.has(edge.source) && matchedIds.has(edge.target) ? 3 : 1,
            }
          }));
        }

        // Apply updates to React Flow
        reactFlowInstance.setNodes(updatedNodes);
        reactFlowInstance.setEdges(highlightedEdges);

        // Zoom to show highlighted nodes if requested
        if (zoom_to_results && matchedIds.size > 0) {
          const nodesToFit = updatedNodes.filter(n => matchedIds.has(n.id));
          if (nodesToFit.length > 0) {
            reactFlowInstance.fitView({
              nodes: nodesToFit,
              padding: 0.2,
              duration: 800,
            });
          }
        }

        // Return summary
        const categories = [...new Set(matchedEntities.map(e => e.category))];
        toast.success(`Graph: Highlighted ${matchedEntities.length} entities`);
        return `Found ${matchedEntities.length} entities:
${categories.map(cat => {
  const count = matchedEntities.filter(e => e.category === cat).length;
  return `- ${count} ${cat}(s)`;
}).join('\n')}

Top matches:
${matchedEntities.slice(0, 5).map(e =>
  `• ${e.name} (${e.category}, score: ${e.importance_score})`
).join('\n')}

${zoom_to_results ? 'Graph zoomed to show results.' : 'Results highlighted in current view.'}`;

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        toast.error('Failed to query graph', {
          description: errorMsg,
        });
        throw new Error(`Failed to query graph: ${errorMsg}`);
      }
    },
  });

  // Tool 2: Focus on specific entity and its connections
  useWebMCP({
    name: 'graph_focus_entity',
    description: `Focus the graph view on a specific entity and show its immediate connections.

This tool:
- Centers the view on the specified entity
- Highlights all its direct relationships
- Shows connected entities within specified depth
- Provides information about the entity's connections`,
    inputSchema: {
      entity_name: z.string()
        .min(1)
        .describe('Name of the entity to focus on'),
      connection_depth: z.number()
        .min(1)
        .max(3)
        .optional()
        .default(1)
        .describe('How many levels of connections to show (1-3)'),
      show_details: z.boolean()
        .optional()
        .default(true)
        .describe('Whether to return detailed information about connections'),
    },
    annotations: {
      title: 'Focus on Entity',
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
    handler: async (input) => {
      const { entity_name, connection_depth, show_details } = input;

      // Find the entity
      const entityResult = await pg_lite.query(`
        SELECT id, name, category, importance_score, description
        FROM memory_entities
        WHERE name ILIKE $1
        LIMIT 1
      `, [`%${entity_name}%`]);

      if (entityResult.rows.length === 0) {
        toast.error(`Entity "${entity_name}" not found in the graph`);
        throw new Error(`Entity "${entity_name}" not found in the graph.`);
      }

      const entity = entityResult.rows[0] as {
        id: string;
        name: string;
        category: string;
        importance_score: number;
        description: string;
      };

      // Find connected entities based on depth
      const connectedIds = new Set<string>([entity.id]);
      let currentLevel = new Set<string>([entity.id]);

      for (let level = 0; level < connection_depth; level++) {
        const idsArray = Array.from(currentLevel);
        if (idsArray.length === 0) break;

        const relationshipsResult = await pg_lite.query(`
          SELECT DISTINCT
            CASE
              WHEN from_entity_id = ANY($1::uuid[]) THEN to_entity_id
              ELSE from_entity_id
            END as connected_id
          FROM entity_relationships
          WHERE from_entity_id = ANY($1::uuid[]) OR to_entity_id = ANY($1::uuid[])
        `, [idsArray]);

        const newIds = new Set<string>();
        for (const row of relationshipsResult.rows) {
          const id = (row as { connected_id: string }).connected_id;
          if (!connectedIds.has(id)) {
            connectedIds.add(id);
            newIds.add(id);
          }
        }
        currentLevel = newIds;
      }

      // Highlight the focal entity and its connections
      const updatedNodes = nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          highlighted: connectedIds.has(node.id),
          isFocus: node.id === entity.id,
        },
        className: node.id === entity.id
          ? 'focus-node'
          : connectedIds.has(node.id)
            ? 'connected-node'
            : '',
      }));

      // Highlight edges connected to the focal network
      const updatedEdges = edges.map(edge => ({
        ...edge,
        animated: connectedIds.has(edge.source) && connectedIds.has(edge.target),
        style: {
          ...edge.style,
          stroke: connectedIds.has(edge.source) && connectedIds.has(edge.target)
            ? '#10b981'
            : '#94a3b8',
          strokeWidth: connectedIds.has(edge.source) && connectedIds.has(edge.target) ? 2 : 1,
          opacity: connectedIds.has(edge.source) && connectedIds.has(edge.target) ? 1 : 0.3,
        }
      }));

      // Apply updates
      reactFlowInstance.setNodes(updatedNodes);
      reactFlowInstance.setEdges(updatedEdges);

      // Find the focus node and zoom to it
      const focusNode = updatedNodes.find(n => n.id === entity.id);
      if (focusNode) {
        reactFlowInstance.fitView({
          nodes: updatedNodes.filter(n => connectedIds.has(n.id)),
          padding: 0.15,
          duration: 1000,
        });
      }

      // Get connection details if requested
      let details = '';
      if (show_details) {
        const connectionsResult = await pg_lite.query(`
          SELECT
            r.relationship_type,
            r.strength,
            e2.name as connected_name,
            e2.category as connected_category,
            CASE
              WHEN r.from_entity_id = $1 THEN 'outgoing'
              ELSE 'incoming'
            END as direction
          FROM entity_relationships r
          JOIN memory_entities e2 ON (
            CASE
              WHEN r.from_entity_id = $1 THEN r.to_entity_id = e2.id
              ELSE r.from_entity_id = e2.id
            END
          )
          WHERE r.from_entity_id = $1 OR r.to_entity_id = $1
          ORDER BY r.strength DESC
          LIMIT 10
        `, [entity.id]);

        const connections = connectionsResult.rows as Array<{
          relationship_type: string;
          strength: number;
          connected_name: string;
          connected_category: string;
          direction: string;
        }>;

        details = `\n\nTop connections:
${connections.map(c =>
  `• ${c.direction === 'outgoing' ? '→' : '←'} ${c.connected_name} (${c.connected_category}): ${c.relationship_type} [strength: ${c.strength}]`
).join('\n')}`;
      }

      toast.success(`Graph: Focused on "${entity.name}"`);
      return `Focused on: ${entity.name}
Category: ${entity.category}
Importance: ${entity.importance_score}
Description: ${entity.description}

Showing ${connectedIds.size} entities within depth ${connection_depth}${details}`;
    },
  });

  // Tool 3: Clear all highlights
  useWebMCP({
    name: 'graph_clear_highlights',
    description: 'Clear all highlights and return the graph to its normal state.',
    inputSchema: {},
    annotations: {
      title: 'Clear Graph Highlights',
      readOnlyHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    handler: async () => {
      // Reset all nodes to unhighlighted state
      const resetNodes = nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          highlighted: false,
          isFocus: false,
        },
        className: '',
      }));

      // Reset all edges
      const resetEdges = edges.map(edge => ({
        ...edge,
        animated: false,
        className: '',
        style: {
          ...edge.style,
          strokeWidth: 1,
          opacity: 1,
        }
      }));

      reactFlowInstance.setNodes(resetNodes);
      reactFlowInstance.setEdges(resetEdges);

      // Fit view to show entire graph
      reactFlowInstance.fitView({
        padding: 0.1,
        duration: 500,
      });

      toast.success('Graph highlights cleared');
      return 'Graph highlights cleared and view reset.';
    },
  });

  // Tool 4: Get graph statistics
  useWebMCP({
    name: 'graph_statistics',
    description: 'Get statistics about the current graph visualization.',
    inputSchema: {},
    annotations: {
      title: 'Graph Statistics',
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
    handler: async () => {
      const categories = nodes.reduce((acc, node) => {
        const category = (node.data as any).category || 'unknown';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const avgImportance = nodes.reduce((sum, node) =>
        sum + ((node.data as any).importance_score || 0), 0) / nodes.length;

      const maxConnections = Math.max(...nodes.map(node =>
        (node.data as any).connection_count || 0));

      return `Graph Statistics:

Total Entities: ${nodes.length}
Total Relationships: ${edges.length}

Categories:
${Object.entries(categories).map(([cat, count]) =>
  `• ${cat}: ${count} entities`).join('\n')}

Average Importance Score: ${avgImportance.toFixed(1)}
Most Connected Entity: ${maxConnections} connections

Current View:
• Zoom Level: ${reactFlowInstance.getZoom().toFixed(2)}x
• Viewport: ${JSON.stringify(reactFlowInstance.getViewport(), null, 2)}`;
    },
  });
}