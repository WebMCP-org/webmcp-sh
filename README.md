<div align="center">

![WebMCP](./public/mcp-b-logo.png)

# WebMCP.sh

**Web-based MCP playground with in-browser PostgreSQL**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev)

[Quick Start](#quick-start) • [Features](#features) • [Tech Stack](#tech-stack) • [Contributing](#contributing)

</div>

---

## Try It Live

**Live Demo:** [webmcp.sh](https://webmcp.sh)

---

## What This Does

WebMCP.sh is a development playground for the Model Context Protocol. Connect to MCP servers, execute tools, browse resources, and test your implementations—all from the browser.

**Key capabilities:**
- Connect to multiple MCP servers simultaneously
- Execute tools with real-time parameter validation
- Browse and manage server resources
- In-browser PostgreSQL database (PGlite) for persistence
- Interactive SQL REPL for database exploration

## Quick Start

```bash
# Clone and install
git clone https://github.com/WebMCP-org/webmcp-sh.git
cd webmcp-sh
pnpm install

# Start development server
pnpm dev
```

Open http://localhost:5173

### Requirements

- Node.js 18+
- pnpm 9+

## Features

### MCP Integration
- **Multi-server connections** - Connect to multiple MCP servers via WebSocket
- **Tool execution** - Run server tools with schema validation
- **Resource browser** - Explore and manage server resources
- **Prompt templates** - Create and reuse common prompts

### In-Browser Database
- **PGlite** - Full PostgreSQL running in the browser via WASM
- **Drizzle ORM** - Type-safe database operations
- **SQL REPL** - Interactive query interface with autocomplete
- **IndexedDB persistence** - Data survives browser sessions

### Developer Experience
- **Dark mode** - Comfortable viewing in any lighting
- **Real-time updates** - Live connection status and streaming
- **Debug mode** - Detailed logging for troubleshooting

## Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 19, TypeScript 5.8, Vite 7 |
| Styling | Tailwind CSS 4, shadcn/ui |
| Database | PGlite, Drizzle ORM |
| Testing | Playwright |
| Deployment | Cloudflare Workers |

## Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm preview          # Preview production build

# Code Quality
pnpm lint             # Run ESLint
pnpm check            # Typecheck + build + dry-run deploy

# Database
pnpm db:generate      # Generate migrations
pnpm db:studio        # Open Drizzle Studio

# Testing
pnpm test             # Run E2E tests
pnpm test:ui          # Interactive Playwright UI
```

## Project Structure

```
src/
├── react-app/
│   ├── components/   # UI components
│   ├── hooks/        # React hooks (MCP tools, etc.)
│   ├── lib/
│   │   ├── db/       # PGlite + Drizzle database
│   │   └── webmcp/   # WebMCP client library
│   └── routes/       # Application routes
└── worker/           # Cloudflare Worker
```

## Deployment

### Cloudflare Workers

```bash
pnpm build
pnpm deploy
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development standards.

## Resources

- [Model Context Protocol](https://modelcontextprotocol.io/) - Official MCP documentation
- [MCP Specification](https://spec.modelcontextprotocol.io/) - Technical specification
- [PGlite](https://pglite.dev/) - In-browser PostgreSQL
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

**Website:** [webmcp.sh](https://webmcp.sh) • **GitHub:** [WebMCP-org/webmcp-sh](https://github.com/WebMCP-org/webmcp-sh)
