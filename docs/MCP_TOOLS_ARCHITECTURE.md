# MCP Tools Architecture

This document describes the Model Context Protocol (MCP) tools architecture used in this application.

## Overview

The app exposes user interactions as MCP tools, allowing LLMs to interact with the application programmatically. This creates a powerful interface where AI can browse posts, like content, read comments, and more.

## Architecture

### Two-Layer Tool System

1. **Global Tools** (Database Operations)
   - Parameterized tools that work across the entire app
   - Take IDs and params as input (e.g., `postId`, `limit`, `offset`)
   - Registered once in the root component
   - Examples: `posts_list`, `posts_like`, `comments_count`

2. **Component-Scoped Tools** (Context)
   - Expose the current UI state/context
   - Help LLMs discover what the user is currently viewing
   - Registered per-route component
   - Examples: `context_current_post_id`

### Tool Design Pattern

**Global Tool Example:**
```typescript
useMCPTool({
  name: 'posts_like',
  description: 'Increment the like count for a post',
  inputSchema: {
    postId: z.string().uuid().describe('The post ID to like'),
  },
  annotations: {
    readOnlyHint: false,
    idempotentHint: true,
  },
  handler: async (input) => {
    await postQueries.incrementLikes(input.postId);
    return { success: true };
  },
})
```

**Context Tool Example:**
```typescript
useMCPContextTool(
  'context_current_post_id',
  'Get the ID of the post currently being viewed',
  () => ({ postId, title: post?.title })
)
```

## LLM Workflow

The typical workflow for an LLM interacting with the app:

1. **Discover Content**
   ```
   Call posts_list → Get list of posts with IDs
   ```

2. **Get Details**
   ```
   Call posts_get(postId) → Get full post details
   ```

3. **Take Action**
   ```
   Call posts_like(postId) → Like the post
   ```

4. **Context-Aware Actions**
   ```
   Call context_current_post_id → Discover what user is viewing
   Then use that ID with other tools
   ```

## Tool Metadata (Annotations)

All tools include MCP-standard annotations that provide hints to LLMs:

- **`readOnlyHint`**: Does the tool modify state? (queries are `true`, mutations are `false`)
- **`destructiveHint`**: Does it perform destructive updates? (deletes are `true`)
- **`idempotentHint`**: Can it be called repeatedly safely? (likes are `true`, views are `false`)
- **`openWorldHint`**: Does it interact with external systems? (`false` for local DB)

## Available Tools

### Post Tools

| Tool | Type | Description |
|------|------|-------------|
| `posts_list` | Query | List published posts with pagination |
| `posts_get` | Query | Get full post details by ID |
| `posts_search` | Query | Search posts by keyword |
| `posts_by_tag` | Query | Filter posts by tag |
| `posts_like` | Mutation | Increment like count |
| `posts_increment_views` | Mutation | Increment view count |

### Comment Tools

| Tool | Type | Description |
|------|------|-------------|
| `comments_list` | Query | Get all comments for a post |
| `comments_count` | Query | Get comment count |

### Context Tools

| Tool | Type | Description |
|------|------|-------------|
| `context_current_post_id` | Context | Get currently viewed post |

## Implementation Details

### Hook: `useMCPTool`

The core hook for registering MCP tools with full TypeScript safety and async state management.

**Features:**
- ✅ Type-safe input/output schemas with Zod
- ✅ Async execution state tracking (loading, error, success)
- ✅ Tool metadata annotations
- ✅ Elicitation support (user confirmation prompts)
- ✅ Manual execution for testing/debugging
- ✅ Error handling with MCP-compliant responses

**State Tracking:**
```typescript
const likeTool = useMCPTool({ ...config });

// Access execution state
likeTool.state.isExecuting    // boolean
likeTool.state.lastResult     // last successful result
likeTool.state.lastError      // last error
likeTool.state.executionCount // number of times executed

// Manually execute (for testing)
await likeTool.execute({ postId: '123' });

// Reset state
likeTool.reset();
```

### File Structure

```
src/react-app/
├── hooks/
│   ├── useMCPTool.ts           # Core MCP tool hook
│   ├── useMCPDatabaseTools.ts  # Global database tools
│   └── useMCPTools.ts          # Legacy (deprecated)
├── routes/
│   ├── __root.tsx              # Registers global tools
│   └── posts.$postId.tsx       # Registers context tools
```

## Future Enhancements

### 1. React Query Integration
Add caching and request deduplication:
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['posts', input.postId],
  queryFn: () => handler(input),
});
```

### 2. Elicitation UI
Show user confirmation dialogs:
```typescript
elicitation: {
  message: 'Delete this post?',
  fields: {
    confirm: z.boolean(),
  },
  when: (input) => input.destructive === true
}
```

### 3. Tool Chaining
Allow tools to call other tools:
```typescript
handler: async (input) => {
  const post = await tools.posts_get({ postId: input.postId });
  await tools.posts_like({ postId: input.postId });
  return post;
}
```

### 4. Observability
Add logging and analytics:
```typescript
onExecute: (input) => analytics.track('tool_used', { tool: name, input }),
onSuccess: (result) => console.log('Tool succeeded', result),
onError: (error) => errorTracking.capture(error),
```

## Best Practices

### DO ✅

- Use clear, descriptive tool names (`posts_like` not `like`)
- Provide detailed descriptions for LLM context
- Set appropriate annotations (readonly, idempotent, etc.)
- Return structured data that can be JSON.stringify'd
- Handle errors gracefully with user-friendly messages
- Use Zod schemas for input validation

### DON'T ❌

- Create a tool for every single component instance
- Use ambiguous names (`action1`, `doThing`)
- Skip input validation
- Return raw database objects with sensitive fields
- Forget to set `readOnlyHint` for queries
- Make destructive actions without elicitation

## Testing Tools

You can manually test tools in the browser console:

```javascript
// List posts
await navigator.mcp.callTool('posts_list', { limit: 5 });

// Get a specific post
await navigator.mcp.callTool('posts_get', {
  postId: 'uuid-here'
});

// Like a post
await navigator.mcp.callTool('posts_like', {
  postId: 'uuid-here'
});

// Get current context
await navigator.mcp.callTool('context_current_post_id', {});
```

## Summary

This architecture creates a clean, type-safe way to expose app functionality as MCP tools. The two-layer system (global + context) provides both broad capabilities and contextual awareness, while the `useMCPTool` hook handles all the complexity of async state, error handling, and MCP protocol compliance.
