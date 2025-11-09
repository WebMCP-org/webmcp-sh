import '@mcp-b/global';
import { useWebMCP, useWebMCPContext } from '@mcp-b/react-webmcp';

// Re-export the useWebMCP hook as useMCPTool for backward compatibility
export { useWebMCP as useMCPTool };

/**
 * Simplified hook for read-only context tools
 * Use this for exposing current UI state (e.g., "current post ID")
 *
 * This now uses the official useWebMCPContext hook from @mcp-b/react-webmcp
 */
export function useMCPContextTool<T>(
  name: string,
  description: string,
  getValue: () => T
) {
  return useWebMCPContext(name, description, getValue);
}
