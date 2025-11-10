/**
 * Brand Context Middleware for Hono
 * Fetches brand data from Supabase and stores it in context for MCP gateway
 */

import type { Context, Next } from "hono";
import { createSupabaseClient } from "../integrations/supabase/client";
import { getBrandById } from "../integrations/supabase/queries/brands";
import type { Brand } from "../integrations/supabase/types";

// Brand context interface for Hono context
export interface BrandContext {
  brand: Brand;
  isGlobal: boolean;
}

/**
 * Brand context middleware following Cloudflare Workers + Hono best practices
 * Parses brandId from query parameters and fetches brand data
 */
export const brandContextMiddleware = async (c: Context, next: Next) => {
  try {
    const brandId = c.req.query("brandId");

    if (brandId) {
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      if (!uuidRegex.test(brandId)) {
        console.warn(`[BrandContext] Invalid brandId format: ${brandId}`);
        // Continue without brand context for invalid UUIDs
        await next();
        return;
      }

      // Create Supabase client and fetch brand
      const supabase = createSupabaseClient(c.env);
      const brand = await getBrandById(supabase, brandId);

      if (brand) {
        const brandContext: BrandContext = {
          brand,
          isGlobal: false,
        };

        // Store brand context in Hono context
        c.set("brandContext", brandContext);

        console.log(`[BrandContext] ✅ Loaded brand: ${brand.name} (${brand.id})`);
      } else {
        console.warn(`[BrandContext] Brand not found: ${brandId}`);
        // Continue without brand context if brand doesn't exist
      }
    } else {
      // No brandId provided - global search mode
      const globalContext: BrandContext = {
        brand: null as any, // Will be undefined/null
        isGlobal: true,
      };

      c.set("brandContext", globalContext);
      console.log(`[BrandContext] Global search mode (no brandId)`);
    }

    await next();
  } catch (error) {
    console.error("[BrandContext] Error in brand context middleware:", error);
    
    // Continue without brand context on error to avoid breaking the request
    await next();
  }
};

/**
 * Helper function to get brand context from Hono context
 */
export function getBrandContext(c: Context): BrandContext | undefined {
  return c.get("brandContext");
}