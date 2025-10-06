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
  emitParticlesOnPath: (edgeFilter: (l: GraphLink) => boolean) => void;
  zoomToFit: (ms?: number, pad?: number) => void;
  reheat: () => void;
  cameraOrbit: (ms?: number) => void;
  pulseNode: (id: string) => void;
  explodeView: () => void;
  contractView: () => void;
  getFg: () => any; // Get ForceGraph instance for advanced operations
}

const KG3D = forwardRef<KG3DApi, Props>(({ nodes, links, height = "calc(100vh - 120px)", onNodeClick }, ref) => {
  const fgRef = useRef<ForceGraphMethods<any, any> | undefined>(undefined);
  const [highlightIds, setHighlightIds] = useState<Set<string>>(new Set());
  const [pulsingNodes, setPulsingNodes] = useState<Set<string>>(new Set());

  const data = useMemo(() => ({
    nodes: nodes.map(n => ({ ...n })),
    links: links.map(l => ({ ...l }))
  }), [nodes, links]);

  // Removed bloom effect - it was making things hard to see
  // useEffect(() => {
  //   const fg = fgRef.current;
  //   if (!fg) return;
  // }, []);

  // API methods
  const api: KG3DApi = {
    focusNode: (id: string, ms = 1200) => {
      // Use the graph's internal data which has positions
      const fg = fgRef.current;
      if (!fg) return;

      // Get the graph data with positions
      const graphData = (fg as any).graphData?.() || { nodes: [], links: [] };
      const node = graphData.nodes?.find((n: any) => n.id === id);
      if (!node) return;

      const dist = 200;
      const angle = Date.now() * 0.001; // Rotating camera angle

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
      setPulsingNodes(new Set([id]));

      // Stop pulsing after 3 seconds
      setTimeout(() => setPulsingNodes(new Set()), 3000);

      // Don't reheat - it causes full re-render
    },

    highlightWhere: (predicate: (n: GraphNode) => boolean) => {
      const matching = data.nodes.filter(predicate).map(n => n.id);
      setHighlightIds(new Set(matching));
      // Don't reheat - it causes full re-render
    },

    clear: () => {
      setHighlightIds(new Set());
      setPulsingNodes(new Set());
    },

    emitParticlesOnPath: (edgeFilter: (l: GraphLink) => boolean) => {
      // Particles removed for cleaner professional look
      // Instead, temporarily highlight the connected nodes
      const matchingLinks = data.links.filter(edgeFilter);

      // Flash the connected nodes briefly
      const nodesToHighlight = new Set<string>();
      matchingLinks.forEach(l => {
        nodesToHighlight.add(l.source);
        nodesToHighlight.add(l.target);
      });

      setHighlightIds(prev => new Set([...prev, ...nodesToHighlight]));

      // Clear highlights after a brief moment
      setTimeout(() => {
        setHighlightIds(prev => {
          const next = new Set(prev);
          nodesToHighlight.forEach(id => next.delete(id));
          return next;
        });
      }, 1500);
    },

    zoomToFit: (ms = 800, pad = 40) => fgRef.current?.zoomToFit(ms, pad),

    reheat: () => {
      // Only reheat when explicitly requested
      fgRef.current?.d3ReheatSimulation();
    },

    cameraOrbit: (ms = 5000) => {
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

    explodeView: () => {
      // Expand the graph by increasing repulsion
      const fg = fgRef.current;
      if (fg) {
        const chargeForce = (fg as any).d3Force?.('charge');
        if (chargeForce?.strength) {
          chargeForce.strength(-500);
          chargeForce.distanceMax(800);
          fg.d3ReheatSimulation(); // OK to reheat for explode effect
        }
      }
    },

    contractView: () => {
      // Contract the graph by reducing repulsion
      const fg = fgRef.current;
      if (fg) {
        const chargeForce = (fg as any).d3Force?.('charge');
        if (chargeForce?.strength) {
          chargeForce.strength(-250);
          chargeForce.distanceMax(500);
          fg.d3ReheatSimulation(); // OK to reheat for contract effect
        }
      }
    },

    getFg: () => fgRef.current
  };

  // Expose API to parent component
  useImperativeHandle(ref, () => api, [data, highlightIds, pulsingNodes]);

  // Also expose globally for MCP tools
  useEffect(() => {
    // @ts-ignore
    window.KG3D = api;
    // @ts-ignore
    window.fgRef = fgRef; // Also expose the ref for advanced operations
    return () => {
      // @ts-ignore
      delete window.KG3D;
      // @ts-ignore
      delete window.fgRef;
    };
  }, [api]);

  // Set initial camera position and configure forces after graph loads
  useEffect(() => {
    if (fgRef.current && data.nodes.length > 0) {
      // Delay to ensure graph has initialized
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
          const isPulsing = pulsingNodes.has(n.id);
          const color = new THREE.Color(getCategoryColor3D(n.category));

          // Create group for node
          const group = new THREE.Group();

          // Main sphere - reduced emissive intensity and smaller size
          const material = new THREE.MeshPhongMaterial({
            color: isHighlighted ? 0xffffff : color,
            emissive: color,
            emissiveIntensity: isHighlighted ? 0.3 : 0.1, // Much less glow
            transparent: true,
            opacity: isHighlighted ? 1 : 0.9,
            shininess: 50,
          });

          const size = (n.val || 4) * (isHighlighted ? 1.1 : 1); // Smaller base size
          const geometry = new THREE.SphereGeometry(size, 16, 16); // Less segments for performance
          const mesh = new THREE.Mesh(geometry, material);
          group.add(mesh);

          // Add pulsing ring if pulsing
          if (isPulsing) {
            const ringGeometry = new THREE.TorusGeometry(size * 1.5, 2, 16, 100);
            const ringMaterial = new THREE.MeshBasicMaterial({
              color: color,
              transparent: true,
              opacity: 0.5,
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);

            // Animate ring
            const animate = () => {
              if (!pulsingNodes.has(n.id)) return;
              ring.scale.setScalar(1 + Math.sin(Date.now() * 0.003) * 0.2);
              ring.material.opacity = 0.3 + Math.sin(Date.now() * 0.003) * 0.2;
              requestAnimationFrame(animate);
            };
            animate();

            group.add(ring);
          }

          // Removed category icon to reduce clutter

          return group;
        }}
        linkColor={(l: any) => {
          const sourceHighlighted = highlightIds.has(l.source.id || l.source);
          const targetHighlighted = highlightIds.has(l.target.id || l.target);
          if (sourceHighlighted && targetHighlighted) return '#3b82f6';
          if (sourceHighlighted || targetHighlighted) return '#94a3b8';
          return '#334155'; // Professional gray
        }}
        linkWidth={(l: any) => {
          const sourceHighlighted = highlightIds.has(l.source.id || l.source);
          const targetHighlighted = highlightIds.has(l.target.id || l.target);
          if (sourceHighlighted && targetHighlighted) return 2.5;
          if (sourceHighlighted || targetHighlighted) return 1.5;
          // Consistent thin lines that scale with strength
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
          // Fine-tune spacing after initial layout
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