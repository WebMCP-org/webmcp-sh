/**
 * @deprecated This file is deprecated. Import hooks directly from '@mcp-b/react-webmcp' instead.
 *
 * Use:
 * - import { useWebMCP } from '@mcp-b/react-webmcp'; (instead of useMCPTool)
 * - import { useWebMCPContext } from '@mcp-b/react-webmcp'; (instead of useMCPContextTool)
 *
 * Make sure to also import '@mcp-b/global' at the entry point of your application.
 */

import '@mcp-b/global';
import { useWebMCP, useWebMCPContext } from '@mcp-b/react-webmcp';

// Re-export for backward compatibility (deprecated)
/** @deprecated Use useWebMCP from '@mcp-b/react-webmcp' directly */
export { useWebMCP as useMCPTool };

/** @deprecated Use useWebMCPContext from '@mcp-b/react-webmcp' directly */
export { useWebMCPContext as useMCPContextTool };
