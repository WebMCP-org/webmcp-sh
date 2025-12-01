## FOR AGENTS
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Development standards and best practices for AI agents

## Quick Navigation

### Project Overview
- **[README.md](./README.md)** - What this project does, quick start, and tech stack
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Development standards and best practices for AI agents

### Architecture & Implementation
- **[docs/MCP_TOOLS_ARCHITECTURE.md](./docs/MCP_TOOLS_ARCHITECTURE.md)** - MCP tools architecture and design
- **[docs/SCHEMA.md](./docs/SCHEMA.md)** - Database schema documentation
- **[docs/AUDIT_LOG_SYSTEM.md](./docs/AUDIT_LOG_SYSTEM.md)** - Audit logging system

### Feature Documentation
- **[docs/MEMORY_SYSTEM_SUMMARY.md](./docs/MEMORY_SYSTEM_SUMMARY.md)** - Memory system overview
- **[docs/SQL_TOOLS_GUIDE.md](./docs/SQL_TOOLS_GUIDE.md)** - SQL tools usage guide
- **[docs/NAVIGATION_TOOLS_GUIDE.md](./docs/NAVIGATION_TOOLS_GUIDE.md)** - Navigation tools guide
- **[docs/TOOL_QUICK_REFERENCE.md](./docs/TOOL_QUICK_REFERENCE.md)** - Quick reference for all tools

### Testing
- **[e2e/README.md](./e2e/README.md)** - End-to-end testing with Playwright

### Component Documentation
- **[src/react-app/components/CustomRepl/README.md](./src/react-app/components/CustomRepl/README.md)** - Custom REPL component
- **[src/react-app/lib/db/README.md](./src/react-app/lib/db/README.md)** - Database library documentation

## Common Development Tasks

### Running the Project
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev                    # http://localhost:5173

# Database operations
pnpm db:generate            # Generate migrations
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

See **[CONTRIBUTING.md](./CONTRIBUTING.md)** for detailed development standards.

## Key Technologies

- **TypeScript 5.8.3** - Type-safe development
- **React 19.1.0** - UI framework
- **Vite 7.x** - Build tool and dev server
- **Tailwind CSS 4.x** - Styling
- **Drizzle ORM** - Database operations
- **PGlite** - In-browser PostgreSQL
- **Playwright** - E2E testing
- **Cloudflare Workers** - Edge deployment

## File Locations

### Adding MCP Tools
- Tool implementations: `src/react-app/lib/mcp/`
- Tool schemas: Define with Zod in tool files

### Database Changes
- Schema definitions: `src/react-app/lib/db/schema.ts`
- Migrations: Run `pnpm db:generate` after schema changes

### Adding UI Components
- Components: `src/react-app/components/`
- Pages: `src/react-app/pages/`
- Hooks: `src/react-app/hooks/`

## Development Standards

Before making changes, review **[CONTRIBUTING.md](./CONTRIBUTING.md)** for:
- Type safety requirements
- Single source of truth principles
- Modularity patterns
- Code cleanliness standards
- Documentation requirements

---

**Remember**: This file is a navigation hub only. All detailed information lives in the linked documentation to maintain a single source of truth.
