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

/** Simple entity reference with id and name */
interface EntityRef {
  id: string;
  name: string;
}

/** Count query result */
interface CountResult {
  count: number;
}

/**
 * MCP tools for 3D graph visualization control
 * These tools allow AI agents to create cinematic effects and control the 3D graph
 */
export function useMCPGraph3DTools() {
  // Get the 3D API from window (set by KG3D component)
  const getApi = (): KG3DApi | null => {
    if (typeof window !== "undefined") {
      return window.KG3D ?? null;
    }
    return null;
  };

  // Tool 1: Query and highlight in 3D with visual effects
  useWebMCP({
    name: "graph3d_query_highlight",
    description: `Find entities by SQL WHERE clause and highlight them in 3D with visual effects.

This tool creates a cinematic highlighting effect:
- Entities glow and scale up
- Camera can auto-zoom to show results
- Particles flow between connected highlighted nodes
- Creates a dramatic reveal effect

Example queries:
- "category = 'skill'" - highlight all skills
- "importance_score > 80" - highlight important entities
- "name ILIKE '%AI%'" - find AI-related entities`,
    inputSchema: {
      where_clause: z.string().min(1)
        .describe("SQL WHERE clause to filter entities"),
      zoom: z.boolean().default(true)
        .describe("Auto-zoom camera to show highlighted entities"),
      emit_particles: z.boolean().default(true)
        .describe("Emit particles on edges between highlighted nodes"),
      orbit_camera: z.boolean().default(false)
        .describe("Orbit camera around highlighted nodes for dramatic effect"),
    },
    annotations: {
      title: "3D Query & Highlight",
      readOnlyHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    handler: async ({ where_clause, zoom, emit_particles, orbit_camera }) => {
      const api = getApi();
      if (!api) {
        toast.error("3D graph not initialized");
        return "3D graph not initialized";
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

      const ids = rows.map((r) => r.id);

      // Highlight matching nodes
      api.highlightWhere((n: GraphNode) => ids.includes(n.id));

      // Always zoom to show highlighted entities for better visibility
      // Use the zoom parameter to control padding
      setTimeout(() => api.zoomToFit(1000, zoom ? 60 : 100), 100);

      // Emit particles on connected edges
      if (emit_particles) {
        setTimeout(() => {
          api.emitParticlesOnPath(
            (l: GraphLink) => ids.includes(l.source) && ids.includes(l.target)
          );
        }, 500);
      }

      // Orbit camera for dramatic effect
      if (orbit_camera) {
        setTimeout(() => api.cameraOrbit(3000), 1500);
      }

      const categories = [...new Set(rows.map((r) => r.category))];
      toast.success(`3D Graph: Highlighted ${rows.length} entities`);
      return `🌟 Highlighted ${rows.length} entities in 3D:
${categories.map(cat => `• ${rows.filter((r) => r.category === cat).length} ${cat}(s)`).join('\n')}

Top matches:
${rows.slice(0, 5).map((e) => `• ${e.name} (${e.category})`).join('\n')}

${zoom ? "📹 Camera zoomed to results" : ""}
${emit_particles ? "✨ Particle effects active" : ""}
${orbit_camera ? "🎬 Camera orbiting" : ""}`;
    },
  });

  // Tool 2: Focus on entity with cinematic camera movement
  useWebMCP({
    name: "graph3d_focus_entity",
    description: `Fly camera to a specific entity with cinematic effects.

Creates a dramatic focus effect:
- Smooth camera fly-to animation
- Entity pulses with energy
- Particles emit from connected edges
- Shows detailed information about connections`,
    inputSchema: {
      name: z.string().min(1)
        .describe("Name of entity to focus on (partial match allowed)"),
      pulse: z.boolean().default(true)
        .describe("Add pulsing animation to the focused entity"),
      show_connections: z.boolean().default(true)
        .describe("Highlight and emit particles on connected edges"),
    },
    annotations: {
      title: "3D Focus Entity",
      readOnlyHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    handler: async ({ name, pulse, show_connections }) => {
      const api = getApi();
      if (!api) {
        toast.error("3D graph not initialized");
        return "3D graph not initialized";
      }

      // Find entity
      const { rows } = await pg_lite.query<EntityQueryResult>(
        `SELECT id, name, category, importance_score FROM memory_entities WHERE name ILIKE $1 LIMIT 1`,
        [`%${name}%`]
      );

      if (!rows?.length) {
        toast.error(`Entity "${name}" not found`);
        throw new Error(`Entity "${name}" not found`);
      }

      const entity = rows[0];
      const id = entity.id;

      // Focus with camera animation
      api.focusNode(id, 1500);

      // Add pulse effect
      if (pulse) {
        api.pulseNode(id);
      }

      // Show connections with particles
      if (show_connections) {
        setTimeout(() => {
          api.emitParticlesOnPath(
            (l: GraphLink) => l.source === id || l.target === id
          );
        }, 800);

        // Get connection count
        const { rows: connections } = await pg_lite.query<CountResult>(
          `SELECT COUNT(*) as count FROM entity_relationships WHERE from_entity_id = $1 OR to_entity_id = $1`,
          [id]
        );

        toast.success(`3D Graph: Focused on "${entity.name}"`);
        return `🎯 Focused on: ${entity.name}
Category: ${entity.category}
Importance: ${entity.importance_score}
Connections: ${connections[0].count}

${pulse ? "💫 Pulsing effect active" : ""}
${show_connections ? "✨ Connection particles flowing" : ""}`;
      }

      toast.success(`3D Graph: Focused on "${entity.name}"`);
      return `🎯 Focused on: ${entity.name}`;
    },
  });

  // Tool 3: Create cinematic camera tour
  useWebMCP({
    name: "graph3d_camera_tour",
    description: `Create a cinematic camera tour through multiple entities.

This creates a movie-like sequence:
- Camera flies smoothly between entities
- Each entity pulses when visited
- Particles flow along the path
- Perfect for demonstrating relationships`,
    inputSchema: {
      entity_names: z.array(z.string())
        .min(2)
        .max(10)
        .describe("List of entity names to visit in sequence"),
      duration_per_stop: z.number()
        .min(1000)
        .max(5000)
        .default(2000)
        .describe("Milliseconds to spend at each entity"),
    },
    annotations: {
      title: "3D Camera Tour",
      readOnlyHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    handler: async ({ entity_names, duration_per_stop }) => {
      const api = getApi();
      if (!api) {
        toast.error("3D graph not initialized");
        return "3D graph not initialized";
      }

      const tour_entities: EntityRef[] = [];

      // Find all entities
      for (const name of entity_names) {
        const { rows } = await pg_lite.query<EntityRef>(
          `SELECT id, name FROM memory_entities WHERE name ILIKE $1 LIMIT 1`,
          [`%${name}%`]
        );
        if (rows?.length) {
          tour_entities.push(rows[0]);
        }
      }

      if (tour_entities.length < 2) {
        toast.error("Not enough entities found for tour");
        return "Not enough entities found for tour";
      }

      // Execute tour
      tour_entities.forEach((entity, index) => {
        setTimeout(() => {
          api.focusNode(entity.id, 1000);
          api.pulseNode(entity.id);

          // Emit particles to next entity
          if (index < tour_entities.length - 1) {
            const nextId = tour_entities[index + 1].id;
            setTimeout(() => {
              api.emitParticlesOnPath(
                (l: GraphLink) =>
                  (l.source === entity.id && l.target === nextId) ||
                  (l.target === entity.id && l.source === nextId)
              );
            }, 500);
          }
        }, index * duration_per_stop);
      });

      toast.success(`3D Graph: Camera tour started with ${tour_entities.length} stops`);
      return `🎬 Camera tour started!
Visiting ${tour_entities.length} entities:
${tour_entities.map((e, i) => `${i + 1}. ${e.name}`).join('\n')}

Total duration: ${tour_entities.length * duration_per_stop / 1000} seconds`;
    },
  });

  // Tool 4: Explode/Contract view for dramatic effect
  useWebMCP({
    name: "graph3d_explode_view",
    description: `Explode or contract the graph for dramatic effect.

This creates a "big bang" or "collapse" effect:
- Explode: Nodes push apart dramatically
- Contract: Nodes pull together tightly
- Great for revealing structure or creating emphasis`,
    inputSchema: {
      mode: z.enum(["explode", "contract"])
        .describe("Whether to explode or contract the view"),
    },
    annotations: {
      title: "3D Explode/Contract",
      readOnlyHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    handler: async ({ mode }) => {
      const api = getApi();
      if (!api) {
        toast.error("3D graph not initialized");
        return "3D graph not initialized";
      }

      if (mode === "explode") {
        api.explodeView();
        toast.success("3D Graph: Exploded view");
        return "💥 Graph exploded! Nodes pushed apart for dramatic effect.";
      } else {
        api.contractView();
        toast.success("3D Graph: Contracted view");
        return "🌀 Graph contracted! Nodes pulled together.";
      }
    },
  });

  // Tool 5: Particle burst effect
  useWebMCP({
    name: "graph3d_particle_burst",
    description: `Create a particle burst effect from high-importance nodes.

This creates a fireworks-like effect:
- Particles burst from important nodes
- Flow along strong relationships
- Creates an energetic, dynamic visualization`,
    inputSchema: {
      min_importance: z.number()
        .min(0)
        .max(100)
        .default(70)
        .describe("Minimum importance score for nodes to emit particles"),
      particle_count: z.number()
        .min(1)
        .max(20)
        .default(5)
        .describe("Number of particles per edge"),
    },
    annotations: {
      title: "3D Particle Burst",
      readOnlyHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    handler: async ({ min_importance, particle_count }) => {
      const api = getApi();
      if (!api) {
        toast.error("3D graph not initialized");
        return "3D graph not initialized";
      }

      // Find high-importance nodes
      const { rows } = await pg_lite.query<{ id: string }>(
        `SELECT id FROM memory_entities WHERE importance_score >= $1`,
        [min_importance]
      );

      if (!rows?.length) {
        toast.info("No nodes meet importance threshold");
        return "No nodes meet importance threshold";
      }

      const importantIds = rows.map((r) => r.id);

      // Emit particles from all edges connected to important nodes
      api.emitParticlesOnPath(
        (l: GraphLink) =>
          importantIds.includes(l.source) ||
          importantIds.includes(l.target)
      );

      toast.success(`3D Graph: Particle burst from ${rows.length} nodes`);
      return `🎆 Particle burst!
${rows.length} high-importance nodes emitting particles
${particle_count} particles per edge`;
    },
  });

  // Tool 6: Clear all effects and reset
  useWebMCP({
    name: "graph3d_clear",
    description: "Clear all 3D highlights and effects, reset camera view.",
    inputSchema: {},
    annotations: {
      title: "3D Clear Effects",
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

      toast.success("3D Graph: Effects cleared");
      return "🔄 3D graph reset to default view";
    },
  });

  // Tool 7: Category wave effect
  useWebMCP({
    name: "graph3d_category_wave",
    description: `Create a wave effect that highlights categories in sequence.

This creates a cascading reveal:
- Each category lights up in turn
- Creates a wave-like progression
- Shows the diversity of entity types`,
    inputSchema: {
      duration_per_category: z.number()
        .min(500)
        .max(3000)
        .default(1500)
        .describe("Milliseconds to highlight each category"),
    },
    annotations: {
      title: "3D Category Wave",
      readOnlyHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    handler: async ({ duration_per_category }) => {
      const api = getApi();
      if (!api) {
        toast.error("3D graph not initialized");
        return "3D graph not initialized";
      }

      const categories = ['fact', 'preference', 'skill', 'rule', 'context', 'person', 'project', 'goal'];

      categories.forEach((category, index) => {
        setTimeout(async () => {
          // Highlight this category
          const { rows } = await pg_lite.query<{ id: string }>(
            `SELECT id FROM memory_entities WHERE category = $1`,
            [category]
          );

          if (rows?.length) {
            const ids = rows.map((r) => r.id);
            api.highlightWhere((n: GraphNode) => ids.includes(n.id));

            // Emit particles
            setTimeout(() => {
              api.emitParticlesOnPath(
                (l: GraphLink) => ids.includes(l.source) && ids.includes(l.target)
              );
            }, 200);
          }
        }, index * duration_per_category);
      });

      // Clear at the end
      setTimeout(() => {
        api.clear();
        api.zoomToFit(800, 60);
      }, categories.length * duration_per_category + 500);

      toast.success(`3D Graph: Category wave started`);
      return `🌊 Category wave started!
Highlighting ${categories.length} categories in sequence
Total duration: ${categories.length * duration_per_category / 1000} seconds`;
    },
  });
}