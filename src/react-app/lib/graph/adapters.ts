import type { MemoryEntity, EntityRelationship } from "@/lib/db/types";

export type GraphNode = {
  id: string;
  name: string;
  category: string;
  tier: string;
  importance: number;
  lastMentioned?: string;
  description?: string;
  color?: string;         // runtime styling
  __highlight?: boolean;  // runtime flag
  val?: number;          // node size
};

export type GraphLink = {
  source: string;
  target: string;
  type: string;
  strength: number;
  color?: string;         // runtime styling
  __highlight?: boolean;  // runtime flag
  curvature?: number;    // for curved edges
};

export function toForceGraphData(
  entities: MemoryEntity[],
  rels: EntityRelationship[],
) {
  const nodes: GraphNode[] = entities.map(e => ({
    id: e.id,
    name: e.name,
    category: e.category,
    tier: e.memory_tier,
    importance: e.importance_score,
    lastMentioned: e.last_mentioned?.toString(),
    description: e.description || undefined,
    val: Math.max(2, Math.min(8, e.importance_score / 15)), // Smaller size based on importance
  }));

  const links: GraphLink[] = rels.map(r => ({
    source: r.from_entity_id,
    target: r.to_entity_id,
    type: r.relationship_type,
    strength: r.strength,
    curvature: 0.25, // Add some curve to edges for visual appeal
  }));

  return { nodes, links };
}

// Color mapping for categories
export const categoryColors: Record<string, string> = {
  fact: '#10b981',      // emerald
  preference: '#3b82f6', // blue
  skill: '#f59e0b',     // amber
  rule: '#ef4444',      // red
  context: '#8b5cf6',   // purple
  person: '#ec4899',    // pink
  project: '#06b6d4',   // cyan
  goal: '#84cc16',      // lime
};

export function getCategoryColor3D(category: string): string {
  return categoryColors[category.toLowerCase()] || '#6b7280';
}