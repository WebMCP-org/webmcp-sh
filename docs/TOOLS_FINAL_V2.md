# MCP Tools - Final Implementation (6 Tools)

## The Perfect Balance 🎯

We've found the sweet spot between power and convenience:
- **Not too many** (avoiding context bloat)
- **Not too few** (providing helpful conveniences)
- **Just right** (6 thoughtfully designed tools)

---

## The 6 Tools

### Core Power Tools (2)

#### 1. `sql_query` - Database Operations
Execute any SQL query with safety guardrails.

**Capabilities:**
- SELECT, INSERT, UPDATE, DELETE
- Full PostgreSQL feature set
- Safety checks for dangerous operations

**Example:**
```typescript
sql_query({
  query: `
    SELECT e.*, COUNT(r.id) as relations
    FROM memory_entities e
    LEFT JOIN entity_relationships r ON e.id = r.from_entity_id
    GROUP BY e.id
    ORDER BY relations DESC
    LIMIT 10
  `
})
```

---

#### 2. `navigate` - Routing & Navigation
Navigate to any route in the application.

**Capabilities:**
- Simple and dynamic routes
- Search params, hash navigation
- History replacement
- Built-in validation

**Example:**
```typescript
navigate({
  to: "/entities/$entityId",
  params: { entityId: "uuid" },
  search: { tab: "relationships" }
})
```

---

### Convenience Tools (4)

These save the AI from writing boilerplate queries repeatedly.

#### 3. `get_schema` - Schema Introspection
Get table schema(s) without writing information_schema queries.

**Why it's useful:**
- Saves typing the same query repeatedly
- Can fetch multiple tables at once
- Better formatted output

**Example:**
```typescript
get_schema({
  tables: ["memory_entities", "entity_relationships"]
})

// Returns:
{
  "memory_entities": [
    { "column_name": "id", "data_type": "uuid", "is_nullable": "NO" },
    { "column_name": "name", "data_type": "text", "is_nullable": "NO" },
    ...
  ],
  "entity_relationships": [...]
}
```

**Alternative (using sql_query):**
```typescript
// More verbose, but possible
sql_query({
  query: `
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'memory_entities'
  `
})
```

---

#### 4. `list_tables` - Discover Tables
List all available tables with column counts.

**Why it's useful:**
- Quick discovery of available tables
- No need to remember the pg_tables query

**Example:**
```typescript
list_tables({})

// Returns:
[
  { "table_name": "memory_blocks", "column_count": 11 },
  { "table_name": "memory_entities", "column_count": 17 },
  { "table_name": "entity_relationships", "column_count": 7 },
  ...
]
```

**Alternative (using sql_query):**
```typescript
sql_query({
  query: "SELECT tablename FROM pg_tables WHERE schemaname = 'public'"
})
```

---

#### 5. `get_db_stats` - Database Statistics
Get quick stats about all core tables.

**Why it's useful:**
- Instant overview of database state
- No need to write COUNT queries for each table

**Example:**
```typescript
get_db_stats({})

// Returns:
{
  "memory_blocks": 8,
  "memory_entities": 142,
  "entity_relationships": 89,
  "conversation_sessions": 12,
  "conversation_messages": 347,
  "entity_mentions": 234,
  "total_records": 832
}
```

**Alternative (using sql_query):**
```typescript
// Would need multiple queries or a complex UNION
sql_query({ query: "SELECT COUNT(*) FROM memory_blocks" })
sql_query({ query: "SELECT COUNT(*) FROM memory_entities" })
// ... etc
```

---

#### 6. `get_current_context` - Current Location
Get current route and search params.

**Why it's useful:**
- Understand user's current location
- Provide context-aware responses
- No need to infer from conversation

**Example:**
```typescript
get_current_context({})

// Returns:
{
  "pathname": "/entities/550e8400-e29b-41d4-a716-446655440000",
  "search": { "tab": "relationships" },
  "hash": "",
  "href": "/entities/550e8400-e29b-41d4-a716-446655440000?tab=relationships"
}
```

**Use case:**
- User asks: "What can you tell me about this?"
- AI uses get_current_context to see they're viewing entity details
- AI can then query that specific entity

---

## Tool Design Principles

### 1. Power Tools for Flexibility
- `sql_query` and `navigate` can handle ANY scenario
- No artificial limitations
- Full control

### 2. Convenience Tools for Ergonomics
- Save repetitive boilerplate
- Better formatted output
- Faster common operations

### 3. No Redundancy
Each tool serves a distinct purpose:
- ✅ `get_schema` - Multi-table schema fetch
- ✅ `list_tables` - Quick table discovery
- ✅ `get_db_stats` - Aggregated statistics
- ✅ `get_current_context` - Location awareness

These CAN'T be easily replicated with a single sql_query or navigate call.

---

## Comparison: Before vs After

### Original Attempt (15+ tools)
❌ Too much context bloat
❌ Redundant specialized tools
❌ Limited flexibility
❌ High maintenance

### Ultra-Minimal (2 tools)
❌ Too much boilerplate for common tasks
❌ AI has to write the same queries repeatedly
❌ Less ergonomic

### Final Design (6 tools) ✅
✅ Minimal context usage
✅ No redundancy
✅ Convenient for common operations
✅ Powerful for complex operations
✅ Low maintenance

---

## Context Window Analysis

### Token Estimates

**6 Tools:**
- `sql_query`: ~400 tokens (extensive description)
- `navigate`: ~350 tokens (includes route list)
- `get_schema`: ~80 tokens
- `list_tables`: ~60 tokens
- `get_db_stats`: ~60 tokens
- `get_current_context`: ~60 tokens

**Total: ~1,010 tokens**

**Savings vs Original (15+ tools):** ~2,500 tokens (71% reduction)

---

## Usage Patterns

### Pattern 1: Quick Database Exploration
```typescript
// 1. See what's available
const tables = await list_tables({});

// 2. Get schema for interesting tables
const schema = await get_schema({
  tables: ["memory_entities", "entity_relationships"]
});

// 3. Query specific data
const data = await sql_query({
  query: "SELECT * FROM memory_entities WHERE category = 'skill' LIMIT 5"
});
```

### Pattern 2: Context-Aware Response
```typescript
// 1. Check where user is
const context = await get_current_context({});

// 2. If they're viewing an entity
if (context.pathname.startsWith("/entities/")) {
  const entityId = context.pathname.split("/").pop();

  // 3. Query that entity
  const entity = await sql_query({
    query: `SELECT * FROM memory_entities WHERE id = '${entityId}'`
  });

  // 4. Provide relevant info
}
```

### Pattern 3: Database Health Check
```typescript
// Quick overview
const stats = await get_db_stats({});

// If entities are low, suggest creating more
if (stats.memory_entities < 10) {
  // Suggest creating more memories
}
```

---

## Other Ideas Considered

### Ideas We Added ✅
1. **`get_schema`** - Multi-table schema (ADDED)
2. **`list_tables`** - Quick table discovery (ADDED)
3. **`get_db_stats`** - Database stats (ADDED)
4. **`get_current_context`** - Location awareness (ADDED)

### Ideas We Rejected ❌
1. **`execute_batch_sql`** - Just use transactions in sql_query
2. **`search_entities`** - Just use sql_query with ILIKE
3. **`get_relationships`** - Just use sql_query with JOIN
4. **`create_entity`** - Just use sql_query with INSERT
5. **`update_entity`** - Just use sql_query with UPDATE

**Why rejected:** These don't add value. They're just wrappers around SQL that limit flexibility.

### Ideas Worth Considering (Future)
1. **`execute_in_transaction`** - Batch multiple queries atomically
2. **`export_data`** - Export table data as JSON/CSV
3. **`import_data`** - Import data from JSON/CSV
4. **`validate_query`** - Dry-run query validation

---

## Files Modified

### `/src/react-app/hooks/useMCPSQLTool.ts`
- Added `get_schema` tool (multi-table schema fetch)
- Added `list_tables` tool (table discovery)
- Added `get_db_stats` tool (database statistics)
- Modified helper function to support multiple tables

### `/src/react-app/hooks/useMCPNavigationTool.ts`
- Added `get_current_context` tool (location awareness)

### `/src/react-app/hooks/useMCPDatabaseTools.ts`
- Remains minimal (19 lines)
- Registers both tool sets

---

## Build Status

✅ **All builds successful**
✅ **Zero TypeScript errors in our tools**
✅ **All pre-existing errors unchanged**

---

## Summary

### The 6 Tools
1. **`sql_query`** - Database power tool
2. **`navigate`** - Navigation power tool
3. **`get_schema`** - Schema introspection helper
4. **`list_tables`** - Table discovery helper
5. **`get_db_stats`** - Statistics helper
6. **`get_current_context`** - Location helper

### Design Goals Achieved
✅ **Minimal** - Only 6 tools (vs 15+)
✅ **Powerful** - Can handle any scenario
✅ **Convenient** - Common tasks are easy
✅ **Ergonomic** - Well-designed APIs
✅ **Non-redundant** - Each tool has unique value

### The Philosophy
> "Provide power tools for flexibility, and convenience tools for ergonomics. Never add a tool that's just a wrapper around another tool unless it provides significant value."

---

**Final Result: 6 thoughtfully designed tools that balance power, convenience, and context efficiency.** 🎯
