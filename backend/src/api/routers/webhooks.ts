import { Hono } from "hono";
import { handleFirecrawlWebhook } from "../../integrations/firecrawl/webhooks";

export const webhooksRouter = new Hono<{ Bindings: Env }>();

// Firecrawl webhook endpoint - simplified to use integrated handler
webhooksRouter.post("/firecrawl", async (c) => {
  try {
    console.log("[Webhook] 🎯 Received Firecrawl webhook from:", c.req.header("User-Agent"));

    // The handler now manages signature verification internally
    const response = await handleFirecrawlWebhook(c.req.raw, c.env);

    return new Response(response.body, {
      status: response.status,
      headers: response.headers,
    });
  } catch (error) {
    console.error("[Webhook] Error handling webhook:", error);
    return c.text("Internal Server Error", 500);
  }
});
