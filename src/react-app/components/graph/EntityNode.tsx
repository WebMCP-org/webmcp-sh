import { memo, useState, useEffect, useRef } from 'react';
import { Handle, Position, NodeProps, NodeToolbar } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export interface EntityNodeData {
  name: string;
  category: 'fact' | 'preference' | 'skill' | 'rule' | 'context' | 'person' | 'project' | 'goal';
  description: string;
  importance_score: number;
  connection_count?: number;
  confidence?: number;
  mention_count?: number;
  memory_tier?: 'short_term' | 'working' | 'long_term' | 'archived';
  access_count?: number;
  current_strength?: number;
  tags?: string[];
}

const categoryColors = {
  fact: 'bg-chart-5/10 border-chart-5 text-chart-5',
  preference: 'bg-primary/10 border-primary text-primary',
  skill: 'bg-chart-3/10 border-chart-3 text-chart-3',
  rule: 'bg-primary/10 border-primary text-primary',
  context: 'bg-chart-2/10 border-chart-2 text-chart-2',
  person: 'bg-chart-4/10 border-chart-4 text-chart-4',
  project: 'bg-chart-3/10 border-chart-3 text-chart-3',
  goal: 'bg-chart-5/10 border-chart-5 text-chart-5',
};

const categoryBorderColors = {
  fact: 'border-chart-5',
  preference: 'border-primary',
  skill: 'border-chart-3',
  rule: 'border-primary',
  context: 'border-chart-2',
  person: 'border-chart-4',
  project: 'border-chart-3',
  goal: 'border-chart-5',
};

function EntityNode({ data, selected, positionAbsoluteX, positionAbsoluteY }: NodeProps) {
  const entityData = data as unknown as EntityNodeData;
  const [isHovered, setIsHovered] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState<Position>(Position.Top);
  const nodeRef = useRef<HTMLDivElement>(null);
  const importanceWidth = Math.max(200, (entityData.importance_score / 100) * 300);

  // Dynamically calculate the best position for the toolbar to prevent clipping
  useEffect(() => {
    if (!nodeRef.current || (!isHovered && !selected)) return;

    const viewportHeight = window.innerHeight;

    // Simple heuristic: if node is in top half, show below; if in bottom half, show above
    const nodeY = positionAbsoluteY || 0;

    // Determine vertical position
    if (nodeY < viewportHeight / 2) {
      setToolbarPosition(Position.Bottom);
    } else {
      setToolbarPosition(Position.Top);
    }
  }, [isHovered, selected, positionAbsoluteX, positionAbsoluteY]);

  return (
    <div
      ref={nodeRef}
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Connection Handles */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-primary" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-primary" />

      {/* Expanded Details Toolbar - Shows on hover or click */}
      <NodeToolbar
        isVisible={isHovered || !!selected}
        position={toolbarPosition}
        offset={8}
        className="z-50"
      >
        <Card
          className="shadow-lg border border-primary/20 bg-card overflow-hidden"
          style={{ width: `${Math.min(importanceWidth * 1.2, 320)}px` }}
        >
          {/* Header - Compact */}
          <div className="bg-primary/5 border-b border-primary/10 px-2 py-1">
            <div className="flex items-center justify-between gap-1.5">
              <h4 className="text-[11px] font-bold text-primary truncate">{entityData.name}</h4>
              <Badge variant="outline" className={`capitalize text-[9px] font-medium px-1.5 py-0 ${categoryColors[entityData.category]}`}>
                {entityData.category}
              </Badge>
            </div>
          </div>

          <CardContent className="p-2 space-y-1.5">
            {/* Description - Compact */}
            <p className="text-[9px] text-muted-foreground leading-tight line-clamp-2">
              {entityData.description}
            </p>

            {/* Stats Grid - Condensed */}
            <div className="grid grid-cols-2 gap-1 text-[9px]">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Importance:</span>
                <span className="font-semibold text-primary">{entityData.importance_score}</span>
              </div>

              {entityData.confidence !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Confidence:</span>
                  <span className="font-semibold text-primary">{entityData.confidence}%</span>
                </div>
              )}

              {entityData.mention_count !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Mentions:</span>
                  <span className="font-semibold text-primary">{entityData.mention_count}</span>
                </div>
              )}

              {entityData.connection_count !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Connections:</span>
                  <span className="font-semibold text-primary">{entityData.connection_count}</span>
                </div>
              )}

              {entityData.memory_tier && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tier:</span>
                  <span className="font-semibold text-primary capitalize">{entityData.memory_tier.replace('_', ' ')}</span>
                </div>
              )}

              {entityData.current_strength !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Strength:</span>
                  <span className="font-semibold text-primary">{entityData.current_strength}</span>
                </div>
              )}

              {entityData.access_count !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Accessed:</span>
                  <span className="font-semibold text-primary">{entityData.access_count}x</span>
                </div>
              )}
            </div>

            {/* Tags - Condensed */}
            {entityData.tags && entityData.tags.length > 0 && (
              <div className="flex flex-wrap gap-0.5 pt-0.5">
                {entityData.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-1.5 py-0.5 rounded-sm text-[8px] font-medium bg-muted text-muted-foreground border border-border"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </NodeToolbar>

      {/* Node Card - Compact View */}
      <div
        className={`rounded-lg border-2 bg-card shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer ${categoryBorderColors[entityData.category]} ${selected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
        style={{ width: `${importanceWidth}px` }}
      >
        {/* Header */}
        <div className="px-3 py-2 border-b border-divide">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-sm text-primary line-clamp-1">
              {entityData.name}
            </h3>
            <Badge variant="outline" className={`text-xs capitalize ${categoryColors[entityData.category]}`}>
              {entityData.category}
            </Badge>
          </div>
        </div>

        {/* Description */}
        <div className="px-3 py-2">
          <p className="text-xs text-muted-foreground line-clamp-2">
            {entityData.description}
          </p>
        </div>

        {/* Footer Stats */}
        <div className="px-3 py-1.5 bg-muted rounded-b-lg border-t border-border">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Importance: <span className="font-semibold text-primary">{entityData.importance_score}</span>
            </span>
            {entityData.connection_count !== undefined && (
              <span className="text-muted-foreground">
                <span className="font-semibold text-primary">{entityData.connection_count}</span> connections
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-200 blur-xl ${categoryBorderColors[entityData.category]}`} />
    </div>
  );
}

export default memo(EntityNode);
