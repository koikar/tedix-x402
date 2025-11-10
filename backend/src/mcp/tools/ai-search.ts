import { createUIResource } from "@mcp-ui/server";
import { z } from "zod";
import type { BrandContext } from "../../middleware/brand-context";

// Apps SDK template URI (must match the registered resource)
const TEMPLATE_URI = "ui://widgets/ai-search";

export function createAISearchTool(env: Env) {
  // Get widget URL from environment
  const widgetUrl = env.WIDGET_URL;

  return {
    name: "ai-search",
    description:
      "Search brand-specific or global information using Cloudflare AI Search",
    inputSchema: {
      query: z
        .string()
        .describe("Search query for brand-specific or global information"),
    },
    // Apps SDK metadata - references the registered template resource
    appsSdkMeta: {
      "openai/outputTemplate": TEMPLATE_URI,
      "openai/toolInvocation/invoking": "Searching knowledge base...",
      "openai/toolInvocation/invoked": "AI search completed",
      "openai/widgetAccessible": true,
    },
    handler: async (
      { query }: { query: string },
      brandContext?: BrandContext,
    ) => {
      try {
        const brandInfo = brandContext?.isGlobal
          ? "Global (all brands)"
          : brandContext?.brand
            ? `${brandContext.brand.name} (${brandContext.brand.primary_domain})`
            : "No brand context";

        console.log(`🔍 AI Search query: "${query}"`);
        console.log(`🎯 Brand context: ${brandInfo}`);
        console.log(`🔧 Widget URL: ${widgetUrl}`);
        console.log(`🔧 AI Search instance: ${env.AI_SEARCH_INSTANCE}`);

        // Use AutoRAG API with Cloudflare filtering for brand isolation
        const response = await env.AI.autorag(env.AI_SEARCH_INSTANCE).aiSearch({
          query,
          max_num_results: brandContext?.isGlobal ? 8 : 5, // More results for global search
          rewrite_query: true,
          filters: brandContext?.brand
            ? {
                type: "and",
                filters: [
                  {
                    type: "gt",
                    key: "folder",
                    value: `brands/${brandContext.brand.id}//`, // "starts with" pattern
                  },
                  {
                    type: "lte",
                    key: "folder",
                    value: `brands/${brandContext.brand.id}/z`,
                  },
                ],
              }
            : undefined, // No filter for global search
        });

        console.log(`✅ AI Search response received`);

        // Extract the text response from the AutoRAG result
        const aiAnswer =
          response && typeof response === "string"
            ? response
            : response?.response
              ? response.response
              : `No specific information found for "${query}". Please try a more general query.`;

        // For MCP-UI native hosts: use iframe pointing to Next.js widget

        // Build URL with query parameters for the Next.js page
        const nextjsPageUrl = new URL(`${widgetUrl}/ai-search`);
        nextjsPageUrl.searchParams.set("query", query);
        nextjsPageUrl.searchParams.set("results", aiAnswer);
        nextjsPageUrl.searchParams.set("timestamp", new Date().toISOString());
        nextjsPageUrl.searchParams.set("source", "mcp-tool");

        // Add brand context parameters
        if (brandContext?.brand) {
          nextjsPageUrl.searchParams.set("brandName", brandContext.brand.name);
          nextjsPageUrl.searchParams.set(
            "brandDomain",
            brandContext.brand.primary_domain,
          );
          if (brandContext.brand.logo_url) {
            nextjsPageUrl.searchParams.set(
              "brandLogo",
              brandContext.brand.logo_url,
            );
          }
        }

        console.log(
          `🌐 Creating iframe widget for: ${nextjsPageUrl.toString()}`,
        );

        // MCP-UI embedded resource using externalUrl (direct Next.js page)
        const mcpUIResource = createUIResource({
          uri: `ui://ai-search/embedded-${Date.now()}`,
          content: {
            type: "externalUrl",
            iframeUrl: nextjsPageUrl.toString(),
          },
          encoding: "text",
          metadata: {
            title: `AI Search Results`,
            description: `Search results for "${query}"`,
            author: "Tedix Platform",
            preferredRenderContext: "inline",
          },
          uiMetadata: {
            "preferred-frame-size": ["800px", "600px"],
          },
        });

        return {
          content: [
            {
              type: "text" as const,
              text: `AI search results for "${query}"`,
            },
            mcpUIResource,
          ],
          // Apps SDK structured content (for ChatGPT)
          structuredContent: {
            query,
            searchResults: aiAnswer,
            timestamp: new Date().toISOString(),
          },
        };
      } catch (error) {
        console.error("AI Search error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        // For MCP-UI native hosts: use iframe pointing to Next.js widget with error state
        const errorPageUrl = new URL(`${widgetUrl}/ai-search`);
        errorPageUrl.searchParams.set("query", query);
        errorPageUrl.searchParams.set("error", errorMessage);
        errorPageUrl.searchParams.set("timestamp", new Date().toISOString());
        errorPageUrl.searchParams.set("source", "mcp-tool-error");

        console.log(
          `🌐 Creating error iframe widget for: ${errorPageUrl.toString()}`,
        );

        // MCP-UI error embedded resource using externalUrl (direct Next.js page)
        const errorUIResource = createUIResource({
          uri: `ui://ai-search/error-${Date.now()}`,
          content: {
            type: "externalUrl",
            iframeUrl: errorPageUrl.toString(),
          },
          encoding: "text",
          metadata: {
            title: `AI Search Error`,
            description: `Search failed for "${query}"`,
            author: "Tedix Platform",
          },
          uiMetadata: {
            "preferred-frame-size": ["800px", "400px"],
          },
        });

        return {
          content: [
            {
              type: "text" as const,
              text: `Search failed: ${errorMessage}`,
            },
            errorUIResource,
          ],
          // Apps SDK structured content for errors
          structuredContent: {
            query,
            error: errorMessage,
            timestamp: new Date().toISOString(),
          },
        };
      }
    },
  };
}
