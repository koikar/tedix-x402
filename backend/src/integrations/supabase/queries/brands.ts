import type { TypedSupabaseClient } from "../client";
import type { Brand, BrandInsert, BrandMetadata, BrandUpdate, DiscoveryStatus } from "../types";

/**
 * Get a brand by its ID
 */
export async function getBrandById(
  supabase: TypedSupabaseClient,
  id: string,
): Promise<Brand | null> {
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    // Handle "not found" as null rather than error
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to get brand by ID: ${error.message}`);
  }

  return data;
}

/**
 * Get a brand by its primary domain
 */
export async function getBrandByDomain(
  supabase: TypedSupabaseClient,
  domain: string,
): Promise<Brand | null> {
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .eq("primary_domain", domain)
    .single();

  if (error) {
    // Handle "not found" as null rather than error
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to get brand by domain: ${error.message}`);
  }

  return data;
}

/**
 * Get a brand by its slug
 */
export async function getBrandBySlug(
  supabase: TypedSupabaseClient,
  slug: string,
): Promise<Brand | null> {
  const { data, error } = await supabase.from("brands").select("*").eq("slug", slug).single();

  if (error) {
    // Handle "not found" as null rather than error
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to get brand by slug: ${error.message}`);
  }

  return data;
}

/**
 * Get all brands
 */
export async function getAllBrands(supabase: TypedSupabaseClient): Promise<Brand[]> {
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to get all brands: ${error.message}`);
  }

  return data || [];
}

/**
 * Create a new brand
 */
export async function createBrand(
  supabase: TypedSupabaseClient,
  brand: BrandInsert,
): Promise<Brand> {
  const { data, error } = await supabase.from("brands").insert(brand).select().single();

  if (error) {
    throw new Error(`Failed to create brand: ${error.message}`);
  }

  return data;
}

/**
 * Update a brand by ID
 */
export async function updateBrand(
  supabase: TypedSupabaseClient,
  id: string,
  updates: BrandUpdate,
): Promise<Brand> {
  const { data, error } = await supabase
    .from("brands")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update brand: ${error.message}`);
  }

  return data;
}

/**
 * Update brand discovery status
 */
export async function updateBrandDiscoveryStatus(
  supabase: TypedSupabaseClient,
  id: string,
  status: DiscoveryStatus,
): Promise<Brand> {
  return updateBrand(supabase, id, { discovery_status: status });
}

/**
 * Get brands that need extract processing (pending or scraped status with no extracted_at)
 */
export async function getPendingExtractBrands(
  supabase: TypedSupabaseClient,
  limit = 10,
): Promise<Brand[]> {
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .in("discovery_status", ["pending", "scraped"])
    .is("extracted_at", null)
    .not("metadata->extractJobId", "is", null)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to get pending extract brands: ${error.message}`);
  }

  return data || [];
}
