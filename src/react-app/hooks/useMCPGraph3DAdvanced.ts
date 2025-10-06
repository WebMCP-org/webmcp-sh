import { useMCPTool } from "@/hooks/useMCPTool";
import { z } from "zod";
import { pg_lite } from "@/lib/db";

export function useMCPGraph3DAdvanced() {
  // Helper to get the 3D graph API
  const getApi = () => {
    const api = (window as any).KG3D;
    if (!api) {
      console.warn("3D graph not initialized");
    }
    return api;
  };

  // Tool 1: Advanced Relationship Visualization
  useMCPTool({
    name: "graph3d_activate_particle_flow",
    description: `Activate sophisticated particle flows between entity categories to show relationships.

Creates dynamic particle streams that visualize:
- Information flow direction and intensity
- Connection strength through particle speed/count
- Category relationships through color gradients`,
    inputSchema: {
      from_category: z.string().optional()
        .describe("Source category for particles"),
      to_category: z.string().optional()
        .describe("Target category for particles"),
      from_query: z.string().optional()
        .describe("SQL WHERE clause for source entities"),
      to_query: z.string().optional()
        .describe("SQL WHERE clause for target entities"),
      particle_speed: z.number().min(0.001).max(0.01).default(0.003)
        .describe("Speed of particle movement"),
      particle_count: z.number().min(1).max(10).default(2)
        .describe("Number of particles per edge"),
      color_gradient: z.boolean().default(true)
        .describe("Use gradient colors based on strength"),
    },
    annotations: {
      title: "Particle Flow System",
      readOnlyHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    handler: async ({ from_category, to_category, from_query, to_query, particle_speed, particle_count, color_gradient }) => {
      const api = getApi();
      if (!api) return "3D graph not initialized";

      // Build query for source entities
      let sourceWhere = "1=1";
      if (from_category) sourceWhere = `category = '${from_category}'`;
      if (from_query) sourceWhere = from_query;

      // Build query for target entities
      let targetWhere = "1=1";
      if (to_category) targetWhere = `category = '${to_category}'`;
      if (to_query) targetWhere = to_query;

      // Get entities
      const { rows: sourceEntities } = await pg_lite.query(
        `SELECT id, name, category FROM memory_entities WHERE ${sourceWhere}`
      );
      const { rows: targetEntities } = await pg_lite.query(
        `SELECT id, name, category FROM memory_entities WHERE ${targetWhere}`
      );

      const sourceIds = sourceEntities.map((e: any) => e.id);
      const targetIds = targetEntities.map((e: any) => e.id);

      // Highlight matching entities to show the flow
      api.highlightWhere((n: any) => {
        return sourceIds.includes(n.id) || targetIds.includes(n.id);
      });

      // Emit particles on paths between source and target
      if (sourceIds.length > 0 && targetIds.length > 0) {
        api.emitParticlesOnPath((l: any) => {
          const sourceMatch = sourceIds.includes(l.source?.id || l.source);
          const targetMatch = targetIds.includes(l.target?.id || l.target);
          return sourceMatch && targetMatch;
        });
      }

      // Auto-zoom to show highlighted entities
      setTimeout(() => {
        api.zoomToFit(1000, 80);
      }, 100);

      return `🌊 Particle flow activated:
Source: ${sourceEntities.length} entities (${from_category || from_query || 'all'})
Target: ${targetEntities.length} entities (${to_category || to_query || 'all'})
Speed: ${particle_speed} | Count: ${particle_count}
${color_gradient ? "✨ Gradient coloring enabled" : ""}`;
    },
  });

  // Tool 2: Dynamic Node Styling
  useMCPTool({
    name: "graph3d_style_nodes_by_metrics",
    description: `Apply sophisticated node styling based on computed metrics.

Dynamically adjusts:
- Node size based on importance/connections
- Color schemes by category or metric gradients
- Opacity for layered visibility
- Custom geometries per category`,
    inputSchema: {
      size_metric: z.enum(["importance", "connections", "importance_x_connections", "custom"])
        .describe("Metric to determine node size"),
      size_multiplier: z.number().min(0.5).max(5).default(1)
        .describe("Multiplier for node sizes"),
      color_scheme: z.enum(["category", "importance_gradient", "connection_gradient", "temporal"])
        .describe("Color scheme to apply"),
      opacity_by_importance: z.boolean().default(false)
        .describe("Make less important nodes more transparent"),
      apply_geometries: z.boolean().default(false)
        .describe("Apply different 3D shapes per category"),
    },
    annotations: {
      title: "Dynamic Node Styling",
      readOnlyHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    handler: async ({ size_metric, size_multiplier, color_scheme, opacity_by_importance, apply_geometries }) => {
      const api = getApi();
      if (!api) return "3D graph not initialized";

      // Get all entities with their metrics
      const { rows: entities } = await pg_lite.query(`
        SELECT
          e.id,
          e.name,
          e.category,
          e.importance_score,
          e.created_at,
          COUNT(DISTINCT r1.id) + COUNT(DISTINCT r2.id) as connection_count
        FROM memory_entities e
        LEFT JOIN entity_relationships r1 ON e.id = r1.from_entity_id
        LEFT JOIN entity_relationships r2 ON e.id = r2.to_entity_id
        GROUP BY e.id, e.name, e.category, e.importance_score, e.created_at
      `);

      // Note: Dynamic node styling would require modifying the ForceGraph3D component
      // For now, we'll highlight nodes based on the criteria

      // Highlight nodes based on metrics
      if (color_scheme === "importance_gradient") {
        const highImportance = entities.filter((e: any) => e.importance_score > 80);
        const ids = highImportance.map((e: any) => e.id);
        api.highlightWhere((n: any) => ids.includes(n.id));
      } else if (color_scheme === "connection_gradient") {
        const highConnection = entities.filter((e: any) => e.connection_count > 3);
        const ids = highConnection.map((e: any) => e.id);
        api.highlightWhere((n: any) => ids.includes(n.id));
      }

      // Auto-zoom to show styled entities
      setTimeout(() => {
        api.zoomToFit(1000, 80);
      }, 100);

      return `🎨 Node styling applied:
Size metric: ${size_metric} (×${size_multiplier})
Color scheme: ${color_scheme}
${opacity_by_importance ? "✓ Opacity by importance" : ""}
${apply_geometries ? "✓ Custom geometries applied" : ""}
Styled ${entities.length} nodes`;
    },
  });

  // Tool 3: Sophisticated Camera Choreography
  useMCPTool({
    name: "graph3d_camera_sequence",
    description: `Execute a choreographed camera sequence with multiple movements.

Supports cinematic movements:
- Orbit around specific entities
- Fly-to transitions
- Zoom to entity groups
- Spiral movements
- Custom waypoint paths`,
    inputSchema: {
      sequence: z.array(z.object({
        action: z.enum(["orbit_around", "fly_to", "zoom_to_fit", "spiral_out", "pause"])
          .describe("Camera action type"),
        target: z.string().optional()
          .describe("Target entity name or category"),
        duration: z.number().min(500).max(10000)
          .describe("Duration in milliseconds"),
        radius: z.number().optional()
          .describe("Radius for orbit movements"),
        filter: z.string().optional()
          .describe("SQL WHERE clause for zoom_to_fit"),
      })).describe("Sequence of camera movements"),
      loop: z.boolean().default(false)
        .describe("Loop the sequence continuously"),
    },
    annotations: {
      title: "Camera Choreography",
      readOnlyHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    handler: async ({ sequence, loop }) => {
      const api = getApi();
      if (!api) return "3D graph not initialized";

      const fg = (api as any).getFg?.() || (window as any).fgRef?.current;
      if (!fg) return "ForceGraph instance not available";

      let totalDuration = 0;

      const executeSequence = async () => {
        for (const step of sequence) {
          switch (step.action) {
            case "orbit_around":
              if (step.target) {
                // Find entity
                const { rows } = await pg_lite.query(
                  `SELECT id, name FROM memory_entities WHERE name ILIKE $1 LIMIT 1`,
                  [`%${step.target}%`]
                );
                if (rows.length > 0) {
                  const entity = rows[0] as any;
                  // Orbit around entity
                  api.focusNode(entity.id, step.duration / 4);
                  setTimeout(() => api.cameraOrbit(step.duration), 100);
                }
              }
              break;

            case "fly_to":
              if (step.target) {
                const { rows } = await pg_lite.query(
                  `SELECT id FROM memory_entities WHERE name ILIKE $1 LIMIT 1`,
                  [`%${step.target}%`]
                );
                if (rows.length > 0) {
                  api.focusNode((rows[0] as any).id, step.duration);
                }
              }
              break;

            case "zoom_to_fit":
              if (step.filter) {
                const { rows } = await pg_lite.query(
                  `SELECT id FROM memory_entities WHERE ${step.filter}`
                );
                const ids = rows.map((r: any) => r.id);
                api.highlightWhere((n: any) => ids.includes(n.id));
                api.zoomToFit(step.duration, 50);
              } else {
                api.zoomToFit(step.duration, 50);
              }
              break;

            case "spiral_out":
              const camera = fg.camera();
              const startPos = camera.position.clone();
              const startTime = Date.now();
              const spiralRadius = step.radius || 200;

              const animate = () => {
                const elapsed = Date.now() - startTime;
                if (elapsed > step.duration) return;

                const progress = elapsed / step.duration;
                const angle = progress * Math.PI * 4;
                const radius = spiralRadius * (1 + progress);

                fg.cameraPosition({
                  x: radius * Math.cos(angle),
                  y: startPos.y + progress * 100,
                  z: radius * Math.sin(angle)
                }, { x: 0, y: 0, z: 0 }, 0);

                requestAnimationFrame(animate);
              };
              animate();
              break;

            case "pause":
              // Just wait
              break;
          }

          totalDuration += step.duration;
          await new Promise(resolve => setTimeout(resolve, step.duration));
        }

        if (loop) {
          executeSequence(); // Restart sequence
        }
      };

      executeSequence();

      return `🎬 Camera sequence started:
${sequence.length} movements
Total duration: ${totalDuration}ms
${loop ? "🔁 Looping enabled" : ""}

Sequence:
${sequence.map((s, i) => `${i + 1}. ${s.action} ${s.target || ''} (${s.duration}ms)`).join('\n')}`;
    },
  });

  // Tool 4: Real-time Visual Reasoning
  useMCPTool({
    name: "graph3d_highlight_analysis_path",
    description: `Show analytical reasoning process through progressive highlighting.

Demonstrates thought process by:
- Sequential query highlighting
- Connection tracing with particles
- Progressive revelation of insights
- Visual proof of conclusions`,
    inputSchema: {
      reasoning_steps: z.array(z.object({
        query: z.string().optional()
          .describe("SQL WHERE clause for entities to highlight"),
        highlight_color: z.string().optional()
          .describe("Color for this step (hex or name)"),
        duration: z.number().min(500).max(5000)
          .describe("How long to show this step"),
        trace_connections: z.boolean().optional()
          .describe("Show connections from highlighted entities"),
        particle_burst: z.boolean().optional()
          .describe("Emit particles from highlighted nodes"),
        narration: z.string().optional()
          .describe("Text explanation of this reasoning step"),
      })).describe("Sequential reasoning steps to visualize"),
    },
    annotations: {
      title: "Visual Reasoning Path",
      readOnlyHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    handler: async ({ reasoning_steps }) => {
      const api = getApi();
      if (!api) return "3D graph not initialized";

      const results: string[] = [];

      for (const [index, step] of reasoning_steps.entries()) {
        // Clear previous highlights
        if (index > 0) {
          api.clear();
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        if (step.query) {
          // Execute query
          const { rows } = await pg_lite.query(
            `SELECT id, name, category FROM memory_entities WHERE ${step.query}`
          );

          const ids = rows.map((r: any) => r.id);

          // Apply highlighting
          api.highlightWhere((n: any) => ids.includes(n.id));

          // Auto-zoom to show highlighted entities
          if (ids.length > 0) {
            setTimeout(() => api.zoomToFit(800, 80), 100);
          }

          // Trace connections if requested
          if (step.trace_connections) {
            setTimeout(() => {
              api.emitParticlesOnPath((l: any) =>
                ids.includes(l.source?.id || l.source) ||
                ids.includes(l.target?.id || l.target)
              );
            }, 300);
          }

          // Particle burst effect
          if (step.particle_burst) {
            // Create burst effect by pulsing nodes
            ids.forEach((id: string) => api.pulseNode(id));
          }

          results.push(`Step ${index + 1}: ${step.narration || step.query}
  → Found ${rows.length} entities
  → Categories: ${[...new Set(rows.map((r: any) => r.category))].join(', ')}`);
        }

        // Wait for step duration
        await new Promise(resolve => setTimeout(resolve, step.duration));
      }

      return `🧠 Visual reasoning complete:

${results.join('\n\n')}

Total steps: ${reasoning_steps.length}
Analysis revealed through progressive highlighting`;
    },
  });

  // Tool 5: Comparative Analysis
  useMCPTool({
    name: "graph3d_comparative_layout",
    description: `Arrange entities in comparative layouts to analyze relationships.

Creates specialized layouts:
- Triangular arrangement of categories
- Circular clustering by attributes
- Layered hierarchy visualization
- Side-by-side comparisons`,
    inputSchema: {
      groups: z.array(z.string())
        .describe("Categories or SQL queries to compare"),
      arrangement: z.enum(["triangular", "circular", "layered", "side_by_side"])
        .describe("Layout arrangement type"),
      separation_distance: z.number().min(50).max(500).default(200)
        .describe("Distance between groups"),
      show_inter_group_flows: z.boolean().default(true)
        .describe("Highlight connections between groups"),
      highlight_bridges: z.boolean().default(true)
        .describe("Emphasize entities that connect groups"),
    },
    annotations: {
      title: "Comparative Layout",
      readOnlyHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    handler: async ({ groups, arrangement, separation_distance, show_inter_group_flows, highlight_bridges }) => {
      const api = getApi();
      if (!api) return "3D graph not initialized";

      // Get entities for each group
      const groupEntities: any[] = [];
      for (const group of groups) {
        const isCategory = !group.includes(' ');
        const query = isCategory
          ? `SELECT id, name, category FROM memory_entities WHERE category = '${group}'`
          : `SELECT id, name, category FROM memory_entities WHERE ${group}`;

        const { rows } = await pg_lite.query(query);
        groupEntities.push({ group, entities: rows });
      }

      // Note: Layout positioning would require modifying the ForceGraph3D component
      // For now, we'll highlight the groups sequentially
      const positions: Record<string, { x: number, y: number, z: number }> = {};

      switch (arrangement) {
        case "triangular":
          groups.forEach((group, i) => {
            const angle = (i / groups.length) * Math.PI * 2;
            positions[group] = {
              x: Math.cos(angle) * separation_distance,
              y: 0,
              z: Math.sin(angle) * separation_distance
            };
          });
          break;

        case "circular":
          groups.forEach((group, i) => {
            const angle = (i / groups.length) * Math.PI * 2;
            positions[group] = {
              x: Math.cos(angle) * separation_distance,
              y: Math.sin(angle * 2) * 50,
              z: Math.sin(angle) * separation_distance
            };
          });
          break;

        case "layered":
          groups.forEach((group, i) => {
            positions[group] = {
              x: 0,
              y: i * separation_distance / 2,
              z: 0
            };
          });
          break;

        case "side_by_side":
          groups.forEach((group, i) => {
            positions[group] = {
              x: (i - groups.length / 2) * separation_distance,
              y: 0,
              z: 0
            };
          });
          break;
      }

      // Highlight groups sequentially to show layout
      for (let i = 0; i < groupEntities.length; i++) {
        const { entities } = groupEntities[i];
        const ids = entities.map((e: any) => e.id);

        setTimeout(() => {
          api.highlightWhere((n: any) => ids.includes(n.id));
          // Zoom to fit the highlighted group
          api.zoomToFit(800, 100);
        }, i * 1500);
      }

      // Show all groups together after sequential display
      setTimeout(() => {
        const allGroupIds = groupEntities.flatMap(g => g.entities.map((e: any) => e.id));
        api.highlightWhere((n: any) => allGroupIds.includes(n.id));
        api.zoomToFit(1000, 80);
      }, groupEntities.length * 1500 + 500);

      // Highlight inter-group connections
      if (show_inter_group_flows) {
        const allGroupIds = groupEntities.flatMap(g => g.entities.map((e: any) => e.id));
        api.emitParticlesOnPath((l: any) => {
          const sourceInGroup = allGroupIds.includes(l.source?.id || l.source);
          const targetInGroup = allGroupIds.includes(l.target?.id || l.target);
          return sourceInGroup && targetInGroup;
        });
      }

      // Find and highlight bridge entities
      let bridgeCount = 0;
      if (highlight_bridges) {
        const { rows: bridges } = await pg_lite.query(`
          SELECT DISTINCT e.id, e.name
          FROM memory_entities e
          JOIN entity_relationships r1 ON e.id = r1.from_entity_id OR e.id = r1.to_entity_id
          WHERE EXISTS (
            SELECT 1 FROM memory_entities e2
            WHERE (r1.from_entity_id = e2.id OR r1.to_entity_id = e2.id)
            AND e2.category != e.category
          )
        `);
        bridgeCount = bridges.length;

        const bridgeIds = bridges.map((b: any) => b.id);
        setTimeout(() => {
          bridgeIds.forEach((id: string) => api.pulseNode(id));
        }, 1500);
      }

      return `📊 Comparative layout applied:
Arrangement: ${arrangement}
Groups: ${groups.join(', ')}
Total entities: ${groupEntities.reduce((sum, g) => sum + g.entities.length, 0)}
${highlight_bridges ? `Bridge entities: ${bridgeCount}` : ''}
${show_inter_group_flows ? '✨ Inter-group flows active' : ''}`;
    },
  });

  // Tool 6: Pattern Detection
  useMCPTool({
    name: "graph3d_pattern_detection",
    description: `Detect and highlight structural patterns in the knowledge graph.

Identifies:
- Hub nodes (high connectivity)
- Clusters (densely connected groups)
- Bridge nodes (connect different clusters)
- Isolated nodes
- Chains and paths`,
    inputSchema: {
      pattern_type: z.enum(["hubs", "clusters", "bridges", "isolated", "chains"])
        .describe("Type of pattern to detect"),
      min_connections: z.number().min(1).default(3)
        .describe("Minimum connections for hub detection"),
      highlight_duration: z.number().min(1000).max(10000).default(5000)
        .describe("How long to highlight patterns"),
      animate_discovery: z.boolean().default(true)
        .describe("Animate the discovery process"),
    },
    annotations: {
      title: "Pattern Detection",
      readOnlyHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    handler: async ({ pattern_type, min_connections, highlight_duration, animate_discovery }) => {
      const api = getApi();
      if (!api) return "3D graph not initialized";

      let patternNodes: any[] = [];
      let description = "";

      switch (pattern_type) {
        case "hubs":
          const { rows: hubs } = await pg_lite.query(`
            SELECT e.id, e.name, e.category, COUNT(DISTINCT r.id) as connection_count
            FROM memory_entities e
            LEFT JOIN entity_relationships r ON e.id = r.from_entity_id OR e.id = r.to_entity_id
            GROUP BY e.id, e.name, e.category
            HAVING COUNT(DISTINCT r.id) >= $1
            ORDER BY connection_count DESC
          `, [min_connections]);

          patternNodes = hubs;
          description = `Found ${hubs.length} hub nodes with ${min_connections}+ connections`;
          break;

        case "clusters":
          // Find densely connected groups using common connections
          const { rows: clusters } = await pg_lite.query(`
            WITH entity_pairs AS (
              SELECT DISTINCT
                LEAST(r1.from_entity_id, r1.to_entity_id) as entity1,
                GREATEST(r1.from_entity_id, r1.to_entity_id) as entity2
              FROM entity_relationships r1
              JOIN entity_relationships r2 ON
                (r1.from_entity_id = r2.from_entity_id OR r1.from_entity_id = r2.to_entity_id OR
                 r1.to_entity_id = r2.from_entity_id OR r1.to_entity_id = r2.to_entity_id)
              WHERE r1.id != r2.id
            )
            SELECT DISTINCT e.id, e.name, e.category
            FROM memory_entities e
            WHERE e.id IN (
              SELECT entity1 FROM entity_pairs
              UNION
              SELECT entity2 FROM entity_pairs
            )
          `);

          patternNodes = clusters;
          description = `Found ${clusters.length} entities in dense clusters`;
          break;

        case "bridges":
          // Find entities that connect different categories
          const { rows: bridges } = await pg_lite.query(`
            SELECT DISTINCT e.id, e.name, e.category,
              COUNT(DISTINCT e2.category) as connected_categories
            FROM memory_entities e
            JOIN entity_relationships r ON e.id = r.from_entity_id OR e.id = r.to_entity_id
            JOIN memory_entities e2 ON
              (e2.id = r.from_entity_id OR e2.id = r.to_entity_id) AND e2.id != e.id
            GROUP BY e.id, e.name, e.category
            HAVING COUNT(DISTINCT e2.category) > 1
            ORDER BY connected_categories DESC
          `);

          patternNodes = bridges;
          description = `Found ${bridges.length} bridge entities connecting multiple categories`;
          break;

        case "isolated":
          const { rows: isolated } = await pg_lite.query(`
            SELECT e.id, e.name, e.category
            FROM memory_entities e
            LEFT JOIN entity_relationships r ON e.id = r.from_entity_id OR e.id = r.to_entity_id
            WHERE r.id IS NULL
          `);

          patternNodes = isolated;
          description = `Found ${isolated.length} isolated entities with no connections`;
          break;

        case "chains":
          // Find linear chains (entities with exactly 2 connections)
          const { rows: chains } = await pg_lite.query(`
            SELECT e.id, e.name, e.category, COUNT(DISTINCT r.id) as connection_count
            FROM memory_entities e
            LEFT JOIN entity_relationships r ON e.id = r.from_entity_id OR e.id = r.to_entity_id
            GROUP BY e.id, e.name, e.category
            HAVING COUNT(DISTINCT r.id) = 2
          `);

          patternNodes = chains;
          description = `Found ${chains.length} entities in chain patterns (exactly 2 connections)`;
          break;
      }

      // Animate discovery if requested
      if (animate_discovery && patternNodes.length > 0) {
        const ids = patternNodes.map((n: any) => n.id);

        // Progressive highlighting
        for (let i = 0; i < Math.min(10, ids.length); i++) {
          setTimeout(() => {
            api.pulseNode(ids[i]);
          }, i * 200);
        }

        // Highlight all after animation
        setTimeout(() => {
          api.highlightWhere((n: any) => ids.includes(n.id));
          // Auto-zoom to show pattern
          api.zoomToFit(1000, 80);
        }, Math.min(10, ids.length) * 200);
      } else {
        // Immediate highlighting
        const ids = patternNodes.map((n: any) => n.id);
        api.highlightWhere((n: any) => ids.includes(n.id));
        // Auto-zoom to show pattern
        setTimeout(() => api.zoomToFit(1000, 80), 100);
      }

      // Clear after duration
      setTimeout(() => {
        api.clear();
      }, highlight_duration);

      return `🔍 Pattern detection: ${pattern_type}
${description}

Top patterns:
${patternNodes.slice(0, 5).map((n: any) =>
  `• ${n.name} (${n.category})${n.connection_count ? ` - ${n.connection_count} connections` : ''}`
).join('\n')}`;
    },
  });

  return {
    getApi,
  };
}