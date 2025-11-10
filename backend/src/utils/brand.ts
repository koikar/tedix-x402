import type { Brand } from "../integrations/supabase/types";

/**
 * Get the best available logo URL for a brand
 */
export function getBrandLogoUrl(brand: Brand): string {
  if (brand.logo_url && brand.logo_url !== brand.primary_domain) {
    return brand.logo_url;
  }

  // Check if metadata has a logo_url
  if (brand.metadata && typeof brand.metadata === "object" && "logo_url" in brand.metadata) {
    const metadataLogoUrl = (brand.metadata as any).logo_url;
    if (metadataLogoUrl && metadataLogoUrl !== brand.primary_domain) {
      return metadataLogoUrl;
    }
  }

  // Fallback to Clearbit logo or favicon
  return `https://logo.clearbit.com/${brand.primary_domain}`;
}

/**
 * Get brand tagline/industry info
 */
export function getBrandTagline(brand: Brand): string {
  if (brand.metadata && typeof brand.metadata === "object") {
    const metadata = brand.metadata as any;

    if (metadata.industry) {
      return metadata.industry;
    }

    if (metadata.main_product) {
      return metadata.main_product;
    }
  }

  return "";
}

/**
 * Generate a URL-friendly slug from brand name or domain
 */
export function generateBrandSlug(nameOrDomain: string): string {
  return nameOrDomain
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
