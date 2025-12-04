import { z } from "zod";
import { useWebMCP } from "@mcp-b/react-webmcp";
import { toast } from "sonner";
import { pg_lite } from "@/lib/db";
import type { KG3DApi } from "@/components/graph/KG3D";
import type { GraphNode, GraphLink } from "@/lib/graph/adapters";

/** Entity query result from database */
interface EntityQueryResult {
  id: string;
  name: string;
  category: string;
  importance_score: number;
  description: string | null;
}

/** Relationship result */
interface RelationshipResult {
  id: string;
  from_entity_id: string;
  to_entity_id: string;
  relationship_type: string;
  strength: number;
}

/** Connected entity info */
interface ConnectedEntityInfo {
  id: string;
  name: string;
  category: string;
  relationship_type: string;
  direction: string;
}

/**
 * Simplified MCP tools for 3D graph visualization
 *
 * These tools help users navigate and modify the knowledge graph:
 * - Query and find entities (with visual zoom)
 * - Navigate to specific entities (zoom + show connections)
 * - Add entities and connections (with visual feedback)
 * - Clear/reset the view
 */
export function useMCPGraph3DTools() {
  // Get the 3D API from window (set by KG3D component)
  const getApi = (): KG3DApi | null => {
    if (typeof window !== "undefined") {
      return window.KG3D ?? null;
    }
    return null;
  };

  // Tool 1: Query and highlight entities
  useWebMCP({
    name: "graph3d_query",
    description: `Find and highlight entities in the 3D knowledge graph.

Use this to search for entities and visually show them to the user.
The camera will zoom to the results so the user can see what you found.

Example queries:
- "category = 'skill'" - find all skills
- "importance_score > 80" - find important entities
- "name ILIKE '%AI%'" - find AI-related entities
- "category = 'person'" - find all people

The results are highlighted and the camera zooms to show them.`,
    inputSchema: {
      where_clause: z.string().min(1)
        .describe("SQL WHERE clause to filter entities (e.g., \"category = 'skill'\")"),
      show_connections: z.boolean().default(true)
        .describe("Also highlight connected entities"),
    },
    annotations: {
      title: "3D Query",
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
    handler: async ({ where_clause, show_connections }) => {
      const api = getApi();
      if (!api) {
        toast.error("3D graph not initialized - please navigate to the Graph page");
        return "3D graph not initialized. Please navigate to the Graph page first.";
      }

      const query = `
        SELECT id, name, category, importance_score, description
        FROM memory_entities
        WHERE ${where_clause}
        ORDER BY importance_score DESC
        LIMIT 100
      `;

      const { rows } = await pg_lite.query<EntityQueryResult>(query);
      if (!rows?.length) {
        toast.info("No entities found matching query");
        return "No entities found matching query";
      }

      const ids = new Set(rows.map((r) => r.id));

      // If showing connections, also get connected entities
      if (show_connections) {
        const { rows: connections } = await pg_lite.query<{ from_entity_id: string; to_entity_id: string }>(
          `SELECT from_entity_id, to_entity_id FROM entity_relationships
           WHERE from_entity_id = ANY($1) OR to_entity_id = ANY($1)`,
          [rows.map((r) => r.id)]
        );

        connections.forEach((conn) => {
          ids.add(conn.from_entity_id);
          ids.add(conn.to_entity_id);
        });
      }

      // Highlight matching nodes
      api.highlightWhere((n: GraphNode) => ids.has(n.id));

      // Zoom to show highlighted entities
      setTimeout(() => api.zoomToFit(1000, 60), 100);

      const categories = [...new Set(rows.map((r) => r.category))];
      toast.success(`Found ${rows.length} entities`);

      return `Found ${rows.length} entities:
${categories.map(cat => `- ${rows.filter((r) => r.category === cat).length} ${cat}(s)`).join('\n')}

Results:
${rows.slice(0, 10).map((e) => `- ${e.name} (${e.category})${e.description ? `: ${e.description.slice(0, 50)}...` : ''}`).join('\n')}
${rows.length > 10 ? `\n...and ${rows.length - 10} more` : ''}

The entities are now highlighted in the 3D graph.`;
    },
  });

  // Tool 2: Navigate to a specific entity
  useWebMCP({
    name: "graph3d_navigate",
    description: `Navigate to a specific entity in the 3D graph.

Use this when the user asks about a specific entity (e.g., "where is X?", "show me Y").
The camera will fly to the entity and highlight it along with its connections.

This helps users who don't know how to navigate the 3D UI - you navigate for them.`,
    inputSchema: {
      name: z.string().min(1)
        .describe("Name of entity to navigate to (partial match allowed)"),
    },
    annotations: {
      title: "3D Navigate",
      readOnlyHint: true,
      idempotentHint: false,
      openWorldHint: false,
    },
    handler: async ({ name }) => {
      const api = getApi();
      if (!api) {
        toast.error("3D graph not initialized - please navigate to the Graph page");
        return "3D graph not initialized. Please navigate to the Graph page first.";
      }

      // Find entity
      const { rows } = await pg_lite.query<EntityQueryResult>(
        `SELECT id, name, category, importance_score, description
         FROM memory_entities
         WHERE name ILIKE $1
         ORDER BY importance_score DESC
         LIMIT 1`,
        [`%${name}%`]
      );

      if (!rows?.length) {
        toast.error(`Entity "${name}" not found`);
        return `Entity "${name}" not found. Try using graph3d_query to search for it.`;
      }

      const entity = rows[0];

      // Get connections
      const { rows: connections } = await pg_lite.query<ConnectedEntityInfo>(`
        SELECT
          e.id,
          e.name,
          e.category,
          r.relationship_type,
          CASE WHEN r.from_entity_id = $1 THEN 'outgoing' ELSE 'incoming' END as direction
        FROM entity_relationships r
        JOIN memory_entities e ON (
          CASE WHEN r.from_entity_id = $1 THEN r.to_entity_id ELSE r.from_entity_id END = e.id
        )
        WHERE r.from_entity_id = $1 OR r.to_entity_id = $1
        ORDER BY e.importance_score DESC
      `, [entity.id]);

      // Highlight entity and connections
      const idsToHighlight = new Set([entity.id, ...connections.map((c) => c.id)]);
      api.highlightWhere((n: GraphNode) => idsToHighlight.has(n.id));

      // Focus camera on the entity
      api.focusNode(entity.id, 1500);

      toast.success(`Navigated to "${entity.name}"`);

      const incomingConnections = connections.filter((c) => c.direction === 'incoming');
      const outgoingConnections = connections.filter((c) => c.direction === 'outgoing');

      return `Navigated to: ${entity.name}
Category: ${entity.category}
Importance: ${entity.importance_score}
${entity.description ? `Description: ${entity.description}` : ''}

Connections (${connections.length} total):
${outgoingConnections.length > 0 ? `\nOutgoing (${outgoingConnections.length}):
${outgoingConnections.slice(0, 5).map((c) => `  → ${c.name} (${c.relationship_type})`).join('\n')}` : ''}
${incomingConnections.length > 0 ? `\nIncoming (${incomingConnections.length}):
${incomingConnections.slice(0, 5).map((c) => `  ← ${c.name} (${c.relationship_type})`).join('\n')}` : ''}

The entity and its connections are now highlighted in the 3D graph.`;
    },
  });

  // Tool 3: Add a new entity
  useWebMCP({
    name: "graph3d_add_entity",
    description: `Create a new entity in the knowledge graph.

Use this to add new knowledge to the graph. After creation, the camera
will zoom to the new entity so the user can see it was created.

Categories: fact, preference, skill, rule, context, person, project, goal`,
    inputSchema: {
      name: z.string().min(1).max(200)
        .describe("Name of the entity"),
      category: z.enum(["fact", "preference", "skill", "rule", "context", "person", "project", "goal"])
        .describe("Category of the entity"),
      description: z.string().max(1000).optional()
        .describe("Description of the entity"),
      importance_score: z.number().min(0).max(100).default(50)
        .describe("Importance score (0-100)"),
      tags: z.array(z.string()).default([])
        .describe("Tags for the entity"),
    },
    annotations: {
      title: "3D Add Entity",
      readOnlyHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    handler: async ({ name, category, description, importance_score, tags }) => {
      const api = getApi();

      // Create the entity
      const { rows } = await pg_lite.query<{ id: string }>(
        `INSERT INTO memory_entities (name, category, description, importance_score, tags)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [name, category, description || null, importance_score, tags]
      );

      if (!rows?.length) {
        toast.error("Failed to create entity");
        return "Failed to create entity";
      }

      const newId = rows[0].id;
      toast.success(`Created entity "${name}"`);

      // If 3D graph is available, highlight and zoom to the new entity
      // Note: The graph needs to refresh to show the new entity
      if (api) {
        // Give the graph a moment to update with new data
        setTimeout(() => {
          api.highlightWhere((n: GraphNode) => n.id === newId);
          api.focusNode(newId, 1500);
        }, 500);
      }

      return `Created new entity:
- ID: ${newId}
- Name: ${name}
- Category: ${category}
- Importance: ${importance_score}
${description ? `- Description: ${description}` : ''}
${tags.length > 0 ? `- Tags: ${tags.join(', ')}` : ''}

${api ? 'The graph will refresh and zoom to show the new entity.' : 'Navigate to the Graph page to see it in the 3D view.'}`;
    },
  });

  // Tool 4: Add a connection between entities
  useWebMCP({
    name: "graph3d_add_connection",
    description: `Create a relationship between two entities.

Use this to connect entities in the knowledge graph. After creation,
the camera will zoom to show both entities and their connection.

Common relationship types: uses, related_to, works_on, knows, created, part_of, depends_on`,
    inputSchema: {
      from_entity: z.string().min(1)
        .describe("Name of the source entity (partial match allowed)"),
      to_entity: z.string().min(1)
        .describe("Name of the target entity (partial match allowed)"),
      relationship_type: z.string().min(1).max(50)
        .describe("Type of relationship (e.g., 'uses', 'related_to', 'works_on')"),
      strength: z.number().min(1).max(10).default(5)
        .describe("Connection strength (1-10)"),
      description: z.string().max(500).optional()
        .describe("Description of the relationship"),
    },
    annotations: {
      title: "3D Add Connection",
      readOnlyHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    handler: async ({ from_entity, to_entity, relationship_type, strength, description }) => {
      const api = getApi();

      // Find source entity
      const { rows: fromRows } = await pg_lite.query<{ id: string; name: string }>(
        `SELECT id, name FROM memory_entities WHERE name ILIKE $1 LIMIT 1`,
        [`%${from_entity}%`]
      );

      if (!fromRows?.length) {
        toast.error(`Source entity "${from_entity}" not found`);
        return `Source entity "${from_entity}" not found. Create it first with graph3d_add_entity.`;
      }

      // Find target entity
      const { rows: toRows } = await pg_lite.query<{ id: string; name: string }>(
        `SELECT id, name FROM memory_entities WHERE name ILIKE $1 LIMIT 1`,
        [`%${to_entity}%`]
      );

      if (!toRows?.length) {
        toast.error(`Target entity "${to_entity}" not found`);
        return `Target entity "${to_entity}" not found. Create it first with graph3d_add_entity.`;
      }

      const fromId = fromRows[0].id;
      const toId = toRows[0].id;
      const fromName = fromRows[0].name;
      const toName = toRows[0].name;

      // Create the relationship
      const { rows: relRows } = await pg_lite.query<{ id: string }>(
        `INSERT INTO entity_relationships (from_entity_id, to_entity_id, relationship_type, strength, description)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [fromId, toId, relationship_type, strength, description || null]
      );

      if (!relRows?.length) {
        toast.error("Failed to create connection");
        return "Failed to create connection";
      }

      toast.success(`Connected "${fromName}" → "${toName}"`);

      // If 3D graph is available, highlight and zoom to show the connection
      if (api) {
        setTimeout(() => {
          api.highlightWhere((n: GraphNode) => n.id === fromId || n.id === toId);
          api.zoomToFit(1000, 60);
        }, 500);
      }

      return `Created connection:
${fromName} → ${relationship_type} → ${toName}
Strength: ${strength}/10
${description ? `Description: ${description}` : ''}

${api ? 'The graph will refresh and zoom to show the connected entities.' : 'Navigate to the Graph page to see it in the 3D view.'}`;
    },
  });

  // Tool 5: Clear highlights and reset view
  useWebMCP({
    name: "graph3d_clear",
    description: "Clear all highlights and reset the camera to show the full graph.",
    inputSchema: {},
    annotations: {
      title: "3D Clear",
      readOnlyHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    handler: async () => {
      const api = getApi();
      if (!api) {
        toast.error("3D graph not initialized");
        return "3D graph not initialized";
      }

      api.clear();
      api.zoomToFit(800, 80);

      toast.success("Graph view reset");
      return "Graph view has been reset. All highlights cleared and camera zoomed to show full graph.";
    },
  });
}
