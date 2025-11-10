# Tedix Backend - AI-Powered Brand Discovery Platform

Modern Cloudflare Workers backend with async brand intelligence pipeline, MCP integration, and type-safe database operations.

## 🏗️ Architecture Overview

### **Technology Stack**
- **Cloudflare Workers** - Edge computing with global distribution
- **Hono** - Fast, lightweight web framework for Workers
- **Supabase** - PostgreSQL database with real-time capabilities
- **Firecrawl** - AI-powered web scraping and extraction
- **MCP (Model Context Protocol)** - AI tool integration
- **TypeScript** - End-to-end type safety

### **Core Components**
```
backend/src/
├── agents/              # Cloudflare Agents (Durable Objects)
├── api/                 # Hono API routes
├── integrations/        # External service integrations
├── jobs/                # Background processing (cron)
├── mcp/                 # MCP server resources and tools
├── services/            # Business logic services
├── types/               # TypeScript definitions
└── utils/               # Utility functions
```

## 🚀 How It Works

### **1. Brand Discovery Pipeline**

The async pipeline processes brands in three stages:

```
📤 POST /api/brand-discovery {"domain": "example.com"}
    ↓
🔍 Extract → Brand info (company, industry, description)
    ↓
🗺️ Map → Discover all URLs (homepage, docs, pricing, etc.)
    ↓
📄 Scrape → Content from top priority pages
    ↓
💾 Store → Database + R2 storage + AI indexing
```

**Key Features:**
- **Async Processing** - Returns immediately with job IDs
- **Multi-Domain Support** - example.com + docs.example.com + github.com/example
- **Smart URL Prioritization** - Homepage (100), Pricing (90), Products (85), etc.
- **Webhook Integration** - Real-time progress updates
- **Cron Job Polling** - Handles completion and data updates

### **2. Database Schema**

#### **Brands Table**
```sql
CREATE TABLE brands (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  primary_domain TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  crawl_status crawl_status_enum DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **Brand URLs Table**
```sql
CREATE TABLE brand_urls (
  id UUID PRIMARY KEY,
  brand_id UUID REFERENCES brands(id),
  url TEXT NOT NULL,
  title TEXT,
  category url_category_enum DEFAULT 'other',
  priority INTEGER DEFAULT 50,
  discovered_via TEXT,
  scrape_status TEXT DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  UNIQUE(brand_id, url)
);
```

### **3. API Endpoints**

#### **Brand Discovery**
```bash
# Start async brand discovery
POST /api/brand-discovery
{
  "domain": "stripe.com"
}

# Response
{
  "success": true,
  "brandId": "uuid",
  "status": "extracting",
  "extractJobId": "firecrawl-job-id",
  "mapJobId": "map-timestamp",
  "scrapeJobId": "batch-scrape-id",
  "estimatedTime": "2-5 minutes"
}
```

#### **Webhooks**
```bash
# Firecrawl webhook endpoint
POST /api/webhook/firecrawl
# Handles: extract.completed, batch_scrape.completed, etc.
```

#### **Storage**
```bash
# Upload brand content to R2
POST /api/upload-brand-content

# Clean up R2 storage
POST /api/cleanup-r2
```

#### **Agents**
```bash
# WebSocket connections to TedixAgent
WS /agents/tedix-agent/default

# MCP server endpoint
ALL /mcp/*
```

### **4. Integrations**

#### **Supabase Integration**
```typescript
// Functional query approach
import { getBrandByDomain, createBrand } from './integrations/supabase/queries/brands'
import { upsertBrandUrls } from './integrations/supabase/queries/brand-urls'

const supabase = createSupabaseClient(env)
const brand = await getBrandByDomain(supabase, 'example.com')
```

#### **Firecrawl Integration**
```typescript
// Modular async operations
import {
  startMapping,
  startBatchScrape
} from './services/async-jobs'

const mapResult = await startMapping(config, firecrawl, supabase)
const scrapeResult = await startBatchScrape(config, firecrawl, urls)
```

### **5. Background Processing**

#### **Cron Jobs** (Every minute)
```typescript
// Check pending extract jobs
const pendingBrands = await getPendingExtractBrands(supabase)

for (const brand of pendingBrands) {
  const extractStatus = await firecrawlService.getExtractStatus(jobId)
  if (extractStatus.status === 'completed') {
    // Update brand with real extracted data
    await updateBrand(supabase, brand.id, {
      crawl_status: 'processing',
      name: extractedData.company_name,
      description: extractedData.description,
      // ... enhanced data
    })
  }
}
```

#### **Webhook Processing**
```typescript
// Handle Firecrawl webhooks
if (event.type === 'batch_scrape.completed') {
  // Upload content to R2
  // Update URL scrape status
  // Trigger AI indexing
}
```

## 🔧 Development

### **Setup**
```bash
# Install dependencies
bun install

# Start development server
bun run dev  # → http://localhost:8787

# Generate types
bun run types         # Cloudflare Worker types
bun run types:supabase # Database types
```

### **Environment Variables**
```bash
# Required
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your_anon_key
FIRECRAWL_API_KEY=fc-your_api_key

# Optional (for payment features)
CLIENT_TEST_PK=0x...
MCP_ADDRESS=0x...
```

### **Deployment**
```bash
# Deploy to Cloudflare Workers
bun run deploy

# Set production secrets
wrangler secret put SUPABASE_PUBLISHABLE_KEY
wrangler secret put FIRECRAWL_API_KEY
```

## 🎯 Key Features

### **Type Safety**
- **Auto-generated types** from Supabase schema
- **Cloudflare Worker types** from wrangler configuration
- **End-to-end TypeScript** with strict checking

### **Performance**
- **Edge computing** with Cloudflare's global network
- **Connection pooling** with Supabase
- **Caching strategies** with Firecrawl and R2
- **Async processing** for non-blocking operations

### **Scalability**
- **Functional architecture** - easy to test and maintain
- **Modular services** - clear separation of concerns
- **Durable Objects** - stateful agents with persistence
- **Horizontal scaling** - automatic with Cloudflare Workers

### **Reliability**
- **Error handling** with proper fallbacks
- **Webhook validation** with signature verification
- **Graceful degradation** - optional features fail safely
- **Comprehensive logging** for debugging

## 📊 Monitoring

### **Logs**
```bash
# View real-time logs
wrangler tail

# Check specific operations
curl -X POST http://localhost:8787/api/test-cron/trigger
```

### **Database**
```bash
# Check brand status
SELECT name, crawl_status, metadata->'extractJobId'
FROM brands
WHERE crawl_status = 'extracting';

# Check discovered URLs
SELECT url, category, priority, scrape_status
FROM brand_urls
WHERE brand_id = 'brand-uuid'
ORDER BY priority DESC;
```

### **Firecrawl Dashboard**
Monitor active jobs at [firecrawl.dev/app](https://firecrawl.dev/app):
- Extract jobs for brand information
- Map jobs for URL discovery
- Batch scrape jobs for content collection

## 🔄 Pipeline States

### **Brand Discovery Flow**
```
pending → extracting → processing → completed
```

### **URL Processing Flow**
```
discovered → pending → scraped/failed
```

### **Content Pipeline**
```
extract + map + scrape → webhook → R2 upload → AI indexing
```

## 🛠️ Extending the Platform

### **Adding New Integrations**
```typescript
// 1. Create integration module
/integrations/new-service/
├── client.ts     # Service client factory
└── operations.ts # Service-specific operations

// 2. Add to services
import { newServiceOperation } from '../integrations/new-service/operations'
```

### **Adding New API Endpoints**
```typescript
// 1. Create router
/api/new-feature.ts

// 2. Mount in API router
apiRouter.route('/new-feature', newFeatureRouter)
```

### **Adding Background Jobs**
```typescript
// 1. Add to cron job
export async function processNewJobs(env: Env) {
  // Job processing logic
}

// 2. Update main worker scheduled handler
ctx.waitUntil(processNewJobs(env))
```

## 📚 Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Hono Documentation](https://hono.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [Firecrawl API](https://docs.firecrawl.dev/)
- [MCP Specification](https://modelcontextprotocol.io/)

---

**Ready for production deployment on Cloudflare's global edge network!** 🌍
