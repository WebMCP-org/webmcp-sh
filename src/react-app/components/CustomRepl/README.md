# CustomRepl - Forked PGlite REPL with Programmatic Execution

This is a customized fork of [@electric-sql/pglite-repl](https://github.com/electric-sql/pglite/tree/main/packages/pglite-repl) v0.2.28, licensed under Apache 2.0.

## Why We Forked

The original PGlite REPL is a fantastic interactive terminal component, but we needed the ability to programmatically execute SQL queries through the UI from our AI MCP tools. This allows:

1. **Visual Feedback**: AI-executed queries appear in the REPL UI alongside manual queries
2. **Complete Audit Trail**: All queries (AI + manual) are logged to the database
3. **Unified Interface**: Users see exactly what the AI is doing in real-time

## Key Modifications

### 1. Added Programmatic Execution API

We converted the component to use `forwardRef` and exposed a `executeQuery` method via `useImperativeHandle`:

```typescript
export interface ReplRef {
  executeQuery: (query: string) => Promise<Response>
}

export const Repl = forwardRef<ReplRef, ReplProps>(function Repl({ ... }, ref) {
  useImperativeHandle(ref, () => ({
    executeQuery: async (query: string): Promise<Response> => {
      const response = await runQuery(query, pg)
      setOutput((prev) => [...prev, response])
      // ... scroll to bottom, update schema
      return response
    },
  }), [pg, disableUpdateSchema])
})
```

### 2. Integration with MCP SQL Tool

The SQL REPL route exposes a global ref:

```typescript
// src/react-app/routes/_dashboard.sql-repl.tsx
export let replRef: ReplRef | null = null

function SQLReplPage() {
  const localReplRef = useRef<ReplRef>(null)

  useEffect(() => {
    replRef = localReplRef.current
    return () => { replRef = null }
  }, [])

  return <Repl ref={localReplRef} ... />
}
```

The SQL tool uses dynamic import to access the ref:

```typescript
// src/react-app/hooks/useMCPSQLTool.ts
const { replRef } = await import('@/routes/_dashboard.sql-repl');

if (replRef) {
  // Execute through REPL UI - shows in UI AND returns results
  response = await replRef.executeQuery(query);
} else {
  // Fallback: Execute directly if REPL not mounted
  response = await pg_lite.query(query);
}
```

## File Structure

```
src/react-app/components/CustomRepl/
├── LICENSE           # Apache 2.0 license from original project
├── README.md         # This file
├── Repl.tsx          # Main REPL component (MODIFIED)
├── ReplResponse.tsx  # Query response display
├── ReplTable.tsx     # Table rendering for results
├── Repl.css          # Styles
├── types.ts          # TypeScript types
├── utils.ts          # Query execution utilities
├── sqlSupport.ts     # SQL autocomplete & \d commands
└── index.ts          # Exports
```

## Usage

```typescript
import { Repl, type ReplRef } from '@/components/CustomRepl'

function MyComponent() {
  const replRef = useRef<ReplRef>(null)

  const runAIQuery = async () => {
    if (replRef.current) {
      const response = await replRef.current.executeQuery('SELECT * FROM users')
      console.log('Query result:', response)
    }
  }

  return <Repl ref={replRef} pg={pg_lite} theme="auto" />
}
```

## License

Apache License 2.0 - Same as the original PGlite REPL project.

See [LICENSE](./LICENSE) for full text.

## Attribution

Original code: [@electric-sql/pglite-repl](https://github.com/electric-sql/pglite) by Electric DB Limited
Modified by: WebMCP-org for AI agent integration
