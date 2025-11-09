/**
 * Type definitions for MCP Table Tools configuration
 * Ensures type safety across all data table implementations
 */

/**
 * Custom action handler for table items
 */
export interface MCPCustomAction<T> {
  /** Human-readable description of what this action does */
  description: string;
  /** Handler function that performs the action on an item */
  handler: (item: T) => Promise<string | unknown> | string | unknown;
}

/**
 * Configuration for MCP table tools
 * Generic type T represents the shape of items in your table
 */
export interface MCPToolsConfig<T extends Record<string, unknown>> {
  /** Unique identifier for this table (e.g., 'entities', 'memory_blocks') */
  tableName: string;

  /** Human-readable description of what this table contains */
  tableDescription: string;

  /** Currently selected item in the table */
  selectedItem: T | null | undefined;

  /** Callback to update the selected item */
  onSelectItem: (item: T | null) => void;

  /** Fields that should be searchable via global filter */
  searchableFields: string[];

  /** Function to extract a unique ID from an item */
  getItemId: (item: T) => string | number;

  /** Function to generate a display name for an item */
  getItemDisplayName: (item: T) => string;

  /** Custom actions that can be performed on items */
  customActions: Record<string, MCPCustomAction<T>>;
}

/**
 * Type guard to check if a config object is a valid MCPToolsConfig
 */
export function isMCPToolsConfig<T extends Record<string, unknown>>(
  config: unknown
): config is MCPToolsConfig<T> {
  if (!config || typeof config !== 'object') return false;

  const c = config as any;
  return (
    typeof c.tableName === 'string' &&
    typeof c.tableDescription === 'string' &&
    typeof c.onSelectItem === 'function' &&
    Array.isArray(c.searchableFields) &&
    typeof c.getItemId === 'function' &&
    typeof c.getItemDisplayName === 'function' &&
    typeof c.customActions === 'object'
  );
}

/**
 * Helper type to extract the item type from a table configuration
 */
export type ExtractItemType<T> = T extends MCPToolsConfig<infer U> ? U : never;