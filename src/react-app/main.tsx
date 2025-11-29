import '@mcp-b/global';
import '@mcp-b/embedded-agent/web-component';
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import "./index.css";
import { mcpServer, transport } from "./lib/webmcp/index.ts";
import { seedDatabase } from "./lib/db/seed";
import {tab_guard} from "./lib/db/tab-guard.ts";
import { waitForDb } from "./lib/db/database";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

console.log("[main.tsx] Starting application initialization...");

// Wrap everything in an async IIFE to handle initialization
(async () => {
  try {
    console.log("[main.tsx] Setting up tab guard...");
    tab_guard.on_change((is_primary, has_other_tabs) => {
      console.log(`Tab guard state changed: is_primary=${is_primary}, has_other_tabs=${has_other_tabs}`);
    });

    console.log("[main.tsx] Connecting to MCP server...");
    // Initialize MCP server
    await mcpServer.connect(transport);
    navigator.mcp = mcpServer;
    console.log("[main.tsx] MCP server connected");

    console.log("[main.tsx] Waiting for database and migrations...");
    // Wait for database migrations to complete before seeding
    // Note: waitForDb() already runs migrations internally
    await waitForDb();
    console.log("[main.tsx] Database ready and migrations complete");

    console.log("[main.tsx] Seeding database...");
    // Seed database with initial data (only runs once)
    await seedDatabase();
    console.log("[main.tsx] Database seeded");

    console.log("[main.tsx] Creating router...");
    // Create a new router instance
    const router = createRouter({ routeTree });

    console.log("[main.tsx] Mounting React app...");
    // Render the app
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new Error("Root element not found");
    }

    if (!rootElement.innerHTML) {
      const root = createRoot(rootElement);
      root.render(
          <RouterProvider router={router} />
      );
      console.log("[main.tsx] React app mounted successfully");
    } else {
      console.log("[main.tsx] Root element already has content, skipping mount");
    }
  } catch (error) {
    console.error("[main.tsx] Failed to initialize application:", error);

    // Show error in the UI
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; font-family: monospace; color: red;">
          <h2>Failed to initialize application</h2>
          <pre>${error instanceof Error ? error.message : String(error)}</pre>
          <p>Check the browser console for more details.</p>
        </div>
      `;
    }
  }
})();
