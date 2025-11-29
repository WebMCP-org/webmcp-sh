import { pgTable, uuid, text, timestamp, integer, index, jsonb, boolean, primaryKey, AnyPgColumn } from 'drizzle-orm/pg-core';
import { relations, sql, SQL } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * AI AGENT MEMORY SYSTEM - SQL-FIRST ARCHITECTURE
 *
 * No embeddings, no RAG - pure SQL-based memory using:
 * - Structured entities with categories
 * - Knowledge graph relationships
 * - SQL-based retrieval with scoring
 * - Message history with smart chunking
 */

/**
 * MEMORY BLOCKS
 * Always-in-context information (like Letta's "core memory")
 * These are the 5-10 most important facts that should always be available
 *
 * Enhanced with token budget management (Phase 6.1)
 */
export const memory_blocks = pgTable('memory_blocks', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Block identification
  block_type: text('block_type', {
    enum: ['user_profile', 'agent_persona', 'current_goals', 'context']
  }).notNull(),
  label: text('label').notNull(), // Human-readable label

  // Content
  value: text('value').notNull(), // The actual memory content (always in context)
  metadata: jsonb('metadata').$type<Record<string, unknown>>(), // Additional structured data

  // Limits & priority
  char_limit: integer('char_limit').notNull().default(500), // Context window budget
  priority: integer('priority').notNull().default(0), // Higher = more important

  // Token budget management (Phase 6.1)
  token_cost: integer('token_cost').notNull().generatedAlwaysAs(
    (): SQL => sql`CEIL(LENGTH(${memory_blocks.value})::NUMERIC / 4)`
  ), // Estimated tokens - auto-calculated
  inclusion_priority: integer('inclusion_priority').notNull().default(50), // Computed score 0-100

  // Lifecycle
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
  last_accessed: timestamp('last_accessed'),
}, (table) => [
  index('memory_blocks_type_idx').on(table.block_type),
  index('memory_blocks_priority_idx').on(table.priority),
  index('memory_blocks_updated_idx').on(table.updated_at),
  index('memory_blocks_inclusion_idx').on(table.inclusion_priority),
]);

/**
 * MEMORY ENTITIES
 * Structured knowledge extracted from conversations
 * Categories: facts, preferences, skills, rules, people, projects, goals
 *
 * Enhanced with human-like memory patterns:
 * - Memory tiers (short-term → working → long-term → archived)
 * - Time-based decay
 * - Episodic vs semantic memory types
 */
export const memory_entities = pgTable('memory_entities', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Entity classification
  category: text('category', {
    enum: ['fact', 'preference', 'skill', 'rule', 'context', 'person', 'project', 'goal']
  }).notNull(),

  // Content
  name: text('name').notNull(), // e.g., "Python programming"
  description: text('description').notNull(), // Detailed description

  // Metadata
  tags: text('tags').array().notNull().default([]), // Flexible categorization
  confidence: integer('confidence').notNull().default(100), // 0-100 confidence score

  // Source tracking
  source_type: text('source_type'), // 'conversation', 'manual', 'imported'
  source_session_id: uuid('source_session_id'), // Which session created this
  source_message_id: uuid('source_message_id'), // Which message created this

  // Retrieval scoring
  mention_count: integer('mention_count').notNull().default(1), // Frequency
  last_mentioned: timestamp('last_mentioned').notNull().defaultNow(), // Recency
  importance_score: integer('importance_score').notNull().default(50), // 0-100 manual importance

  // Memory tier system (Phase 1.1)
  memory_tier: text('memory_tier', {
    enum: ['short_term', 'working', 'long_term', 'archived']
  }).notNull().default('short_term'),
  access_count: integer('access_count').notNull().default(0), // How many times accessed
  last_accessed: timestamp('last_accessed'), // When last retrieved
  promotion_score: integer('promotion_score').notNull().default(0), // Auto-calculated 0-100

  // Memory decay system (Phase 1.2)
  decay_rate: integer('decay_rate').notNull().default(10), // 0-100, higher = faster decay
  last_reinforced: timestamp('last_reinforced').notNull().defaultNow(), // When strengthened
  current_strength: integer('current_strength').notNull().default(100), // Calculated field 0-100

  // Memory type (Phase 2.1)
  memory_type: text('memory_type', {
    enum: ['episodic', 'semantic']
  }).notNull().default('semantic'),

  // Token cost tracking (for context budget analysis)
  token_cost: integer('token_cost').notNull().generatedAlwaysAs(
    (): SQL => sql`CEIL(LENGTH(${memory_entities.name} || ' ' || ${memory_entities.description})::NUMERIC / 4)`
  ), // Estimated tokens - auto-calculated

  // Lifecycle
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  index('memory_entities_category_idx').on(table.category),
  index('memory_entities_tags_idx').on(table.tags),
  index('memory_entities_mention_count_idx').on(table.mention_count),
  index('memory_entities_last_mentioned_idx').on(table.last_mentioned),
  index('memory_entities_importance_idx').on(table.importance_score),
  index('memory_entities_name_idx').on(table.name), // For text search
  // New indexes for memory enhancement
  index('memory_entities_tier_idx').on(table.memory_tier),
  index('memory_entities_access_count_idx').on(table.access_count),
  index('memory_entities_last_accessed_idx').on(table.last_accessed),
  index('memory_entities_strength_idx').on(table.current_strength),
  index('memory_entities_type_idx').on(table.memory_type),
]);

/**
 * ENTITY RELATIONSHIPS
 * Knowledge graph - how entities connect to each other
 */
export const entity_relationships = pgTable('entity_relationships', {
  id: uuid('id').primaryKey().defaultRandom(),

  from_entity_id: uuid('from_entity_id').notNull().references(() => memory_entities.id, { onDelete: 'cascade' }),
  to_entity_id: uuid('to_entity_id').notNull().references(() => memory_entities.id, { onDelete: 'cascade' }),

  relationship_type: text('relationship_type').notNull(), // 'uses', 'related_to', 'works_on', 'knows', etc.
  description: text('description'), // Optional context about the relationship
  strength: integer('strength').notNull().default(1), // How strong the connection (1-10)

  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  index('entity_rel_from_idx').on(table.from_entity_id),
  index('entity_rel_to_idx').on(table.to_entity_id),
  index('entity_rel_type_idx').on(table.relationship_type),
]);

/**
 * CONVERSATION SESSIONS
 * Group messages into logical sessions/threads
 */
export const conversation_sessions = pgTable('conversation_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),

  title: text('title'), // Optional title for the session
  summary: text('summary'), // AI-generated summary

  // Stats
  message_count: integer('message_count').notNull().default(0),
  entity_count: integer('entity_count').notNull().default(0), // Entities created from this session

  // Lifecycle
  started_at: timestamp('started_at').notNull().defaultNow(),
  last_activity: timestamp('last_activity').notNull().defaultNow(),
  ended_at: timestamp('ended_at'),
}, (table) => [
  index('conv_sessions_started_idx').on(table.started_at),
  index('conv_sessions_last_activity_idx').on(table.last_activity),
]);

/**
 * CONVERSATION MESSAGES
 * Raw message history with references to entities mentioned
 */
export const conversation_messages = pgTable('conversation_messages', {
  id: uuid('id').primaryKey().defaultRandom(),

  session_id: uuid('session_id').notNull().references(() => conversation_sessions.id, { onDelete: 'cascade' }),

  // Message content
  role: text('role', { enum: ['user', 'assistant', 'system'] }).notNull(),
  content: text('content').notNull(),

  // Metadata
  token_count: integer('token_count'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(), // Tool calls, attachments, etc.

  created_at: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  index('conv_messages_session_idx').on(table.session_id),
  index('conv_messages_created_idx').on(table.created_at),
  index('conv_messages_role_idx').on(table.role),
]);

/**
 * ENTITY MENTIONS
 * Track when/where entities are mentioned in conversations
 * Enables SQL-based retrieval: "find messages mentioning entity X"
 */
export const entity_mentions = pgTable('entity_mentions', {
  id: uuid('id').primaryKey().defaultRandom(),

  entity_id: uuid('entity_id').notNull().references(() => memory_entities.id, { onDelete: 'cascade' }),
  message_id: uuid('message_id').notNull().references(() => conversation_messages.id, { onDelete: 'cascade' }),
  session_id: uuid('session_id').notNull().references(() => conversation_sessions.id, { onDelete: 'cascade' }),

  // Context
  mention_context: text('mention_context'), // Snippet of text around the mention

  created_at: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  index('entity_mentions_entity_idx').on(table.entity_id),
  index('entity_mentions_message_idx').on(table.message_id),
  index('entity_mentions_session_idx').on(table.session_id),
  index('entity_mentions_created_idx').on(table.created_at),
]);

/**
 * MEMORY RETRIEVAL LOGS
 * Track what memories were retrieved for which queries (analytics & debugging)
 */
export const memory_retrieval_logs = pgTable('memory_retrieval_logs', {
  id: uuid('id').primaryKey().defaultRandom(),

  session_id: uuid('session_id').references(() => conversation_sessions.id, { onDelete: 'set null' }),

  // Query info
  query_text: text('query_text'),
  query_type: text('query_type'), // 'keyword', 'category', 'relationship', 'hybrid'

  // Results
  retrieved_entity_ids: jsonb('retrieved_entity_ids'), // Array of entity IDs
  retrieval_scores: jsonb('retrieval_scores'), // Score breakdown

  // Performance
  retrieval_time_ms: integer('retrieval_time_ms'),
  result_count: integer('result_count').notNull().default(0),

  created_at: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  index('memory_retrieval_session_idx').on(table.session_id),
  index('memory_retrieval_created_idx').on(table.created_at),
]);

/**
 * MEMORY EPISODES (Phase 2.2)
 * Episodic memories - specific events and experiences
 * "I learned Python in 2020" vs "Python is a programming language"
 */
export const memory_episodes = pgTable('memory_episodes', {
  id: uuid('id').primaryKey().defaultRandom(),

  session_id: uuid('session_id').notNull().references(() => conversation_sessions.id, { onDelete: 'cascade' }),

  event_type: text('event_type', {
    enum: ['conversation', 'action', 'observation', 'learning']
  }).notNull(),
  content: text('content').notNull(), // What happened
  related_entity_ids: uuid('related_entity_ids').array().notNull().default([]), // Links to semantic memories

  temporal_order: integer('temporal_order').notNull(), // Sequence within session
  emotional_context: text('emotional_context', {
    enum: ['positive', 'negative', 'neutral']
  }), // Optional

  created_at: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  index('episodes_session_idx').on(table.session_id),
  index('episodes_temporal_idx').on(table.temporal_order),
  index('episodes_type_idx').on(table.event_type),
]);

/**
 * MEMORY CONTEXTS (Phase 3.1)
 * Context scoping - work, personal, project-specific memories
 * Supports hierarchical contexts (parent_context_id)
 */
export const memory_contexts = pgTable('memory_contexts', {
  id: uuid('id').primaryKey().defaultRandom(),

  name: text('name').notNull().unique(), // 'work', 'personal', 'project_webmcp', 'learning'
  description: text('description'),
  parent_context_id: uuid('parent_context_id').references((): AnyPgColumn  => memory_contexts.id), // Hierarchical

  active: boolean('active').notNull().default(true),
  color: text('color'), // For UI: '#6366f1'

  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  index('contexts_name_idx').on(table.name),
  index('contexts_parent_idx').on(table.parent_context_id),
]);

/**
 * ENTITY CONTEXTS (Phase 3.2)
 * Junction table - which entities belong to which contexts
 */
export const entity_contexts = pgTable('entity_contexts', {
  entity_id: uuid('entity_id').notNull().references(() => memory_entities.id, { onDelete: 'cascade' }),
  context_id: uuid('context_id').notNull().references(() => memory_contexts.id, { onDelete: 'cascade' }),

  relevance_score: integer('relevance_score').notNull().default(50), // 0-100

  created_at: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.entity_id, table.context_id] }),
  index('entity_contexts_entity_idx').on(table.entity_id),
  index('entity_contexts_context_idx').on(table.context_id),
]);

/**
 * MEMORY TRIGGERS (Phase 4.1)
 * Associative memory - what keywords/contexts trigger which memories
 */
export const memory_triggers = pgTable('memory_triggers', {
  id: uuid('id').primaryKey().defaultRandom(),

  entity_id: uuid('entity_id').notNull().references(() => memory_entities.id, { onDelete: 'cascade' }),

  trigger_type: text('trigger_type', {
    enum: ['keyword', 'context', 'temporal', 'emotional', 'entity_reference']
  }).notNull(),
  trigger_value: text('trigger_value').notNull(), // The actual trigger
  strength: integer('strength').notNull().default(50), // 0-100 association strength

  created_at: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  index('triggers_entity_idx').on(table.entity_id),
  index('triggers_type_idx').on(table.trigger_type),
  index('triggers_value_idx').on(table.trigger_value),
]);

/**
 * MEMORY CONSOLIDATIONS (Phase 5.1)
 * Track when memories are merged, summarized, or deduplicated
 */
export const memory_consolidations = pgTable('memory_consolidations', {
  id: uuid('id').primaryKey().defaultRandom(),

  consolidation_type: text('consolidation_type', {
    enum: ['merge', 'summarize', 'deduplicate', 'refine']
  }).notNull(),

  source_entity_ids: uuid('source_entity_ids').array().notNull(), // Entities being consolidated
  target_entity_id: uuid('target_entity_id').notNull().references(() => memory_entities.id),

  reason: text('reason'), // Why consolidation happened
  confidence: integer('confidence').notNull().default(50), // 0-100

  consolidated_at: timestamp('consolidated_at').notNull().defaultNow(),
  consolidated_by: text('consolidated_by').notNull().default('system'), // 'system', 'user', 'ai'
}, (table) => [
  index('consolidations_target_idx').on(table.target_entity_id),
  index('consolidations_type_idx').on(table.consolidation_type),
]);

/**
 * MEMORY CONFLICTS (Phase 5.2)
 * Detect and resolve contradictions between memories
 */
export const memory_conflicts = pgTable('memory_conflicts', {
  id: uuid('id').primaryKey().defaultRandom(),

  entity_a_id: uuid('entity_a_id').notNull().references(() => memory_entities.id, { onDelete: 'cascade' }),
  entity_b_id: uuid('entity_b_id').notNull().references(() => memory_entities.id, { onDelete: 'cascade' }),

  conflict_type: text('conflict_type', {
    enum: ['contradiction', 'update', 'refinement', 'preference_change']
  }).notNull(),

  resolution_status: text('resolution_status', {
    enum: ['pending', 'resolved', 'both_valid', 'ignored']
  }).notNull().default('pending'),

  resolution_entity_id: uuid('resolution_entity_id').references(() => memory_entities.id), // Which memory won
  resolution_strategy: text('resolution_strategy'), // 'prefer_recent', 'prefer_important', 'merge', 'manual'

  detected_at: timestamp('detected_at').notNull().defaultNow(),
  resolved_at: timestamp('resolved_at'),
}, (table) => [
  index('conflicts_status_idx').on(table.resolution_status),
  index('conflicts_type_idx').on(table.conflict_type),
]);

/**
 * MEMORY BUDGET LOGS (Phase 6.2)
 * Track token budget management for context windows
 */
export const memory_budget_logs = pgTable('memory_budget_logs', {
  id: uuid('id').primaryKey().defaultRandom(),

  session_id: uuid('session_id').references(() => conversation_sessions.id, { onDelete: 'set null' }),

  total_tokens_available: integer('total_tokens_available').notNull(),
  tokens_used: integer('tokens_used').notNull(),

  memories_included: uuid('memories_included').array().notNull().default([]),
  memories_excluded: uuid('memories_excluded').array().notNull().default([]),

  timestamp: timestamp('timestamp').notNull().defaultNow(),
}, (table) => [
  index('budget_logs_session_idx').on(table.session_id),
  index('budget_logs_timestamp_idx').on(table.timestamp),
]);

/**
 * AUDIT LOG (Security/Infrastructure)
 * Protected, append-only log of all database changes
 *
 * NOTE: This table is created and managed entirely via raw SQL migration (add-audit-log.ts)
 * It is NOT included in Drizzle schema to prevent Drizzle from trying to manage it.
 *
 * Why separate from Drizzle:
 * - Protection requires database triggers (not supported by Drizzle)
 * - Should be independent of ORM layer for security
 * - Prevents Drizzle from generating conflicting migrations
 *
 * PROTECTED: Cannot be modified or deleted by AI tools
 *
 * Schema (for reference only - actual table created by migration):
 *   id: uuid PRIMARY KEY
 *   operation: text ('INSERT' | 'UPDATE' | 'DELETE')
 *   table_name: text
 *   record_id: uuid
 *   old_data: jsonb
 *   new_data: jsonb
 *   changed_fields: text[]
 *   operation_type: text
 *   session_id: uuid (FK to conversation_sessions)
 *   timestamp: timestamp
 *   is_protected: boolean
 */

// TypeScript type for audit_log (not a Drizzle table)
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

/**
 * Drizzle Relations for Query API
 */
export const memoryBlocksRelations = relations(memory_blocks, () => ({}));

export const memoryEntitiesRelations = relations(memory_entities, ({ many }) => ({
  outgoing_relationships: many(entity_relationships, { relationName: 'from_entity' }),
  incoming_relationships: many(entity_relationships, { relationName: 'to_entity' }),
  mentions: many(entity_mentions),
  contexts: many(entity_contexts),
  triggers: many(memory_triggers),
}));

export const entityRelationshipsRelations = relations(entity_relationships, ({ one }) => ({
  from_entity: one(memory_entities, {
    fields: [entity_relationships.from_entity_id],
    references: [memory_entities.id],
    relationName: 'from_entity',
  }),
  to_entity: one(memory_entities, {
    fields: [entity_relationships.to_entity_id],
    references: [memory_entities.id],
    relationName: 'to_entity',
  }),
}));

export const conversationSessionsRelations = relations(conversation_sessions, ({ many }) => ({
  messages: many(conversation_messages),
  entity_mentions: many(entity_mentions),
  retrieval_logs: many(memory_retrieval_logs),
  episodes: many(memory_episodes),
  budget_logs: many(memory_budget_logs),
}));

export const conversationMessagesRelations = relations(conversation_messages, ({ one, many }) => ({
  session: one(conversation_sessions, {
    fields: [conversation_messages.session_id],
    references: [conversation_sessions.id],
  }),
  entity_mentions: many(entity_mentions),
}));

export const entityMentionsRelations = relations(entity_mentions, ({ one }) => ({
  entity: one(memory_entities, {
    fields: [entity_mentions.entity_id],
    references: [memory_entities.id],
  }),
  message: one(conversation_messages, {
    fields: [entity_mentions.message_id],
    references: [conversation_messages.id],
  }),
  session: one(conversation_sessions, {
    fields: [entity_mentions.session_id],
    references: [conversation_sessions.id],
  }),
}));

export const memoryRetrievalLogsRelations = relations(memory_retrieval_logs, ({ one }) => ({
  session: one(conversation_sessions, {
    fields: [memory_retrieval_logs.session_id],
    references: [conversation_sessions.id],
  }),
}));

export const memoryEpisodesRelations = relations(memory_episodes, ({ one }) => ({
  session: one(conversation_sessions, {
    fields: [memory_episodes.session_id],
    references: [conversation_sessions.id],
  }),
}));

export const memoryContextsRelations = relations(memory_contexts, ({ many, one }) => ({
  entities: many(entity_contexts),
  parent: one(memory_contexts, {
    fields: [memory_contexts.parent_context_id],
    references: [memory_contexts.id],
    relationName: 'parent_context',
  }),
  children: many(memory_contexts, { relationName: 'parent_context' }),
}));

export const entityContextsRelations = relations(entity_contexts, ({ one }) => ({
  entity: one(memory_entities, {
    fields: [entity_contexts.entity_id],
    references: [memory_entities.id],
  }),
  context: one(memory_contexts, {
    fields: [entity_contexts.context_id],
    references: [memory_contexts.id],
  }),
}));

export const memoryTriggersRelations = relations(memory_triggers, ({ one }) => ({
  entity: one(memory_entities, {
    fields: [memory_triggers.entity_id],
    references: [memory_entities.id],
  }),
}));

export const memoryConsolidationsRelations = relations(memory_consolidations, ({ one }) => ({
  target_entity: one(memory_entities, {
    fields: [memory_consolidations.target_entity_id],
    references: [memory_entities.id],
  }),
}));

export const memoryConflictsRelations = relations(memory_conflicts, ({ one }) => ({
  entity_a: one(memory_entities, {
    fields: [memory_conflicts.entity_a_id],
    references: [memory_entities.id],
    relationName: 'conflict_a',
  }),
  entity_b: one(memory_entities, {
    fields: [memory_conflicts.entity_b_id],
    references: [memory_entities.id],
    relationName: 'conflict_b',
  }),
  resolution_entity: one(memory_entities, {
    fields: [memory_conflicts.resolution_entity_id],
    references: [memory_entities.id],
    relationName: 'resolution',
  }),
}));

export const memoryBudgetLogsRelations = relations(memory_budget_logs, ({ one }) => ({
  session: one(conversation_sessions, {
    fields: [memory_budget_logs.session_id],
    references: [conversation_sessions.id],
  }),
}));

// Note: audit_log relations removed - table managed outside Drizzle

/**
 * SQL EXECUTION LOG
 * Track all SQL queries executed (both manual and AI-driven)
 */
export const sql_execution_log = pgTable('sql_execution_log', {
  id: uuid('id').primaryKey().defaultRandom(),

  query: text('query').notNull(), // The SQL query
  source: text('source', { enum: ['ai', 'manual'] }).notNull(), // Who executed it

  // Results
  success: boolean('success').notNull(),
  rows_affected: integer('rows_affected'),
  result_data: jsonb('result_data').$type<{ rows: unknown[]; fields?: { name: string }[] }>(), // Query results
  error_message: text('error_message'),

  // Timing
  execution_time_ms: integer('execution_time_ms'),
  executed_at: timestamp('executed_at').notNull().defaultNow(),
}, (table) => [
  index('sql_log_source_idx').on(table.source),
  index('sql_log_executed_idx').on(table.executed_at),
  index('sql_log_success_idx').on(table.success),
]);

/**
 * TypeScript types inferred from Drizzle tables
 */
export type MemoryBlock = typeof memory_blocks.$inferSelect;
export type MemoryEntity = typeof memory_entities.$inferSelect;
export type EntityRelationship = typeof entity_relationships.$inferSelect;
export type ConversationSession = typeof conversation_sessions.$inferSelect;
export type ConversationMessage = typeof conversation_messages.$inferSelect;
export type EntityMention = typeof entity_mentions.$inferSelect;
export type MemoryRetrievalLog = typeof memory_retrieval_logs.$inferSelect;
export type MemoryEpisode = typeof memory_episodes.$inferSelect;
export type MemoryContext = typeof memory_contexts.$inferSelect;
export type EntityContext = typeof entity_contexts.$inferSelect;
export type MemoryTrigger = typeof memory_triggers.$inferSelect;
export type MemoryConsolidation = typeof memory_consolidations.$inferSelect;
export type MemoryConflict = typeof memory_conflicts.$inferSelect;
export type MemoryBudgetLog = typeof memory_budget_logs.$inferSelect;
export type SQLExecutionLog = typeof sql_execution_log.$inferSelect;
// Note: AuditLog type defined manually above - not inferred from Drizzle

/**
 * Zod validation schemas - Auto-generated from Drizzle schemas
 */

// Memory Blocks
export const select_memory_block_schema = createSelectSchema(memory_blocks);
export const insert_memory_block_schema = createInsertSchema(memory_blocks, {
  block_type: (schema) => schema.default('context'),
  label: (schema) => schema.min(1).max(200),
  value: (schema) => schema.min(1),
  char_limit: (schema) => schema.positive(),
}).omit({
  id: true,
  created_at: true,
  updated_at: true,
  last_accessed: true,
  // token_cost is auto-excluded (generated column)
  inclusion_priority: true,
});

export const update_memory_block_schema = insert_memory_block_schema.partial().extend({
  id: z.string().uuid(),
});

// Memory Entities
export const select_memory_entity_schema = createSelectSchema(memory_entities);
export const insert_memory_entity_schema = createInsertSchema(memory_entities, {
  name: (schema) => schema.min(1).max(200),
  description: (schema) => schema.min(1),
  confidence: (schema) => schema.min(0).max(100),
  importance_score: (schema) => schema.min(0).max(100),
  promotion_score: (schema) => schema.min(0).max(100),
  decay_rate: (schema) => schema.min(0).max(100),
  current_strength: (schema) => schema.min(0).max(100),
}).omit({
  id: true,
  mention_count: true,
  last_mentioned: true,
  created_at: true,
  updated_at: true,
  // token_cost is auto-excluded (generated column)
});

export const update_memory_entity_schema = insert_memory_entity_schema.partial().extend({
  id: z.string().uuid(),
});

// Entity Relationships
export const select_entity_relationship_schema = createSelectSchema(entity_relationships);
export const insert_entity_relationship_schema = createInsertSchema(entity_relationships, {
  relationship_type: (schema) => schema.min(1).max(100),
  strength: (schema) => schema.min(1).max(10),
}).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const update_entity_relationship_schema = insert_entity_relationship_schema.partial().extend({
  id: z.string().uuid(),
});

// Conversation Sessions
export const select_conversation_session_schema = createSelectSchema(conversation_sessions);
export const insert_conversation_session_schema = createInsertSchema(conversation_sessions).omit({
  id: true,
  message_count: true,
  entity_count: true,
  started_at: true,
  last_activity: true,
  ended_at: true,
});

export const update_conversation_session_schema = insert_conversation_session_schema.partial().extend({
  id: z.string().uuid(),
  ended_at: z.date().optional(),
});

// Conversation Messages
export const select_conversation_message_schema = createSelectSchema(conversation_messages);
export const insert_conversation_message_schema = createInsertSchema(conversation_messages, {
  content: (schema) => schema.min(1),
}).omit({
  id: true,
  created_at: true,
});

// Entity Mentions
export const select_entity_mention_schema = createSelectSchema(entity_mentions);
export const insert_entity_mention_schema = createInsertSchema(entity_mentions).omit({
  id: true,
  created_at: true,
});

// Memory Episodes
export const select_memory_episode_schema = createSelectSchema(memory_episodes);
export const insert_memory_episode_schema = createInsertSchema(memory_episodes, {
  content: (schema) => schema.min(1),
}).omit({
  id: true,
  created_at: true,
});

export const update_memory_episode_schema = insert_memory_episode_schema.partial().extend({
  id: z.string().uuid(),
});

// Memory Contexts
export const select_memory_context_schema = createSelectSchema(memory_contexts);
export const insert_memory_context_schema = createInsertSchema(memory_contexts, {
  name: (schema) => schema.min(1).max(100),
}).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const update_memory_context_schema = insert_memory_context_schema.partial().extend({
  id: z.string().uuid(),
});

// Entity Contexts
export const select_entity_context_schema = createSelectSchema(entity_contexts);
export const insert_entity_context_schema = createInsertSchema(entity_contexts, {
  relevance_score: (schema) => schema.min(0).max(100),
}).omit({
  created_at: true,
});

// Memory Triggers
export const select_memory_trigger_schema = createSelectSchema(memory_triggers);
export const insert_memory_trigger_schema = createInsertSchema(memory_triggers, {
  trigger_value: (schema) => schema.min(1),
  strength: (schema) => schema.min(0).max(100),
}).omit({
  id: true,
  created_at: true,
});

export const update_memory_trigger_schema = insert_memory_trigger_schema.partial().extend({
  id: z.string().uuid(),
});

// Memory Consolidations
export const select_memory_consolidation_schema = createSelectSchema(memory_consolidations);
export const insert_memory_consolidation_schema = createInsertSchema(memory_consolidations, {
  confidence: (schema) => schema.min(0).max(100),
}).omit({
  id: true,
  consolidated_at: true,
});

// Memory Conflicts
export const select_memory_conflict_schema = createSelectSchema(memory_conflicts);
export const insert_memory_conflict_schema = createInsertSchema(memory_conflicts).omit({
  id: true,
  detected_at: true,
  resolved_at: true,
});

export const update_memory_conflict_schema = insert_memory_conflict_schema.partial().extend({
  id: z.string().uuid(),
  resolved_at: z.date().optional(),
});

// Memory Budget Logs
export const select_memory_budget_log_schema = createSelectSchema(memory_budget_logs);
export const insert_memory_budget_log_schema = createInsertSchema(memory_budget_logs).omit({
  id: true,
  timestamp: true,
});

// SQL Execution Log
export const select_sql_execution_log_schema = createSelectSchema(sql_execution_log);
export const insert_sql_execution_log_schema = createInsertSchema(sql_execution_log, {
  query: (schema) => schema.min(1),
}).omit({
  id: true,
  executed_at: true,
});

// Note: Audit log schemas removed - table managed outside Drizzle with raw SQL
// AuditLog TypeScript type is defined manually above

/**
 * Type inference exports - Use types from './types.ts' for single source of truth
 * These are re-exported for backwards compatibility
 */
export type {
  InsertMemoryBlock,
  UpdateMemoryBlock,
  InsertMemoryEntity,
  UpdateMemoryEntity,
  InsertEntityRelationship,
  UpdateEntityRelationship,
  InsertConversationSession,
  UpdateConversationSession,
  InsertConversationMessage,
  InsertEntityMention,
  InsertMemoryEpisode,
  UpdateMemoryEpisode,
  InsertMemoryContext,
  UpdateMemoryContext,
  InsertEntityContext,
  InsertMemoryTrigger,
  UpdateMemoryTrigger,
  InsertMemoryConsolidation,
  InsertMemoryConflict,
  UpdateMemoryConflict,
  InsertMemoryBudgetLog,
  InsertSQLExecutionLog,
} from './types';
