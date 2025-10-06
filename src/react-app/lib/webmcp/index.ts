import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { TabServerTransport } from "@mcp-b/transports"

export const mcpServer = new McpServer({
  name: 'WebMCP Playground',
  title: 'WebMCP Playground',
  version: '0.1.0',
})

mcpServer.registerTool('ping', {
  description: 'A simple ping tool that responds with pong',
}, () => {
  return { content: [{ type: 'text', text: 'pong' }] }
})


export const transport = new TabServerTransport({
  allowedOrigins: ["*"]
})



export default mcpServer
