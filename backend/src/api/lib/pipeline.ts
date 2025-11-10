import type FirecrawlApp from "@mendable/firecrawl-js";
import {
  startBrandPipeline,
  startExtract,
} from "../../integrations/firecrawl/queries";
import type { TypedSupabaseClient } from "../../integrations/supabase/client";
import {
  createBrand,
  getBrandByDomain,
  updateBrand,
  updateBrandDiscoveryStatus,
} from "../../integrations/supabase/queries/brands";
import type { BrandMetadata } from "../../integrations/supabase/types";
import { generateBrandSlug } from "../../utils/brand";

/**
 * Complete unified brand discovery pipeline
 * 1. Extract brand information (async)
 * 2. Map website URLs (async)
 * 3. Batch scrape selected content (async)
 * All steps return immediately, webhooks + cron handle completion
 */
export async function brandDiscovery(
  domain: string,
  supabase: TypedSupabaseClient,
  firecrawl: FirecrawlApp,
  env: Env,
) {
  try {
    console.log(
      `🚀 [Pipeline] STARTING UNIFIED BRAND DISCOVERY FOR: ${domain}`,
    );

    // Supabase client passed as parameter

    // Check if brand already exists
    console.log(`[Pipeline] Checking if brand exists for domain: ${domain}`);
    const existingBrand = await getBrandByDomain(supabase, domain);

    let brand = null;

    if (existingBrand) {
      // Update existing brand with pending status
      console.log(`[Pipeline] Updating existing brand: ${existingBrand.id}`);

      brand = await updateBrand(supabase, existingBrand.id, {
        discovery_status: "pending",
        metadata: {
          ...((existingBrand.metadata as BrandMetadata) || {}),
          worker_processed: true,
          pipeline_started_at: new Date().toISOString(),
        },
      });
    }

    // Step 1: Start async brand extraction (fast, cron will handle completion)
    console.log(
      `📡 [Pipeline] Step 1: Starting async brand extraction for ${domain}`,
    );

    const extractResult = await startExtract(firecrawl, domain);
    const extractJobId = extractResult?.id;

    if (!extractJobId) {
      console.error(
        `❌ [Pipeline] CRITICAL: Failed to start brand extraction for ${domain}`,
      );
      return { success: false, error: "Failed to start brand extraction" };
    }

    console.log(
      `✅ [Pipeline] Brand extraction job started: ${extractJobId} (cron will process completion)`,
    );

    // Create brand if doesn't exist
    if (!brand) {
      const placeholderName =
        domain.split(".")[0].charAt(0).toUpperCase() +
        domain.split(".")[0].slice(1);

      const metadata: BrandMetadata = {
        extractJobId,
        workerProcessed: true,
        pipelineStartedAt: new Date().toISOString(),
        industry: "Analyzing...",
      };

      brand = await createBrand(supabase, {
        name: placeholderName,
        slug: generateBrandSlug(placeholderName),
        primary_domain: domain,
        description: `Extracting brand information from ${domain}...`,
        logo_url: `https://logo.clearbit.com/${domain}`,
        discovery_status: "pending",
        metadata,
      });

      console.log(
        `✅ [Pipeline] Created placeholder brand: ${brand.name} (${brand.id})`,
      );
    } else {
      // Update existing brand with extract job ID
      const currentMetadata = (brand.metadata as BrandMetadata) || {};
      const updatedMetadata: BrandMetadata = {
        ...currentMetadata,
        extractJobId,
        workerProcessed: true,
        pipelineStartedAt: new Date().toISOString(),
      };

      brand = await updateBrand(supabase, brand.id, {
        discovery_status: "pending",
        metadata: updatedMetadata,
      });
    }

    // Step 2: Start async URL mapping and batch scraping
    console.log(
      `🗺️ [Pipeline] Step 2: Starting async URL mapping and batch scraping for ${domain}`,
    );

    const webhookUrl = `${env.BACKEND_URL}/api/webhook/firecrawl`;
    console.log(`[Pipeline] Using webhook URL: ${webhookUrl}`);

    const brandDiscoveryResult = await startBrandPipeline(
      {
        brandId: brand.id,
        domain,
        webhookUrl,
      },
      firecrawl,
      supabase,
    );

    if (brandDiscoveryResult.error) {
      console.error(
        `❌ [Pipeline] CRITICAL: Failed to start async pipeline for ${domain}:`,
        brandDiscoveryResult.error,
      );

      // Update brand status to failed
      await updateBrandDiscoveryStatus(supabase, brand.id, "failed");

      return {
        success: false,
        error: "Failed to start URL mapping and scraping pipeline",
        details: brandDiscoveryResult.error,
      };
    }

    console.log(
      `✅ [Pipeline] Complete async pipeline started for ${brand.name}:`,
    );
    console.log(`   🔍 Extract Job: ${extractJobId}`);
    console.log(`   🗺️ Map Job: ${brandDiscoveryResult.mapJobId || "N/A"}`);
    console.log(
      `   📄 Batch Scrape Job: ${brandDiscoveryResult.batchScrapeJobId || "N/A"}`,
    );

    return {
      success: true,
      brandId: brand.id,
      status: "extracting",
      extractJobId,
      mapJobId: brandDiscoveryResult.mapJobId,
      scrapeJobId: brandDiscoveryResult.batchScrapeJobId,
      message: `Complete brand discovery pipeline started for ${brand.name}. Processing extract, mapping, and content scraping...`,
      estimatedTime: "2-5 minutes",
      brand,
      pipeline: {
        extract: { jobId: extractJobId, status: "processing" },
        map: {
          jobId: brandDiscoveryResult.mapJobId,
          status: brandDiscoveryResult.mapJobId ? "processing" : "pending",
        },
        scrape: {
          jobId: brandDiscoveryResult.batchScrapeJobId,
          status: brandDiscoveryResult.batchScrapeJobId
            ? "processing"
            : "pending",
        },
      },
    };
  } catch (error) {
    console.error(`🚨 [Pipeline] CRITICAL ERROR in brand discovery:`, error);
    return {
      success: false,
      error: "Brand discovery pipeline failed",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
