import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createFirecrawlClient } from "../../integrations/firecrawl/client";
import { createSupabaseClient } from "../../integrations/supabase/client";
import { normalizeUrl } from "../../utils/url-processing";
import { brandDiscovery } from "../lib/pipeline";
import { BrandDiscoveryRequestSchema } from "../schema";

export const brandDiscoveryRouter = new Hono<{ Bindings: Env }>();

// Brand discovery endpoint
brandDiscoveryRouter.post("/", zValidator("json", BrandDiscoveryRequestSchema), async (c) => {
  try {
    const { domain } = c.req.valid("json");

    // Initialize services
    const supabase = createSupabaseClient(c.env);
    const firecrawl = createFirecrawlClient(c.env);

    // URL normalization
    const cleanDomain = normalizeUrl(domain);
    console.log(`[Brand Discovery] Processing: ${cleanDomain}`);

    // Start the unified async pipeline
    const result = await brandDiscovery(cleanDomain, supabase, firecrawl, c.env);

    return c.json(result);
  } catch (error) {
    console.error("[Brand Discovery] Error:", error);
    return c.json(
      {
        success: false,
        error: "Brand discovery pipeline failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});
