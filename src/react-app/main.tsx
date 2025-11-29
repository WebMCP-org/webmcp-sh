import '@mcp-b/global';
import '@mcp-b/embedded-agent/web-component';
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import "./index.css";
import { seedDatabase } from "./lib/db/seed";
import { waitForDb } from "./lib/db/database";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Wrap everything in an async IIFE to handle initialization
(async () => {
  try {
    await waitForDb();

    // Seed database with initial data (only runs once)
    await seedDatabase();

    // Create router and mount app
    const router = createRouter({ routeTree });
    const rootElement = document.getElementById("root");

    if (!rootElement) {
      throw new Error("Root element not found");
    }

    if (!rootElement.innerHTML) {
      const root = createRoot(rootElement);
      root.render(<RouterProvider router={router} />);
    }
  } catch (error) {
    console.error("[WebMCP] Failed to initialize:", error);

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
