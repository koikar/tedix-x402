# CLAUDE INSTRUCTIONS — TANSTACK START AI-COMMERCE PLATFORM

## 🎯 Objective
**Tedix** is a **modern AI-commerce brand platform** built with TanStack Start featuring real-time brand intelligence, professional ChatGPT-style interfaces, and full-stack TypeScript architecture. Focus on demonstrating production-ready brand discovery and AI integration using modern web standards.

## ✅ **CURRENT STATUS — TANSTACK START PRODUCTION READY**
- **TanStack Start Frontend** with full-stack TypeScript and type-safe routing
- **TanStack Form + TanStack DB** for reactive form handling and real-time data
- **Professional AI Elements** using official ChatGPT-style components
- **Cloudflare Workers Backend** with unified MCP architecture
- **Brand Discovery Playground** at `/playground` with real-time analysis
- **Production Deployment** ready for Cloudflare Pages + Workers

---

## 🏗️ **MODERN ARCHITECTURE STACK**

### **Frontend - TanStack Start**
- **TanStack Start** - Full-stack React framework with file-based routing
- **TanStack Form** - Type-safe forms with validation and real-time updates
- **TanStack DB** - Client-side reactive database with live queries
- **TanStack Query** - Server state management and caching
- **AI Elements** - Official ChatGPT-style UI components
- **Vite + TypeScript** - Modern build system with hot module replacement

### **Backend - Cloudflare Workers**
- **Cloudflare Workers** - Edge computing with global distribution
- **MCP Architecture** - Model Context Protocol for AI tool integration
- **Cloudflare AI Search** - Managed vector database with auto-indexing
- **Cloudflare R2** - Object storage for brand content and assets
- **Firecrawl Integration** - Premium content extraction and mapping

### **Database & State**
- **TanStack DB** - Client-side reactive collections
- **Supabase** - PostgreSQL with real-time subscriptions
- **pgvector** - Vector storage for embeddings and semantic search
- **Live Queries** - Real-time data synchronization

### **Deployment**
- **Frontend**: Cloudflare Pages with TanStack Start
- **Backend**: Cloudflare Workers with Wrangler CLI
- **Database**: Supabase with edge functions
- **CDN**: Cloudflare global edge network

---

## 🧱 **IMPLEMENTATION ARCHITECTURE**

### **TanStack Start File Structure**
```
frontend/src/
├── app/
│   ├── __root.tsx              # Root layout with providers
│   ├── index.tsx               # Home page
│   ├── playground.tsx          # Brand analysis playground
│   ├── api/
│   │   ├── chat.ts            # AI chat server route
│   │   └── scan.ts            # Brand discovery server route
│   └── privacy.tsx            # Legal pages
├── components/
│   ├── ai-elements/           # ChatGPT-style UI components
│   ├── simple-chat/           # Chat interface components
│   └── ui/                    # Shared UI components
├── lib/
│   ├── server-functions.ts    # TanStack Start server functions
│   ├── collections.ts         # TanStack DB collections
│   └── env.ts                 # Environment configuration
└── utils/supabase/            # Database utilities
```

### **Cloudflare Workers Structure**
```
backend/src/
├── index.ts                   # Main worker entry point
├── mcp/
│   ├── ui.ts                 # MCP UI resource handler
│   └── r2-upload-handler.ts  # R2 storage operations
├── brand-discovery/
│   ├── firecrawl-service.ts  # Content extraction
│   ├── url-prioritizer.ts    # Smart URL selection
│   └── content-processor.ts  # Data transformation
├── services/
│   └── cloudflare-ai.ts      # AI Search integration
└── webhooks/                 # External integrations
```

---

## 🔧 **TANSTACK START PATTERNS**

### **Server Routes (API Endpoints)**
```typescript
// frontend/src/app/api/scan.ts
import { createFileRoute } from "@tanstack/react-router";
import { env } from "@/lib/env";

export const Route = createFileRoute("/api/scan")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { domain } = await request.json();

        const response = await fetch(`${env.server.MCP_URL}/brand-discovery`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain }),
        });

        return new Response(JSON.stringify(await response.json()), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
```

### **TanStack Form Integration**
```typescript
// Reactive form with validation and submission
const form = useForm({
  defaultValues: { domain: "" },
  validators: {
    onSubmit: ({ value }) => {
      try {
        formSchema.parse(value);
      } catch (error) {
        return error.format();
      }
    },
  },
  onSubmit: async ({ value }) => {
    const response = await fetch("/api/scan", {
      method: "POST",
      body: JSON.stringify(value),
    });
    const result = await response.json();
    setAnalysisResults(result);
  },
});
```

### **TanStack DB Live Queries**
```typescript
// Real-time reactive data
const { data: brands } = useLiveQuery(
  (q) => {
    if (!brandsCollection) return undefined;
    return q
      .from({ brand: brandsCollection })
      .where(({ brand }) => eq(brand.domain, currentDomain))
      .limit(1);
  },
  [currentDomain],
);
```

---

## 🚀 **BRAND DISCOVERY PIPELINE**

### **Single-Pipeline Cloudflare Architecture**
1. **Frontend Form** → TanStack Form validates domain input
2. **Server Route** → `/api/scan` proxies to Cloudflare Worker
3. **Worker Processing** → Firecrawl Extract → Map → BatchScrape
4. **Direct R2 Upload** → Organized content storage (`brands/{domain}/`)
5. **AI Search Auto-Index** → Cloudflare AI Search creates embeddings
6. **Real-time Updates** → TanStack DB live queries sync results

### **MCP Tools Available**
- `cloudflare-ai-search` - Brand content search with AI-generated responses
- `browse-merchandise` - Interactive product catalog browsing
- `purchase-merchandise` - E-commerce transactions with x402 payments

### **Content Intelligence**
- **Rich Product Data** - Pricing, images, availability, structured metadata
- **Smart Categorization** - Products, blog, docs, services with scoring
- **Brand Isolation** - Tenant-specific search with folder-based filtering
- **Quality Validation** - Content filtering, duplicate detection
- **Production Tested** - MANSORY automotive + fashion brands

---

## 🧩 **ENVIRONMENT CONFIGURATION**

### **Frontend (.env.local)**
```env
# TanStack Start Configuration
VITE_MCP_URL=https://your-worker.workers.dev
VITE_NETWORK=mainnet

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Development
NODE_ENV=development
```

### **Backend (wrangler.jsonc)**
```json
{
  "name": "tedix-worker",
  "main": "src/index.ts",
  "compatibility_date": "2024-11-01",
  "vars": {
    "ENVIRONMENT": "production"
  },
  "secrets": [
    "OPENAI_API_KEY",
    "FIRECRAWL_API_KEY",
    "AI_SEARCH_API_TOKEN"
  ],
  "ai": {
    "binding": "AI"
  },
  "r2_buckets": [
    {
      "binding": "R2_BUCKET",
      "bucket_name": "tedix-brand-content"
    }
  ]
}
```

---

## 📋 **DEVELOPMENT WORKFLOW**

### **Local Development**
```bash
# Terminal 1: Frontend (TanStack Start)
cd frontend
bun install
bun run dev  # → http://localhost:3001

# Terminal 2: Backend (Cloudflare Workers)
cd backend
bun install
bun run dev  # → http://localhost:8787

# Terminal 3: Database (Optional)
supabase start
```

### **Build & Deploy**
```bash
# Frontend - Deploy to Cloudflare Pages
cd frontend
bun run build
wrangler pages deploy dist/client

# Backend - Deploy to Cloudflare Workers
cd backend
bun run deploy
```

### **Type Safety**
```bash
# Frontend type checking
cd frontend
bun run build:check

# Backend type checking
cd backend
bun run typecheck
```

---

## 🎯 **CURRENT FOCUS AREAS**

### ✅ **COMPLETED**
- [x] **TanStack Start Migration** - Full framework upgrade
- [x] **TanStack Form Integration** - Reactive form handling
- [x] **TanStack DB Setup** - Client-side reactive data
- [x] **Cloudflare Workers Backend** - Unified MCP architecture
- [x] **AI Elements Integration** - Professional ChatGPT interface
- [x] **Brand Discovery Pipeline** - Firecrawl + R2 + AI Search
- [x] **Production Deployment** - Cloudflare Pages + Workers

### 🔄 **IN PROGRESS**
- [ ] **Real-time Brand Analytics** - Live progress tracking
- [ ] **Enhanced Error Handling** - Production-ready error boundaries
- [ ] **Performance Optimization** - Edge caching and compression
- [ ] **Mobile Optimization** - Responsive design improvements

### 🔮 **FUTURE ROADMAP**
- [ ] **Multi-tenant Architecture** - Brand-specific deployments
- [ ] **Advanced AI Features** - Custom model integrations
- [ ] **Enterprise Authentication** - SSO and role-based access
- [ ] **API Rate Limiting** - Usage controls and billing

---

## ⚠️ **IMPLEMENTATION GUIDELINES**

### **TanStack Start Best Practices**
- **Server Routes** for API endpoints (not Server Functions for this use case)
- **TanStack Form** for all form handling with validation
- **TanStack DB** for client-side reactive data
- **File-based routing** with type-safe navigation
- **Server-side environment variables** via `env.server`

### **Cloudflare Workers Patterns**
- **MCP Architecture** for AI tool integration
- **R2 Storage** for brand content and assets
- **AI Search** for vector database and embeddings
- **Edge distribution** for global performance
- **TypeScript throughout** for type safety

### **Development Standards**
- **No inline imports** - Always use import statements
- **Bun package manager** - Consistent dependency management
- **Biome formatting** - Code style and linting
- **Type-safe everything** - End-to-end TypeScript

---

## 📝 **DOCUMENTATION POLICY**
ONLY update these core documentation files:
- **CLAUDE.md** (this file - implementation instructions)
- **README.md** (project overview and setup)
- **PRD.md** (product requirements and features)

Any additional documentation should be added to these existing files.

---

## 🚀 **QUICK START**
```bash
# Clone and setup
git clone https://github.com/your-repo/tedix-402
cd tedix-402

# Frontend setup
cd frontend && bun install && bun run dev

# Backend setup
cd backend && bun install && bun run dev

# Visit: http://localhost:3001/playground
```

**Ready for production deployment on Cloudflare's global edge network!** 🌍
