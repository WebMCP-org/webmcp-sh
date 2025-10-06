/**
 * Centralized type definitions for the database
 * Single source of truth for all database-related types
 */

import { z } from 'zod';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import * as schema from './schema';

// ============================================================================
// Table Type Exports - Inferred from Drizzle schemas
// ============================================================================

// Memory Blocks
export type MemoryBlock = InferSelectModel<typeof schema.memory_blocks>;
export type InsertMemoryBlock = InferInsertModel<typeof schema.memory_blocks>;
export type UpdateMemoryBlock = Partial<InsertMemoryBlock> & { id: string };

// Memory Entities
export type MemoryEntity = InferSelectModel<typeof schema.memory_entities>;
export type InsertMemoryEntity = InferInsertModel<typeof schema.memory_entities>;
export type UpdateMemoryEntity = Partial<InsertMemoryEntity> & { id: string };

// Entity Relationships
export type EntityRelationship = InferSelectModel<typeof schema.entity_relationships>;
export type InsertEntityRelationship = InferInsertModel<typeof schema.entity_relationships>;
export type UpdateEntityRelationship = Partial<InsertEntityRelationship> & { id: string };

// Conversation Sessions
export type ConversationSession = InferSelectModel<typeof schema.conversation_sessions>;
export type InsertConversationSession = InferInsertModel<typeof schema.conversation_sessions>;
export type UpdateConversationSession = Partial<InsertConversationSession> & { id: string };

// Conversation Messages
export type ConversationMessage = InferSelectModel<typeof schema.conversation_messages>;
export type InsertConversationMessage = InferInsertModel<typeof schema.conversation_messages>;
export type UpdateConversationMessage = Partial<InsertConversationMessage> & { id: string };

// Entity Mentions
export type EntityMention = InferSelectModel<typeof schema.entity_mentions>;
export type InsertEntityMention = InferInsertModel<typeof schema.entity_mentions>;

// Memory Retrieval Logs
export type MemoryRetrievalLog = InferSelectModel<typeof schema.memory_retrieval_logs>;
export type InsertMemoryRetrievalLog = InferInsertModel<typeof schema.memory_retrieval_logs>;

// Memory Episodes
export type MemoryEpisode = InferSelectModel<typeof schema.memory_episodes>;
export type InsertMemoryEpisode = InferInsertModel<typeof schema.memory_episodes>;
export type UpdateMemoryEpisode = Partial<InsertMemoryEpisode> & { id: string };

// Memory Contexts
export type MemoryContext = InferSelectModel<typeof schema.memory_contexts>;
export type InsertMemoryContext = InferInsertModel<typeof schema.memory_contexts>;
export type UpdateMemoryContext = Partial<InsertMemoryContext> & { id: string };

// Entity Contexts
export type EntityContext = InferSelectModel<typeof schema.entity_contexts>;
export type InsertEntityContext = InferInsertModel<typeof schema.entity_contexts>;

// Memory Triggers
export type MemoryTrigger = InferSelectModel<typeof schema.memory_triggers>;
export type InsertMemoryTrigger = InferInsertModel<typeof schema.memory_triggers>;
export type UpdateMemoryTrigger = Partial<InsertMemoryTrigger> & { id: string };

// Memory Consolidations
export type MemoryConsolidation = InferSelectModel<typeof schema.memory_consolidations>;
export type InsertMemoryConsolidation = InferInsertModel<typeof schema.memory_consolidations>;

// Memory Conflicts
export type MemoryConflict = InferSelectModel<typeof schema.memory_conflicts>;
export type InsertMemoryConflict = InferInsertModel<typeof schema.memory_conflicts>;
export type UpdateMemoryConflict = Partial<InsertMemoryConflict> & { id: string };

// Memory Budget Logs
export type MemoryBudgetLog = InferSelectModel<typeof schema.memory_budget_logs>;
export type InsertMemoryBudgetLog = InferInsertModel<typeof schema.memory_budget_logs>;

// SQL Execution Log
export type SQLExecutionLog = InferSelectModel<typeof schema.sql_execution_log>;
export type InsertSQLExecutionLog = InferInsertModel<typeof schema.sql_execution_log>;

// Audit Log (manually defined as it's not in Drizzle schema)
export type AuditLog = {
  id: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  table_name: string;
  record_id: string;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  changed_fields: string[] | null;
  operation_type: string | null;
  session_id: string | null;
  timestamp: Date;
  is_protected: boolean;
};

// ============================================================================
// Enum Types
// ============================================================================

export const MemoryBlockType = z.enum(['user_profile', 'agent_persona', 'current_goals', 'context']);
export type MemoryBlockType = z.infer<typeof MemoryBlockType>;

export const MemoryEntityCategory = z.enum(['fact', 'preference', 'skill', 'rule', 'context', 'person', 'project', 'goal']);
export type MemoryEntityCategory = z.infer<typeof MemoryEntityCategory>;

export const MemoryTier = z.enum(['short_term', 'working', 'long_term', 'archived']);
export type MemoryTier = z.infer<typeof MemoryTier>;

export const MemoryType = z.enum(['episodic', 'semantic']);
export type MemoryType = z.infer<typeof MemoryType>;

export const MessageRole = z.enum(['user', 'assistant', 'system']);
export type MessageRole = z.infer<typeof MessageRole>;

export const EventType = z.enum(['conversation', 'action', 'observation', 'learning']);
export type EventType = z.infer<typeof EventType>;

export const TriggerType = z.enum(['keyword', 'context', 'temporal', 'emotional', 'entity_reference']);
export type TriggerType = z.infer<typeof TriggerType>;

export const ConsolidationType = z.enum(['merge', 'summarize', 'deduplicate', 'refine']);
export type ConsolidationType = z.infer<typeof ConsolidationType>;

export const ConflictType = z.enum(['contradiction', 'update', 'refinement', 'preference_change']);
export type ConflictType = z.infer<typeof ConflictType>;

export const ResolutionStatus = z.enum(['pending', 'resolved', 'both_valid', 'ignored']);
export type ResolutionStatus = z.infer<typeof ResolutionStatus>;

export const SQLSource = z.enum(['ai', 'manual']);
export type SQLSource = z.infer<typeof SQLSource>;

// ============================================================================
// Query Result Types
// ============================================================================

export type QueryResult<T> =
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: Error };

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

// ============================================================================
// Validation Schemas (re-exported from schema.ts but with proper types)
// ============================================================================

export {
  // Select schemas
  select_memory_block_schema,
  select_memory_entity_schema,
  select_entity_relationship_schema,
  select_conversation_session_schema,
  select_conversation_message_schema,
  select_entity_mention_schema,
  select_memory_episode_schema,
  select_memory_context_schema,
  select_entity_context_schema,
  select_memory_trigger_schema,
  select_memory_consolidation_schema,
  select_memory_conflict_schema,
  select_memory_budget_log_schema,
  select_sql_execution_log_schema,

  // Insert schemas
  insert_memory_block_schema,
  insert_memory_entity_schema,
  insert_entity_relationship_schema,
  insert_conversation_session_schema,
  insert_conversation_message_schema,
  insert_entity_mention_schema,
  insert_memory_episode_schema,
  insert_memory_context_schema,
  insert_entity_context_schema,
  insert_memory_trigger_schema,
  insert_memory_consolidation_schema,
  insert_memory_conflict_schema,
  insert_memory_budget_log_schema,
  insert_sql_execution_log_schema,

  // Update schemas
  update_memory_block_schema,
  update_memory_entity_schema,
  update_entity_relationship_schema,
  update_conversation_session_schema,
  update_memory_episode_schema,
  update_memory_context_schema,
  update_memory_trigger_schema,
  update_memory_conflict_schema,
} from './schema';

// ============================================================================
// Database Schema Type
// ============================================================================

export type DatabaseSchema = typeof schema;

// ============================================================================
// Utility Types
// ============================================================================

export type TableName = keyof DatabaseSchema;

export type ExtractModel<T extends TableName> = DatabaseSchema[T] extends { $inferSelect: infer S } ? S : never;

export type ExtractInsert<T extends TableName> = DatabaseSchema[T] extends { $inferInsert: infer I } ? I : never;