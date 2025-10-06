import { useMCPSQLTool } from './useMCPSQLTool';
import { useMCPNavigationTool } from './useMCPNavigationTool';

/**
 * Register global MCP tools for AI agents
 *
 * Core Philosophy: Minimal, powerful tools instead of specialized wrappers
 *
 * Tools:
 * - sql_query: Generic database access with safety guardrails
 * - navigate: Universal routing and navigation
 */
export function useMCPDatabaseTools() {
  // SQL power tool - handles all data operations
  useMCPSQLTool();

  // Navigation power tool - handles all routing
  useMCPNavigationTool();
}
