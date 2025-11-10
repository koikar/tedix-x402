import type { TypedSupabaseClient } from "../client";
import type { BrandUrl, BrandUrlInsert } from "../types";

/**
 * Upsert brand URLs (supports multiple domains per brand)
 */
export async function upsertBrandUrls(
  supabase: TypedSupabaseClient,
  brandId: string,
  urls: Array<Omit<BrandUrlInsert, "brand_id">>,
): Promise<BrandUrl[]> {
  const urlInserts: BrandUrlInsert[] = urls.map((url) => ({
    brand_id: brandId,
    ...url,
  }));

  const { data, error } = await supabase
    .from("brand_urls")
    .upsert(urlInserts, {
      onConflict: "brand_id,url",
      ignoreDuplicates: false,
    })
    .select();

  if (error) {
    throw new Error(`Failed to upsert brand URLs: ${error.message}`);
  }

  return data || [];
}

/**
 * Get all URLs for a brand
 */
export async function getBrandUrls(
  supabase: TypedSupabaseClient,
  brandId: string,
): Promise<BrandUrl[]> {
  const { data, error } = await supabase
    .from("brand_urls")
    .select("*")
    .eq("brand_id", brandId)
    .order("priority", { ascending: false });

  if (error) {
    throw new Error(`Failed to get brand URLs: ${error.message}`);
  }

  return data || [];
}

/**
 * Update URL scrape status
 */
export async function updateUrlScrapeStatus(
  supabase: TypedSupabaseClient,
  brandId: string,
  url: string,
  status: "scraped" | "failed",
  contentLength?: number,
): Promise<void> {
  const { error } = await supabase
    .from("brand_urls")
    .update({
      scrape_status: status,
      scraped_at: new Date().toISOString(),
      content_length: contentLength,
      updated_at: new Date().toISOString(),
    })
    .eq("brand_id", brandId)
    .eq("url", url);

  if (error) {
    throw new Error(`Failed to update URL scrape status: ${error.message}`);
  }
}

/**
 * Get pending URLs to scrape for a brand
 */
export async function getPendingUrlsToScrape(
  supabase: TypedSupabaseClient,
  brandId: string,
  limit = 10,
): Promise<BrandUrl[]> {
  const { data, error } = await supabase
    .from("brand_urls")
    .select("*")
    .eq("brand_id", brandId)
    .eq("scrape_status", "pending")
    .order("priority", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to get pending URLs: ${error.message}`);
  }

  return data || [];
}
