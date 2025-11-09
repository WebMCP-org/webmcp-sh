import { useReactFlow, useNodes, useEdges } from '@xyflow/react';
import { useWebMCP } from '@mcp-b/react-webmcp';
import { z } from 'zod';
import { pg_lite } from '@/lib/db';

/**
 * Component that registers MCP visual effects tools
 * Must be used inside ReactFlow context
 */
export function GraphWithEffects() {
  const reactFlowInstance = useReactFlow();
  const nodes = useNodes();
  const edges = useEdges();

  // Simple highlight tool that actually works
  useWebMCP({
    name: 'graph_highlight_category',
    description: `Highlight all entities of a specific category with visual effects.

This tool:
- Highlights all nodes of the specified category
- Dims other nodes for contrast
- Adds pulsing animation to highlighted nodes
- Colors edges between highlighted nodes`,
    inputSchema: {
      category: z.enum(['fact', 'preference', 'skill', 'rule', 'context', 'person', 'project', 'goal'])
        .describe('Category to highlight'),
      zoom_to_category: z.boolean()
        .optional()
        .default(true)
        .describe('Whether to zoom to show highlighted nodes'),
    },
    annotations: {
      title: 'Highlight Category',
      readOnlyHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    handler: async (input) => {
      const { category, zoom_to_category } = input;

      // Find all entities of this category
      const result = await pg_lite.query(`
        SELECT id, name, importance_score
        FROM memory_entities
        WHERE category = $1
      `, [category]);

      const categoryIds = new Set(result.rows.map((r: any) => r.id));

      if (categoryIds.size === 0) {
        return `No entities found with category "${category}"`;
      }

      // Update nodes
      const updatedNodes = nodes.map(node => {
        const isHighlighted = categoryIds.has(node.id);

        return {
          ...node,
          style: {
            ...node.style,
            opacity: isHighlighted ? 1 : 0.3,
            transform: isHighlighted ? 'scale(1.2)' : 'scale(1)',
            transition: 'all 0.5s ease-out',
            boxShadow: isHighlighted ? '0 0 20px rgba(59, 130, 246, 0.8)' : 'none',
            zIndex: isHighlighted ? 100 : 1,
          },
          className: isHighlighted ? 'category-highlight pulse' : '',
        };
      });

      // Update edges
      const updatedEdges = edges.map(edge => {
        const sourcehighlighted = categoryIds.has(edge.source);
        const targetHighlighted = categoryIds.has(edge.target);
        const bothHighlighted = sourcehighlighted && targetHighlighted;

        return {
          ...edge,
          animated: bothHighlighted,
          style: {
            ...edge.style,
            opacity: bothHighlighted ? 1 : 0.1,
            stroke: bothHighlighted ? '#3b82f6' : '#94a3b8',
            strokeWidth: bothHighlighted ? 3 : 1,
            transition: 'all 0.5s ease-out',
          },
        };
      });

      // Apply the updates
      reactFlowInstance.setNodes(updatedNodes);
      reactFlowInstance.setEdges(updatedEdges);

      // Zoom to highlighted nodes if requested
      if (zoom_to_category) {
        const highlightedNodes = updatedNodes.filter(n => categoryIds.has(n.id));
        if (highlightedNodes.length > 0) {
          setTimeout(() => {
            reactFlowInstance.fitView({
              nodes: highlightedNodes,
              padding: 0.2,
              duration: 800,
            });
          }, 100);
        }
      }

      return `✨ Highlighted ${categoryIds.size} ${category} entities
${result.rows.slice(0, 5).map((e: any) => `• ${e.name}`).join('\n')}
${zoom_to_category ? '\nZoomed to show highlighted nodes' : ''}`;
    },
  });

  // Wave effect tool
  useWebMCP({
    name: 'graph_wave_effect',
    description: `Create a wave effect across the graph, highlighting nodes in sequence.

This creates a visual wave that travels through the graph:
- Nodes light up in sequence
- Creates a flowing animation effect
- Shows the graph structure dynamically`,
    inputSchema: {
      direction: z.enum(['left-to-right', 'top-to-bottom', 'center-out'])
        .optional()
        .default('left-to-right')
        .describe('Direction of the wave effect'),
      wave_speed: z.number()
        .min(50)
        .max(500)
        .optional()
        .default(100)
        .describe('Speed of wave in ms per node'),
      color: z.string()
        .optional()
        .default('#3b82f6')
        .describe('Color of the wave effect'),
    },
    annotations: {
      title: 'Wave Effect',
      readOnlyHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    handler: async (input) => {
      const { direction, wave_speed, color } = input;

      // Sort nodes based on direction
      let sortedNodes = [...nodes];

      if (direction === 'left-to-right') {
        sortedNodes.sort((a, b) => a.position.x - b.position.x);
      } else if (direction === 'top-to-bottom') {
        sortedNodes.sort((a, b) => a.position.y - b.position.y);
      } else {
        // center-out: sort by distance from center
        const centerX = nodes.reduce((sum, n) => sum + n.position.x, 0) / nodes.length;
        const centerY = nodes.reduce((sum, n) => sum + n.position.y, 0) / nodes.length;
        sortedNodes.sort((a, b) => {
          const distA = Math.sqrt(Math.pow(a.position.x - centerX, 2) + Math.pow(a.position.y - centerY, 2));
          const distB = Math.sqrt(Math.pow(b.position.x - centerX, 2) + Math.pow(b.position.y - centerY, 2));
          return distA - distB;
        });
      }

      // Animate nodes in sequence
      sortedNodes.forEach((node, index) => {
        setTimeout(() => {
          const updatedNodes = nodes.map(n => {
            if (n.id === node.id) {
              return {
                ...n,
                style: {
                  ...n.style,
                  backgroundColor: color,
                  transform: 'scale(1.3)',
                  boxShadow: `0 0 30px ${color}`,
                  transition: 'all 0.3s ease-out',
                  zIndex: 1000,
                },
              };
            }
            return n;
          });

          reactFlowInstance.setNodes(updatedNodes);

          // Reset after a delay
          setTimeout(() => {
            const resetNodes = nodes.map(n => {
              if (n.id === node.id) {
                return {
                  ...n,
                  style: {
                    ...n.style,
                    backgroundColor: n.style?.backgroundColor || '#ffffff',
                    transform: 'scale(1)',
                    boxShadow: 'none',
                    transition: 'all 0.5s ease-out',
                    zIndex: 1,
                  },
                };
              }
              return n;
            });
            reactFlowInstance.setNodes(resetNodes);
          }, wave_speed * 3);
        }, index * wave_speed);
      });

      return `🌊 Wave effect started!
Direction: ${direction}
Speed: ${wave_speed}ms per node
Total duration: ${sortedNodes.length * wave_speed}ms`;
    },
  });

  // Clear all effects
  useWebMCP({
    name: 'graph_clear_effects',
    description: 'Clear all visual effects and return graph to normal state.',
    inputSchema: {},
    annotations: {
      title: 'Clear Effects',
      readOnlyHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    handler: async () => {
      // Reset all nodes
      const resetNodes = nodes.map(node => ({
        ...node,
        style: {
          ...node.style,
          opacity: 1,
          transform: 'scale(1)',
          boxShadow: 'none',
          transition: 'all 0.5s ease-out',
          zIndex: 1,
        },
        className: '',
      }));

      // Reset all edges
      const resetEdges = edges.map(edge => ({
        ...edge,
        animated: false,
        style: {
          ...edge.style,
          opacity: 1,
          stroke: edge.style?.stroke || '#b1b1b7',
          strokeWidth: 1,
          transition: 'all 0.5s ease-out',
        },
      }));

      reactFlowInstance.setNodes(resetNodes);
      reactFlowInstance.setEdges(resetEdges);

      // Fit view to show all
      setTimeout(() => {
        reactFlowInstance.fitView({
          padding: 0.1,
          duration: 500,
        });
      }, 100);

      return '✨ All effects cleared';
    },
  });

  return null; // This component just registers tools
}