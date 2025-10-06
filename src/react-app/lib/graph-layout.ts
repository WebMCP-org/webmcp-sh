import dagre from 'dagre';
import { Node, Edge } from '@xyflow/react';

interface NodeData {
  importance_score?: number;
  [key: string]: unknown;
}

export interface LayoutOptions {
  direction?: 'TB' | 'LR' | 'BT' | 'RL';
  nodeWidth?: number;
  nodeHeight?: number;
  rankSep?: number;
  nodeSep?: number;
}

/**
 * Auto-layout nodes using Dagre hierarchical layout algorithm
 */
export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {}
) {
  const {
    direction = 'TB',
    nodeWidth = 250,
    nodeHeight = 120,
    rankSep = 150,
    nodeSep = 100,
  } = options;

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: direction,
    ranksep: rankSep,
    nodesep: nodeSep,
  });

  // Add nodes to dagre graph
  nodes.forEach((node) => {
    // Use dynamic width based on importance if available
    const importanceScore = (node.data as NodeData)?.importance_score;
    const width = importanceScore
      ? Math.max(200, (importanceScore / 100) * 300)
      : nodeWidth;

    dagreGraph.setNode(node.id, { width, height: nodeHeight });
  });

  // Add edges to dagre graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculate layout
  dagre.layout(dagreGraph);

  // Apply calculated positions to nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWithPosition.width / 2,
        y: nodeWithPosition.y - nodeWithPosition.height / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

/**
 * Get edge color based on relationship type
 */
export function getRelationshipColor(relationshipType: string): string {
  const colors: Record<string, string> = {
    uses: '#10b981', // green
    related_to: '#6366f1', // indigo
    works_on: '#f59e0b', // amber
    knows: '#ec4899', // pink
    depends_on: '#ef4444', // red
    part_of: '#8b5cf6', // violet
    creates: '#14b8a6', // teal
    manages: '#f97316', // orange
  };

  return colors[relationshipType] || '#6b7280'; // gray as default
}

/**
 * Get edge style based on relationship strength
 */
export function getEdgeStyle(strength: number) {
  return {
    strokeWidth: Math.max(1, strength / 2),
    opacity: 0.5 + (strength / 20), // 0.5 to 1.0
  };
}
