# AI Agent Tools Overview

This document provides a comprehensive overview of all MCP (Model Context Protocol) tools available to AI agents in the WebMCP Playground application.

## Table of Contents

1. [Introduction](#introduction)
2. [Tool Categories](#tool-categories)
3. [Quick Reference](#quick-reference)
4. [Tool Combinations](#tool-combinations)
5. [Best Practices](#best-practices)

---

## Introduction

The WebMCP Playground provides AI agents with a rich set of tools to interact with a browser-based memory system. The application uses:

- **PostgreSQL (PGlite)** - Full Postgres running in the browser via WASM
- **TanStack Router** - Type-safe client-side routing
- **MCP Tools** - Structured interfaces for AI interaction

AI agents can read, write, query, and navigate through an interconnected knowledge graph of memories, entities, relationships, and conversations.

---

## Tool Categories

### 1. SQL Tools (Generic Database Access)
Direct SQL access with safety guardrails and advanced query capabilities.

**Tools:**
- `get_database_info` - Get complete schema, patterns, and best practices (call ONCE at start)
- `sql_query` - Execute SELECT, INSERT, UPDATE, DELETE queries with full PostgreSQL power

**Documentation:** [SQL Tools Guide](./SQL_TOOLS_GUIDE.md)

**🚀 Key Capability: Write POWERFUL queries!**
- Use JOINs to combine multiple tables in ONE query
- Use CTEs (WITH clause) for complex multi-step operations
- Use json_agg() to create nested data structures
- Use window functions for per-group analytics
- Use array operations for tag filtering

**Workflow:**
1. Call `get_database_info` once - loads ALL schemas, patterns, and best practices into context
2. Use `sql_query` for all database operations - reference the loaded info

**Use cases:**
- Complex queries across multiple tables (use JOINs!)
- Batch operations (use CTEs with multiple INSERTs)
- Custom analytics (use window functions)
- Knowledge graph traversal (join entities + relationships)
- Relevance scoring (combine importance + frequency + recency)

**Safety features:**
- ✅ Allows: SELECT, INSERT, UPDATE, DELETE
- ❌ Blocks: DROP, TRUNCATE, ALTER, CREATE, SQL injection
- ⚠️ Warns: UPDATE/DELETE without WHERE clause

---

### 2. Memory Entity Tools (Structured Knowledge)
High-level operations on memory entities (facts, preferences, skills, etc.).

**Tools:**
- `memory_entities_list` - List all entities with optional filters
- `memory_entities_search` - Full-text search across entities
- `memory_entities_get` - Get entity details by ID
- `memory_entities_by_tag` - Filter entities by tag
- `memory_entities_top_mentioned` - Most frequently mentioned entities

**Use cases:**
- Discovery and exploration
- Semantic search
- Importance-based retrieval
- Tag-based organization

---

### 3. Memory Block Tools (Always-in-Context Information)
Manage core memories that stay in context (5-10 most important facts).

**Tools:**
- `memory_blocks_list` - List all memory blocks
- `memory_blocks_by_type` - Filter by block type

**Block types:**
- `user_profile` - Key user information
- `agent_persona` - AI agent's personality/role
- `current_goals` - Active objectives
- `context` - Current situational context

**Use cases:**
- Core identity and preferences
- Mission-critical information
- Current active context

---

### 4. Entity Relationship Tools (Knowledge Graph)
Explore and manage connections between entities.

**Tools:**
- `entity_relationships_get` - Get relationships for an entity
- `entity_relationships_stats` - Relationship statistics

**Relationship types:**
- `uses` - Tool/skill usage
- `related_to` - General association
- `works_on` - Project involvement
- `knows` - Person relationships
- Custom types supported

**Use cases:**
- Knowledge graph traversal
- Finding related concepts
- Understanding entity context
- Network analysis

---

### 5. Conversation Tools (Message History)
Access conversation history and context.

**Tools:**
- `conversations_list` - List conversation sessions
- `conversation_messages_get` - Get messages from a session

**Use cases:**
- Context retrieval
- Conversation summarization
- Historical reference
- Temporal context

---

### 6. Entity Mention Tools (Usage Tracking)
Track where entities appear in conversations.

**Tools:**
- `entity_mentions_get` - Get all mentions of an entity

**Use cases:**
- Usage patterns
- Context extraction
- Relevance scoring
- Temporal analysis

---

### 7. Navigation Tools (Application Routing)
Navigate through the application UI.

**Tools:**
- `navigate` - Go to a specific route
- `list_routes` - Show all available routes
- `current_route` - Get current location
- `navigate_back` - Browser back
- `navigate_forward` - Browser forward

**Documentation:** [Navigation Tools Guide](./NAVIGATION_TOOLS_GUIDE.md)

**Available routes:**
- `/` - Dashboard home
- `/entities` - Entity browser
- `/entities/$entityId` - Entity detail
- `/graph` - Knowledge graph visualization
- `/memory-blocks` - Memory block editor
- `/about` - About page
- `/showcase` - Component showcase

**Use cases:**
- Guided user journeys
- Contextual navigation
- Deep linking
- User flow orchestration

---

## Quick Reference

### Most Common Operations

#### Search for Information
```typescript
// Option 1: Structured search
await memory_entities_search({
  query: "python programming",
  category: "skill"
});

// Option 2: Simple SQL search
await sql_query({
  query: `
    SELECT name, description, importance_score
    FROM memory_entities
    WHERE category = 'skill'
      AND (name ILIKE '%python%' OR description ILIKE '%python%')
    ORDER BY importance_score DESC
    LIMIT 10
  `
});

// 🚀 Option 3: POWERFUL search with relevance scoring
await sql_query({
  query: `
    SELECT
      e.*,
      (e.importance_score * 0.4 +
       e.mention_count * 2 +
       CASE WHEN e.last_mentioned > NOW() - INTERVAL '7 days' THEN 30 ELSE 0 END) as relevance_score
    FROM memory_entities e
    WHERE e.name ILIKE '%python%' OR e.description ILIKE '%python%' OR 'python' = ANY(e.tags)
    ORDER BY relevance_score DESC
    LIMIT 10
  `
});
```

#### Create New Memory
```typescript
await sql_query({
  query: `
    INSERT INTO memory_entities (
      category, name, description, tags, importance_score
    ) VALUES (
      'preference',
      'Dark mode UI',
      'User strongly prefers dark mode interfaces',
      ARRAY['ui', 'accessibility'],
      85
    ) RETURNING id, name
  `
});
```

#### Navigate to Entity
```typescript
// 1. Find entity
const result = await sql_query({
  query: "SELECT id FROM memory_entities WHERE name = 'Python Programming'"
});

// 2. Navigate to detail page
await navigate({
  to: "/entities/$entityId",
  params: { entityId: result[0].id }
});
```

#### Explore Relationships
```typescript
// Simple: Get entity relationships
const relationships = await entity_relationships_get({
  entityId: "entity-uuid-here"
});

// 🚀 POWERFUL: Get entity WITH all relationships in ONE query using json_agg
await sql_query({
  query: `
    SELECT
      e.id, e.name, e.description, e.category,
      json_agg(json_build_object(
        'relationship', r.relationship_type,
        'entity', re.name,
        'category', re.category,
        'strength', r.strength
      )) FILTER (WHERE r.id IS NOT NULL) as relationships
    FROM memory_entities e
    LEFT JOIN entity_relationships r ON e.id = r.from_entity_id
    LEFT JOIN memory_entities re ON r.to_entity_id = re.id
    WHERE e.id = 'entity-uuid-here'
    GROUP BY e.id
  `
});
```

---

## Tool Combinations

### Pattern 1: Search → View → Navigate

Create intelligent user journeys by combining tools:

```typescript
// 1. Search for relevant entities
const skills = await memory_entities_search({
  query: "web development",
  category: "skill"
});

// 2. Get top result
const topSkill = skills[0];

// 3. Get relationships
const related = await entity_relationships_get({
  entityId: topSkill.id
});

// 4. Navigate to graph view focused on this skill
await navigate({
  to: "/graph",
  search: {
    focus: topSkill.id,
    depth: "2"
  }
});
```

### Pattern 2: Create → Link → Display

Build connected knowledge:

```typescript
// 1. Create a new project entity
const project = await sql_query({
  query: `
    INSERT INTO memory_entities (category, name, description)
    VALUES ('project', 'WebMCP Enhancement', 'Improving AI memory capabilities')
    RETURNING id
  `
});

// 2. Link to existing skills
await sql_query({
  query: `
    INSERT INTO entity_relationships (from_entity_id, to_entity_id, relationship_type, strength)
    SELECT
      $1,
      id,
      'uses',
      8
    FROM memory_entities
    WHERE category = 'skill' AND name IN ('TypeScript', 'React', 'PostgreSQL')
  `,
  params: [project[0].id]
});

// 3. Navigate to project view
await navigate({
  to: "/entities/$entityId",
  params: { entityId: project[0].id }
});
```

### Pattern 3: Analyze → Filter → Navigate

Intelligent data exploration:

```typescript
// 1. Analyze entity distribution
const stats = await sql_query({
  query: `
    SELECT
      category,
      COUNT(*) as count,
      AVG(importance_score) as avg_importance
    FROM memory_entities
    GROUP BY category
    ORDER BY avg_importance DESC
  `
});

// 2. Find top category
const topCategory = stats[0].category;

// 3. Navigate to filtered view
await navigate({
  to: "/entities",
  search: {
    filter: topCategory,
    sort: "importance"
  }
});
```

### Pattern 4: Context-Aware Memory Retrieval

Use current location to provide relevant information:

```typescript
// 1. Check where user is
const currentRoute = await current_route();

// 2. Get context-specific memories
if (currentRoute.path === "/graph") {
  // On graph page - get highly connected entities
  const central = await sql_query({
    query: `
      SELECT e.id, e.name, COUNT(r.id) as connections
      FROM memory_entities e
      LEFT JOIN entity_relationships r ON (e.id = r.from_entity_id OR e.id = r.to_entity_id)
      GROUP BY e.id
      ORDER BY connections DESC
      LIMIT 5
    `
  });
} else if (currentRoute.path.startsWith("/entities")) {
  // On entities page - get recent entities
  const recent = await sql_query({
    query: `
      SELECT * FROM memory_entities
      ORDER BY last_mentioned DESC
      LIMIT 10
    `
  });
}
```

---

## Best Practices

### 1. Choose the Right Tool

**Use structured tools** when:
- You need simple, common operations
- Type safety is important
- You want guided interfaces

**Use SQL tools** when:
- You need complex queries
- Joining multiple tables
- Custom aggregations
- Bulk operations

**Use navigation tools** when:
- Guiding user through the app
- Creating multi-step flows
- Context-dependent routing

### 2. Always Validate Before Navigation

```typescript
// Bad
await navigate({
  to: "/entities/$entityId",
  params: { entityId: someId }
});

// Good
const entity = await sql_query({
  query: "SELECT id FROM memory_entities WHERE id = $1",
  params: [someId]
});

if (entity.length > 0) {
  await navigate({
    to: "/entities/$entityId",
    params: { entityId: someId }
  });
} else {
  throw new Error("Entity not found");
}
```

### 3. Use Transactions for Multi-Step Operations

```typescript
// When creating related entities, use SQL transactions
await sql_query({
  query: `
    BEGIN;

    INSERT INTO memory_entities (category, name) VALUES ('person', 'Alice')
    RETURNING id as person_id;

    INSERT INTO memory_entities (category, name) VALUES ('project', 'Project X')
    RETURNING id as project_id;

    INSERT INTO entity_relationships (from_entity_id, to_entity_id, relationship_type)
    VALUES (
      (SELECT id FROM memory_entities WHERE name = 'Alice'),
      (SELECT id FROM memory_entities WHERE name = 'Project X'),
      'works_on'
    );

    COMMIT;
  `
});
```

### 4. Leverage Search Params

```typescript
// Create rich, bookmarkable URLs
await navigate({
  to: "/entities",
  search: {
    filter: "skills",
    sort: "importance",
    search: "programming",
    minScore: "70"
  }
});
```

### 5. Handle Errors Gracefully

```typescript
try {
  const result = await sql_query({ query: "SELECT * FROM memory_entities" });

  if (result.length === 0) {
    // Handle empty results
    await navigate({ to: "/entities" });
  } else {
    // Process results
    await navigate({
      to: "/entities/$entityId",
      params: { entityId: result[0].id }
    });
  }
} catch (error) {
  console.error("Operation failed:", error);
  // Fallback behavior
  await navigate({ to: "/" });
}
```

### 6. Build Contextual Experiences

```typescript
// Check current context before acting
const current = await current_route();
const recentEntities = await memory_entities_top_mentioned({ limit: 5 });

// Provide contextual suggestions
if (current.path === "/" && recentEntities.length > 0) {
  // On home page - suggest viewing recent entity
  await navigate({
    to: "/entities/$entityId",
    params: { entityId: recentEntities[0].id }
  });
}
```

---

## Performance Tips

1. **Use LIMIT in queries** - Always constrain result sets
2. **Leverage indexes** - The schema has indexes on common fields
3. **Batch related operations** - Use CTEs and joins instead of multiple queries
4. **Cache route information** - Use `list_routes` once, then reference
5. **Use replace for corrections** - Avoid cluttering browser history

---

## Security Considerations

1. **SQL tools block dangerous operations** - DROP, TRUNCATE, ALTER are blocked
2. **Always use WHERE clauses** - DELETE without WHERE is blocked
3. **Validate UUIDs** - Ensure entity IDs are valid before use
4. **Sanitize user input** - When building dynamic queries, use parameterized queries

---

## Summary

AI agents have powerful, flexible tools to:

✅ **Read and write** structured memories
✅ **Query with SQL** for complex operations
✅ **Navigate the UI** to guide users
✅ **Build knowledge graphs** through relationships
✅ **Track context** via conversations and mentions
✅ **Provide intelligent experiences** through tool combinations

**Next steps:**
- Review [SQL Tools Guide](./SQL_TOOLS_GUIDE.md) for database operations
- Review [Navigation Tools Guide](./NAVIGATION_TOOLS_GUIDE.md) for routing
- Explore the database schema in `src/react-app/lib/db/schema.ts`
- Test tool combinations to build rich user experiences

---

**Remember:** The goal is to create an intelligent, context-aware AI agent that helps users build and navigate their personal knowledge graph. Use these tools creatively to provide value!
