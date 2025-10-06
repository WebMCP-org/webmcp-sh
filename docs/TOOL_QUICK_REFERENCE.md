# MCP Tools - Quick Reference Card

## 🎯 Two Power Tools (Use These!)

### 1. `sql_query` - Database Operations
Execute any SQL query with safety guardrails.

```typescript
// Basic query
sql_query({ query: "SELECT * FROM memory_entities LIMIT 10" })

// With conditions
sql_query({
  query: `
    SELECT id, name, description
    FROM memory_entities
    WHERE category = 'skill'
    ORDER BY importance_score DESC
    LIMIT 5
  `
})

// Joins
sql_query({
  query: `
    SELECT e.*, COUNT(r.id) as relation_count
    FROM memory_entities e
    LEFT JOIN entity_relationships r ON e.id = r.from_entity_id
    GROUP BY e.id
    ORDER BY relation_count DESC
  `
})

// Schema introspection
sql_query({
  query: `
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'memory_entities'
  `
})

// List tables
sql_query({
  query: "SELECT tablename FROM pg_tables WHERE schemaname = 'public'"
})
```

**Blocks:** DROP, TRUNCATE, ALTER, CREATE, DELETE without WHERE

---

### 2. `navigate` - Routing
Navigate to any route in the application.

```typescript
// Simple navigation
navigate({ to: "/entities" })

// With params (dynamic routes)
navigate({
  to: "/entities/$entityId",
  params: { entityId: "uuid-here" }
})

// With search params
navigate({
  to: "/entities",
  search: { filter: "skills", sort: "importance" }
})

// With hash
navigate({
  to: "/about",
  hash: "team-section"
})

// Replace history (don't add to stack)
navigate({
  to: "/graph",
  replace: true
})
```

**Available routes:**
- `/` - Dashboard home
- `/entities` - Entity browser
- `/entities/$entityId` - Entity detail
- `/graph` - Knowledge graph
- `/memory-blocks` - Memory blocks
- `/about` - About page
- `/showcase` - Showcase

---

## 📊 Database Tables

```
memory_blocks          - Core always-in-context memories
memory_entities        - Facts, preferences, skills, rules, etc.
entity_relationships   - Knowledge graph connections
conversation_sessions  - Conversation threads
conversation_messages  - Message history
entity_mentions        - Entity usage tracking
memory_episodes        - Episodic memories
memory_contexts        - Context scoping
entity_contexts        - Entity-context mappings
memory_triggers        - Associative triggers
memory_consolidations  - Memory merging
memory_conflicts       - Contradiction detection
memory_budget_logs     - Token tracking
memory_retrieval_logs  - Query analytics
```

---

## 🔥 Common Patterns

### Search & Navigate
```typescript
// 1. Find entity
const result = await sql_query({
  query: "SELECT id FROM memory_entities WHERE name ILIKE '%react%' LIMIT 1"
})

// 2. Navigate to it
await navigate({
  to: "/entities/$entityId",
  params: { entityId: result[0].id }
})
```

### Create & Link
```typescript
// 1. Create entity
const entity = await sql_query({
  query: `
    INSERT INTO memory_entities (category, name, description)
    VALUES ('skill', 'TypeScript', 'Expert TS knowledge')
    RETURNING id
  `
})

// 2. Create relationship
await sql_query({
  query: `
    INSERT INTO entity_relationships (from_entity_id, to_entity_id, relationship_type)
    VALUES ($1, $2, 'uses')
  `,
  params: [userId, entity[0].id]
})
```

### Get Entity with Relations
```typescript
await sql_query({
  query: `
    SELECT
      e.*,
      json_agg(DISTINCT jsonb_build_object(
        'type', r.relationship_type,
        'target', t.name
      )) FILTER (WHERE r.id IS NOT NULL) as relations
    FROM memory_entities e
    LEFT JOIN entity_relationships r ON e.id = r.from_entity_id
    LEFT JOIN memory_entities t ON r.to_entity_id = t.id
    WHERE e.id = 'uuid'
    GROUP BY e.id
  `
})
```

---

## 🛡️ Safety Rules

**SQL Tool:**
- ✅ SELECT, INSERT, UPDATE, DELETE
- ❌ DROP, TRUNCATE, ALTER, CREATE
- ❌ SQL injection patterns
- ❌ DELETE without WHERE

**Navigate Tool:**
- ✅ All defined routes
- ❌ Invalid routes
- ✅ Validates params/search

---

## ⚡ Pro Tips

1. **Use SQL for everything data-related** - More powerful than specialized tools
2. **Always use LIMIT** - Constrain result sets
3. **Use information_schema** - For schema introspection
4. **Combine tools** - Query then navigate
5. **Parameterize when possible** - Though PGlite has limitations

---

## 🚫 Don't Use (Legacy)

These tools still exist but are redundant:

- ❌ `memory_entities_list` → Use SQL
- ❌ `memory_entities_search` → Use SQL
- ❌ `memory_entities_get` → Use SQL
- ❌ `sql_schema` → Use information_schema
- ❌ `sql_tables` → Use pg_tables
- ❌ `list_routes` → Routes in tool description
- ❌ `current_route` → Not needed
- ❌ `navigate_back` → Use navigate with replace

---

**Remember: Less tools = More power. Master the two core tools!**
