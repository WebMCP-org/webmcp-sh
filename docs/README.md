# WebMCP Playground Documentation

Welcome to the WebMCP Playground documentation! This directory contains comprehensive guides for AI agents and developers working with the memory system.

## 📚 Documentation Index

### For AI Agents

1. **[AI Agent Tools Overview](./AI_AGENT_TOOLS_OVERVIEW.md)** ⭐ START HERE
   - Complete overview of all available MCP tools
   - Quick reference and common patterns
   - Tool combinations and best practices

2. **[SQL Tools Guide](./SQL_TOOLS_GUIDE.md)**
   - Generic database access with safety guardrails
   - Complete schema reference
   - SQL examples and patterns
   - Security features and error handling

3. **[Navigation Tools Guide](./NAVIGATION_TOOLS_GUIDE.md)**
   - Application routing and navigation
   - Route reference
   - Navigation patterns and deep linking
   - Tool combinations for user flows

### For Developers

4. **[Database README](../src/react-app/lib/db/README.md)**
   - PGlite + Drizzle architecture
   - Database utilities
   - Migration guide
   - Performance tips

## 🚀 Quick Start for AI Agents

### Available Tool Categories

1. **SQL Tools** - Direct database access
   - `sql_query` - Execute queries
   - `sql_schema` - Inspect tables
   - `sql_tables` - List tables

2. **Memory Entity Tools** - Structured knowledge
   - `memory_entities_list`
   - `memory_entities_search`
   - `memory_entities_get`
   - `memory_entities_by_tag`

3. **Memory Block Tools** - Core memories
   - `memory_blocks_list`
   - `memory_blocks_by_type`

4. **Relationship Tools** - Knowledge graph
   - `entity_relationships_get`
   - `entity_relationships_stats`

5. **Conversation Tools** - Message history
   - `conversations_list`
   - `conversation_messages_get`

6. **Navigation Tools** - UI routing
   - `navigate`
   - `list_routes`
   - `current_route`
   - `navigate_back`/`forward`

## 🎯 Common Use Cases

### Search and Navigate to Entity
```typescript
// 1. Search
const results = await sql_query({
  query: "SELECT id, name FROM memory_entities WHERE name ILIKE '%react%' LIMIT 1"
});

// 2. Navigate
await navigate({
  to: "/entities/$entityId",
  params: { entityId: results[0].id }
});
```

### Create and Link Entities
```typescript
// 1. Create entity
const entity = await sql_query({
  query: `
    INSERT INTO memory_entities (category, name, description)
    VALUES ('skill', 'TypeScript', 'Expert TypeScript knowledge')
    RETURNING id
  `
});

// 2. Create relationship
await sql_query({
  query: `
    INSERT INTO entity_relationships (from_entity_id, to_entity_id, relationship_type)
    VALUES ($1, $2, 'uses')
  `,
  params: [userId, entity[0].id]
});
```

### View in Knowledge Graph
```typescript
await navigate({
  to: "/graph",
  search: {
    focus: entityId,
    depth: "2"
  }
});
```

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React + TanStack Router
- **Database**: PostgreSQL (PGlite - WASM in browser)
- **ORM**: Drizzle
- **Validation**: Zod
- **MCP**: Model Context Protocol for AI tools

### Database Schema
- `memory_blocks` - Always-in-context memories
- `memory_entities` - Facts, preferences, skills, etc.
- `entity_relationships` - Knowledge graph
- `conversation_sessions` - Conversation threads
- `conversation_messages` - Message history
- `entity_mentions` - Usage tracking
- And more (see SQL Tools Guide)

### Data Flow
```
AI Agent → MCP Tools → Business Logic → Drizzle ORM → PGlite → IndexedDB
```

## 🔒 Safety Features

### SQL Tool Guardrails
✅ **Allowed:**
- SELECT (read operations)
- INSERT (create records)
- UPDATE (modify records)
- DELETE (with WHERE clause)

❌ **Blocked:**
- DROP TABLE/DATABASE
- TRUNCATE TABLE
- ALTER TABLE
- CREATE TABLE
- SQL injection patterns
- DELETE without WHERE

### Navigation Safety
- Route validation before navigation
- Parameter validation for dynamic routes
- Graceful error handling

## 📖 Reading Order

**For AI Agents:**
1. Start with [AI Agent Tools Overview](./AI_AGENT_TOOLS_OVERVIEW.md)
2. Deep dive into [SQL Tools Guide](./SQL_TOOLS_GUIDE.md)
3. Learn navigation in [Navigation Tools Guide](./NAVIGATION_TOOLS_GUIDE.md)

**For Developers:**
1. Review [Database README](../src/react-app/lib/db/README.md)
2. Explore `src/react-app/hooks/useMCPTool.ts` for tool creation
3. Check `src/react-app/lib/db/schema.ts` for database schema

## 🤝 Contributing

When adding new tools:
1. Create hook in `src/react-app/hooks/`
2. Register in `useMCPDatabaseTools.ts`
3. Document in appropriate guide
4. Update this README

## 🐛 Troubleshooting

### Tool not working?
- Check console for MCP registration logs
- Verify input schema matches tool definition
- Ensure database is initialized (`waitForDb()`)

### Navigation failing?
- Validate route exists with `list_routes`
- Check entity ID exists before navigating to detail page
- Verify params are UUIDs where required

### SQL errors?
- Use `sql_schema` to understand table structure
- Check `sql_tables` for available tables
- Review error message for syntax issues

## 📝 Examples

See each guide for comprehensive examples:
- **SQL**: 20+ query patterns in SQL Tools Guide
- **Navigation**: 10+ routing scenarios in Navigation Tools Guide
- **Combinations**: Tool composition patterns in Overview

## 🔗 Quick Links

- [Main README](../README.md)
- [Database Schema](../src/react-app/lib/db/schema.ts)
- [MCP Tool Hook](../src/react-app/hooks/useMCPTool.ts)
- [Route Tree](../src/react-app/routeTree.gen.ts)

---

**Happy Building! 🚀**

For questions or issues, please refer to the specific guide or check the source code in `src/react-app/`.
