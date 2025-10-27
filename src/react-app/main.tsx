import '@mcp-b/global';
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import "./index.css";
import { mcpServer, transport } from "./lib/webmcp/index.ts";
import { seedDatabase } from "./lib/db/seed";
import {tab_guard} from "./lib/db/tab-guard.ts";
import { waitForDb } from "./lib/db/database";
import { routeTree } from "./routeTree.gen";

(async () => {
  try {
    tab_guard.on_change((is_primary, has_other_tabs) => {
      console.log(`Tab guard state changed: is_primary=${is_primary}, has_other_tabs=${has_other_tabs}`);
    });

    await mcpServer.connect(transport);
    navigator.mcp = mcpServer;

    await waitForDb();
    await seedDatabase();

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
    console.error("[main.tsx] Failed to initialize application:", error);

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
