import { z } from 'zod';
import { useWebMCP } from '@mcp-b/react-webmcp';
import { pg_lite } from '@/lib/db';

/**
 * SQL-based graph query tools that don't require ReactFlow context
 * These tools allow AI to query the graph data directly via SQL
 */
export function useMCPGraphSQLTools() {
  // Tool 1: Find connected entities
  useWebMCP({
    name: 'graph_find_connections',
    description: `Find all entities connected to a specific entity in the knowledge graph.

This tool queries the database to find:
- All entities directly connected to the target
- The type and strength of relationships
- Connection statistics

Useful for understanding an entity's context without needing the visual graph.`,
    inputSchema: {
      entity_name: z.string()
        .min(1)
        .describe('Name of the entity to find connections for'),
      min_strength: z.number()
        .min(1)
        .max(10)
        .optional()
        .default(1)
        .describe('Minimum relationship strength to include (1-10)'),
      limit: z.number()
        .min(1)
        .max(100)
        .optional()
        .default(20)
        .describe('Maximum number of connections to return'),
    },
    annotations: {
      title: 'Find Entity Connections',
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
    handler: async (input) => {
      const { entity_name, min_strength, limit } = input;

      // Find the entity
      const entityResult = await pg_lite.query(`
        SELECT id, name, category, importance_score, description
        FROM memory_entities
        WHERE name ILIKE $1
        LIMIT 1
      `, [`%${entity_name}%`]);

      if (entityResult.rows.length === 0) {
        return `Entity "${entity_name}" not found.`;
      }

      const entity = entityResult.rows[0] as any;

      // Get connections
      const connectionsResult = await pg_lite.query(`
        WITH entity_connections AS (
          SELECT
            r.id,
            r.relationship_type,
            r.strength,
            r.confidence,
            CASE
              WHEN r.from_entity_id = $1 THEN r.to_entity_id
              ELSE r.from_entity_id
            END as connected_id,
            CASE
              WHEN r.from_entity_id = $1 THEN 'outgoing'
              ELSE 'incoming'
            END as direction
          FROM entity_relationships r
          WHERE (r.from_entity_id = $1 OR r.to_entity_id = $1)
            AND r.strength >= $2
        )
        SELECT
          ec.*,
          e.name as connected_name,
          e.category as connected_category,
          e.importance_score as connected_importance,
          e.description as connected_description
        FROM entity_connections ec
        JOIN memory_entities e ON ec.connected_id = e.id
        ORDER BY ec.strength DESC, e.importance_score DESC
        LIMIT $3
      `, [entity.id, min_strength, limit]);

      const connections = connectionsResult.rows;

      if (connections.length === 0) {
        return `No connections found for "${entity.name}" with strength >= ${min_strength}.`;
      }

      // Group by relationship type
      const byType: Record<string, any[]> = {};
      for (const conn of connections) {
        const type = (conn as any).relationship_type;
        if (!byType[type]) byType[type] = [];
        byType[type].push(conn);
      }

      // Format output
      let output = `Entity: ${entity.name}
Category: ${entity.category}
Importance: ${entity.importance_score}
Description: ${entity.description}

Found ${connections.length} connections:

`;

      for (const [type, conns] of Object.entries(byType)) {
        output += `\n${type.replace(/_/g, ' ').toUpperCase()} (${conns.length}):\n`;
        for (const conn of conns.slice(0, 5)) {
          const arrow = conn.direction === 'outgoing' ? '→' : '←';
          output += `  ${arrow} ${conn.connected_name} (${conn.connected_category}, importance: ${conn.connected_importance}, strength: ${conn.strength})\n`;
        }
        if (conns.length > 5) {
          output += `  ... and ${conns.length - 5} more\n`;
        }
      }

      return output;
    },
  });

  // Tool 2: Find paths between entities
  useWebMCP({
    name: 'graph_find_path',
    description: `Find the shortest path between two entities in the knowledge graph.

This tool uses SQL to find how two entities are connected through relationships,
showing the chain of connections between them.`,
    inputSchema: {
      from_entity: z.string()
        .min(1)
        .describe('Name of the starting entity'),
      to_entity: z.string()
        .min(1)
        .describe('Name of the target entity'),
      max_depth: z.number()
        .min(1)
        .max(5)
        .optional()
        .default(3)
        .describe('Maximum path length to search (1-5)'),
    },
    annotations: {
      title: 'Find Path Between Entities',
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
    handler: async (input) => {
      const { from_entity, to_entity, max_depth } = input;

      // Find both entities
      const fromResult = await pg_lite.query(`
        SELECT id, name FROM memory_entities WHERE name ILIKE $1 LIMIT 1
      `, [`%${from_entity}%`]);

      const toResult = await pg_lite.query(`
        SELECT id, name FROM memory_entities WHERE name ILIKE $1 LIMIT 1
      `, [`%${to_entity}%`]);

      if (fromResult.rows.length === 0) {
        return `Starting entity "${from_entity}" not found.`;
      }
      if (toResult.rows.length === 0) {
        return `Target entity "${to_entity}" not found.`;
      }

      const fromEntity = fromResult.rows[0] as any;
      const toEntity = toResult.rows[0] as any;

      if (fromEntity.id === toEntity.id) {
        return `"${fromEntity.name}" and "${toEntity.name}" are the same entity.`;
      }

      // Check direct connection first
      const directResult = await pg_lite.query(`
        SELECT r.*,
               e1.name as from_name,
               e2.name as to_name
        FROM entity_relationships r
        JOIN memory_entities e1 ON r.from_entity_id = e1.id
        JOIN memory_entities e2 ON r.to_entity_id = e2.id
        WHERE (r.from_entity_id = $1 AND r.to_entity_id = $2)
           OR (r.from_entity_id = $2 AND r.to_entity_id = $1)
      `, [fromEntity.id, toEntity.id]);

      if (directResult.rows.length > 0) {
        const rel = directResult.rows[0] as any;
        return `Direct connection found:
${rel.from_name} → ${rel.to_name}
Relationship: ${rel.relationship_type.replace(/_/g, ' ')}
Strength: ${rel.strength}/10`;
      }

      // For deeper paths, we'll do a breadth-first search
      // This is simplified - a full implementation would use recursive CTEs
      const visited = new Set<string>([fromEntity.id]);
      let currentLevel = [fromEntity.id];
      const paths: Map<string, string[]> = new Map([[fromEntity.id, [fromEntity.name]]]);

      for (let depth = 1; depth <= max_depth && currentLevel.length > 0; depth++) {
        const nextLevel: string[] = [];

        for (const currentId of currentLevel) {
          const neighborsResult = await pg_lite.query(`
            SELECT DISTINCT
              CASE
                WHEN r.from_entity_id = $1 THEN r.to_entity_id
                ELSE r.from_entity_id
              END as neighbor_id,
              r.relationship_type,
              e.name as neighbor_name
            FROM entity_relationships r
            JOIN memory_entities e ON (
              CASE
                WHEN r.from_entity_id = $1 THEN r.to_entity_id = e.id
                ELSE r.from_entity_id = e.id
              END
            )
            WHERE r.from_entity_id = $1 OR r.to_entity_id = $1
          `, [currentId]);

          for (const neighbor of neighborsResult.rows as any[]) {
            if (!visited.has(neighbor.neighbor_id)) {
              visited.add(neighbor.neighbor_id);
              nextLevel.push(neighbor.neighbor_id);

              const currentPath = paths.get(currentId) || [];
              paths.set(neighbor.neighbor_id, [...currentPath, neighbor.neighbor_name]);

              if (neighbor.neighbor_id === toEntity.id) {
                const path = paths.get(neighbor.neighbor_id) || [];
                return `Path found (${path.length} steps):
${path.join(' → ')}`;
              }
            }
          }
        }

        currentLevel = nextLevel;
      }

      return `No path found between "${fromEntity.name}" and "${toEntity.name}" within ${max_depth} steps.`;
    },
  });

  // Tool 3: Analyze entity clusters
  useWebMCP({
    name: 'graph_analyze_clusters',
    description: `Analyze clusters and highly connected components in the knowledge graph.

Identifies:
- Most connected entities (hubs)
- Entity categories distribution
- Relationship type statistics
- Isolated entities`,
    inputSchema: {
      min_connections: z.number()
        .min(1)
        .optional()
        .default(3)
        .describe('Minimum connections to be considered a hub'),
    },
    annotations: {
      title: 'Analyze Graph Clusters',
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
    handler: async (input) => {
      const { min_connections } = input;

      // Find hubs (most connected entities)
      const hubsResult = await pg_lite.query(`
        WITH connection_counts AS (
          SELECT
            e.id,
            e.name,
            e.category,
            e.importance_score,
            COUNT(DISTINCT r.id) as connection_count,
            COUNT(DISTINCT CASE WHEN r.from_entity_id = e.id THEN r.id END) as outgoing,
            COUNT(DISTINCT CASE WHEN r.to_entity_id = e.id THEN r.id END) as incoming
          FROM memory_entities e
          LEFT JOIN entity_relationships r ON (e.id = r.from_entity_id OR e.id = r.to_entity_id)
          GROUP BY e.id, e.name, e.category, e.importance_score
        )
        SELECT *
        FROM connection_counts
        WHERE connection_count >= $1
        ORDER BY connection_count DESC, importance_score DESC
        LIMIT 10
      `, [min_connections]);

      // Get category distribution
      const categoryResult = await pg_lite.query(`
        SELECT
          category,
          COUNT(*) as count,
          AVG(importance_score) as avg_importance,
          MAX(importance_score) as max_importance
        FROM memory_entities
        GROUP BY category
        ORDER BY count DESC
      `);

      // Get relationship type distribution
      const relTypeResult = await pg_lite.query(`
        SELECT
          relationship_type,
          COUNT(*) as count,
          AVG(strength) as avg_strength,
          MAX(strength) as max_strength
        FROM entity_relationships
        GROUP BY relationship_type
        ORDER BY count DESC
      `);

      // Find isolated entities
      const isolatedResult = await pg_lite.query(`
        SELECT COUNT(*) as isolated_count
        FROM memory_entities e
        WHERE NOT EXISTS (
          SELECT 1 FROM entity_relationships r
          WHERE r.from_entity_id = e.id OR r.to_entity_id = e.id
        )
      `);

      const hubs = hubsResult.rows;
      const categories = categoryResult.rows;
      const relTypes = relTypeResult.rows;
      const isolated = (isolatedResult.rows[0] as any).isolated_count;

      return `Graph Analysis:

TOP HUBS (≥${min_connections} connections):
${hubs.slice(0, 5).map((h: any) =>
  `• ${h.name} (${h.category}): ${h.connection_count} connections (${h.outgoing} out, ${h.incoming} in)`
).join('\n')}

CATEGORY DISTRIBUTION:
${categories.map((c: any) =>
  `• ${c.category}: ${c.count} entities (avg importance: ${Math.round(c.avg_importance)})`
).join('\n')}

RELATIONSHIP TYPES:
${relTypes.slice(0, 5).map((r: any) =>
  `• ${r.relationship_type.replace(/_/g, ' ')}: ${r.count} relationships (avg strength: ${Math.round(r.avg_strength)})`
).join('\n')}

GRAPH STATISTICS:
• Total hubs (≥${min_connections} connections): ${hubs.length}
• Isolated entities: ${isolated}
• Most connected entity: ${hubs[0] ? `${(hubs[0] as any).name} (${(hubs[0] as any).connection_count} connections)` : 'None'}`;
    },
  });
}