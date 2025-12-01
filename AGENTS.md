## FOR AGENTS
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Development standards and best practices

## Quick Navigation

### Project Overview
- **[README.md](./README.md)** - What this project does, quick start, and tech stack
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Development standards and best practices

### Source Code

#### Core Application
- **[src/react-app/](./src/react-app/)** - Main React application
  - `components/` - UI components
  - `hooks/` - React hooks (including MCP tool hooks)
  - `lib/` - Utilities and core libraries
  - `routes/` - Application routes
  - `types/` - TypeScript type definitions

#### Database Layer
- **[src/react-app/lib/db/](./src/react-app/lib/db/)** - PGlite + Drizzle database
  - `schema.ts` - Table definitions and Zod schemas
  - `database.ts` - PGlite instance and setup
  - `queries/` - Reusable query functions

#### MCP Integration
- **[src/react-app/lib/webmcp/](./src/react-app/lib/webmcp/)** - WebMCP client library
- **[src/react-app/hooks/](./src/react-app/hooks/)** - MCP tool hooks

#### Worker
- **[src/worker/](./src/worker/)** - Cloudflare Worker entry point

### Testing
- **[e2e/](./e2e/)** - Playwright E2E tests

### Forked Components
- **[src/react-app/components/CustomRepl/](./src/react-app/components/CustomRepl/)** - Forked PGlite REPL (see README for attribution)

## Common Development Tasks

### Running the Project
```bash
pnpm install                # Install dependencies
pnpm dev                    # Start dev server (http://localhost:5173)
pnpm db:generate            # Generate migrations after schema changes
pnpm db:studio              # Open Drizzle Studio
```

### Code Quality
```bash
pnpm lint       # Lint the codebase
pnpm check      # Full check: typecheck, build, and dry-run deploy
```

### Testing
```bash
pnpm test           # Run all E2E tests
pnpm test:ui        # Interactive Playwright UI
pnpm test:headed    # See browser while testing
pnpm test:debug     # Debug mode
```

## Key Technologies

- **TypeScript 5.8** - Type-safe development
- **React 19** - UI framework
- **Vite 7** - Build tool and dev server
- **Tailwind CSS 4** - Styling
- **Drizzle ORM** - Database operations
- **PGlite** - In-browser PostgreSQL
- **Playwright** - E2E testing
- **Cloudflare Workers** - Edge deployment

## Development Standards

Before making changes, review **[CONTRIBUTING.md](./CONTRIBUTING.md)** for:
- Type safety requirements
- Single source of truth principles
- Modularity patterns
- Code cleanliness standards
