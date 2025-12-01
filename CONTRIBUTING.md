# Contributing Guide for AI Agents

This guide outlines the development standards and best practices for AI assistants contributing to this codebase. Our philosophy prioritizes type safety, single source of truth, modularity, and clean, self-documenting code.

## Core Principles

### 0. Adhere to the principles of working with legacy codebases
 * Deeply investigate and understand existing code before making changes.
 * Adhere to existing coding styles and patterns.
 * Minimize changes to working code; prioritize stability.
 * Read documentation, check that it is accurate, and update it if it is not

### 1. Type Safety First

**Always leverage TypeScript's type system fully:**

✅ **Good:**
```typescript
interface ServerConnection {
  id: string;
  url: string;
  status: 'connected' | 'disconnected' | 'connecting';
  lastPing: Date | null;
}

function validateConnection(conn: ServerConnection): boolean {
  return conn.status === 'connected' && conn.lastPing !== null;
}
```

❌ **Bad:**
```typescript
function validateConnection(conn: any) {
  return conn.status === 'connected';
}
```

**Guidelines:**
- Never use `any` - use `unknown` if type is truly unknown, then narrow it
- Prefer union types over enums for string constants
- Use strict TypeScript settings (already configured in tsconfig files)
- Leverage type inference but annotate function signatures
- Use Zod for runtime validation (already used throughout the codebase)

**Verify types:** Run `pnpm check` before committing.

### 2. Single Source of Truth

**Never duplicate information - always reference the canonical source.**

✅ **Good:**
```typescript
/**
 * MCP Tool categories
 * See: src/react-app/lib/mcp for implementations
 */
export const TOOL_CATEGORIES = ['memory', 'navigation', 'sql'] as const;
```

❌ **Bad:**
```typescript
// Duplicating tool list that already exists elsewhere
export const TOOL_CATEGORIES = ['memory', 'navigation', 'sql'];
```

**Guidelines:**
- Configuration lives in one place (e.g., `vite.config.ts`, `drizzle.config.ts`)
- Constants are exported from a single module and imported elsewhere
- Types are defined once and shared via imports
- Documentation references other docs rather than duplicating content

**This applies to documentation too:**
- README.md has the project overview
- AGENTS.md links to source code (not duplicating it)
- Keep documentation close to the code it describes

### 3. Modularity

**Write small, focused, reusable modules with clear boundaries.**

✅ **Good:**
```typescript
// src/react-app/lib/mcp/validation.ts - Pure validation logic
export function validateToolParams(schema: ZodSchema, params: unknown): Result {
  // Logic only, no UI or side effects
}

// src/react-app/components/ToolExecutor.tsx - UI component
import { validateToolParams } from '../lib/mcp/validation';

export function ToolExecutor() {
  const result = validateToolParams(schema, params);
  // Render UI
}
```

❌ **Bad:**
```typescript
// Everything in one file
export function ToolExecutor() {
  // Validation logic mixed with UI
  const validate = () => { /* ... */ };
  // Render UI
}
```

**Guidelines:**
- One responsibility per file/function
- Separate concerns: logic, UI, API, types
- Components should be composable and testable
- Pure functions for business logic
- Side effects isolated to specific modules

**File organization:**
```
src/
├── react-app/
│   ├── components/    # React components (UI only)
│   ├── lib/           # Pure utility functions
│   │   ├── db/        # Database schemas and operations
│   │   └── mcp/       # MCP client implementation
│   ├── hooks/         # React hooks (isolated logic)
│   └── pages/         # Application pages
├── server/            # Backend server code
└── shared/            # Shared types and utilities
```

### 4. Code Cleanliness

**Code should be self-documenting. Use JSDoc for public APIs, not inline comments.**

✅ **Good:**
```typescript
/**
 * Execute an MCP tool with the given parameters
 *
 * @param toolName - Name of the tool to execute
 * @param params - Tool parameters matching the tool's schema
 * @returns Tool execution result or error
 *
 * @example
 * ```ts
 * const result = await executeTool('memory_store', {
 *   key: 'user-pref',
 *   value: { theme: 'dark' }
 * });
 * ```
 */
export async function executeTool(toolName: string, params: unknown): Promise<ToolResult> {
  // Implementation
}
```

❌ **Bad:**
```typescript
export async function executeTool(toolName: string, params: unknown) {
  // Get the tool from registry
  const tool = getToolFromRegistry(toolName);

  // Validate the params
  const validated = tool.schema.parse(params);

  // Execute and return
  return await tool.handler(validated);
}
```

**Guidelines:**
- Write clear function/variable names instead of comments
- Use JSDoc for all exported functions, classes, and types
- Include `@param`, `@returns`, and `@example` in JSDoc
- No inline comments explaining "what" - code should be clear
- Only use inline comments for "why" if truly necessary (rare)
- Keep functions small and focused (easier to understand without comments)

**JSDoc best practices:**
- Document the interface, not the implementation
- Include examples for complex APIs
- Link to related documentation: `@see src/react-app/lib/mcp`
- Keep it concise but complete

## Practical Guidelines

### Adding New Features

**Before writing code:**
1. Check existing patterns in the codebase
2. Review relevant source code and README.md
3. Ensure the feature fits the existing architecture
4. Identify where types, logic, and UI should live

**When writing code:**
1. Define TypeScript types/interfaces first
2. Write pure logic functions (testable)
3. Create UI components that use the logic
4. Add JSDoc to public APIs
5. Update relevant documentation if needed

**After writing code:**
```bash
pnpm lint      # Lint the code
pnpm check     # Full check: typecheck, build, and dry-run deploy
pnpm test      # Run E2E tests locally (REQUIRED before submitting PR)
```

**IMPORTANT - Running E2E Tests Before PR Submission:**

E2E tests use Playwright and should be run locally before submitting a PR:

```bash
# Run all E2E tests (REQUIRED)
pnpm test

# Useful for debugging
pnpm test:ui      # Run with Playwright UI
pnpm test:headed  # See browser while testing
pnpm test:debug   # Debug mode
```

All tests must pass before your PR can be merged.

### Modifying Existing Code

**Follow the existing patterns:**
- If file uses named exports, continue using named exports
- If types are in a separate file, add new types there
- Match the JSDoc style of the module
- Maintain the same level of abstraction

**Don't refactor unnecessarily:**
- If code works and follows these principles, leave it
- Only refactor if fixing a bug or adding a feature
- Refactoring should improve clarity, not just change style

### Documentation Updates

**When documentation needs updating:**
- Update the canonical source (e.g., README.md, not AGENTS.md)
- AGENTS.md should only link, never duplicate
- Keep documentation close to code when possible
- Prefer code comments over separate doc files

### Testing

**Write tests when:**
- Adding complex business logic
- Creating reusable utilities
- Implementing critical features

**Current test setup:**
- E2E tests: Playwright (see [e2e/README.md](./e2e/README.md))
- Unit tests: Not yet configured (would use Vitest)

## Code Review Checklist

Before submitting changes, verify:

- [ ] **Type safety**: No `any`, all types are explicit
- [ ] **No duplication**: Information lives in one place
- [ ] **Modularity**: Functions/components have single responsibility
- [ ] **Clean code**: JSDoc on public APIs, no inline comments
- [ ] **Lint passes**: `pnpm lint` succeeds with no errors
- [ ] **Build succeeds**: `pnpm check` completes without errors
- [ ] **E2E tests pass**: `pnpm test` runs successfully
- [ ] **Documentation updated**: If changing APIs or architecture
- [ ] **Follows patterns**: Matches existing code style and structure

## Common Patterns

### Database Operations (Drizzle + PGlite)

```typescript
/**
 * Store a key-value pair in the memory store
 * Uses PGlite for in-browser persistence
 */
export async function storeMemory(key: string, value: unknown): Promise<void> {
  await db.insert(memoryTable).values({
    key,
    value: JSON.stringify(value),
    createdAt: new Date()
  });
}
```

### React Component Structure

```typescript
/**
 * Server connection card with real-time status
 * Displays connection info and provides disconnect action
 */
export function ServerCard({ server }: ServerCardProps) {
  // State
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');

  // Logic (extracted to hooks or lib/)
  const { connect, disconnect } = useServerConnection(server.id);

  // Render
  return <div>{/* UI */}</div>;
}
```

### MCP Tool Execution

```typescript
/**
 * Handle tool execution errors gracefully
 * Always return valid response even on error
 */
try {
  const result = await executeTool(toolName, params);
  return { success: true, data: result };
} catch (error) {
  console.error('Tool execution failed:', error);
  return {
    success: false,
    error: error instanceof Error ? error.message : 'Unknown error'
  };
}
```

## Resources

### Primary Documentation
- [README.md](./README.md) - Project overview and quick start
- [AGENTS.md](./AGENTS.md) - Navigation hub pointing to source code

### External Resources
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [Zod Documentation](https://zod.dev/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [PGlite Documentation](https://pglite.dev/)

## Questions?

If you're unsure about a pattern or approach:
1. Check existing code for similar patterns
2. Look at existing components for complete examples
3. When in doubt, prioritize clarity and type safety

---

**Remember**: These principles exist to make the codebase maintainable and understandable. When followed consistently, they reduce bugs, improve collaboration, and make the code self-documenting.
