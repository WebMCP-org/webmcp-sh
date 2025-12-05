/**
 * MCP Prompts - Barrel export
 *
 * These hooks register MCP prompts that appear in the AI agent's interface,
 * guiding users through the application's capabilities.
 *
 * Prompts are different from tools:
 * - Tools = Actions the agent CAN take (create entity, run SQL, navigate)
 * - Prompts = Suggested interactions the website RECOMMENDS (guided workflows)
 */

// Global prompts (available on all pages)
export { useMCPGlobalPrompts } from './useMCPGlobalPrompts';

// Page-specific prompts
export { useMCPLandingPrompts } from './useMCPLandingPrompts';
export { useMCPDashboardPrompts } from './useMCPDashboardPrompts';
export { useMCPEntityPrompts } from './useMCPEntityPrompts';
export { useMCPEntityDetailPrompts } from './useMCPEntityDetailPrompts';
export { useMCPMemoryBlockPrompts } from './useMCPMemoryBlockPrompts';
export { useMCPGraphPrompts } from './useMCPGraphPrompts';
export { useMCPSQLPrompts } from './useMCPSQLPrompts';
export { useMCPSQLLogPrompts } from './useMCPSQLLogPrompts';
