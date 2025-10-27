import '@mcp-b/global';
import { useWebMCP } from '@mcp-b/react-webmcp';

// Re-export the useWebMCP hook as useMCPTool for backward compatibility
export { useWebMCP as useMCPTool };

// Re-export types if needed
export type { MCPToolConfig, MCPToolReturn } from '@mcp-b/react-webmcp';

/**
 * Simplified hook for read-only context tools
 * Use this for exposing current UI state (e.g., "current post ID")
 */
export function useMCPContextTool<T>(
  name: string,
  description: string,
  getValue: () => T
) {
  return useMCPTool({
    name,
    description,
    annotations: {
      readOnlyHint: true,
      idempotentHint: true,
    },
    handler: async () => getValue(),
  });
}
