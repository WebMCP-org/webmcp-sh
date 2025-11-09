import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono<{ Bindings: Env }>();

// Enable permissive CORS for all origins
app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowHeaders: ["*"],
  exposeHeaders: ["*"],
  credentials: true,
}));

// Add permissive headers to allow cross-origin iframe embedding
app.use("*", async (c, next) => {
  await next();

  // Allow embedding in any iframe (permissive CSP frame-ancestors)
  c.header("Content-Security-Policy", "frame-ancestors *");

  // Remove X-Frame-Options restrictions (not setting it is most permissive)
  // If explicitly needed, use ALLOWALL but CSP takes precedence

  // Permissive Cross-Origin policies
  c.header("Cross-Origin-Opener-Policy", "unsafe-none");
  c.header("Cross-Origin-Embedder-Policy", "unsafe-none");
  c.header("Cross-Origin-Resource-Policy", "cross-origin");

  // Additional permissive headers
  c.header("Access-Control-Allow-Origin", "*");
  c.header("Access-Control-Allow-Credentials", "true");
});

app.get("/api/", (c) => c.json({ name: "Cloudflare" }));

export default app;
