# `react-webmcp` - Requirements Document

## 1. Package Overview

### 1.1 Purpose
A React hook library for registering and managing Model Context Protocol (MCP) tools with type-safe schemas, async state management, and built-in error handling. Enables React applications to expose UI interactions and data operations as MCP tools that AI agents can discover and execute.

### 1.2 Target Audience
- React developers building MCP-enabled web applications
- Teams creating AI-accessible user interfaces
- Developers building browser-based MCP servers

### 1.3 Core Value Proposition
- **Type-Safe**: Full TypeScript support with Zod schema validation
- **State-Aware**: Track execution state (loading, success, error) for UI feedback
- **React-Native**: Designed for React's lifecycle, including StrictMode compatibility
- **Developer-Friendly**: Intuitive API with comprehensive examples

---

## 2. Global Object Interface

### 2.1 Expected Global Structure
The package assumes the following global object exists at runtime:

```typescript
interface ModelContextProtocol {
  registerTool<TInputSchema, TOutputSchema>(
    name: string,
    config: {
      description: string;
      inputSchema?: TInputSchema;
      outputSchema?: TOutputSchema;
      annotations?: ToolAnnotations;
    },
    handler: (input: unknown, extra: unknown) => Promise<CallToolResult>
  ): { remove: () => void };
}

declare global {
  interface Navigator {
    modelContext: ModelContextProtocol;
  }
}
```

### 2.2 Access Pattern
```typescript
// Tools register via:
window.navigator.modelContext.registerTool(name, config, handler);

// Returns an unregister object:
{ remove: () => void }
```

---

## 3. Core API Specification

### 3.1 Primary Hook: `useWebMCP`

#### Type Signature
```typescript
function useWebMCP<
  TInputSchema extends Record<string, z.ZodTypeAny> = {},
  TOutput = string
>(
  config: WebMCPConfig<TInputSchema, TOutput>
): WebMCPReturn<TOutput>
```

#### Configuration Interface
```typescript
interface WebMCPConfig<
  TInputSchema extends Record<string, z.ZodTypeAny>,
  TOutput = string
> {
  /** Tool name (e.g., 'posts_like', 'graph_navigate') */
  name: string;

  /** Human-readable description for AI consumption */
  description: string;

  /** Input parameter schemas using Zod */
  inputSchema?: TInputSchema;

  /** Output schema (optional, for validation) */
  outputSchema?: Record<string, z.ZodTypeAny>;

  /** MCP tool metadata annotations */
  annotations?: ToolAnnotations;

  /** Elicitation config for user confirmation */
  elicitation?: ElicitationConfig;

  /** The handler function that executes the tool */
  handler: (
    input: z.infer<z.ZodObject<TInputSchema>>
  ) => Promise<TOutput> | TOutput;

  /** Format output for MCP response (default: JSON.stringify) */
  formatOutput?: (output: TOutput) => string;

  /** Called when tool execution fails */
  onError?: (error: Error, input: unknown) => void;
}
```

#### Tool Annotations
```typescript
interface ToolAnnotations {
  /** Display title for the tool */
  title?: string;

  /** Is this tool read-only? (queries = true, mutations = false) */
  readOnlyHint?: boolean;

  /** Can this tool be called repeatedly without side effects? */
  idempotentHint?: boolean;

  /** Does this tool perform destructive operations? */
  destructiveHint?: boolean;

  /** Does this tool interact with external systems? */
  openWorldHint?: boolean;
}
```

#### Elicitation Configuration
```typescript
interface ElicitationConfig {
  /** Message to show the user before execution */
  message: string;

  /** Required fields to collect from user (future feature) */
  fields?: Record<string, z.ZodTypeAny>;

  /** Only elicit if this condition is true */
  when?: (input: unknown) => boolean;
}
```

#### Return Type
```typescript
interface WebMCPReturn<TOutput = unknown> {
  /** Current execution state */
  state: ToolExecutionState<TOutput>;

  /** Manually execute the tool (for testing/debugging) */
  execute: (input: unknown) => Promise<TOutput>;

  /** Reset execution state */
  reset: () => void;
}

interface ToolExecutionState<TOutput = unknown> {
  /** Is the tool currently executing? */
  isExecuting: boolean;

  /** Result from last successful execution */
  lastResult: TOutput | null;

  /** Error from last failed execution */
  error: Error | null;

  /** Total number of times executed */
  executionCount: number;
}
```

### 3.2 Helper Hook: `useWebMCPContext`

Simplified hook for read-only context exposure:

```typescript
function useWebMCPContext<T>(
  name: string,
  description: string,
  getValue: () => T
): WebMCPReturn<T>
```

---

## 4. Usage Examples

### 4.1 Basic Tool Registration

```typescript
import { useWebMCP } from 'react-webmcp';
import { z } from 'zod';

function PostsPage() {
  const likeTool = useWebMCP({
    name: 'posts_like',
    description: 'Like a post by ID. Increments the like count.',
    inputSchema: {
      postId: z.string().uuid().describe('The post ID to like'),
    },
    annotations: {
      title: 'Like Post',
      readOnlyHint: false,
      idempotentHint: true,
    },
    handler: async (input) => {
      await api.posts.like(input.postId);
      return { success: true, postId: input.postId };
    },
    formatOutput: (result) => `Post ${result.postId} liked successfully!`,
  });

  return (
    <div>
      {likeTool.state.isExecuting && <Spinner />}
      {likeTool.state.error && <ErrorAlert error={likeTool.state.error} />}
      {/* Your UI */}
    </div>
  );
}
```

### 4.2 Query Tool with Complex Schema

```typescript
const searchTool = useWebMCP({
  name: 'posts_search',
  description: 'Search posts by keyword with pagination and filtering.',
  inputSchema: {
    query: z.string().min(1).describe('Search query'),
    category: z.enum(['tech', 'design', 'business']).optional(),
    limit: z.number().min(1).max(100).default(10),
    offset: z.number().min(0).default(0),
  },
  annotations: {
    title: 'Search Posts',
    readOnlyHint: true,
    idempotentHint: true,
  },
  handler: async (input) => {
    const results = await api.posts.search({
      query: input.query,
      category: input.category,
      limit: input.limit,
      offset: input.offset,
    });
    return results;
  },
  formatOutput: (results) => {
    return `Found ${results.length} posts:\n${results
      .map((p) => `• ${p.title}`)
      .join('\n')}`;
  },
});
```

### 4.3 Context Tool for Current UI State

```typescript
import { useWebMCPContext } from 'react-webmcp';

function PostDetailPage() {
  const { postId } = useParams();
  const { data: post } = useQuery(['post', postId], () => fetchPost(postId));

  // Expose current context to AI
  useWebMCPContext(
    'context_current_post',
    'Get the currently viewed post ID and metadata',
    () => ({
      postId,
      title: post?.title,
      author: post?.author,
      tags: post?.tags,
    })
  );

  return <div>{/* Post UI */}</div>;
}
```

### 4.4 Table Manipulation Tool

```typescript
const tableControlTool = useWebMCP({
  name: 'table_entities_control',
  description: `Control the entities table UI.

Available operations:
• filter - Filter by column value
• sort - Sort by column
• search - Global search
• select - Select a row
• paginate - Change page

Examples:
  { "operation": "filter", "column": "category", "value": "skill" }
  { "operation": "sort", "column": "created_at", "order": "desc" }
  { "operation": "search", "query": "python" }`,
  inputSchema: {
    operation: z.enum(['filter', 'sort', 'search', 'select', 'paginate']),
    column: z.string().optional(),
    value: z.unknown().optional(),
    order: z.enum(['asc', 'desc']).optional(),
    query: z.string().optional(),
    id: z.string().optional(),
    page: z.number().optional(),
  },
  handler: async (input) => {
    switch (input.operation) {
      case 'filter':
        setFilters({ [input.column!]: input.value });
        return { success: true, message: `Filtered by ${input.column}` };
      case 'sort':
        setSorting([{ id: input.column!, desc: input.order === 'desc' }]);
        return { success: true, message: `Sorted by ${input.column}` };
      // ... other operations
    }
  },
});
```

### 4.5 Destructive Action with Elicitation

```typescript
const deleteTool = useWebMCP({
  name: 'posts_delete',
  description: 'Delete a post permanently. This action cannot be undone.',
  inputSchema: {
    postId: z.string().uuid(),
  },
  annotations: {
    readOnlyHint: false,
    idempotentHint: false,
    destructiveHint: true,
  },
  elicitation: {
    message: 'Are you sure you want to delete this post? This cannot be undone.',
    when: () => true, // Always ask for confirmation
  },
  handler: async (input) => {
    await api.posts.delete(input.postId);
    return { success: true, deletedId: input.postId };
  },
  onError: (error, input) => {
    console.error('Failed to delete post:', error);
    toast.error(`Could not delete post: ${error.message}`);
  },
});
```

### 4.6 Navigation Tool

```typescript
function RootLayout() {
  const router = useRouter();

  useWebMCP({
    name: 'navigate',
    description: `Navigate to a different route in the application.

Available routes:
• "/" - Dashboard
• "/posts" - Posts list
• "/posts/:id" - Post detail
• "/settings" - Settings

Examples:
  { "to": "/posts" }
  { "to": "/posts/:id", "params": { "id": "123" } }
  { "to": "/posts", "search": { "filter": "popular" } }`,
    inputSchema: {
      to: z.string().describe('Route path'),
      params: z.record(z.string(), z.any()).optional(),
      search: z.record(z.string(), z.any()).optional(),
      replace: z.boolean().optional().default(false),
    },
    handler: async (input) => {
      await router.navigate({
        to: input.to,
        params: input.params,
        search: input.search,
        replace: input.replace,
      });
      return `Navigated to ${input.to}`;
    },
  });

  return <Outlet />;
}
```

### 4.7 Graph Visualization Tool

```typescript
function KnowledgeGraph() {
  const { nodes, edges } = useGraphData();
  const reactFlowInstance = useReactFlow();

  useWebMCP({
    name: 'graph_focus_node',
    description: 'Focus the graph view on a specific node and its connections.',
    inputSchema: {
      nodeId: z.string().describe('Node ID to focus on'),
      depth: z.number().min(1).max(3).default(1).describe('Connection depth'),
      zoomLevel: z.number().min(0.1).max(2).default(1),
    },
    handler: async (input) => {
      const targetNode = nodes.find((n) => n.id === input.nodeId);
      if (!targetNode) {
        throw new Error(`Node ${input.nodeId} not found`);
      }

      // Highlight connected nodes
      const connectedNodeIds = findConnectedNodes(
        input.nodeId,
        edges,
        input.depth
      );

      setNodes(
        nodes.map((n) => ({
          ...n,
          data: {
            ...n.data,
            highlighted: connectedNodeIds.has(n.id),
          },
        }))
      );

      // Zoom to focused area
      reactFlowInstance.fitView({
        nodes: nodes.filter((n) => connectedNodeIds.has(n.id)),
        padding: 0.2,
        duration: 800,
      });

      return `Focused on ${targetNode.data.label} with ${connectedNodeIds.size} connected nodes`;
    },
  });

  return <ReactFlow nodes={nodes} edges={edges} />;
}
```

### 4.8 Manual Execution for Testing

```typescript
function MyComponent() {
  const tool = useWebMCP({
    name: 'my_tool',
    description: 'Example tool',
    handler: async (input) => {
      return { result: 'success' };
    },
  });

  // Test the tool manually
  useEffect(() => {
    async function test() {
      try {
        const result = await tool.execute({ test: true });
        console.log('Tool result:', result);
      } catch (error) {
        console.error('Tool failed:', error);
      }
    }
    test();
  }, []);

  // Use state for UI feedback
  return (
    <div>
      {tool.state.isExecuting && <p>Executing...</p>}
      {tool.state.error && <p>Error: {tool.state.error.message}</p>}
      {tool.state.lastResult && <p>Success! Executed {tool.state.executionCount} times</p>}
      <button onClick={tool.reset}>Reset State</button>
    </div>
  );
}
```

---

## 5. Advanced Features

### 5.1 React StrictMode Compatibility

The package includes a built-in tool registry to prevent duplicate registrations in React StrictMode (which double-mounts components):

```typescript
// Internal registry (exported for advanced use cases)
export function isToolRegistered(name: string): boolean;
export function markToolRegistered(name: string): void;
export function markToolUnregistered(name: string): void;
export function getRegisteredTools(): string[];
export function clearRegistry(): void; // For testing
```

**Usage:**
Tools are automatically tracked to avoid SDK errors when React StrictMode causes double-mounting.

### 5.2 Dynamic Tool Configuration

Tools can use refs to update handlers without re-registration:

```typescript
function DynamicTool() {
  const [config, setConfig] = useState({ threshold: 10 });

  const tool = useWebMCP({
    name: 'dynamic_filter',
    description: 'Filter with dynamic threshold',
    inputSchema: {
      value: z.number(),
    },
    handler: async (input) => {
      // Uses latest config without re-registering the tool
      return input.value > config.threshold;
    },
  });

  // Handler updates automatically when config changes
  return <button onClick={() => setConfig({ threshold: 20 })}>
    Update Threshold
  </button>;
}
```

### 5.3 Error Handling Patterns

```typescript
const tool = useWebMCP({
  name: 'api_call',
  description: 'Call external API',
  handler: async (input) => {
    try {
      const response = await fetch('/api/data');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      // Error will be captured in tool.state.error
      // and returned as MCP error response
      throw error;
    }
  },
  onError: (error, input) => {
    // Application-level error handling
    logger.error('Tool failed', { error, input });
    toast.error(`Operation failed: ${error.message}`);
    analytics.track('tool_error', { tool: 'api_call' });
  },
});
```

---

## 6. Type Definitions Export

The package should export all relevant types for consumer use:

```typescript
// Main exports
export { useWebMCP, useWebMCPContext };

// Type exports
export type {
  WebMCPConfig,
  WebMCPReturn,
  ToolExecutionState,
  ElicitationConfig,
  ToolAnnotations,
};

// Registry utilities (advanced)
export {
  isToolRegistered,
  markToolRegistered,
  markToolUnregistered,
  getRegisteredTools,
  clearRegistry,
};

// Re-export MCP SDK types for convenience
export type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
```

---

## 7. Dependencies

### 7.1 Required Peer Dependencies
```json
{
  "react": "^18.0.0 || ^19.0.0",
  "zod": "^3.0.0"
}
```

### 7.2 Required Dependencies
```json
{
  "@modelcontextprotocol/sdk": "^1.19.0"
}
```

### 7.3 TypeScript Support
- Minimum TypeScript version: `^5.0.0`
- Includes full type definitions
- Strict mode compatible

---

## 8. Best Practices

### 8.1 Tool Naming
- Use verb-noun format: `posts_like`, `graph_navigate`, `table_filter`
- Prefix with domain: `posts_`, `comments_`, `graph_`, `table_`
- Be specific and descriptive

### 8.2 Descriptions
- Write for AI consumption
- Include examples in the description
- List available operations/parameters
- Explain return value format

### 8.3 Annotations
- Always set `readOnlyHint` (true for queries, false for mutations)
- Set `idempotentHint` (true if repeated calls are safe)
- Set `destructiveHint` for delete/permanent operations
- Set `openWorldHint` for external API calls

### 8.4 Input Schemas
- Use descriptive field names
- Add `.describe()` to all fields
- Set reasonable defaults
- Use enums for fixed options
- Validate ranges with `.min()` and `.max()`

### 8.5 Error Handling
- Throw descriptive errors
- Use `onError` for side effects (logging, toasts)
- Don't swallow errors in handler
- Return structured error responses

### 8.6 Performance
- Register tools at component level, not in loops
- Use `useMemo` for expensive schema definitions
- Don't create new tools on every render
- Clean up happens automatically on unmount

---

## 9. Testing Utilities

### 9.1 Registry Testing
```typescript
import { clearRegistry, getRegisteredTools } from 'react-webmcp';

beforeEach(() => {
  clearRegistry(); // Clear between tests
});

test('tool registration', () => {
  render(<MyComponent />);
  expect(getRegisteredTools()).toContain('my_tool_name');
});
```

### 9.2 Manual Execution Testing
```typescript
test('tool execution', async () => {
  const { result } = renderHook(() =>
    useWebMCP({
      name: 'test_tool',
      handler: async (input) => input.value * 2,
    })
  );

  const output = await result.current.execute({ value: 5 });
  expect(output).toBe(10);
  expect(result.current.state.executionCount).toBe(1);
});
```

---

## 10. Migration from Internal Implementation

For teams currently using the hook internally:

### 10.1 Import Changes
```typescript
// Before
import { useMCPTool } from '@/hooks/useMCPTool';

// After
import { useWebMCP } from 'react-webmcp';
```

### 10.2 Global Object Update
Update your MCP setup to use the new global path:

```typescript
// Before
navigator.mcp = mcpServer;

// After
navigator.modelContext = mcpServer;
```

### 10.3 API Compatibility
The API is 100% backward compatible. No code changes needed beyond imports and global object path.

---

**Document Version:** 1.0
**Last Updated:** 2025-10-26
**Status:** Ready for Implementation
