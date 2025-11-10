import type FirecrawlApp from "@mendable/firecrawl-js";
import type { ExtractResponse } from "@mendable/firecrawl-js";
import {
  categorizeUrls,
  type FirecrawlMapLink,
} from "../../utils/url-processing";
import type { TypedSupabaseClient } from "../supabase/client";
import { getBrandUrls, upsertBrandUrls } from "../supabase/queries/brand-urls";
import type { BrandUrlInsert } from "../supabase/types";

// Extract schema response matching our BRAND_EXTRACT_SCHEMA
export interface ExtractSchemaResponse {
  company_name?: string;
  description?: string;
  industry?: string;
  logo_url?: string;
  [key: string]: any;
}

// Typed version of ExtractResponse with our schema
export interface TypedExtractResponse extends Omit<ExtractResponse, 'data'> {
  data?: ExtractSchemaResponse;
}

// Use Firecrawl SDK's built-in ExtractResponse type
export type ExtractJobStatus = ExtractResponse;

export interface JobConfig {
  brandId: string;
  domain: string;
  webhookUrl: string;
}

/**
 * Brand extraction schema for consistent data structure
 */
const BRAND_EXTRACT_SCHEMA = {
  type: "object",
  properties: {
    company_name: {
      type: "string",
      description: "The official company or brand name",
    },
    description: {
      type: "string",
      description: "A brief description of what the company does",
    },
    industry: {
      type: "string",
      description: "The industry or sector the company operates in",
    },
    logo_url: {
      type: "string",
      description: "URL to the company logo image",
    },
  },
  required: ["company_name", "description"],
} as const;

/**
 * Start an async extract job (returns job ID immediately)
 */
export async function startExtract(
  firecrawl: FirecrawlApp,
  domain: string,
): Promise<{ success?: boolean; id?: string; error?: string }> {
  const url = domain.startsWith("http") ? domain : `https://${domain}`;

  try {
    const result = await firecrawl.startExtract({
      urls: [url],
      prompt:
        "Extract comprehensive brand information including company name, description, industry, and logo URL.",
      schema: BRAND_EXTRACT_SCHEMA,
      ignoreInvalidURLs: true,
    });

    return {
      success: result.success,
      id: result.id,
      error: result.error,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get the status of an extract job
 */
export async function getExtractStatus(
  firecrawl: FirecrawlApp,
  jobId: string,
): Promise<TypedExtractResponse> {
  try {
    console.log(`[Extract] Checking status for job: ${jobId}`);
    const extractResponse = await firecrawl.getExtractStatus(jobId);

    console.log(`[Extract] Raw Firecrawl response:`, {
      success: extractResponse.success,
      status: extractResponse.status,
      hasData: !!extractResponse.data,
      hasError: !!extractResponse.error,
    });

    // Type the response properly
    return {
      ...extractResponse,
      data: extractResponse.data as ExtractSchemaResponse | undefined,
    };
  } catch (error) {
    console.error(`[Extract] Exception getting status for ${jobId}:`, error);
    return {
      success: false,
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error",
      data: undefined,
    };
  }
}

/**
 * Map website URLs and store in database
 */
export async function startMapping(
  config: JobConfig,
  firecrawl: FirecrawlApp,
  supabase: TypedSupabaseClient,
): Promise<{ mapJobId?: string; urlsFound?: number; error?: string }> {
  try {
    const baseUrl = `https://${config.domain}`;
    console.log(`🗺️ [Map] Starting website mapping for ${baseUrl}`);

    const mapResult = await firecrawl.map(baseUrl, {
      limit: 20,
      sitemap: "include",
      includeSubdomains: true,
    });

    if (!mapResult?.links || mapResult.links.length === 0) {
      console.error(`❌ [Map] No URLs discovered for ${baseUrl}`);
      return { error: "No URLs discovered during mapping" };
    }

    console.log(`✅ [Map] Discovered ${mapResult.links.length} URLs`);

    // Categorize URLs using advanced categorization
    const categorizedUrls = categorizeUrls(mapResult.links);

    // Flatten and store URLs in brand_urls table
    const urlsToStore: Array<Omit<BrandUrlInsert, "brand_id">> = [];
    for (const [category, urls] of Object.entries(categorizedUrls)) {
      urls.forEach((link: FirecrawlMapLink) => {
        urlsToStore.push({
          url: link.url,
          title: link.title || link.url.split("/").pop() || "Page",
          description: link.description,
          discovered_via: "map",
          category: category as "info" | "blog" | "docs" | "shop" | "other",
          priority: link.priority || 50,
          metadata: {
            domain: config.domain,
            mapJobResult: true,
            advancedCategory: category,
            firecrawlCategory: link.category,
          },
        });
      });
    }

    await upsertBrandUrls(supabase, config.brandId, urlsToStore);
    console.log(`✅ [Map] Stored ${urlsToStore.length} URLs in database`);

    return {
      mapJobId: `map-${Date.now()}`,
      urlsFound: mapResult.links.length,
    };
  } catch (error) {
    console.error(`🚨 [Map] Error:`, error);
    return { error: error instanceof Error ? error.message : "Mapping failed" };
  }
}

/**
 * Start async batch scrape for selected URLs
 */
export async function startBatchScrape(
  config: JobConfig,
  firecrawl: FirecrawlApp,
  urls: string[],
): Promise<{
  batchScrapeJobId?: string;
  urlsSelected?: number;
  error?: string;
}> {
  try {
    console.log(`🔥 [BatchScrape] Starting scrape for ${urls.length} URLs`);

    const batchScrapeJob = await firecrawl.startBatchScrape(urls, {
      options: {
        formats: ["markdown", "images"],
        onlyMainContent: true,
        timeout: 30000,
        blockAds: true,
        removeBase64Images: true,
      },
      ignoreInvalidURLs: true,
      webhook: {
        url: config.webhookUrl,
        metadata: {
          brandId: config.brandId,
          domain: config.domain,
          step: "batch_scrape",
        },
        events: ["page", "completed", "failed"],
      },
    });

    if (!batchScrapeJob?.id) {
      console.error(`❌ [BatchScrape] Failed to start:`, batchScrapeJob);
      return { error: "Failed to start batch scrape" };
    }

    console.log(`✅ [BatchScrape] Job started: ${batchScrapeJob.id}`);

    return {
      batchScrapeJobId: batchScrapeJob.id,
      urlsSelected: urls.length,
    };
  } catch (error) {
    console.error(`🚨 [BatchScrape] Error:`, error);
    return {
      error: error instanceof Error ? error.message : "Batch scrape failed",
    };
  }
}

/**
 * Combined pipeline function that orchestrates map + batch scrape
 */
export async function startBrandPipeline(
  config: JobConfig,
  firecrawl: FirecrawlApp,
  supabase: TypedSupabaseClient,
): Promise<{ mapJobId?: string; batchScrapeJobId?: string; error?: string }> {
  try {
    console.log(
      `🚀 [Pipeline] Starting map + scrape pipeline for ${config.domain}`,
    );

    // Step 1: Map website URLs
    const mapResult = await startMapping(config, firecrawl, supabase);

    if (mapResult.error) {
      return { error: mapResult.error };
    }

    // Step 2: Get all stored URLs for scraping (no selection logic)
    const storedUrls = await getBrandUrls(supabase, config.brandId);
    const topUrls = storedUrls.map((url) => url.url);

    if (topUrls.length === 0) {
      return {
        mapJobId: mapResult.mapJobId,
        error: "No URLs available for scraping",
      };
    }

    // Step 3: Start batch scrape
    const scrapeResult = await startBatchScrape(config, firecrawl, topUrls);

    if (scrapeResult.error) {
      return {
        mapJobId: mapResult.mapJobId,
        error: scrapeResult.error,
      };
    }

    console.log(`✅ [Pipeline] Complete pipeline started successfully`);
    console.log(`   🗺️ Map: ${mapResult.urlsFound} URLs found`);
    console.log(
      `   🔥 Scrape: ${scrapeResult.urlsSelected} URLs queued (all discovered URLs)`,
    );

    return {
      mapJobId: mapResult.mapJobId,
      batchScrapeJobId: scrapeResult.batchScrapeJobId,
    };
  } catch (error) {
    console.error(`🚨 [Pipeline] Error:`, error);
    return {
      error: error instanceof Error ? error.message : "Pipeline failed",
    };
  }
}
