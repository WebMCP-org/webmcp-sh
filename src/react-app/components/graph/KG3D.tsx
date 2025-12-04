import { useEffect, useMemo, useRef, useState, useImperativeHandle, forwardRef } from "react";
import ForceGraph3D, { ForceGraphMethods } from "react-force-graph-3d";
import * as THREE from "three";
import type { GraphNode, GraphLink } from "@/lib/graph/adapters";
import { getCategoryColor3D } from "@/lib/graph/adapters";

type Props = {
  nodes: GraphNode[];
  links: GraphLink[];
  height?: number | string;
  onNodeClick?: (node: GraphNode) => void;
};

export interface KG3DApi {
  focusNode: (id: string, ms?: number) => void;
  highlightWhere: (predicate: (n: GraphNode) => boolean) => void;
  clear: () => void;
  zoomToFit: (ms?: number, pad?: number) => void;
}

const KG3D = forwardRef<KG3DApi, Props>(({ nodes, links, height = "calc(100vh - 120px)", onNodeClick }, ref) => {
  const fgRef = useRef<ForceGraphMethods<any, any> | undefined>(undefined);
  const [highlightIds, setHighlightIds] = useState<Set<string>>(new Set());

  const data = useMemo(() => ({
    nodes: nodes.map(n => ({ ...n })),
    links: links.map(l => ({ ...l }))
  }), [nodes, links]);

  // API methods - simplified to just what's needed
  const api: KG3DApi = {
    focusNode: (id: string, ms = 1200) => {
      const fg = fgRef.current;
      if (!fg) return;

      // Get the graph data with positions
      const graphData = (fg as any).graphData?.() || { nodes: [], links: [] };
      const node = graphData.nodes?.find((n: any) => n.id === id);
      if (!node) return;

      const dist = 200;
      const angle = Date.now() * 0.001;

      // Only focus if node has position (after initial render)
      if (node.x !== undefined) {
        fg.cameraPosition(
          {
            x: node.x + dist * Math.cos(angle),
            y: node.y + dist * 0.5,
            z: node.z + dist * Math.sin(angle)
          },
          { x: node.x, y: node.y, z: node.z },
          ms
        );
      }

      setHighlightIds(new Set([id]));
    },

    highlightWhere: (predicate: (n: GraphNode) => boolean) => {
      const matching = data.nodes.filter(predicate).map(n => n.id);
      setHighlightIds(new Set(matching));
    },

    clear: () => {
      setHighlightIds(new Set());
    },

    zoomToFit: (ms = 800, pad = 40) => fgRef.current?.zoomToFit(ms, pad),
  };

  // Expose API to parent component
  useImperativeHandle(ref, () => api, [data, highlightIds]);

  // Also expose globally for MCP tools
  useEffect(() => {
    // @ts-ignore
    window.KG3D = api;
    return () => {
      // @ts-ignore
      delete window.KG3D;
    };
  }, [api]);

  // Set initial camera position and configure forces after graph loads
  useEffect(() => {
    if (fgRef.current && data.nodes.length > 0) {
      setTimeout(() => {
        const fg = fgRef.current;
        if (!fg) return;

        // Configure forces for better initial spacing
        const chargeForce = (fg as any).d3Force?.('charge');
        if (chargeForce) {
          chargeForce.strength(-300);
          chargeForce.distanceMax(1000);
        }

        const linkForce = (fg as any).d3Force?.('link');
        if (linkForce) {
          linkForce.distance(150);
        }

        // Set camera position
        fg.cameraPosition(
          { x: 0, y: 300, z: 500 },
          { x: 0, y: 0, z: 0 },
          0
        );
        // Zoom to fit with more padding for better initial view
        fg.zoomToFit(400, 100);
      }, 100);
    }
  }, [data.nodes.length]);

  return (
    <div style={{ width: "100%", height }} className="bg-slate-950 rounded-lg overflow-hidden">
      <ForceGraph3D
        ref={fgRef as any}
        graphData={data}
        controlType="orbit"
        showNavInfo={false}
        backgroundColor="rgba(2,6,23,1)"
        nodeId="id"
        nodeLabel={(n: any) => `
          <div style="
            background: rgba(15,23,42,0.95);
            border: 1px solid ${getCategoryColor3D(n.category)};
            border-radius: 8px;
            padding: 8px 12px;
            font-family: system-ui;
            color: white;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
          ">
            <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${n.name}</div>
            <div style="color: ${getCategoryColor3D(n.category)}; font-size: 12px; margin-bottom: 4px;">${n.category}</div>
            ${n.description ? `<div style="font-size: 11px; opacity: 0.8; max-width: 200px;">${n.description}</div>` : ''}
            <div style="font-size: 10px; margin-top: 4px; opacity: 0.6;">Importance: ${n.importance}</div>
          </div>
        `}
        nodeRelSize={6}
        nodeVal={(n: any) => n.val || 10}
        nodeThreeObject={(n: any) => {
          const isHighlighted = highlightIds.has(n.id);
          const color = new THREE.Color(getCategoryColor3D(n.category));

          // Main sphere - clean styling
          const material = new THREE.MeshPhongMaterial({
            color: isHighlighted ? 0xffffff : color,
            emissive: color,
            emissiveIntensity: isHighlighted ? 0.3 : 0.1,
            transparent: true,
            opacity: isHighlighted ? 1 : 0.9,
            shininess: 50,
          });

          const size = (n.val || 4) * (isHighlighted ? 1.2 : 1);
          const geometry = new THREE.SphereGeometry(size, 16, 16);
          const mesh = new THREE.Mesh(geometry, material);

          return mesh;
        }}
        linkColor={(l: any) => {
          const sourceHighlighted = highlightIds.has(l.source.id || l.source);
          const targetHighlighted = highlightIds.has(l.target.id || l.target);
          if (sourceHighlighted && targetHighlighted) return '#3b82f6';
          if (sourceHighlighted || targetHighlighted) return '#94a3b8';
          return '#334155';
        }}
        linkWidth={(l: any) => {
          const sourceHighlighted = highlightIds.has(l.source.id || l.source);
          const targetHighlighted = highlightIds.has(l.target.id || l.target);
          if (sourceHighlighted && targetHighlighted) return 2.5;
          if (sourceHighlighted || targetHighlighted) return 1.5;
          return 0.5 + Math.min(1, l.strength * 0.3);
        }}
        linkOpacity={0.6}
        linkCurvature={0}
        linkDirectionalParticles={0}
        onNodeClick={(node: any) => {
          api.focusNode(node.id);
          onNodeClick?.(node);
        }}
        onNodeHover={(node: any) => {
          document.body.style.cursor = node ? 'pointer' : 'default';
        }}
        cooldownTime={3000}
        cooldownTicks={0}
        warmupTicks={100}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        d3AlphaMin={0.001}
        enableNavigationControls={true}
        enableNodeDrag={true}
        onEngineStop={() => {
          const fg = fgRef.current;
          if (fg) {
            const chargeForce = (fg as any).d3Force?.('charge');
            if (chargeForce) {
              chargeForce.strength(-250);
              chargeForce.distanceMax(800);
            }
            const linkForce = (fg as any).d3Force?.('link');
            if (linkForce) {
              linkForce.distance(120);
            }
          }
        }}
      />
    </div>
  );
});

KG3D.displayName = 'KG3D';

export default KG3D;
