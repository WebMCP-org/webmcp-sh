import { createFileRoute } from '@tanstack/react-router'
import { Network, Sparkles, Box, Wand2, ChevronDown, ChevronUp, Search, Navigation, PlusCircle, Link2, RotateCcw } from 'lucide-react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { entity_relationships, memory_entities } from '@/lib/db'
import { useMemo, useRef, useState } from 'react'
import React from 'react'
import { ReactFlow, Background, Controls, MiniMap, Node, Edge, NodeProps, ReactFlowProvider } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import '@/styles/graph-highlights.css'
import EntityNode from '@/components/graph/EntityNode'
import { getLayoutedElements, getRelationshipColor, getEdgeStyle } from '@/lib/graph-layout'
import { getCategoryColor } from '@/lib/category-colors'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import { tooltips } from '@/lib/tooltip-content'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useMCPGraphTools } from '@/hooks/useMCPGraphTools'
import { useMCPSQLTool } from '@/hooks/useMCPSQLTool'
import { GraphWithEffects } from '@/components/graph/GraphWithEffects'
import KG3D, { KG3DApi } from '@/components/graph/KG3D'
import { toForceGraphData } from '@/lib/graph/adapters'
import { useMCPGraph3DTools } from '@/hooks/useMCPGraph3DTools'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_dashboard/graph')({
  component: GraphWrapper,
})

const nodeTypes = {
  entity: EntityNode as React.ComponentType<NodeProps>,
};

// AI Tools documentation panel
function AIToolsPanel() {
  const [isExpanded, setIsExpanded] = useState(false);

  const tools = [
    {
      name: 'graph3d_query',
      icon: Search,
      title: 'Query',
      description: 'Find entities by SQL WHERE clause',
      example: `graph3d_query({ where_clause: "category = 'skill'" })`,
    },
    {
      name: 'graph3d_navigate',
      icon: Navigation,
      title: 'Navigate',
      description: 'Zoom to a specific entity by name',
      example: `graph3d_navigate({ name: "TypeScript" })`,
    },
    {
      name: 'graph3d_add_entity',
      icon: PlusCircle,
      title: 'Add Entity',
      description: 'Create a new entity in the graph',
      example: `graph3d_add_entity({ name: "React", category: "skill" })`,
    },
    {
      name: 'graph3d_add_connection',
      icon: Link2,
      title: 'Add Connection',
      description: 'Connect two entities',
      example: `graph3d_add_connection({ from: "React", to: "TypeScript", type: "uses" })`,
    },
    {
      name: 'graph3d_clear',
      icon: RotateCcw,
      title: 'Clear',
      description: 'Reset the view',
      example: `graph3d_clear()`,
    },
  ];

  return (
    <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 bg-card/95 backdrop-blur-sm rounded-lg shadow-xl border border-border z-10 max-w-[320px] md:max-w-sm overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-2 md:p-3 hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-primary" />
          <span className="font-semibold text-xs md:text-sm text-foreground">AI Tools</span>
          <span className="text-[10px] md:text-xs text-muted-foreground">({tools.length} available)</span>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-border max-h-[50vh] overflow-y-auto">
          <div className="p-2 md:p-3 space-y-2">
            <p className="text-[10px] md:text-xs text-muted-foreground">
              Ask the AI to help you explore the graph. Examples:
            </p>
            <div className="space-y-1 text-[10px] md:text-xs text-muted-foreground italic">
              <p>"Where is TypeScript?"</p>
              <p>"Show me all skills"</p>
              <p>"Add a new project called WebMCP"</p>
            </div>
          </div>

          <div className="border-t border-border">
            {tools.map((tool) => (
              <div key={tool.name} className="p-2 md:p-3 border-b border-border last:border-b-0 hover:bg-accent/30 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <tool.icon className="h-3 w-3 md:h-4 md:w-4 text-primary flex-shrink-0" />
                  <span className="font-medium text-xs md:text-sm text-foreground">{tool.title}</span>
                </div>
                <p className="text-[10px] md:text-xs text-muted-foreground mb-1.5">{tool.description}</p>
                <code className="block text-[9px] md:text-[10px] bg-muted/50 px-1.5 py-1 rounded text-foreground/80 overflow-x-auto">
                  {tool.example}
                </code>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Wrapper component
function GraphWrapper() {
  return <GraphComponent />;
}

// 2D ReactFlow wrapper that registers tools
function ReactFlow2D({ nodes, edges }: { nodes: Node[], edges: Edge[] }) {
  // Register 2D MCP tools
  useMCPGraphTools();

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView
      minZoom={0.1}
      maxZoom={2}
      defaultEdgeOptions={{
        type: 'smoothstep',
        markerEnd: { type: 'arrowclosed', width: 20, height: 20 },
      }}
      nodesDraggable={true}
      nodesConnectable={false}
      elementsSelectable={true}
      panOnScroll={true}
      zoomOnScroll={true}
      zoomOnPinch={true}
      zoomOnDoubleClick={false}
    >
      <Background color="#e5e7eb" gap={16} size={1} />
      <Controls showInteractive={false} />
      <MiniMap
        nodeColor={(node) => {
          const category = (node.data as { category?: string })?.category;
          return category ? getCategoryColor(category) : '#6b7280';
        }}
        maskColor="rgba(0, 0, 0, 0.1)"
        pannable
        zoomable
      />
      <GraphWithEffects />
    </ReactFlow>
  );
}

function GraphComponent() {
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const kg3dRef = useRef<KG3DApi>(null);

  // Register SQL tools
  useMCPSQLTool();

  // Register 3D tools
  useMCPGraph3DTools();

  // Fetch all entities for graph
  const allEntitiesQuery = memory_entities.getAllMemoryEntitiesQuerySQL()
  const allEntitiesResult = useLiveQuery<memory_entities.GetAllMemoryEntitiesResult>(allEntitiesQuery.sql, allEntitiesQuery.params)

  // Fetch all relationships for graph
  const allRelationshipsQuery = entity_relationships.getAllEntityRelationshipsQuerySQL()
  const allRelationshipsResult = useLiveQuery<entity_relationships.GetAllEntityRelationshipsResult>(allRelationshipsQuery.sql, allRelationshipsQuery.params)

  // Transform data for 3D graph
  const { nodes: nodes3d, links: links3d } = useMemo(() => {
    const entities = allEntitiesResult?.rows ?? [];
    const relationships = allRelationshipsResult?.rows ?? [];
    return toForceGraphData(entities, relationships);
  }, [allEntitiesResult, allRelationshipsResult]);

  // Also keep ReactFlow data for potential 2D view
  const { nodes, edges } = useMemo(() => {
    const entities = allEntitiesResult?.rows ?? [];
    const relationships = allRelationshipsResult?.rows ?? [];

    // Count connections per entity
    const connectionCounts = new Map<string, number>();
    relationships.forEach(rel => {
      connectionCounts.set(rel.from_entity_id, (connectionCounts.get(rel.from_entity_id) || 0) + 1);
      connectionCounts.set(rel.to_entity_id, (connectionCounts.get(rel.to_entity_id) || 0) + 1);
    });

    // Create nodes
    const rawNodes: Node[] = entities.map(entity => ({
      id: entity.id,
      type: 'entity',
      position: { x: 0, y: 0 }, // Will be set by layout
      data: {
        name: entity.name,
        category: entity.category,
        description: entity.description,
        importance_score: entity.importance_score,
        connection_count: connectionCounts.get(entity.id) || 0,
        confidence: entity.confidence,
        mention_count: entity.mention_count,
        memory_tier: entity.memory_tier,
        access_count: entity.access_count,
        current_strength: entity.current_strength,
        tags: entity.tags,
      },
    }));

    // Create edges
    const rawEdges: Edge[] = relationships.map(rel => ({
      id: rel.id,
      source: rel.from_entity_id,
      target: rel.to_entity_id,
      label: rel.relationship_type.replace(/_/g, ' '),
      animated: rel.strength > 7,
      style: {
        stroke: getRelationshipColor(rel.relationship_type),
        ...getEdgeStyle(rel.strength),
      },
      labelStyle: {
        fontSize: 10,
        fontWeight: 500,
      },
    }));

    // Apply auto-layout
    return getLayoutedElements(rawNodes, rawEdges, {
      direction: 'TB',
      rankSep: 200,
      nodeSep: 150,
    });
  }, [allEntitiesResult, allRelationshipsResult])

  return (
    <TooltipProvider>
    <div className="w-full h-full min-w-0 bg-background dark:bg-slate-950">
      {/* Header */}
      <div className="border-b border-border bg-card px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
              <span className="truncate">Knowledge Graph</span>
              <InfoTooltip content={tooltips.pageHeaders.knowledgeGraph} />
            </h1>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
              {nodes3d.length} entities, {links3d.length} relationships
            </p>
          </div>
          <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
            <Button
              variant={viewMode === '3d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('3d')}
              className="text-xs h-8 px-2 md:px-3"
            >
              <Box className="h-3 w-3 md:mr-1" />
              <span className="hidden md:inline">3D</span>
            </Button>
            <Button
              variant={viewMode === '2d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('2d')}
              className="text-xs h-8 px-2 md:px-3"
            >
              <Network className="h-3 w-3 md:mr-1" />
              <span className="hidden md:inline">2D</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Graph Container - Account for mobile header/footer */}
      <div className="relative w-full h-[calc(100vh-180px)] md:h-[calc(100vh-120px)]">
        {viewMode === '3d' ? (
          <>
            <KG3D
              ref={kg3dRef}
              nodes={nodes3d}
              links={links3d}
              height="100%"
            />

            {/* 3D Controls Legend - Hidden on small mobile */}
            <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-card/95 backdrop-blur-sm rounded-lg shadow-xl border border-border p-2 md:p-3 text-[10px] md:text-xs z-10 max-w-[140px] md:max-w-xs hidden sm:block">
              <h4 className="font-semibold text-foreground mb-1.5 md:mb-2 text-xs">Controls</h4>
              <div className="space-y-0.5 md:space-y-1 text-muted-foreground">
                <div className="hidden md:block">🖱️ Left click + drag: Rotate</div>
                <div className="hidden md:block">🖱️ Right click + drag: Pan</div>
                <div className="hidden md:block">🖱️ Scroll: Zoom</div>
                <div className="md:hidden">👆 Drag: Rotate</div>
                <div className="md:hidden">✌️ Pinch: Zoom</div>
                <div>👆 Tap node: Focus</div>
              </div>
            </div>

            {/* Category Legend - Compact on mobile */}
            <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-card/95 backdrop-blur-sm rounded-lg shadow-xl border border-border p-2 md:p-3 text-[10px] md:text-xs z-10">
              <h4 className="font-semibold text-foreground mb-1.5 md:mb-2 text-xs hidden sm:block">Categories</h4>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-x-2 md:gap-x-3 gap-y-0.5 md:gap-y-1">
                {[
                  { label: 'Fact', color: '#10b981', key: 'fact' },
                  { label: 'Preference', color: '#3b82f6', key: 'preference' },
                  { label: 'Skill', color: '#f59e0b', key: 'skill' },
                  { label: 'Rule', color: '#ef4444', key: 'rule' },
                  { label: 'Context', color: '#8b5cf6', key: 'context' },
                  { label: 'Person', color: '#ec4899', key: 'person' },
                  { label: 'Project', color: '#06b6d4', key: 'project' },
                  { label: 'Goal', color: '#84cc16', key: 'goal' },
                ].map(({ label, color, key }) => (
                  <Tooltip key={label}>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 md:gap-1.5 cursor-help">
                        <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
                        <span className="text-foreground truncate">{label}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      {tooltips.categories[key as keyof typeof tooltips.categories]}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>

            {/* AI Tools Panel */}
            <AIToolsPanel />
          </>
        ) : (
          <ReactFlowProvider>
            <ReactFlow2D nodes={nodes} edges={edges} />
          </ReactFlowProvider>
        )}
      </div>
    </div>
    </TooltipProvider>
  )
}
