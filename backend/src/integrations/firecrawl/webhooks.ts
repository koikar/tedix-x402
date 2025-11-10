/**
 * Firecrawl Webhook Handler
 * Processes real-time events from Firecrawl operations with HMAC verification
 */

import crypto from "node:crypto";
import { type BrandContent, uploadBrandContent } from "../../utils/r2";
import { categorizeContent } from "../../utils/url-processing";
import type { TypedSupabaseClient } from "../supabase/client";
import { createSupabaseClient } from "../supabase/client";

export interface FirecrawlWebhookEvent {
  success: boolean;
  type: string; // "started" | "page" | "completed" | "failed" etc.
  id: string; // Firecrawl job ID
  data: any[];
  metadata: {
    brandId: string;
    domain: string;
    [key: string]: any;
  };
  error?: string;
}

/**
 * Process Firecrawl webhook events with signature verification
 */
export async function handleFirecrawlWebhook(
  request: Request,
  env: Env,
): Promise<Response> {
  try {
    // Verify webhook signature first
    const body = await request.text();
    const signature = request.headers.get("X-Firecrawl-Signature");

    if (
      !verifyFirecrawlSignature(body, signature, env.FIRECRAWL_WEBHOOK_SECRET)
    ) {
      console.error(
        `🚨 [Webhook] Invalid signature - potential security threat`,
      );
      return new Response("Unauthorized", { status: 401 });
    }

    const event: FirecrawlWebhookEvent = JSON.parse(body);

    console.log(
      `🎯 [Webhook] VERIFIED EVENT: ${event.type} for job ${event.id}`,
    );

    const supabase = createSupabaseClient(env);

    // Handle events according to official Firecrawl webhook docs
    switch (event.type) {
      case "started":
      case "crawl.started":
      case "batch_scrape.started":
        return handleJobStarted(event, supabase, env);

      case "page":
      case "crawl.page":
      case "batch_scrape.page":
        return handlePageScraped(event, supabase, env);

      case "completed":
      case "crawl.completed":
      case "batch_scrape.completed":
        return handleJobCompleted(event, supabase, env);

      case "failed":
      case "crawl.failed":
      case "batch_scrape.failed":
        return handleJobFailed(event, supabase, env);

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
        return new Response("OK", { status: 200 });
    }
  } catch (error) {
    console.error("[Webhook] Error processing webhook:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

/**
 * Verify Firecrawl webhook signature using HMAC-SHA256
 * Implements security as per official Firecrawl docs
 */
function verifyFirecrawlSignature(
  body: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature || !secret) {
    return false;
  }

  try {
    // Extract hash from signature header (format: "sha256=abc123...")
    const [algorithm, hash] = signature.split("=");
    if (algorithm !== "sha256") {
      return false;
    }

    // Compute expected signature
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(hash, "hex"),
      Buffer.from(expectedSignature, "hex"),
    );
  } catch (error) {
    console.error("[Webhook] Signature verification error:", error);
    return false;
  }
}

/**
 * Handle job started events
 */
async function handleJobStarted(
  event: FirecrawlWebhookEvent,
  supabase: TypedSupabaseClient,
  env: Env,
): Promise<Response> {
  const { brandId } = event.metadata;

  console.log(`[Webhook] Job started for brand ${brandId}`);

  // Update brand status to indicate job started
  if (brandId) {
    await supabase
      .from("brands")
      .update({
        discovery_status: "scraped",
        metadata: {
          currentJobId: event.id,
          jobStartedAt: new Date().toISOString(),
        },
      })
      .eq("id", brandId);
  }

  return new Response("OK", { status: 200 });
}

/**
 * Handle individual page scraped events
 */
async function handlePageScraped(
  event: FirecrawlWebhookEvent,
  supabase: TypedSupabaseClient,
  env: Env,
): Promise<Response> {
  const { brandId, domain } = event.metadata;

  if (!event.data || event.data.length === 0) {
    return new Response("OK", { status: 200 });
  }

  const page = event.data[0];
  const url = page.metadata?.sourceURL || page.metadata?.url;

  if (!url) {
    console.warn("[Webhook] No URL found in page data");
    return new Response("OK", { status: 200 });
  }

  console.log(`[Webhook] Page scraped: ${url}`);

  // Update URL status to scraped
  await supabase
    .from("brand_urls")
    .update({
      scrape_status: "scraped",
      scraped_at: new Date().toISOString(),
      content_length: page.markdown?.length || 0,
    })
    .eq("brand_id", brandId)
    .eq("url", url);

  // Start R2 upload for this page
  await uploadPageToR2(page, brandId, domain, supabase, env);

  return new Response("OK", { status: 200 });
}

/**
 * Handle job completion events
 */
async function handleJobCompleted(
  event: FirecrawlWebhookEvent,
  supabase: TypedSupabaseClient,
  env: Env,
): Promise<Response> {
  const { brandId } = event.metadata;

  console.log(`[Webhook] Job completed for brand ${brandId}`);

  // Get final counts
  const { data: urlStats } = await supabase
    .from("brand_urls")
    .select("scrape_status")
    .eq("brand_id", brandId);

  const statusCounts =
    urlStats?.reduce(
      (acc, item) => {
        acc[item.scrape_status || "unknown"] =
          (acc[item.scrape_status || "unknown"] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ) || {};

  // Update brand status to scraped (cron will handle final completion)
  if (brandId) {
    // Get current metadata to preserve extract job info
    const { data: currentBrand } = await supabase
      .from("brands")
      .select("metadata")
      .eq("id", brandId)
      .single();

    const currentMetadata = (currentBrand?.metadata as any) || {};

    await supabase
      .from("brands")
      .update({
        discovery_status: "scraped",
        metadata: {
          ...currentMetadata, // Preserve existing metadata including extractJobId
          urlsScraped: statusCounts.scraped || 0,
          urlsFailed: statusCounts.failed || 0,
          totalUrls: urlStats?.length || 0,
          scrapedCompletedAt: new Date().toISOString(),
        },
      })
      .eq("id", brandId);
  }

  return new Response("OK", { status: 200 });
}

/**
 * Handle job failure events
 */
async function handleJobFailed(
  event: FirecrawlWebhookEvent,
  supabase: TypedSupabaseClient,
  env: Env,
): Promise<Response> {
  const { brandId } = event.metadata;

  console.error(`[Webhook] Job failed for brand ${brandId}:`, event.error);

  // Update brand status to failed
  if (brandId) {
    await supabase
      .from("brands")
      .update({
        discovery_status: "failed",
        metadata: {
          error: event.error || "Firecrawl job failed",
          failedAt: new Date().toISOString(),
        },
      })
      .eq("id", brandId);
  }

  // Mark any pending URLs as failed
  await supabase
    .from("brand_urls")
    .update({
      scrape_status: "failed",
    })
    .eq("brand_id", brandId)
    .in("scrape_status", ["pending", "scraping"]);

  return new Response("OK", { status: 200 });
}

/**
 * Upload individual page to R2 as webhook receives it
 */
async function uploadPageToR2(
  page: any,
  brandId: string,
  domain: string,
  supabase: TypedSupabaseClient,
  env: Env,
): Promise<void> {
  try {
    const url = page.metadata?.sourceURL || page.metadata?.url;

    // Mark as uploading
    await supabase
      .from("brand_urls")
      .update({
        scrape_status: "uploading",
      })
      .eq("brand_id", brandId)
      .eq("url", url);

    // Prepare content for R2 upload using standardized interface
    const brandContent: BrandContent = {
      url,
      title: page.metadata?.title || "Untitled",
      content: page.markdown || "",
      processed_content: page.markdown?.substring(0, 5000) || "",
      contentType: categorizeContent(url),
      images: page.images || [],
    };

    // Use r2.ts utility function with brandId for UUID-based folder structure
    const uploadResults = await uploadBrandContent(
      env.DEV_TEDIX_BUCKET,
      brandId,
      domain,
      [brandContent],
      {
        overwrite: true,
        generateMetadata: true,
      },
    );

    const uploadResult = uploadResults[0];

    // Mark as uploaded or failed
    if (uploadResult?.success) {
      await supabase
        .from("brand_urls")
        .update({
          scrape_status: "uploaded",
          content_length: uploadResult.size || 0,
        })
        .eq("brand_id", brandId)
        .eq("url", url);

      console.log(`[Webhook] ✅ Uploaded page to R2: ${url}`);
    } else {
      await supabase
        .from("brand_urls")
        .update({
          scrape_status: "failed",
        })
        .eq("brand_id", brandId)
        .eq("url", url);

      console.log(
        `[Webhook] ❌ Failed to upload page: ${url}`,
        uploadResult?.error,
      );
    }
  } catch (error) {
    console.error(
      `[Webhook] Error uploading page ${page.metadata?.sourceURL}:`,
      error,
    );

    // Mark as failed on error
    const url = page.metadata?.sourceURL || page.metadata?.url;
    if (url) {
      await supabase
        .from("brand_urls")
        .update({
          scrape_status: "failed",
        })
        .eq("brand_id", brandId)
        .eq("url", url);
    }
  }
}
