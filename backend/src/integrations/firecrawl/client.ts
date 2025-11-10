import Firecrawl from "@mendable/firecrawl-js";

/**
 * Create a typed Firecrawl client instance
 */
export function createFirecrawlClient(env: Env): Firecrawl {
  return new Firecrawl({ apiKey: env.FIRECRAWL_API_KEY });
}
