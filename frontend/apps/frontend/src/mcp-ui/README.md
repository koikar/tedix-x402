# MCP-UI Implementation

This folder contains the MCP-UI integration for interactive user interfaces with our MCP server.

## Structure
- `server/` - Enhanced MCP tools with UI resources (for Cloudflare Worker)
- `client/` - React components for rendering UI resources  
- `components/` - Reusable UI components and themes

## Features
- 🛍️ Interactive merchandise browsing with product cards
- 💳 Rich checkout experience with payment confirmation
- 🎨 Dynamic theming support
- 🔒 Secure iframe sandboxing
- 📱 Responsive mobile-friendly interfaces

## Quick Toggle
To disable MCP-UI features, simply comment out the imports in:
- `src/cf-x402/src/index.ts` (server-side)
- `src/app/mcp-ui/page.tsx` (client-side)

This keeps the core MCP functionality intact while allowing easy UI enhancement testing.