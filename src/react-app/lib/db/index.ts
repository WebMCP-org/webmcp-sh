/**
 * Database module exports
 */

// Main database instance and utilities
export { db, pg_lite, db_utils } from './database';

// Types - single source of truth
export * from './types';

// Schema (for advanced usage only - prefer types from './types')
export * as schema from './schema';

// Query utilities - all tables
export * as memory_blocks from './queries/memory-blocks';
export * as memory_entities from './queries/memory-entities';
export * as entity_relationships from './queries/entity-relationships';
export * as conversation_sessions from './queries/conversation-sessions';
export * as conversation_messages from './queries/conversation-messages';
export * as entity_mentions from './queries/entity-mentions';
export * as memory_retrieval_logs from './queries/memory-retrieval-logs';
export * as memory_episodes from './queries/memory-episodes';
export * as memory_contexts from './queries/memory-contexts';
export * as entity_contexts from './queries/entity-contexts';
export * as memory_triggers from './queries/memory-triggers';
export * as memory_consolidations from './queries/memory-consolidations';
export * as memory_conflicts from './queries/memory-conflicts';
export * as memory_budget_logs from './queries/memory-budget-logs';

// Tab guard for preventing multiple tabs
export { tab_guard, use_is_primary_tab, get_tab_status } from './tab-guard';
