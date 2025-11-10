import { createUIResource } from "@mcp-ui/server";
import type { BrandContext } from "../../../middleware/brand-context";

// Apps SDK template URI
export const TEMPLATE_URI = "ui://widgets/ai-search";

// Create MCP-UI template resource that points to Next.js page
export async function createAppsSdkTemplate(
  widgetUrl: string,
  brandContext?: BrandContext,
) {
  const widgetTitle = brandContext?.isGlobal
    ? "Global AI Search Results"
    : `${brandContext?.brand?.name || "Brand"} AI Search Results`;

  const widgetDescription = brandContext?.isGlobal
    ? "Interactive AI search results across all brands with global intelligence"
    : `Interactive AI search results for ${brandContext?.brand?.name || "brand"} with brand-specific intelligence`;
  return createUIResource({
    uri: TEMPLATE_URI,
    encoding: "text",
    content: {
      type: "externalUrl",
      iframeUrl: `${widgetUrl}/ai-search`, // Points directly to Next.js page
    },
    metadata: {
      title: widgetTitle,
      description: widgetDescription,
      "openai/widgetDescription": widgetDescription,
      "openai/widgetPrefersBorder": true,
      "openai/widgetDomain": new URL(widgetUrl).hostname,
      // Add brand context metadata
      ...(brandContext &&
        !brandContext.isGlobal && 
        brandContext.brand && {
          "tedix/brandId": brandContext.brand.id,
          "tedix/brandName": brandContext.brand.name,
          "tedix/brandDomain": brandContext.brand.primary_domain,
        }),
    },
  });
}
