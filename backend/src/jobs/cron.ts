import type Firecrawl from "@mendable/firecrawl-js";
import { aiSearchSync } from "../api/lib/ai-search";
import { createFirecrawlClient } from "../integrations/firecrawl/client";
import {
  getExtractStatus,
  type ExtractSchemaResponse,
} from "../integrations/firecrawl/queries";
import {
  createSupabaseClient,
  type TypedSupabaseClient,
} from "../integrations/supabase/client";
import {
  getPendingExtractBrands,
  updateBrand,
  updateBrandDiscoveryStatus,
} from "../integrations/supabase/queries/brands";
import type { BrandMetadata } from "../integrations/supabase/types";

/**
 * Process pending extract jobs (called by cron every minute)
 */
export async function processPendingExtractJobs(env: Env): Promise<void> {
  try {
    console.log(
      `🕒 [Cron] Processing pending jobs at ${new Date().toISOString()}`,
    );

    const supabase = createSupabaseClient(env);
    const firecrawl = createFirecrawlClient(env);

    // Process pending extract jobs
    await processExtractJobs(supabase, firecrawl);

    // Process scraped brands for final completion (only after extract processing)
    await processScrapedBrands(supabase, env);
  } catch (error) {
    console.error(`🚨 [Cron] Error in cron job:`, error);
  }
}

/**
 * Process brands in pending status that need extract processing
 */
async function processExtractJobs(
  supabase: TypedSupabaseClient,
  firecrawl: Firecrawl,
) {
  // Find brands with pending status that have extract job IDs
  const pendingBrands = await getPendingExtractBrands(supabase, 10);

  if (!pendingBrands || pendingBrands.length === 0) {
    console.log(`📭 [Cron] No pending extract jobs to process`);
    return;
  }

  console.log(
    `🔄 [Cron] Processing ${pendingBrands.length} pending extract jobs`,
  );

  for (const brand of pendingBrands) {
    const domain = brand.primary_domain;
    const metadata = brand.metadata as BrandMetadata | null;
    const extractJobId = metadata?.extractJobId;

    if (!extractJobId) {
      console.warn(`⚠️ [Cron] Brand ${domain} missing extractJobId`);
      continue;
    }

    try {
      console.log(
        `📊 [Cron] Checking extract job ${extractJobId} for ${domain}`,
      );

      const extractStatus = await getExtractStatus(firecrawl, extractJobId);

      console.log(`[Cron] Extract status result for ${domain}:`, {
        status: extractStatus.status,
        hasData: !!extractStatus.data,
        error: extractStatus.error,
      });

      if (extractStatus.status === "completed") {
        console.log(
          `✅ [Cron] Extract completed for ${domain}, updating brand data`,
        );

        const extractedData =
          extractStatus.data || ({} as ExtractSchemaResponse);
        const brandName =
          extractedData.company_name ||
          domain.split(".")[0].charAt(0).toUpperCase() +
            domain.split(".")[0].slice(1);

        // Build typed metadata
        const currentMetadata = metadata || {};
        const updatedMetadata: BrandMetadata = {
          ...currentMetadata,
          companyName: extractedData.company_name,
          industry: extractedData.industry || "Technology",
          description: extractedData.description,
          logoUrl: extractedData.logo_url,
          cronProcessed: true,
        };

        await updateBrand(supabase, brand.id, {
          name: brandName,
          description:
            extractedData.description ||
            `Official website and services from ${brandName}.`,
          logo_url:
            extractedData.logo_url || `https://logo.clearbit.com/${domain}`,
          metadata: updatedMetadata,
          discovery_status: "mapped",
          extracted_at: new Date().toISOString(),
        });

        console.log(
          `🎉 [Cron] Brand ${domain} enhanced with: ${brandName}, ${extractedData.industry}`,
        );
      } else if (extractStatus.status === "failed") {
        console.error(
          `❌ [Cron] Extract failed for ${domain}, marking as failed`,
        );

        await updateBrandDiscoveryStatus(supabase, brand.id, "failed");
      } else if (extractStatus.status === "cancelled") {
        console.warn(
          `🚫 [Cron] Extract cancelled for ${domain}, keeping current status`,
        );
        // Don't update status for cancelled jobs, they might be retried
      } else {
        console.log(
          `⏳ [Cron] Extract still processing for ${domain}: ${extractStatus.status}`,
        );
      }
    } catch (error) {
      console.error(`🚨 [Cron] Error processing extract for ${domain}:`, error);
    }
  }
}

/**
 * Process brands in scraped status for final completion and AI search sync
 */
async function processScrapedBrands(
  supabase: TypedSupabaseClient,
  env: Env,
): Promise<void> {
  // Find brands that finished scraping and extract processing but need final completion
  const { data: scrapedBrands } = await supabase
    .from("brands")
    .select("*")
    .in("discovery_status", ["mapped", "scraped"])
    .is("ai_search_synced_at", null)
    .not("extracted_at", "is", null) // Only finalize brands that have been extract-processed
    .order("updated_at", { ascending: true })
    .limit(5);

  if (!scrapedBrands || scrapedBrands.length === 0) {
    console.log(`📭 [Cron] No scraped brands to finalize`);
    return;
  }

  console.log(`🔄 [Cron] Finalizing ${scrapedBrands.length} scraped brands`);

  for (const brand of scrapedBrands) {
    try {
      console.log(
        `🔍 [Cron] Triggering AI Search sync for: ${brand.name} (${brand.primary_domain})`,
      );

      // Trigger AI search sync to vectorize the R2 content
      const syncResult = await aiSearchSync(env);

      if (syncResult) {
        console.log(
          `✅ [Cron] AI Search sync successful for ${brand.name}, job ID: ${syncResult.result.job_id}`,
        );
      } else {
        console.warn(
          `⚠️ [Cron] AI Search sync failed for ${brand.name}, but continuing...`,
        );
      }

      // Mark as completed regardless of sync result (sync failure shouldn't block completion)
      await supabase
        .from("brands")
        .update({
          discovery_status: "completed",
          ai_search_synced_at: new Date().toISOString(),
        })
        .eq("id", brand.id);

      console.log(
        `✅ [Cron] Finalized brand: ${brand.name} (${brand.primary_domain})`,
      );
    } catch (error) {
      console.error(`🚨 [Cron] Error finalizing brand ${brand.name}:`, error);
    }
  }
}
