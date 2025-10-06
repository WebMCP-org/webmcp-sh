# SQL Tools Guide for AI Agents

This guide explains how AI agents can use the SQL tools to interact directly with the memory database.

## 🚀 Philosophy: Write POWERFUL Queries!

**Key Principle: Use ONE powerful query instead of many simple queries.**

You have access to full PostgreSQL with:
- **JOINs** - Combine multiple tables
- **CTEs (WITH clause)** - Multi-step operations
- **Window Functions** - Per-group analytics
- **JSON aggregation** - Nested data structures
- **Array operations** - Tag filtering and overlap detection

This means you can retrieve complex, interconnected data in a SINGLE query instead of making multiple round trips.

### Quick Example

❌ **BAD (Multiple Queries):**
```sql
SELECT * FROM memory_entities WHERE id = 'uuid';  -- Query 1
SELECT * FROM entity_relationships WHERE from_entity_id = 'uuid';  -- Query 2
SELECT * FROM memory_entities WHERE id IN (...);  -- Query 3
```

✅ **GOOD (One Powerful Query):**
```sql
SELECT
  e.*,
  json_agg(json_build_object(
    'type', r.relationship_type,
    'entity', re.name,
    'strength', r.strength
  )) FILTER (WHERE r.id IS NOT NULL) as relationships
FROM memory_entities e
LEFT JOIN entity_relationships r ON e.id = r.from_entity_id
LEFT JOIN memory_entities re ON r.to_entity_id = re.id
WHERE e.id = 'uuid'
GROUP BY e.id;
```

## Overview

The memory system uses PostgreSQL (via PGlite) running in the browser. AI agents have two SQL tools available:

1. **`get_database_info`** - Get complete database schema, patterns, and best practices (call ONCE)
2. **`sql_query`** - Execute SELECT, INSERT, UPDATE, DELETE queries

### How to Use

**First time? Start here:**
1. Call `get_database_info` once - this returns ALL table schemas, query patterns, and best practices
2. Use `sql_query` for all database operations

This approach is token-efficient: database info goes into context once, then stays available for all subsequent queries.

## Safety Features

### ✅ Allowed Operations
- `SELECT` - Read any data
- `INSERT` - Create new records
- `UPDATE` - Modify records (with WHERE recommended)
- `DELETE` - Remove records (WHERE clause required)

### ❌ Blocked Operations
- `DROP TABLE/DATABASE/SCHEMA` - Prevents data loss
- `TRUNCATE TABLE` - Prevents bulk deletion
- `ALTER TABLE` - Prevents schema changes
- `CREATE TABLE/DATABASE` - Schema is fixed
- SQL injection patterns (semicolon-chained commands)
- `DELETE` without `WHERE` clause

### ⚠️ Warnings
- `UPDATE` without `WHERE` - Will update ALL records (allowed but warned)

## Database Schema

### Core Tables

#### `memory_blocks`
Always-in-context information (5-10 most important facts)

**Key Columns:**
- `id` (uuid) - Primary key
- `block_type` (text) - 'user_profile', 'agent_persona', 'current_goals', 'context'
- `label` (text) - Human-readable label
- `value` (text) - The actual memory content
- `priority` (integer) - Higher = more important (default: 0)
- `char_limit` (integer) - Context window budget (default: 500)
- `created_at`, `updated_at`, `last_accessed` (timestamp)

**Example:**
```sql
SELECT * FROM memory_blocks WHERE block_type = 'user_profile' ORDER BY priority DESC;
```

#### `memory_entities`
Structured knowledge extracted from conversations

**Key Columns:**
- `id` (uuid) - Primary key
- `category` (enum) - 'fact', 'preference', 'skill', 'rule', 'context', 'person', 'project', 'goal'
- `name` (text) - e.g., "Python programming"
- `description` (text) - Detailed description
- `tags` (text[]) - Array of tags
- `confidence` (integer) - 0-100 confidence score
- `importance_score` (integer) - 0-100 manual importance
- `mention_count` (integer) - Frequency of mentions
- `last_mentioned` (timestamp) - Recency
- `memory_tier` (enum) - 'short_term', 'working', 'long_term', 'archived'
- `memory_type` (enum) - 'episodic', 'semantic'
- `current_strength` (integer) - 0-100 calculated strength

**Example:**
```sql
-- Find all skills with high importance
SELECT name, description, importance_score, mention_count
FROM memory_entities
WHERE category = 'skill' AND importance_score > 70
ORDER BY importance_score DESC;

-- Insert a new preference
INSERT INTO memory_entities (category, name, description, tags, importance_score)
VALUES ('preference', 'Dark mode UI', 'User prefers dark mode interfaces', ARRAY['ui', 'preference'], 80);
```

#### `entity_relationships`
Knowledge graph connections

**Key Columns:**
- `id` (uuid) - Primary key
- `from_entity_id` (uuid) - Source entity
- `to_entity_id` (uuid) - Target entity
- `relationship_type` (text) - 'uses', 'related_to', 'works_on', 'knows', etc.
- `description` (text) - Optional context
- `strength` (integer) - 1-10 connection strength

**Example:**
```sql
-- Find all relationships for a specific entity
SELECT
  e1.name as from_entity,
  r.relationship_type,
  e2.name as to_entity,
  r.strength
FROM entity_relationships r
JOIN memory_entities e1 ON r.from_entity_id = e1.id
JOIN memory_entities e2 ON r.to_entity_id = e2.id
WHERE r.from_entity_id = 'entity-uuid-here';
```

#### `conversation_sessions`
Conversation threads

**Key Columns:**
- `id` (uuid) - Primary key
- `title` (text) - Optional title
- `summary` (text) - AI-generated summary
- `message_count` (integer) - Number of messages
- `started_at`, `last_activity`, `ended_at` (timestamp)

#### `conversation_messages`
Message history

**Key Columns:**
- `id` (uuid) - Primary key
- `session_id` (uuid) - Foreign key to conversation_sessions
- `role` (enum) - 'user', 'assistant', 'system'
- `content` (text) - Message content
- `token_count` (integer) - Token usage
- `metadata` (jsonb) - Tool calls, attachments, etc.

**Example:**
```sql
-- Get recent conversation history
SELECT role, content, created_at
FROM conversation_messages
WHERE session_id = 'session-uuid-here'
ORDER BY created_at DESC
LIMIT 10;
```

#### `entity_mentions`
Track where entities are mentioned

**Key Columns:**
- `entity_id` (uuid) - Which entity
- `message_id` (uuid) - Which message
- `session_id` (uuid) - Which session
- `mention_context` (text) - Text snippet around mention

### Advanced Tables

#### `memory_episodes`
Episodic memories (specific events)

**Key Columns:**
- `session_id` (uuid)
- `event_type` (enum) - 'conversation', 'action', 'observation', 'learning'
- `content` (text) - What happened
- `related_entity_ids` (uuid[]) - Links to semantic memories
- `temporal_order` (integer) - Sequence within session

#### `memory_contexts`
Context scoping (work, personal, projects)

**Key Columns:**
- `name` (text) - 'work', 'personal', 'project_webmcp'
- `description` (text)
- `parent_context_id` (uuid) - Hierarchical contexts
- `active` (boolean)

#### `memory_triggers`
Associative memory triggers

**Key Columns:**
- `entity_id` (uuid)
- `trigger_type` (enum) - 'keyword', 'context', 'temporal', 'emotional'
- `trigger_value` (text)
- `strength` (integer) - 0-100

## Common Patterns

### 1. Finding Relevant Memories

```sql
-- Simple keyword search
SELECT name, description, category, importance_score
FROM memory_entities
WHERE
  name ILIKE '%keyword%' OR
  description ILIKE '%keyword%'
ORDER BY importance_score DESC
LIMIT 10;

-- Find entities by tag
SELECT name, description, tags
FROM memory_entities
WHERE 'programming' = ANY(tags);

-- ⚡ POWERFUL: Search with relevance scoring (combine importance + frequency + recency)
SELECT
  e.*,
  (e.importance_score * 0.4 +
   e.mention_count * 2 +
   CASE WHEN e.last_mentioned > NOW() - INTERVAL '7 days' THEN 30 ELSE 0 END) as relevance_score
FROM memory_entities e
WHERE e.name ILIKE '%keyword%' OR e.description ILIKE '%keyword%' OR 'tag' = ANY(e.tags)
ORDER BY relevance_score DESC
LIMIT 10;
```

### 2. Creating New Memories

```sql
-- Create a new fact
INSERT INTO memory_entities (
  category,
  name,
  description,
  tags,
  importance_score,
  memory_type
) VALUES (
  'fact',
  'User birthday',
  'User was born on January 15, 1990',
  ARRAY['personal', 'important'],
  95,
  'semantic'
) RETURNING id, name, category;

-- Create a relationship
INSERT INTO entity_relationships (
  from_entity_id,
  to_entity_id,
  relationship_type,
  strength
) VALUES (
  'entity-uuid-1',
  'entity-uuid-2',
  'works_on',
  8
);
```

### 3. Updating Memories

```sql
-- Increase importance score
UPDATE memory_entities
SET
  importance_score = importance_score + 10,
  updated_at = NOW()
WHERE id = 'entity-uuid-here';

-- Update memory block
UPDATE memory_blocks
SET
  value = 'Updated core memory content',
  updated_at = NOW(),
  last_accessed = NOW()
WHERE block_type = 'user_profile';
```

### 4. Complex Queries & Advanced Patterns

```sql
-- Find most connected entities (knowledge graph centrality)
SELECT
  e.name,
  e.category,
  COUNT(DISTINCT r.id) as connection_count
FROM memory_entities e
LEFT JOIN entity_relationships r ON (
  e.id = r.from_entity_id OR e.id = r.to_entity_id
)
GROUP BY e.id, e.name, e.category
ORDER BY connection_count DESC
LIMIT 10;

-- Find memories that haven't been accessed recently
SELECT
  name,
  category,
  last_mentioned,
  current_strength,
  memory_tier
FROM memory_entities
WHERE
  last_mentioned < NOW() - INTERVAL '7 days' AND
  memory_tier = 'working'
ORDER BY current_strength DESC;

-- ⚡ POWERFUL: Get entity with ALL its relationships in ONE query using json_agg
SELECT
  e.id, e.name, e.description, e.category,
  json_agg(json_build_object(
    'relationship', r.relationship_type,
    'related_entity', re.name,
    'related_category', re.category,
    'strength', r.strength
  )) FILTER (WHERE r.id IS NOT NULL) as relationships
FROM memory_entities e
LEFT JOIN entity_relationships r ON (e.id = r.from_entity_id)
LEFT JOIN memory_entities re ON (r.to_entity_id = re.id)
WHERE e.id = 'entity-uuid-here'
GROUP BY e.id;

-- ⚡ POWERFUL: CTE for multi-step analysis (find top entities, then get their contexts)
WITH top_entities AS (
  SELECT id, name, category, importance_score
  FROM memory_entities
  WHERE category IN ('skill', 'preference')
  ORDER BY importance_score DESC
  LIMIT 20
),
entity_with_contexts AS (
  SELECT
    te.id,
    te.name,
    te.category,
    te.importance_score,
    json_agg(json_build_object(
      'context', mc.name,
      'relevance', ec.relevance_score
    )) FILTER (WHERE mc.id IS NOT NULL) as contexts
  FROM top_entities te
  LEFT JOIN entity_contexts ec ON te.id = ec.entity_id
  LEFT JOIN memory_contexts mc ON ec.context_id = mc.id
  GROUP BY te.id, te.name, te.category, te.importance_score
)
SELECT * FROM entity_with_contexts
ORDER BY importance_score DESC;

-- ⚡ POWERFUL: Window functions to get top N entities per category
SELECT * FROM (
  SELECT
    id, name, category, importance_score, mention_count,
    ROW_NUMBER() OVER (PARTITION BY category ORDER BY importance_score DESC) as rank
  FROM memory_entities
) ranked
WHERE rank <= 3;

-- ⚡ POWERFUL: Batch insert with relationships in one transaction
WITH new_entity AS (
  INSERT INTO memory_entities (category, name, description, tags, importance_score)
  VALUES ('project', 'AI Memory System', 'Building an advanced AI memory system', ARRAY['ai', 'database', 'memory'], 90)
  RETURNING id
),
new_relationships AS (
  INSERT INTO entity_relationships (from_entity_id, to_entity_id, relationship_type, strength)
  SELECT
    (SELECT id FROM new_entity),
    e.id,
    'uses',
    8
  FROM memory_entities e
  WHERE e.category = 'skill' AND e.name IN ('PostgreSQL', 'TypeScript', 'React')
  RETURNING *
)
SELECT
  (SELECT id FROM new_entity) as entity_id,
  (SELECT COUNT(*) FROM new_relationships) as relationships_created;

-- ⚡ POWERFUL: Get conversation messages with all mentioned entities
SELECT
  cm.id, cm.role, cm.content, cm.created_at,
  json_agg(json_build_object(
    'entity', me.name,
    'category', me.category,
    'importance', me.importance_score,
    'context', em.mention_context
  )) FILTER (WHERE em.id IS NOT NULL) as mentioned_entities
FROM conversation_messages cm
LEFT JOIN entity_mentions em ON cm.id = em.message_id
LEFT JOIN memory_entities me ON em.entity_id = me.id
WHERE cm.session_id = 'session-uuid-here'
GROUP BY cm.id
ORDER BY cm.created_at DESC;
```

### 5. Analytics

```sql
-- Memory statistics by category
SELECT
  category,
  COUNT(*) as count,
  AVG(importance_score) as avg_importance,
  AVG(mention_count) as avg_mentions
FROM memory_entities
GROUP BY category
ORDER BY count DESC;

-- Conversation activity over time
SELECT
  DATE(started_at) as date,
  COUNT(*) as session_count,
  SUM(message_count) as total_messages
FROM conversation_sessions
GROUP BY DATE(started_at)
ORDER BY date DESC;
```

## Best Practices

### ⚡ Write Powerful Queries - NOT Multiple Simple Ones!

**BAD APPROACH (Multiple Queries):**
```sql
-- Query 1: Get entity
SELECT * FROM memory_entities WHERE id = 'uuid';
-- Query 2: Get relationships
SELECT * FROM entity_relationships WHERE from_entity_id = 'uuid';
-- Query 3: Get related entities
SELECT * FROM memory_entities WHERE id IN (related_ids...);
```

**GOOD APPROACH (ONE Powerful Query):**
```sql
-- ONE query to get everything
SELECT
  e.*,
  json_agg(json_build_object(
    'relationship', r.relationship_type,
    'related_entity', re.name,
    'strength', r.strength
  )) FILTER (WHERE r.id IS NOT NULL) as relationships
FROM memory_entities e
LEFT JOIN entity_relationships r ON e.id = r.from_entity_id
LEFT JOIN memory_entities re ON r.to_entity_id = re.id
WHERE e.id = 'uuid'
GROUP BY e.id;
```

### Key Practices

1. **Use JOINs instead of multiple queries** - Combine data from multiple tables in ONE query
2. **Use CTEs (WITH clause)** - For complex multi-step operations that need intermediate results
3. **Use json_agg() for nested data** - Aggregate related records into JSON structures
4. **Use FILTER (WHERE ...)** - Handle NULL values properly with aggregates
5. **Use window functions** - For per-group analytics (ROW_NUMBER, RANK, PARTITION BY)
6. **Use array operations** - `= ANY(array)` for tag filtering, `&& ` for array overlap
7. **Use WHERE clauses** - Always filter results to avoid large datasets
8. **Use LIMIT** - Constrain result sets to reasonable sizes (10-100 rows)
9. **Check existence before INSERT** - Use `WHERE NOT EXISTS` to avoid duplicates
10. **Use RETURNING** - Get inserted/updated data back immediately
11. **Leverage indexes** - The schema has indexes on common columns (category, tags, importance_score, etc.)
12. **Understand memory tiers** - short_term → working → long_term → archived
13. **Track importance** - Use importance_score and current_strength for retrieval

## Error Handling

When a query fails, the error message will include:
- The PostgreSQL error message
- The original query (for debugging)

Common errors:
- **Syntax error** - Check SQL syntax
- **Foreign key violation** - Referenced entity doesn't exist
- **UUID format** - Use valid UUID format (e.g., from `gen_random_uuid()`)
- **Enum violation** - Use valid enum values (see schema)

## Examples in Practice

### Scenario: User mentions they love hiking

```sql
-- 1. Create the preference entity
INSERT INTO memory_entities (category, name, description, tags, importance_score)
VALUES (
  'preference',
  'Hiking',
  'User loves hiking and outdoor activities',
  ARRAY['hobby', 'outdoor', 'physical_activity'],
  75
)
RETURNING id;

-- 2. Create relationship with existing "outdoor" context
INSERT INTO entity_relationships (from_entity_id, to_entity_id, relationship_type, strength)
VALUES (
  'new-hiking-entity-uuid',
  'outdoor-context-entity-uuid',
  'related_to',
  8
);
```

### Scenario: Retrieve relevant context for a question

```sql
-- User asks: "What do you know about my hobbies?"
SELECT
  e.name,
  e.description,
  e.importance_score,
  e.mention_count,
  e.last_mentioned
FROM memory_entities e
WHERE
  e.category IN ('preference', 'skill') AND
  ('hobby' = ANY(e.tags) OR
   e.description ILIKE '%hobby%' OR
   e.description ILIKE '%enjoy%')
ORDER BY e.importance_score DESC, e.last_mentioned DESC
LIMIT 10;
```

## Tool Usage

### `get_database_info`
Call this first to get complete schema and patterns:
```json
{}
```

Returns a comprehensive JSON object with:
- Table schemas (all columns, types, constraints)
- Record counts
- 7 powerful query patterns
- Best practices
- Important enum values

### `sql_query`
Execute queries after getting database info:
```json
{
  "query": "SELECT name, description FROM memory_entities WHERE category = 'preference' LIMIT 10"
}
```

## Debugging Tips

1. **Start with `get_database_info`** to get complete schema and examples
2. Test SELECT queries before INSERT/UPDATE
3. Use `LIMIT` while developing queries
4. Check foreign keys exist before creating relationships
5. Use `RETURNING *` to see what was inserted/updated
6. Reference the powerful_patterns in database info for complex queries

---

**Remember:** The goal is to build a rich, interconnected knowledge graph that helps the AI agent remember important information about users, maintain context across conversations, and make intelligent associations between concepts.
