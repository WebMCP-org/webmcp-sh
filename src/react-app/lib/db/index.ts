/**
 * Database module exports
 */

// Main database instance and utilities
export { db, pg_lite, db_utils } from './database';

// Types - single source of truth
export * from './types';

// Schema (for advanced usage only - prefer types from './types')
export * as schema from './schema';

// Tab guard for preventing multiple tabs
export { tab_guard, use_is_primary_tab, get_tab_status } from './tab-guard';
