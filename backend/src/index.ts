import { routeAgentRequest } from "agents";
import { Hono } from "hono";
import { TedixAgent } from "./agents/tedix-agent";
import { apiRouter } from "./api";
import { processPendingExtractJobs } from "./jobs/cron";
import { setGlobalBrandContext, TedixMCP } from "./mcp";
import {
  brandContextMiddleware,
  getBrandContext,
} from "./middleware/brand-context";

// Create main Hono app
const app = new Hono<{ Bindings: Env }>();

// Mount API routes
app.route("/api", apiRouter);

// Agent routes - handles WebSocket connections to TedixAgent
app.all("/agents/*", async (c) => {
  const agentResponse = await routeAgentRequest(c.req.raw, c.env);
  return agentResponse || new Response("Agent not found", { status: 404 });
});

// MCP endpoint with brand context middleware
app.use("/mcp", brandContextMiddleware);
app.all("/mcp", (c) => {
  // Get brand context from middleware and set globally
  const brandContext = getBrandContext(c);
  setGlobalBrandContext(brandContext);

  // Use the standard serve method
  return TedixMCP.serve("/mcp").fetch(c.req.raw, c.env, c.executionCtx);
});

// Main UI endpoint
app.get("/", async (c) => {
  return c.text("Hello World");
});

// Health check
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "tedix-backend",
    version: "2.0.0",
  });
});

// Export the default handler
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    try {
      return app.fetch(request, env, ctx);
    } catch (error) {
      console.error("Application error:", error);
      return new Response(
        JSON.stringify({
          error: "Internal server error",
          details: error instanceof Error ? error.message : "Unknown error",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  },

  // Cron job to process pending extract jobs every minute
  async scheduled(
    _controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    console.log(
      `🕒 [Cron] Processing pending extract jobs at ${new Date().toISOString()}`,
    );

    ctx.waitUntil(processPendingExtractJobs(env));
  },
};

// Export classes for external use
export { TedixAgent, TedixMCP };
