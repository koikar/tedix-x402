# CLAUDE INSTRUCTIONS — TEDIX MCP PLATFORM

## 🎯 Core Concept
**Tedix** transforms any brand into a white-labeled MCP server in 5 minutes. Enter a URL → scrape official content → generate MCP server → deploy to ChatGPT → users get official branded responses with custom UI and blockchain payments.

---

## 🏗️ **MODERN ARCHITECTURE STACK**

### **Frontend - Next.js 16**
- **Next.js 16** - App Router with React Server Components
- **MCP UI Library** - Branded ChatGPT-style components
- **x402 SDK** - Coinbase CDP blockchain payments
- **TypeScript** - Full type safety
- **Tailwind CSS** - Utility-first styling
- **Turbo Monorepo** - Optimized workspace management

### **Backend - Hono + Cloudflare Workers**
- **Hono Framework** - Ultra-fast edge web framework
- **AI Agents SDK** - MCP server implementation
- **Cloudflare Workers** - Global edge computing (270+ locations)
- **Durable Objects** - Stateful MCP server instances
- **x402 MCP Tools** - Blockchain-gated premium features

### **AI & Content Pipeline**
- **Firecrawl API** - Extract, map, and batch scrape brand content
- **Cloudflare AI Search** - Vector embeddings and semantic search
- **Cloudflare R2** - Object storage for brand assets
- **OpenAI GPT-4** - AI responses and tool calling
- **MCP Protocol** - Standard AI tool communication

### **Infrastructure**
- **Frontend**: Vercel/Cloudflare Pages deployment
- **Backend**: Cloudflare Workers with custom domain
- **Storage**: R2 buckets organized by brand
- **Payments**: Solana blockchain via x402 protocol
- **CDN**: Cloudflare global edge network
