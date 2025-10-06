# Database Schema Documentation

## Overview
AI Memory System using PostgreSQL (via PGlite) with Drizzle ORM. No embeddings or RAG - pure SQL-based memory with structured entities, knowledge graphs, and intelligent retrieval.

## Architecture Principles
- **Single Source of Truth**: All types derived from Drizzle schemas in `src/react-app/lib/db/types.ts`
- **No Raw SQL**: All queries use Drizzle ORM except for DDL operations (CREATE/DROP TABLE)
- **Type Safety**: 100% TypeScript with Zod validation
- **Auto-calculated Fields**: Token costs via PostgreSQL generated columns

## Core Tables

### 1. memory_blocks
Always-in-context core memories (5-10 most important facts)
- **Purpose**: Store critical information that should always be available
- **Key Fields**: block_type, label, value, priority, token_cost (auto-calculated)
- **Use Cases**: User profile, agent persona, current goals, context

### 2. memory_entities
Structured knowledge extracted from conversations
- **Purpose**: Store facts, preferences, skills, rules, people, projects, goals
- **Key Fields**: category, name, description, tags, importance_score
- **Memory Tiers**: short_term → working → long_term → archived
- **Memory Types**: episodic vs semantic

### 3. entity_relationships
Knowledge graph connections between entities
- **Purpose**: Model how entities relate to each other
- **Key Fields**: from_entity_id, to_entity_id, relationship_type, strength
- **Use Cases**: "uses", "related_to", "works_on", "knows"

### 4. conversation_sessions & conversation_messages
Message history with smart chunking
- **Purpose**: Track conversation threads and messages
- **Sessions**: Group messages into logical conversations
- **Messages**: Store user/assistant/system messages with metadata

### 5. entity_mentions
Track where entities are referenced in conversations
- **Purpose**: Enable SQL-based retrieval of relevant context
- **Key Fields**: entity_id, message_id, session_id, mention_context

### 6. memory_episodes
Episodic memories - specific events and experiences
- **Purpose**: Store "I learned Python in 2020" vs "Python is a programming language"
- **Event Types**: conversation, action, observation, learning

### 7. memory_contexts
Context scoping for organized memory
- **Purpose**: Separate work, personal, project-specific memories
- **Features**: Hierarchical (parent_context_id), can be activated/deactivated

### 8. memory_triggers
Associative memory triggers
- **Purpose**: Define what keywords/contexts trigger which memories
- **Trigger Types**: keyword, context, temporal, emotional, entity_reference

### 9. memory_consolidations
Track memory merging and deduplication
- **Purpose**: Record when memories are merged, summarized, or deduplicated
- **Types**: merge, summarize, deduplicate, refine

### 10. memory_conflicts
Detect and resolve contradictions
- **Purpose**: Handle conflicting information between memories
- **Conflict Types**: contradiction, update, refinement, preference_change
- **Resolution Status**: pending, resolved, both_valid, ignored

### 11. memory_budget_logs
Token budget management for context windows
- **Purpose**: Track token usage and optimize context inclusion
- **Metrics**: tokens_available, tokens_used, memories_included/excluded

### 12. sql_execution_log
Track all SQL queries executed
- **Purpose**: Audit and analyze database operations
- **Sources**: ai, manual

### 13. audit_log (Protected)
Append-only audit trail - managed via raw SQL migrations
- **Purpose**: Security and compliance tracking
- **Protection**: Cannot be modified by AI tools

## Query Patterns

### Standard CRUD Pattern
Every table has a query file with these standard functions:
```typescript
get_all(options?)     // List with filters
get_by_id(id)        // Single record
create(data)         // Insert with validation
update(data)         // Update with validation
remove(id)           // Delete
```

### Advanced Patterns
- **Joins**: Use Drizzle's leftJoin/innerJoin for relationships
- **Aggregations**: Use sql`` template for COUNT, SUM, AVG
- **Window Functions**: ROW_NUMBER() OVER for ranking
- **CTEs**: Chain queries for complex operations
- **Transactions**: Use db.transaction() for atomic operations

## Type System

### Import Hierarchy
1. Import types from `@/lib/db/types` (single source of truth)
2. Import query functions from `@/lib/db` (barrel export)
3. Never import from schema.ts directly (internal use only)

### Type Categories
- **Select Types**: `MemoryEntity`, `MemoryBlock`, etc.
- **Insert Types**: `InsertMemoryEntity`, `InsertMemoryBlock`, etc.
- **Update Types**: `UpdateMemoryEntity`, `UpdateMemoryBlock`, etc.
- **Enum Types**: `MemoryEntityCategory`, `EventType`, `TriggerType`, etc.

## Best Practices

### DO:
- Use Drizzle query builder for all data operations
- Validate with Zod schemas before database operations
- Use transactions for multi-table operations
- Index frequently queried columns
- Use generated columns for calculated fields

### DON'T:
- Write raw SQL (except for DDL operations)
- Store calculated values that can be derived
- Skip validation
- Use string concatenation for SQL
- Modify audit_log table

## Migration Strategy
1. Migrations are compiled to JSON for browser compatibility
2. DDL operations (CREATE/DROP TABLE) require raw SQL
3. DML operations (SELECT/INSERT/UPDATE/DELETE) use Drizzle
4. Custom migrations in `src/react-app/lib/db/migrations/`

## Performance Optimizations
- Indexes on: category, tags, mention_count, importance_score, timestamps
- Generated columns for token_cost (automatic calculation)
- Limit clauses on all queries to prevent huge result sets
- Connection pooling via PGlite's persistent connection