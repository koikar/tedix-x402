// Auto-generated types from Supabase schema
// To regenerate: npx supabase gen types typescript --project-id uumkmhullaajfwqjpafy > types.generated.ts
export * from "./types.generated";

// Import generated types for helper definitions
import type { Database } from "./types.generated";

// Helper types for easy access
export type Brand = Database["public"]["Tables"]["brands"]["Row"];
export type BrandInsert = Database["public"]["Tables"]["brands"]["Insert"];
export type BrandUpdate = Database["public"]["Tables"]["brands"]["Update"];
export type DiscoveryStatus = Database["public"]["Enums"]["discovery_status_enum"];

export type BrandUrl = Database["public"]["Tables"]["brand_urls"]["Row"];
export type BrandUrlInsert = Database["public"]["Tables"]["brand_urls"]["Insert"];
export type BrandUrlUpdate = Database["public"]["Tables"]["brand_urls"]["Update"];
export type UrlCategory = Database["public"]["Enums"]["url_category_enum"];

// Typed metadata interface for brands
export interface BrandMetadata {
  // Job tracking
  extractJobId?: string;
  mapJobId?: string;
  scrapeJobId?: string;

  // Extracted brand data (from cron)
  companyName?: string;
  industry?: string;
  description?: string;
  logoUrl?: string;

  // Pipeline tracking
  pipelineStartedAt?: string;
  cronProcessed?: boolean;
  workerProcessed?: boolean;

  // Additional flexibility for future fields
  [key: string]: any;
}
