/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { KG3DApi } from '@/components/graph/KG3D';
import type { ForceGraphMethods } from 'react-force-graph-3d';

declare global {
  interface Navigator {
    mcp: McpServer;
  }

  interface Window {
    KG3D?: KG3DApi;
    fgRef?: { current?: ForceGraphMethods<object, object> };
  }
}
