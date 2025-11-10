// import { env } from "cloudflare:workers";

// import { facilitator } from "@coinbase/x402";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { withX402, type X402Config } from "agents/x402";
import type { BrandContext } from "../middleware/brand-context";
import { createAISearchTool } from "./tools";

// Simple state for AI search tracking
type MCPState = {
  lastSearchQuery?: string;
  searchCount: number;
  brandContext?: BrandContext;
};

// Props interface for brand context
interface TedixMCPProps extends Record<string, unknown> {
  brandContext?: BrandContext;
}

// Global brand context storage (simple approach for MVP)
let currentBrandContext: BrandContext | undefined;

export function setGlobalBrandContext(brandContext?: BrandContext) {
  currentBrandContext = brandContext;
}

export function getGlobalBrandContext(): BrandContext | undefined {
  return currentBrandContext;
}

const X402_CONFIG: X402Config = {
  network: "base-sepolia",
  recipient: "0x03031bb316C0debc588E518A27534ec302E4CA52",
  facilitator: { url: "https://x402.org/facilitator" },
};

export class TedixMCP extends McpAgent<Env, MCPState, TedixMCPProps> {
  // Initialize server as class property (best practice per docs)
  server = withX402(
    new McpServer({ name: "TedixMCP", version: "1.0.0" }),
    X402_CONFIG,
  );

  // Define initial state
  initialState: MCPState = {
    searchCount: 0,
  };

  async init() {
    console.log("✅ MCP server enhanced with x402 payment support");

    // Register Apps SDK template resource (Step 1 of two-resource pattern)
    // await this.registerAppsSdkTemplate();

    // Register AI search tool with Apps SDK metadata
    const aiSearchTool = createAISearchTool(this.env);
    this.server.paidTool(
      aiSearchTool.name,
      aiSearchTool.description,
      0.001, // USDC
      aiSearchTool.inputSchema,
      {
        // Apps SDK metadata from tool
        _meta: aiSearchTool.appsSdkMeta,
      },
      async (args: { query: string }) => {
        // Update search tracking state
        this.setState({
          ...this.state,
          lastSearchQuery: args.query,
          searchCount: this.state.searchCount + 1,
        });

        // Call the tool handler with brand context
        return aiSearchTool.handler(args, getGlobalBrandContext());
      },
    );
  }

  // Handle state updates for logging/debugging
  onStateUpdate(state: MCPState) {
    console.log(`🔄 MCP Search activity:`, {
      totalSearches: state.searchCount,
      lastQuery: state.lastSearchQuery,
    });
  }
}
