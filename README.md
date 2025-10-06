# WebMCP.sh

A modern web-based Model Context Protocol (MCP) playground for testing and developing MCP servers and clients.

## Overview

WebMCP.sh provides a comprehensive development environment for working with the Model Context Protocol, featuring:

- **Interactive MCP Server Testing**: Connect to and test MCP servers directly from your browser
- **Real-time Communication**: Live WebSocket connections for instant feedback
- **Multi-Server Support**: Connect to multiple MCP servers simultaneously
- **Tool Execution**: Execute server tools with custom parameters
- **Resource Management**: Browse and manage server resources
- **Prompt Templates**: Use and create prompt templates for common tasks

## Features

### Core Functionality
- 🔌 **WebSocket-based MCP Client**: Full-featured MCP client implementation
- 🛠️ **Tool Testing**: Interactive tool execution with parameter validation
- 📚 **Resource Browser**: Explore available server resources
- 📝 **Prompt Management**: Create and manage reusable prompts
- 🔄 **Real-time Updates**: Live connection status and message streaming

### Developer Experience
- 🎨 **Modern UI**: Clean, responsive interface built with React and Tailwind CSS
- 🌙 **Dark Mode Support**: Comfortable viewing in any lighting condition
- 📊 **Connection Monitoring**: Real-time server connection status
- 🔍 **Debug Mode**: Detailed logging for troubleshooting

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: Zustand
- **Database**: SQLite with Drizzle ORM
- **Build Tools**: Vite, ESBuild
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/WebMCP-org/webmcp-sh.git
cd webmcp-sh
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Initialize the database:
```bash
pnpm db:push
```

5. Start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
webmcp-sh/
├── src/
│   ├── react-app/          # React application
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and libraries
│   │   │   ├── db/         # Database schemas and operations
│   │   │   └── mcp/        # MCP client implementation
│   │   └── pages/          # Application pages
│   ├── server/             # Backend server (if applicable)
│   └── shared/             # Shared types and utilities
├── public/                 # Static assets
├── data/                   # Local database files
└── package.json
```

## Usage

### Connecting to an MCP Server

1. Navigate to the Servers page
2. Click "Add Server"
3. Enter the server WebSocket URL
4. Configure any required authentication
5. Click "Connect"

### Testing Tools

1. Select a connected server
2. Browse available tools in the Tools tab
3. Click on a tool to view its schema
4. Fill in required parameters
5. Click "Execute" to run the tool

### Managing Resources

1. Open the Resources tab for a connected server
2. Browse available resources
3. Click on a resource to view its contents
4. Use the built-in editor for modifications

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm db:push` - Push database schema changes
- `pnpm db:studio` - Open Drizzle Studio for database management

### Contributing

We welcome contributions! Please see our contributing guidelines for more information.

### Testing

Run the test suite:
```bash
pnpm test
```

## Deployment

The application can be deployed to any static hosting service that supports SPAs:

1. Build the application:
```bash
pnpm build
```

2. Deploy the `dist` folder to your hosting service

### Deployment Options

- **Vercel**: Zero-config deployment with automatic HTTPS
- **Netlify**: Simple drag-and-drop deployment
- **GitHub Pages**: Free hosting for public repositories
- **Self-hosted**: Deploy to your own server with nginx/Apache

## Security Considerations

- Always use HTTPS in production
- Implement proper authentication for MCP servers
- Validate all user inputs
- Keep dependencies updated
- Use environment variables for sensitive configuration

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built on the [Model Context Protocol](https://modelcontextprotocol.io) specification
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)

## Support

For issues, questions, or suggestions, please open an issue on GitHub or contact the maintainers.

---

**Website**: [webmcp.sh](https://webmcp.sh)
**Documentation**: [docs.webmcp.sh](https://docs.webmcp.sh)
**GitHub**: [github.com/webmcp/webmcp-sh](https://github.com/webmcp/webmcp-sh)
