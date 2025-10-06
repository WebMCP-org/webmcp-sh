/**
 * Global MCP Tool Registry
 *
 * Prevents duplicate tool registrations in React StrictMode
 * Tracks which tools are currently registered
 */

const registeredTools = new Set<string>();

/**
 * Check if a tool is already registered
 */
export function isToolRegistered(name: string): boolean {
  return registeredTools.has(name);
}

/**
 * Mark a tool as registered
 */
export function markToolRegistered(name: string): void {
  registeredTools.add(name);
}

/**
 * Mark a tool as unregistered
 */
export function markToolUnregistered(name: string): void {
  registeredTools.delete(name);
}

/**
 * Get all registered tool names
 */
export function getRegisteredTools(): string[] {
  return Array.from(registeredTools);
}

/**
 * Clear all registered tools (for testing)
 */
export function clearRegistry(): void {
  registeredTools.clear();
}
