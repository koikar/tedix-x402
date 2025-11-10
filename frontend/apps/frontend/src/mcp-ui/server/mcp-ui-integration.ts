// MCP-UI Integration for Cloudflare Worker
// This file can be easily commented out to disable MCP-UI features

import { createBrowseMerchandiseUI, createPurchaseMerchandiseUI } from "./enhanced-tools";

/**
 * Add MCP-UI enhanced tools to existing MCP server
 * Call this from your main MCP server init
 */
export function addMCPUITools(server: any) {
  console.log("[MCP-UI] Adding enhanced UI tools...");

  try {
    // Add UI-enhanced browse tool
    const browseTool = createBrowseMerchandiseUI();
    server.tool(
      browseTool.name,
      browseTool.description,
      browseTool.inputSchema,
      browseTool.handler,
    );

    // Add UI-enhanced purchase tool (paid)
    const purchaseTool = createPurchaseMerchandiseUI();
    server.paidTool(
      purchaseTool.name,
      purchaseTool.description,
      0.05, // $0.05 processing fee
      purchaseTool.inputSchema.properties,
      {},
      purchaseTool.handler,
    );

    console.log("[MCP-UI] ✅ Enhanced UI tools added successfully");
    return true;
  } catch (error) {
    console.error("[MCP-UI] ❌ Failed to add UI tools:", error);
    return false;
  }
}

/**
 * Check if MCP-UI is enabled
 */
export function isMCPUIEnabled(): boolean {
  // You can add environment variable or feature flag here
  return true; // For now, always enabled
}
