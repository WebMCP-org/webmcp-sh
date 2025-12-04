import { useEffect, useMemo, useRef, useState, useImperativeHandle, forwardRef, useCallback } from "react";
import ForceGraph3D, { ForceGraphMethods } from "react-force-graph-3d";
import * as THREE from "three";
import type { GraphNode, GraphLink } from "@/lib/graph/adapters";
import { getCategoryColor3D } from "@/lib/graph/adapters";

/** Internal node type with 3D position data from force simulation */
interface PositionedNode extends GraphNode {
  x?: number;
  y?: number;
  z?: number;
  val?: number;
}

/** Force graph internal data structure */
interface ForceGraphData {
  nodes: PositionedNode[];
  links: GraphLink[];
}

type Props = {
  nodes: GraphNode[];
  links: GraphLink[];
  height?: number | string;
  onNodeClick?: (node: GraphNode) => void;
};

/**
 * API for controlling the 3D knowledge graph
 *
 * @see src/react-app/hooks/useMCPGraph3DTools.ts - Tools that use this API
 */
export interface KG3DApi {
  /** Fly camera to focus on a specific node - zooms in close */
  focusNode: (id: string, ms?: number) => void;
  /** Highlight nodes matching a predicate and zoom to them */
  highlightAndZoom: (ids: string[], ms?: number) => void;
  /** Highlight nodes matching a predicate (no zoom) */
  highlightWhere: (predicate: (n: GraphNode) => boolean) => void;
  /** Clear all highlights and effects */
  clear: () => void;
  /** Zoom camera to fit all nodes in view */
  zoomToFit: (ms?: number, pad?: number) => void;
  /** Add a pulsing ring effect to draw attention to a node */
  pulseNode: (id: string) => void;
  /** Orbit camera around the current view center */
  cameraOrbit: (ms?: number) => void;
}

const KG3D = forwardRef<KG3DApi, Props>(({ nodes, links, height = "calc(100vh - 120px)", onNodeClick }, ref) => {
  const fgRef = useRef<ForceGraphMethods<PositionedNode, GraphLink> | undefined>(undefined);
  const [highlightIds, setHighlightIds] = useState<Set<string>>(new Set());
  const [pulsingNodes, setPulsingNodes] = useState<Set<string>>(new Set());

  const data = useMemo(() => ({
    nodes: nodes.map(n => ({ ...n })),
    links: links.map(l => ({ ...l }))
  }), [nodes, links]);

  // Helper to zoom camera to specific nodes by their IDs
  const zoomToNodes = useCallback((nodeIds: string[], ms: number) => {
    const fg = fgRef.current;
    if (!fg || nodeIds.length === 0) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const graphData: ForceGraphData = (fg as any).graphData?.() || { nodes: [], links: [] };
    const targetNodes = graphData.nodes.filter((n) => nodeIds.includes(n.id));

    // Filter to nodes that have positions
    const positionedNodes = targetNodes.filter((n) => n.x !== undefined);
    if (positionedNodes.length === 0) return;

    // For single node, zoom in close
    if (positionedNodes.length === 1) {
      const node = positionedNodes[0];
      const nodeSize = node.val || 4;
      const dist = Math.max(nodeSize * 10, 50); // Close but not too close
      const angle = Math.PI / 4;

      fg.cameraPosition(
        {
          x: (node.x ?? 0) + dist * Math.cos(angle),
          y: (node.y ?? 0) + dist * 0.5,
          z: (node.z ?? 0) + dist * Math.sin(angle)
        },
        { x: node.x ?? 0, y: node.y ?? 0, z: node.z ?? 0 },
        ms
      );
      return;
    }

    // For multiple nodes, calculate bounding box
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    positionedNodes.forEach((n) => {
      minX = Math.min(minX, n.x ?? 0); maxX = Math.max(maxX, n.x ?? 0);
      minY = Math.min(minY, n.y ?? 0); maxY = Math.max(maxY, n.y ?? 0);
      minZ = Math.min(minZ, n.z ?? 0); maxZ = Math.max(maxZ, n.z ?? 0);
    });

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const centerZ = (minZ + maxZ) / 2;

    // Calculate distance - tighter framing
    const sizeX = maxX - minX;
    const sizeY = maxY - minY;
    const sizeZ = maxZ - minZ;
    const maxSize = Math.max(sizeX, sizeY, sizeZ, 40);
    const dist = maxSize * 1.2; // Tighter framing
    const angle = Math.PI / 4;

    fg.cameraPosition(
      {
        x: centerX + dist * Math.cos(angle),
        y: centerY + dist * 0.5,
        z: centerZ + dist * Math.sin(angle)
      },
      { x: centerX, y: centerY, z: centerZ },
      ms
    );
  }, []);

  // API methods for controlling the graph - memoized to avoid dependency issues
  const api: KG3DApi = useMemo(() => ({
    focusNode: (id: string, ms = 1000) => {
      zoomToNodes([id], ms);
    },

    highlightAndZoom: (ids: string[], ms = 1000) => {
      setHighlightIds(new Set(ids));
      zoomToNodes(ids, ms);
    },

    highlightWhere: (predicate: (n: GraphNode) => boolean) => {
      const matching = data.nodes.filter(predicate).map(n => n.id);
      setHighlightIds(new Set(matching));
    },

    clear: () => {
      setHighlightIds(new Set());
      setPulsingNodes(new Set());
    },

    zoomToFit: (ms = 800, pad = 40) => fgRef.current?.zoomToFit(ms, pad),

    pulseNode: (id: string) => {
      setPulsingNodes(prev => new Set([...prev, id]));
      setTimeout(() => {
        setPulsingNodes(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 2000);
    },

    cameraOrbit: (ms = 3000) => {
      const fg = fgRef.current;
      if (!fg) return;

      const camera = fg.camera();
      const startPos = camera.position.clone();
      const radius = Math.sqrt(startPos.x ** 2 + startPos.z ** 2);
      const startAngle = Math.atan2(startPos.z, startPos.x);
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed > ms) return;

        const progress = elapsed / ms;
        const angle = startAngle + progress * Math.PI * 2;

        fg.cameraPosition({
          x: radius * Math.cos(angle),
          y: startPos.y,
          z: radius * Math.sin(angle)
        }, { x: 0, y: 0, z: 0 }, 0);

        requestAnimationFrame(animate);
      };

      animate();
    },
  }), [data.nodes, zoomToNodes]);

  // Expose API to parent component
  useImperativeHandle(ref, () => api, [api]);

  // Also expose globally for MCP tools
  useEffect(() => {
    window.KG3D = api;
    return () => {
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
        // d3Force is not in library types but exists at runtime
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const chargeForce = (fg as any).d3Force?.('charge');
        if (chargeForce) {
          chargeForce.strength(-300);
          chargeForce.distanceMax(1000);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      {/* eslint-disable @typescript-eslint/no-explicit-any -- react-force-graph-3d callbacks have incomplete types */}
      <ForceGraph3D
        ref={fgRef as React.MutableRefObject<ForceGraphMethods<PositionedNode, GraphLink> | undefined>}
        graphData={data}
        controlType="orbit"
        showNavInfo={false}
        backgroundColor="rgba(2,6,23,1)"
        nodeId="id"
        nodeLabel={(n: PositionedNode) => `
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
        nodeVal={(n: PositionedNode) => n.val || 10}
        nodeThreeObject={(n: PositionedNode) => {
          const isHighlighted = highlightIds.has(n.id);
          const isPulsing = pulsingNodes.has(n.id);
          const color = new THREE.Color(getCategoryColor3D(n.category));

          // Create group for node + optional pulse ring
          const group = new THREE.Group();

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
          group.add(mesh);

          // Add pulsing ring effect
          if (isPulsing) {
            const ringGeometry = new THREE.TorusGeometry(size * 1.5, 1.5, 16, 32);
            const ringMaterial = new THREE.MeshBasicMaterial({
              color: color,
              transparent: true,
              opacity: 0.6,
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);

            // Animate the ring
            const startTime = Date.now();
            const animate = () => {
              if (!pulsingNodes.has(n.id)) return;
              const elapsed = (Date.now() - startTime) / 1000;
              const scale = 1 + Math.sin(elapsed * 4) * 0.3;
              ring.scale.setScalar(scale);
              ring.material.opacity = 0.4 + Math.sin(elapsed * 4) * 0.2;
              requestAnimationFrame(animate);
            };
            animate();

            group.add(ring);
          }

          return group;
        }}
        linkColor={(l) => {
          const sourceId = typeof l.source === 'string' ? l.source : (l.source as PositionedNode).id;
          const targetId = typeof l.target === 'string' ? l.target : (l.target as PositionedNode).id;
          const sourceHighlighted = highlightIds.has(sourceId);
          const targetHighlighted = highlightIds.has(targetId);
          if (sourceHighlighted && targetHighlighted) return '#3b82f6';
          if (sourceHighlighted || targetHighlighted) return '#94a3b8';
          return '#334155';
        }}
        linkWidth={(l) => {
          const sourceId = typeof l.source === 'string' ? l.source : (l.source as PositionedNode).id;
          const targetId = typeof l.target === 'string' ? l.target : (l.target as PositionedNode).id;
          const sourceHighlighted = highlightIds.has(sourceId);
          const targetHighlighted = highlightIds.has(targetId);
          if (sourceHighlighted && targetHighlighted) return 2.5;
          if (sourceHighlighted || targetHighlighted) return 1.5;
          return 0.5 + Math.min(1, (l.strength ?? 1) * 0.3);
        }}
        linkOpacity={0.6}
        linkCurvature={0}
        linkDirectionalParticles={0}
        onNodeClick={(node: PositionedNode) => {
          api.focusNode(node.id);
          onNodeClick?.(node);
        }}
        onNodeHover={(node: PositionedNode | null) => {
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
            // d3Force is not in library types but exists at runtime
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
      {/* eslint-enable @typescript-eslint/no-explicit-any */}
    </div>
  );
});

KG3D.displayName = 'KG3D';

export default KG3D;
