/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

declare global {
  interface Navigator {
    mcp: McpServer;
  }
}
