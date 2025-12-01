import '@mcp-b/global';
import '@mcp-b/embedded-agent/web-component';
import * as Sentry from '@sentry/react';
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import "./index.css";
import { seedDatabase } from "./lib/db/seed";
import { waitForDb } from "./lib/db/database";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create router early so it can be passed to Sentry
const router = createRouter({ routeTree });

// Initialize Sentry
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
const environment = import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE;
const isDevelopment = environment === 'development';

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment,
    sendDefaultPii: true,
    integrations: [
      Sentry.tanstackRouterBrowserTracingIntegration(router),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: isDevelopment ? 1.0 : 0.2,
    tracePropagationTargets: [
      /^\/api\//,
      /^https:\/\/.*\.workers\.dev/,
      /^https:\/\/webmcp\.sh/,
    ],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    ignoreErrors: [
      /^chrome-extension:\/\//,
      /^moz-extension:\/\//,
      'NetworkError',
      'Failed to fetch',
    ],
  });
}

// Wrap everything in an async IIFE to handle initialization
(async () => {
  try {
    await waitForDb();

    // Seed database with initial data (only runs once)
    await seedDatabase();

    const rootElement = document.getElementById("root");

    if (!rootElement) {
      throw new Error("Root element not found");
    }

    if (!rootElement.innerHTML) {
      const root = createRoot(rootElement);
      root.render(
        <ErrorBoundary>
          <RouterProvider router={router} />
        </ErrorBoundary>
      );
    }
  } catch (error) {
    console.error("[WebMCP] Failed to initialize:", error);

    // Report initialization errors to Sentry
    Sentry.captureException(error, {
      tags: { phase: 'initialization' },
    });

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
