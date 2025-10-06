import { z } from 'zod';
import { useMCPTool } from './useMCPTool';
import { useReactFlow, useNodes, useEdges } from '@xyflow/react';
import { pg_lite } from '@/lib/db';
import { getCategoryColor } from '@/lib/category-colors';

/**
 * Advanced visual effects for React Flow graph
 * These tools create impressive visual demonstrations of AI capabilities
 */
export function useMCPGraphVisualEffects() {
  const reactFlowInstance = useReactFlow();
  const nodes = useNodes();
  const edges = useEdges();

  // Tool 1: Animated Ripple Effect from Entity
  useMCPTool({
    name: 'graph_ripple_effect',
    description: `Create an animated ripple effect emanating from an entity, progressively revealing its connections.

This creates a visually stunning effect where:
- A ripple starts from the selected entity
- Connections are revealed in waves based on distance
- Each wave highlights nodes with a different intensity
- Creates a "knowledge spreading" visualization

Perfect for demonstrating how information flows through the knowledge graph.`,
    inputSchema: {
      entity_name: z.string()
        .min(1)
        .describe('Name of the entity to start the ripple from'),
      ripple_speed: z.number()
        .min(100)
        .max(1000)
        .optional()
        .default(500)
        .describe('Speed of ripple animation in ms per level'),
      max_depth: z.number()
        .min(1)
        .max(5)
        .optional()
        .default(3)
        .describe('How many levels deep the ripple should go'),
      color_scheme: z.enum(['blue', 'green', 'purple', 'fire'])
        .optional()
        .default('blue')
        .describe('Color scheme for the ripple effect'),
    },
    annotations: {
      title: 'Create Ripple Effect',
      readOnlyHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    handler: async (input) => {
      const { entity_name, ripple_speed, max_depth, color_scheme } = input;

      // Color schemes for different effects
      const colorSchemes = {
        blue: ['#3b82f6', '#60a5fa', '#93bbfc', '#c7dbfe'],
        green: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
        purple: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'],
        fire: ['#ef4444', '#f87171', '#fbbf24', '#fde047'],
      };

      const colors = colorSchemes[color_scheme];

      // Find the starting entity
      const entityResult = await pg_lite.query(`
        SELECT id, name, category FROM memory_entities
        WHERE name ILIKE $1 LIMIT 1
      `, [`%${entity_name}%`]);

      if (entityResult.rows.length === 0) {
        throw new Error(`Entity "${entity_name}" not found.`);
      }

      const startEntity = entityResult.rows[0] as any;

      // BFS to find entities at each level
      const levels: Set<string>[] = [new Set([startEntity.id])];
      const visited = new Set<string>([startEntity.id]);

      for (let depth = 1; depth <= max_depth; depth++) {
        const currentLevel = new Set<string>();

        for (const entityId of levels[depth - 1]) {
          const connectionsResult = await pg_lite.query(`
            SELECT DISTINCT
              CASE
                WHEN from_entity_id = $1 THEN to_entity_id
                ELSE from_entity_id
              END as connected_id
            FROM entity_relationships
            WHERE (from_entity_id = $1 OR to_entity_id = $1)
          `, [entityId]);

          for (const row of connectionsResult.rows) {
            const connectedId = (row as any).connected_id;
            if (!visited.has(connectedId)) {
              visited.add(connectedId);
              currentLevel.add(connectedId);
            }
          }
        }

        if (currentLevel.size > 0) {
          levels.push(currentLevel);
        } else {
          break;
        }
      }

      // Animate the ripple effect
      for (let level = 0; level < levels.length; level++) {
        setTimeout(() => {
          const levelIds = levels[level];
          const color = colors[Math.min(level, colors.length - 1)];

          // Update nodes for this level
          const updatedNodes = nodes.map(node => {
            if (levelIds.has(node.id)) {
              return {
                ...node,
                data: {
                  ...node.data,
                  rippleLevel: level,
                  rippleActive: true,
                },
                style: {
                  ...node.style,
                  transition: 'all 0.5s ease-out',
                  transform: `scale(${level === 0 ? 1.3 : 1.1})`,
                  boxShadow: `0 0 ${20 - level * 4}px ${color}`,
                  border: `2px solid ${color}`,
                },
                className: `ripple-level-${level}`,
              };
            }
            return node;
          });

          // Update edges connecting to this level
          const updatedEdges = edges.map(edge => {
            const sourceInLevel = levelIds.has(edge.source);
            const targetInLevel = levelIds.has(edge.target);
            const sourceInPrevLevels = level > 0 &&
              Array.from({ length: level }).some((_, i) => levels[i].has(edge.source));
            const targetInPrevLevels = level > 0 &&
              Array.from({ length: level }).some((_, i) => levels[i].has(edge.target));

            if ((sourceInLevel && targetInPrevLevels) || (targetInLevel && sourceInPrevLevels)) {
              return {
                ...edge,
                animated: true,
                style: {
                  ...edge.style,
                  stroke: color,
                  strokeWidth: 3,
                  transition: 'all 0.5s ease-out',
                },
              };
            }
            return edge;
          });

          reactFlowInstance.setNodes(updatedNodes);
          reactFlowInstance.setEdges(updatedEdges);

          // Zoom to show the current ripple extent
          if (level === levels.length - 1) {
            setTimeout(() => {
              const affectedNodes = updatedNodes.filter(n => visited.has(n.id));
              if (affectedNodes.length > 0) {
                reactFlowInstance.fitView({
                  nodes: affectedNodes,
                  padding: 0.15,
                  duration: 1000,
                });
              }
            }, 300);
          }
        }, level * ripple_speed);
      }

      return `🌊 Ripple effect started from "${startEntity.name}"
Expanding through ${levels.length} levels with ${visited.size} total entities
Animation duration: ${levels.length * ripple_speed}ms
Color scheme: ${color_scheme}`;
    },
  });

  // Tool 2: Constellation Mode - Group and Highlight by Category
  useMCPTool({
    name: 'graph_constellation_mode',
    description: `Transform the graph into a constellation view, grouping entities by category with animated connections.

Creates a stunning visualization where:
- Entities are grouped and colored by category
- Strong relationships form "constellations"
- Weak relationships fade into the background
- Categories pulse with different rhythms
- Creates a "night sky" effect with knowledge clusters

Perfect for showing the overall structure and clustering of knowledge.`,
    inputSchema: {
      categories: z.array(z.string())
        .optional()
        .describe('Specific categories to highlight (empty = all)'),
      min_strength: z.number()
        .min(1)
        .max(10)
        .optional()
        .default(5)
        .describe('Minimum relationship strength to show as constellation lines'),
      animation_style: z.enum(['pulse', 'twinkle', 'wave'])
        .optional()
        .default('pulse')
        .describe('Animation style for the constellation'),
    },
    annotations: {
      title: 'Constellation View',
      readOnlyHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    handler: async (input) => {
      const { categories, min_strength, animation_style } = input;

      // Get categories to highlight
      let categoriesToShow = categories;
      if (!categoriesToShow || categoriesToShow.length === 0) {
        const catResult = await pg_lite.query(`
          SELECT DISTINCT category FROM memory_entities
        `);
        categoriesToShow = catResult.rows.map((r: any) => r.category);
      }

      // Get entities by category
      const categoryGroups: Record<string, Set<string>> = {};
      for (const category of categoriesToShow) {
        const entitiesResult = await pg_lite.query(`
          SELECT id FROM memory_entities WHERE category = $1
        `, [category]);
        categoryGroups[category] = new Set(entitiesResult.rows.map((r: any) => r.id));
      }

      // Animation classes based on style
      const animationClasses = {
        pulse: 'constellation-pulse',
        twinkle: 'constellation-twinkle',
        wave: 'constellation-wave',
      };

      // Update all nodes
      const updatedNodes = nodes.map((node, index) => {
        const nodeCategory = Object.entries(categoryGroups).find(([_, ids]) =>
          ids.has(node.id)
        )?.[0];

        if (nodeCategory) {
          const color = getCategoryColor(nodeCategory);
          const delay = animation_style === 'wave' ? index * 50 : Math.random() * 1000;

          return {
            ...node,
            data: {
              ...node.data,
              constellationCategory: nodeCategory,
            },
            style: {
              ...node.style,
              backgroundColor: color,
              color: '#ffffff',
              border: `2px solid ${color}`,
              boxShadow: `0 0 20px ${color}80`,
              transition: 'all 0.5s ease-out',
              animationDelay: `${delay}ms`,
            },
            className: `${animationClasses[animation_style]} constellation-node`,
          };
        } else {
          // Dim non-highlighted nodes
          return {
            ...node,
            style: {
              ...node.style,
              opacity: 0.2,
              transition: 'all 0.5s ease-out',
            },
          };
        }
      });

      // Update edges based on strength
      const updatedEdges = edges.map(edge => {
        const sourceHighlighted = updatedNodes.find(n => n.id === edge.source)?.data?.constellationCategory;
        const targetHighlighted = updatedNodes.find(n => n.id === edge.target)?.data?.constellationCategory;

        if (sourceHighlighted && targetHighlighted) {
          // Get edge strength from database
          return {
            ...edge,
            animated: true,
            style: {
              ...edge.style,
              stroke: sourceHighlighted === targetHighlighted ?
                getCategoryColor(String(sourceHighlighted)) : '#94a3b8',
              strokeWidth: 2,
              strokeDasharray: '5 5',
              opacity: 0.8,
              transition: 'all 0.5s ease-out',
            },
            className: 'constellation-edge',
          };
        } else {
          return {
            ...edge,
            style: {
              ...edge.style,
              opacity: 0.05,
              transition: 'all 0.5s ease-out',
            },
          };
        }
      });

      reactFlowInstance.setNodes(updatedNodes);
      reactFlowInstance.setEdges(updatedEdges);

      // Zoom out to show full constellation
      setTimeout(() => {
        reactFlowInstance.fitView({
          padding: 0.1,
          duration: 1500,
        });
      }, 500);

      const totalHighlighted = Object.values(categoryGroups).reduce((sum, group) =>
        sum + group.size, 0
      );

      return `✨ Constellation mode activated!
Categories shown: ${categoriesToShow.join(', ')}
Entities highlighted: ${totalHighlighted}
Animation style: ${animation_style}
Strong connections (≥${min_strength}) are emphasized`;
    },
  });

  // Tool 3: Path Animation - Show Connection Path
  useMCPTool({
    name: 'graph_animate_path',
    description: `Animate a path between two entities, showing how they connect through the knowledge graph.

Creates a dramatic visualization where:
- The path lights up step by step
- Each hop in the path pulses as it's traversed
- Connection strength determines animation speed
- Shows the "thought process" of following connections

Perfect for demonstrating how AI traces connections between concepts.`,
    inputSchema: {
      from_entity: z.string()
        .min(1)
        .describe('Starting entity name'),
      to_entity: z.string()
        .min(1)
        .describe('Target entity name'),
      animation_speed: z.number()
        .min(200)
        .max(2000)
        .optional()
        .default(800)
        .describe('Speed of animation per hop in ms'),
    },
    annotations: {
      title: 'Animate Path',
      readOnlyHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    handler: async (input) => {
      const { from_entity, to_entity, animation_speed } = input;

      // Find both entities
      const fromResult = await pg_lite.query(`
        SELECT id, name FROM memory_entities WHERE name ILIKE $1 LIMIT 1
      `, [`%${from_entity}%`]);

      const toResult = await pg_lite.query(`
        SELECT id, name FROM memory_entities WHERE name ILIKE $1 LIMIT 1
      `, [`%${to_entity}%`]);

      if (fromResult.rows.length === 0 || toResult.rows.length === 0) {
        throw new Error('One or both entities not found.');
      }

      const fromEntity = fromResult.rows[0] as any;
      const toEntity = toResult.rows[0] as any;

      // Simple BFS to find path
      const queue: Array<{ id: string; path: string[] }> = [
        { id: fromEntity.id, path: [fromEntity.id] }
      ];
      const visited = new Set<string>();
      let foundPath: string[] | null = null;

      while (queue.length > 0 && !foundPath) {
        const current = queue.shift()!;

        if (current.id === toEntity.id) {
          foundPath = current.path;
          break;
        }

        if (visited.has(current.id)) continue;
        visited.add(current.id);

        const neighbors = await pg_lite.query(`
          SELECT DISTINCT
            CASE
              WHEN from_entity_id = $1 THEN to_entity_id
              ELSE from_entity_id
            END as neighbor_id
          FROM entity_relationships
          WHERE from_entity_id = $1 OR to_entity_id = $1
        `, [current.id]);

        for (const neighbor of neighbors.rows) {
          const neighborId = (neighbor as any).neighbor_id;
          if (!visited.has(neighborId)) {
            queue.push({
              id: neighborId,
              path: [...current.path, neighborId]
            });
          }
        }
      }

      if (!foundPath) {
        return `No path found between "${fromEntity.name}" and "${toEntity.name}"`;
      }

      // Animate the path
      for (let i = 0; i < foundPath.length; i++) {
        setTimeout(() => {
          const currentNodeId = foundPath![i];
          const prevNodeId = i > 0 ? foundPath![i - 1] : null;

          // Highlight current node
          const updatedNodes = nodes.map(node => {
            if (node.id === currentNodeId) {
              return {
                ...node,
                style: {
                  ...node.style,
                  backgroundColor: '#10b981',
                  transform: 'scale(1.3)',
                  boxShadow: '0 0 30px #10b981',
                  transition: 'all 0.3s ease-out',
                  zIndex: 1000,
                },
                className: 'path-active',
              };
            } else if (foundPath!.slice(0, i).includes(node.id)) {
              // Previously visited nodes
              return {
                ...node,
                style: {
                  ...node.style,
                  backgroundColor: '#06b6d4',
                  transform: 'scale(1.1)',
                  boxShadow: '0 0 15px #06b6d4',
                  transition: 'all 0.3s ease-out',
                },
                className: 'path-visited',
              };
            }
            return node;
          });

          // Highlight edge if moving between nodes
          const updatedEdges = edges.map(edge => {
            if (prevNodeId && (
              (edge.source === prevNodeId && edge.target === currentNodeId) ||
              (edge.source === currentNodeId && edge.target === prevNodeId)
            )) {
              return {
                ...edge,
                animated: true,
                style: {
                  ...edge.style,
                  stroke: '#10b981',
                  strokeWidth: 4,
                  transition: 'all 0.3s ease-out',
                },
                className: 'path-edge-active',
              };
            }
            return edge;
          });

          reactFlowInstance.setNodes(updatedNodes);
          reactFlowInstance.setEdges(updatedEdges);

          // Pan to current node
          const currentNode = nodes.find(n => n.id === currentNodeId);
          if (currentNode) {
            reactFlowInstance.setCenter(
              currentNode.position.x,
              currentNode.position.y,
              { zoom: 1.5, duration: animation_speed * 0.8 }
            );
          }
        }, i * animation_speed);
      }

      return `🛤️ Path animation started!
From: ${fromEntity.name}
To: ${toEntity.name}
Path length: ${foundPath.length} steps
Total animation time: ${foundPath.length * animation_speed}ms`;
    },
  });

  // Tool 4: Importance Heatmap
  useMCPTool({
    name: 'graph_importance_heatmap',
    description: `Transform the graph into a heatmap showing importance scores.

Creates a gradient visualization where:
- High importance entities glow bright red/orange
- Medium importance shows as yellow/green
- Low importance fades to blue/purple
- Size scales with importance
- Creates a "heat vision" effect

Perfect for showing which knowledge is most critical.`,
    inputSchema: {
      scale_nodes: z.boolean()
        .optional()
        .default(true)
        .describe('Whether to scale node size based on importance'),
      show_values: z.boolean()
        .optional()
        .default(false)
        .describe('Whether to show importance values on nodes'),
    },
    annotations: {
      title: 'Importance Heatmap',
      readOnlyHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    handler: async (input) => {
      const { scale_nodes, show_values } = input;

      // Get importance scores for all entities
      const scoresResult = await pg_lite.query(`
        SELECT id, name, importance_score
        FROM memory_entities
      `);

      const scoreMap = new Map<string, number>();
      let maxScore = 0;
      let minScore = 100;

      for (const row of scoresResult.rows) {
        const entity = row as any;
        scoreMap.set(entity.id, entity.importance_score);
        maxScore = Math.max(maxScore, entity.importance_score);
        minScore = Math.min(minScore, entity.importance_score);
      }

      // Update nodes with heatmap colors
      const updatedNodes = nodes.map(node => {
        const score = scoreMap.get(node.id) || 50;
        const normalized = (score - minScore) / (maxScore - minScore);

        // Generate heatmap color
        let color: string;
        if (normalized > 0.8) {
          color = '#ef4444'; // Red
        } else if (normalized > 0.6) {
          color = '#f97316'; // Orange
        } else if (normalized > 0.4) {
          color = '#eab308'; // Yellow
        } else if (normalized > 0.2) {
          color = '#22c55e'; // Green
        } else {
          color = '#3b82f6'; // Blue
        }

        const scale = scale_nodes ? 0.8 + (normalized * 0.8) : 1;

        return {
          ...node,
          data: {
            ...node.data,
            importanceScore: score,
            showValue: show_values,
          },
          style: {
            ...node.style,
            backgroundColor: color,
            transform: `scale(${scale})`,
            boxShadow: `0 0 ${10 + normalized * 30}px ${color}`,
            border: `2px solid ${color}`,
            color: normalized > 0.5 ? '#ffffff' : '#000000',
            fontWeight: 'bold',
            transition: 'all 0.8s ease-out',
          },
          className: 'heatmap-node',
        };
      });

      // Fade edges based on connected node importance
      const updatedEdges = edges.map(edge => {
        const sourceScore = scoreMap.get(edge.source) || 50;
        const targetScore = scoreMap.get(edge.target) || 50;
        const avgScore = (sourceScore + targetScore) / 2;
        const opacity = 0.2 + ((avgScore - minScore) / (maxScore - minScore)) * 0.6;

        return {
          ...edge,
          style: {
            ...edge.style,
            opacity,
            transition: 'all 0.8s ease-out',
          },
        };
      });

      reactFlowInstance.setNodes(updatedNodes);
      reactFlowInstance.setEdges(updatedEdges);

      // Zoom to show full heatmap
      setTimeout(() => {
        reactFlowInstance.fitView({
          padding: 0.1,
          duration: 1000,
        });
      }, 300);

      return `🌡️ Importance heatmap activated!
Score range: ${minScore} - ${maxScore}
Node scaling: ${scale_nodes ? 'Enabled' : 'Disabled'}
Value display: ${show_values ? 'Shown' : 'Hidden'}

Color legend:
🔴 Red: Critical (80-100)
🟠 Orange: High (60-80)
🟡 Yellow: Medium (40-60)
🟢 Green: Low (20-40)
🔵 Blue: Minimal (0-20)`;
    },
  });
}