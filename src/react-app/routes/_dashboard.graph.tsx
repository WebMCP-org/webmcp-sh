import { createFileRoute } from '@tanstack/react-router'
import { Network, Sparkles, Box } from 'lucide-react'
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
import { useMCPGraph3DAdvanced } from '@/hooks/useMCPGraph3DAdvanced'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_dashboard/graph')({
  component: GraphWrapper,
})

const nodeTypes = {
  entity: EntityNode as React.ComponentType<NodeProps>,
};

function GraphWrapper() {
  return <GraphComponent />;
}

function ReactFlow2D({ nodes, edges }: { nodes: Node[], edges: Edge[] }) {
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

  useMCPSQLTool();

  useMCPGraph3DTools();

  useMCPGraph3DAdvanced();

  const allEntitiesQuery = memory_entities.getAllMemoryEntitiesQuerySQL()
  const allEntitiesResult = useLiveQuery<memory_entities.GetAllMemoryEntitiesResult>(allEntitiesQuery.sql, allEntitiesQuery.params)

  const allRelationshipsQuery = entity_relationships.getAllEntityRelationshipsQuerySQL()
  const allRelationshipsResult = useLiveQuery<entity_relationships.GetAllEntityRelationshipsResult>(allRelationshipsQuery.sql, allRelationshipsQuery.params)
  const { nodes: nodes3d, links: links3d } = useMemo(() => {
    const entities = allEntitiesResult?.rows ?? [];
    const relationships = allRelationshipsResult?.rows ?? [];
    return toForceGraphData(entities, relationships);
  }, [allEntitiesResult, allRelationshipsResult]);

  const { nodes, edges } = useMemo(() => {
    const entities = allEntitiesResult?.rows ?? [];
    const relationships = allRelationshipsResult?.rows ?? [];

    const connectionCounts = new Map<string, number>();
    relationships.forEach(rel => {
      connectionCounts.set(rel.from_entity_id, (connectionCounts.get(rel.from_entity_id) || 0) + 1);
      connectionCounts.set(rel.to_entity_id, (connectionCounts.get(rel.to_entity_id) || 0) + 1);
    });

    const rawNodes: Node[] = entities.map(entity => ({
      id: entity.id,
      type: 'entity',
      position: { x: 0, y: 0 },
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

    return getLayoutedElements(rawNodes, rawEdges, {
      direction: 'TB',
      rankSep: 200,
      nodeSep: 150,
    });
  }, [allEntitiesResult, allRelationshipsResult])

  return (
    <TooltipProvider>
    <div className="w-full h-full bg-slate-950">
      <div className="border-b border-slate-800 bg-slate-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-400" />
              Knowledge Graph 3D
              <InfoTooltip content={tooltips.pageHeaders.knowledgeGraph} />
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {nodes3d.length} entities, {links3d.length} relationships
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === '3d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('3d')}
              className="text-xs"
            >
              <Box className="h-3 w-3 mr-1" />
              3D View
            </Button>
            <Button
              variant={viewMode === '2d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('2d')}
              className="text-xs"
            >
              <Network className="h-3 w-3 mr-1" />
              2D View
            </Button>
          </div>
        </div>
      </div>

      <div className="relative" style={{ width: '100%', height: 'calc(100vh - 120px)' }}>
        {viewMode === '3d' ? (
          <>
            <KG3D
              ref={kg3dRef}
              nodes={nodes3d}
              links={links3d}
              height="100%"
            />

            <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-sm rounded-lg shadow-xl border border-slate-700 p-3 text-xs z-10 max-w-xs">
              <h4 className="font-semibold text-white mb-2">3D Controls</h4>
              <div className="space-y-1 text-slate-300">
                <div>🖱️ Left click + drag: Rotate</div>
                <div>🖱️ Right click + drag: Pan</div>
                <div>🖱️ Scroll: Zoom</div>
                <div>👆 Click node: Focus & info</div>
              </div>
            </div>

            <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-sm rounded-lg shadow-xl border border-slate-700 p-3 text-xs z-10">
              <h4 className="font-semibold text-white mb-2">Categories</h4>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1">
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
                      <div className="flex items-center gap-1.5 cursor-help">
                        <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: color }} />
                        <span className="text-slate-200">{label}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      {tooltips.categories[key as keyof typeof tooltips.categories]}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
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
