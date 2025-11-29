import '@mcp-b/global';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { TabServerTransport } from "@mcp-b/transports";

export const mcpServer = new McpServer({
  name: 'WebMCP Playground',
  title: 'WebMCP Playground',
  version: '0.1.0',
}, {
  capabilities: {
    tools: {
      listChanged: true,
    }
  },
  debouncedNotificationMethods: [
    'notifications/tools/list_changed',
    'notifications/resources/list_changed',
    'notifications/prompts/list_changed'
  ]
});

mcpServer.registerTool('ping', {
  description: 'A simple ping tool that responds with pong',
}, () => {
  return { content: [{ type: 'text' as const, text: 'pong' }] };
});

export const transport = new TabServerTransport({
  allowedOrigins: ["*"]
});

export default mcpServer;
