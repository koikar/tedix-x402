import { experimental_createMCPClient as createMCPClient } from "@ai-sdk/mcp";
// import { getOrCreatePurchaserAccount } from "@/lib/accounts";
// import { CdpClient } from "@coinbase/cdp-sdk";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";
import { withPayment } from "x402-mcp";
// import type { Address } from "viem";
// import type { Network } from "x402-next";
import { env } from "@/env";
import { getOrCreatePurchaserAccount } from "@/lib/accounts";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(request: Request) {
  const {
    messages,
    model,
    webSearch,
    brandId,
  }: {
    messages: UIMessage[];
    model: string;
    webSearch: boolean;
    brandId?: string;
  } = await request.json();

  // Construct MCP URL with brandId if provided
  const mcpUrl = brandId
    ? `${env.BACKEND_URL}/mcp?brandId=${brandId}`
    : `${env.BACKEND_URL}/mcp`;

  const tedixMcpClient = await createMCPClient({
    transport: {
      type: "http",
      url: mcpUrl,
      // optional: configure HTTP headers
      // headers: { Authorization: "Bearer my-api-key" },

      // optional: provide an OAuth client provider for automatic authorization
      // authProvider: myOAuthClientProvider,
    },
  }).then(async (client) => {
    const account = await getOrCreatePurchaserAccount("evm");
    return withPayment(client, { account, network: "base-sepolia" });
  });

  // Get tools from local Cloudflare server
  const tedixTools = await tedixMcpClient.tools();

  const tools = {
    ...tedixTools,
  };

  const result = streamText({
    model: webSearch ? "perplexity/sonar" : model,
    tools: {
      ...tools,
    },
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    onFinish: async () => {
      await tedixMcpClient.close();
    },
    system: `You are a helpful AI assistant for an AI-commerce brand platform called Tedix.
      ${
        brandId
          ? `You are currently focused on a specific brand context. Use the available MCP tools to provide brand-specific insights and information.`
          : `You help brands understand how they can integrate with ChatGPT's App Store and leverage AI for commerce. You have access to global brand intelligence across all discovered brands.`
      }

      Key capabilities you can discuss:
      - Brand content analysis and discovery
      - AI-powered product recommendations
      - Integration with ChatGPT conversations
      - E-commerce AI assistants
      - Brand intelligence and insights

      Be conversational, helpful, and focus on practical AI commerce applications.`,
  });

  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
    messageMetadata: () => ({ networks: ["solana", "ethereum"] }),
  });
}
