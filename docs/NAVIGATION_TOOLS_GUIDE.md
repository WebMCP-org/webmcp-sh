# Navigation Tools Guide for AI Agents

This guide explains how AI agents can navigate through the application using MCP navigation tools.

## Overview

The application uses **TanStack Router** for client-side routing. AI agents have access to navigation tools that allow them to:
- Navigate to different pages
- Read current route information
- Navigate browser history (back/forward)
- List all available routes

## Available Tools

### 1. `navigate`
Navigate to a different route in the application.

**Input Schema:**
```typescript
{
  to: string;              // Route path (required)
  params?: Record<string, any>;   // Route parameters for dynamic routes
  search?: Record<string, any>;   // URL search/query parameters
  hash?: string;           // URL hash fragment
  replace?: boolean;       // Replace history instead of push (default: false)
}
```

**Examples:**

Simple navigation:
```json
{
  "to": "/entities"
}
```

Navigation with route params:
```json
{
  "to": "/entities/$entityId",
  "params": { "entityId": "550e8400-e29b-41d4-a716-446655440000" }
}
```

Navigation with search params:
```json
{
  "to": "/entities",
  "search": { "filter": "skills", "sort": "importance" }
}
```

Navigation with hash:
```json
{
  "to": "/about",
  "hash": "team-section"
}
```

Replace current history entry:
```json
{
  "to": "/graph",
  "replace": true
}
```

---

### 2. `list_routes`
List all available routes with descriptions.

**Input Schema:**
```typescript
{} // No parameters required
```

**Output:**
```
AVAILABLE ROUTES:

• /
  Dashboard home - Memory overview and quick stats

• /entities
  Browse all memory entities (facts, preferences, skills, etc.)

• /entities/$entityId
  View details of a specific entity (replace $entityId with actual UUID)
  Parameters: entityId

• /graph
  Knowledge graph visualization showing entity relationships

• /memory-blocks
  View and edit always-in-context memory blocks

• /about
  About this application

• /showcase
  Component showcase and demo page
```

---

### 3. `current_route`
Get information about the currently active route.

**Input Schema:**
```typescript
{} // No parameters required
```

**Output:**
```json
{
  "path": "/entities/550e8400-e29b-41d4-a716-446655440000",
  "params": {
    "entityId": "550e8400-e29b-41d4-a716-446655440000"
  },
  "search": {
    "filter": "skills"
  },
  "hash": "",
  "href": "/entities/550e8400-e29b-41d4-a716-446655440000?filter=skills"
}
```

---

### 4. `navigate_back`
Navigate back to the previous page in browser history.

**Input Schema:**
```typescript
{} // No parameters required
```

**Output:**
```
✓ Navigated back to previous page
```

---

### 5. `navigate_forward`
Navigate forward to the next page in browser history (if available).

**Input Schema:**
```typescript
{} // No parameters required
```

**Output:**
```
✓ Navigated forward to next page
```

---

## Route Reference

### Main Routes

#### `/` - Dashboard Home
The main dashboard showing memory overview and quick stats.

**Use case:** Default landing page, overview of all memories

---

#### `/entities` - Entity Browser
Browse all memory entities with filtering and sorting.

**Use case:** Explore facts, preferences, skills, rules, contexts, people, projects, and goals

**Search params:**
- `filter` - Filter by category (e.g., "skills", "facts")
- `sort` - Sort order (e.g., "importance", "recent")
- `search` - Text search query

**Example:**
```json
{
  "to": "/entities",
  "search": { "filter": "preferences", "sort": "importance" }
}
```

---

#### `/entities/$entityId` - Entity Detail
View detailed information about a specific entity.

**Use case:** Deep dive into a single entity, view relationships, mentions, and metadata

**Route params:**
- `entityId` (UUID) - The entity's unique identifier

**Example:**
```json
{
  "to": "/entities/$entityId",
  "params": { "entityId": "550e8400-e29b-41d4-a716-446655440000" }
}
```

---

#### `/graph` - Knowledge Graph
Interactive visualization of the knowledge graph showing entity relationships.

**Use case:** Visual exploration of how entities connect, find patterns in memory

**Search params:**
- `focus` - Center graph on specific entity ID
- `depth` - Relationship depth to display (default: 2)
- `category` - Filter by entity category

**Example:**
```json
{
  "to": "/graph",
  "search": {
    "focus": "550e8400-e29b-41d4-a716-446655440000",
    "depth": "3",
    "category": "skills"
  }
}
```

---

#### `/memory-blocks` - Memory Blocks
View and edit always-in-context memory blocks (core memories).

**Use case:** Manage the 5-10 most important pieces of information kept in every context

**Search params:**
- `blockType` - Filter by block type (e.g., "user_profile", "agent_persona")
- `edit` - Open edit mode for specific block ID

**Example:**
```json
{
  "to": "/memory-blocks",
  "search": { "blockType": "user_profile" }
}
```

---

#### `/about` - About Page
Information about the application.

**Use case:** Learn about the memory system architecture

---

#### `/showcase` - Component Showcase
Demo page showing UI components and features.

**Use case:** Testing, development, feature demonstration

---

## Common Navigation Patterns

### 1. Navigate to Entity from Search Result

When you find an entity via SQL or search tools, navigate to its detail page:

```typescript
// 1. Search for entity
const result = await sql_query({
  query: "SELECT id, name FROM memory_entities WHERE name ILIKE '%python%' LIMIT 1"
});

// 2. Navigate to entity detail
const entityId = result[0].id;
await navigate({
  to: "/entities/$entityId",
  params: { entityId }
});
```

---

### 2. Navigate to Graph Focused on Entity

Show an entity in the knowledge graph:

```typescript
await navigate({
  to: "/graph",
  search: {
    focus: entityId,
    depth: "2"
  }
});
```

---

### 3. Filter Entities by Category

Navigate to entities page with a specific filter:

```typescript
await navigate({
  to: "/entities",
  search: {
    filter: "skills",
    sort: "importance"
  }
});
```

---

### 4. Edit a Memory Block

Navigate to memory blocks and open edit mode:

```typescript
await navigate({
  to: "/memory-blocks",
  search: {
    blockType: "user_profile",
    edit: blockId
  }
});
```

---

### 5. Navigation with Context Awareness

Before navigating, check current route to provide context:

```typescript
// Get current location
const current = await current_route();

// Navigate conditionally
if (current.path !== "/entities") {
  await navigate({ to: "/entities" });
}
```

---

## Best Practices

### 1. Always Validate Entity IDs
Before navigating to `/entities/$entityId`, ensure the entity ID exists:

```typescript
// Bad
await navigate({ to: "/entities/$entityId", params: { entityId: "unknown" } });

// Good
const entity = await sql_query({
  query: "SELECT id FROM memory_entities WHERE id = $1",
  params: [entityId]
});

if (entity.length > 0) {
  await navigate({ to: "/entities/$entityId", params: { entityId } });
} else {
  throw new Error("Entity not found");
}
```

### 2. Use Search Params for Filtering
Leverage search params to pre-filter views:

```typescript
await navigate({
  to: "/entities",
  search: {
    filter: "preferences",
    search: "dark mode"
  }
});
```

### 3. Provide User Context
When navigating, explain why:

```typescript
// Good UX
console.log("Navigating to entity detail page to show full information...");
await navigate({ to: "/entities/$entityId", params: { entityId } });
```

### 4. Use Replace for Corrections
If you navigate to the wrong place, use replace to avoid cluttering history:

```typescript
// Oops, wrong entity
await navigate({
  to: "/entities/$entityId",
  params: { entityId: correctId },
  replace: true  // Don't add wrong navigation to history
});
```

### 5. Combine with Other Tools
Navigation works great with other MCP tools:

```typescript
// 1. Query database
const skills = await sql_query({
  query: "SELECT * FROM memory_entities WHERE category = 'skill' ORDER BY importance_score DESC LIMIT 1"
});

// 2. Navigate to top skill
if (skills.length > 0) {
  await navigate({
    to: "/entities/$entityId",
    params: { entityId: skills[0].id }
  });
}
```

---

## Error Handling

### Invalid Route
```json
Error: Invalid route: "/invalid-path". Use the "list_routes" tool to see available routes.
```

**Solution:** Use `list_routes` to see valid paths.

### Missing Route Params
```json
Error: Navigation failed: Missing required param 'entityId' for route '/entities/$entityId'
```

**Solution:** Provide all required params in the `params` object.

### Invalid Entity ID
```json
Error: Navigation failed: Entity not found
```

**Solution:** Query database first to verify entity exists before navigating.

---

## Advanced Usage

### Deep Linking
Create shareable URLs with search params:

```typescript
await navigate({
  to: "/graph",
  search: {
    focus: "550e8400-e29b-41d4-a716-446655440000",
    depth: "3",
    category: "skills",
    layout: "force-directed"
  }
});

// Results in: /graph?focus=550e8400-e29b-41d4-a716-446655440000&depth=3&category=skills&layout=force-directed
```

### Conditional Navigation Flow
Build complex navigation flows:

```typescript
// 1. Check current location
const current = await current_route();

// 2. Navigate based on context
if (current.path === "/") {
  // From home, go to entities
  await navigate({ to: "/entities" });
} else if (current.path.startsWith("/entities")) {
  // From entities, go to graph
  await navigate({ to: "/graph" });
} else {
  // From anywhere else, go home
  await navigate({ to: "/" });
}
```

### Navigation with State
Use hash for in-page navigation:

```typescript
await navigate({
  to: "/about",
  hash: "architecture-section"
});
// Results in: /about#architecture-section
```

---

## Debugging

### Enable Debug Logging
```typescript
// Check current route
const current = await current_route();
console.log("Current route:", current);

// List all routes
const routes = await list_routes();
console.log("Available routes:", routes);
```

### Test Navigation
```typescript
try {
  await navigate({ to: "/entities" });
  console.log("✓ Navigation successful");
} catch (error) {
  console.error("✗ Navigation failed:", error.message);
}
```

---

## Tool Combination Examples

### Example 1: Find and View Entity

```typescript
// 1. Search for entity
const results = await sql_query({
  query: "SELECT id, name, category FROM memory_entities WHERE name ILIKE '%typescript%' LIMIT 1"
});

// 2. Navigate to entity
if (results.length > 0) {
  await navigate({
    to: "/entities/$entityId",
    params: { entityId: results[0].id }
  });
}
```

### Example 2: Create Entity and Navigate

```typescript
// 1. Create new entity
const newEntity = await sql_query({
  query: `
    INSERT INTO memory_entities (category, name, description, importance_score)
    VALUES ('skill', 'React Hooks', 'Expert knowledge of React Hooks', 90)
    RETURNING id
  `
});

// 2. Navigate to the new entity
await navigate({
  to: "/entities/$entityId",
  params: { entityId: newEntity[0].id }
});
```

### Example 3: Browse by Category

```typescript
// 1. Get category stats
const stats = await sql_query({
  query: "SELECT category, COUNT(*) as count FROM memory_entities GROUP BY category ORDER BY count DESC"
});

// 2. Navigate to most populous category
await navigate({
  to: "/entities",
  search: { filter: stats[0].category }
});
```

---

**Remember:** Navigation tools enable AI agents to guide users through the application, creating a seamless and intuitive experience. Always combine navigation with context from other tools (SQL, entity queries) for intelligent user flows.
