# Product Requirements Document (PRD)
## Project: Tedix — Modern AI-Commerce Brand Platform
### Version 3.0 (TanStack Start + Cloudflare)

---

## 🧭 1. Vision
Build a **production-ready AI-commerce platform** using modern web standards that enables brands to seamlessly integrate AI-powered shopping experiences with **TanStack Start**, **Cloudflare Workers**, and **real-time brand intelligence**.

---

## 🏗️ 2. Technical Architecture

### **Frontend Stack**
| Technology | Purpose | Status |
|------------|---------|--------|
| **TanStack Start** | Full-stack React framework with file-based routing | ✅ **IMPLEMENTED** |
| **TanStack Form** | Type-safe reactive forms with validation | ✅ **IMPLEMENTED** |
| **TanStack DB** | Client-side reactive database with live queries | ✅ **IMPLEMENTED** |
| **TanStack Query** | Server state management and caching | ✅ **IMPLEMENTED** |
| **AI Elements** | Official ChatGPT-style UI components | ✅ **IMPLEMENTED** |
| **Vite + TypeScript** | Modern build system with HMR | ✅ **IMPLEMENTED** |

### **Backend Stack**
| Technology | Purpose | Status |
|------------|---------|--------|
| **Cloudflare Workers** | Serverless edge computing | ✅ **IMPLEMENTED** |
| **MCP Architecture** | Model Context Protocol for AI tools | ✅ **IMPLEMENTED** |
| **Cloudflare AI Search** | Managed vector database with auto-indexing | ✅ **IMPLEMENTED** |
| **Cloudflare R2** | Object storage for brand content | ✅ **IMPLEMENTED** |
| **Firecrawl API** | Premium content extraction | ✅ **IMPLEMENTED** |

### **Database & State**
| Technology | Purpose | Status |
|------------|---------|--------|
| **Supabase PostgreSQL** | Primary database with real-time features | ✅ **IMPLEMENTED** |
| **pgvector Extension** | Vector storage for embeddings | ✅ **IMPLEMENTED** |
| **TanStack DB Collections** | Client-side reactive data | ✅ **IMPLEMENTED** |
| **Real-time Subscriptions** | Live data synchronization | ✅ **IMPLEMENTED** |

---

## 🚀 3. Core Features Status

### **✅ Phase 1: Foundation (COMPLETED)**
| Feature | Description | Implementation |
|---------|-------------|----------------|
| **TanStack Start App** | Full-stack React with file-based routing | File-based routes in `frontend/src/app/` |
| **Brand Discovery** | Automated content extraction and analysis | Firecrawl + R2 + AI Search pipeline |
| **Reactive Forms** | TanStack Form with real-time validation | Domain input with async validation |
| **Professional UI** | ChatGPT-style interface with AI Elements | Official components with animations |
| **Server Routes** | Type-safe API endpoints | `/api/scan` and `/api/chat` routes |
| **Edge Deployment** | Global distribution via Cloudflare | Workers + Pages deployment ready |

### **🔄 Phase 2: Enhancement (IN PROGRESS)**
| Feature | Description | Priority |
|---------|-------------|----------|
| **Real-time Analytics** | Live brand discovery progress tracking | HIGH |
| **Advanced Error Handling** | Production-ready error boundaries | HIGH |
| **Performance Optimization** | Edge caching and compression | MEDIUM |
| **Mobile Optimization** | Responsive design improvements | MEDIUM |
| **Multi-brand Management** | Tenant isolation and management | LOW |

### **🔮 Phase 3: Advanced (PLANNED)**
| Feature | Description | Timeline |
|---------|-------------|----------|
| **Enterprise Authentication** | SSO and role-based access control | Q2 2025 |
| **API Rate Limiting** | Usage controls and billing integration | Q2 2025 |
| **Custom AI Models** | Brand-specific AI training | Q3 2025 |
| **White-label Solutions** | Brand-customized deployments | Q3 2025 |

---

## 🧱 4. Data Architecture

### **TanStack DB Collections**
```typescript
// Client-side reactive collections
interface BrandsCollection {
  id: string;
  domain: string;
  name: string;
  status: 'analyzing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

interface BrandContentCollection {
  id: string;
  brand_id: string;
  content_type: 'product' | 'blog' | 'docs' | 'company_info';
  title: string;
  url: string;
  content: string;
  metadata: Record<string, any>;
}

interface MappingProgressCollection {
  id: string;
  domain: string;
  current_step: string;
  progress_percentage: number;
  status: 'in_progress' | 'completed' | 'failed';
  urls_discovered: number;
  error_message?: string;
}
```

### **Supabase Database Schema**
```sql
-- Core brand information
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT UNIQUE NOT NULL,
  name TEXT,
  description TEXT,
  logo_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Brand content with vector embeddings
CREATE TABLE brand_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id),
  content_type TEXT NOT NULL,
  title TEXT,
  url TEXT,
  content TEXT,
  metadata JSONB,
  embedding VECTOR(1536), -- OpenAI text-embedding-3-small
  created_at TIMESTAMP DEFAULT NOW()
);

-- Real-time progress tracking
CREATE TABLE firecrawl_mapping_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL,
  current_step TEXT,
  progress_percentage INTEGER DEFAULT 0,
  status TEXT DEFAULT 'initializing',
  urls_discovered INTEGER DEFAULT 0,
  company_info_count INTEGER DEFAULT 0,
  blog_count INTEGER DEFAULT 0,
  docs_count INTEGER DEFAULT 0,
  ecommerce_count INTEGER DEFAULT 0,
  subdomains TEXT[] DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔌 5. API Architecture

### **TanStack Start Server Routes**
| Route | Method | Purpose | Implementation |
|-------|--------|---------|----------------|
| `/api/scan` | POST | Brand discovery pipeline | Proxy to Cloudflare Worker |
| `/api/chat` | POST | AI chat with MCP tools | Streaming AI responses |

### **Cloudflare Worker Endpoints**
| Endpoint | Method | Purpose | Features |
|----------|--------|---------|----------|
| `/brand-discovery` | POST | Content extraction pipeline | Firecrawl + R2 + AI Search |
| `/mcp` | GET | MCP tools discovery | Brand search and e-commerce |
| `/health` | GET | Service health check | System status monitoring |

### **MCP Tools Integration**
```typescript
// Available MCP tools for AI integration
interface MCPTools {
  "cloudflare-ai-search": {
    description: "Search brand content with AI-generated responses";
    parameters: { query: string; brand?: string };
  };
  "browse-merchandise": {
    description: "Interactive product catalog browsing";
    parameters: { category?: string; brand?: string };
  };
  "purchase-merchandise": {
    description: "E-commerce transaction processing";
    parameters: { product_id: string; quantity: number };
  };
}
```

---

## 🎯 6. User Experience Flow

### **Brand Discovery Journey**
1. **Landing** → User visits `/playground` with TanStack Start routing
2. **Input** → TanStack Form validates domain with real-time feedback
3. **Submission** → Server Route proxies to Cloudflare Worker
4. **Processing** → Firecrawl extracts content, uploads to R2
5. **Indexing** → AI Search auto-generates embeddings
6. **Results** → TanStack DB live queries show real-time updates
7. **Interaction** → AI Elements provide ChatGPT-style interface

### **Real-time Updates**
```typescript
// Live query example for progress tracking
const { data: progress } = useLiveQuery(
  (q) => {
    if (!mappingProgressCollection || !currentDomain) return undefined;
    
    return q
      .from({ progress: mappingProgressCollection })
      .where(({ progress }) => eq(progress.domain, currentDomain))
      .orderBy(({ progress }) => progress.updated_at, "desc")
      .limit(1);
  },
  [currentDomain]
);
```

---

## ⚡ 7. Performance Requirements

### **Response Times**
| Operation | Target | Current | Status |
|-----------|--------|---------|--------|
| Page Load (TanStack Start) | < 500ms | ~300ms | ✅ **ACHIEVED** |
| Form Validation | < 100ms | ~50ms | ✅ **ACHIEVED** |
| Brand Discovery API | < 30s | ~15s | ✅ **ACHIEVED** |
| AI Search Query | < 1s | ~400ms | ✅ **ACHIEVED** |
| Real-time Updates | < 200ms | ~100ms | ✅ **ACHIEVED** |

### **Scalability Targets**
- **Concurrent Users**: 10,000+ (Cloudflare global edge)
- **Brand Processing**: 100+ domains/hour
- **Content Storage**: 1TB+ in R2 buckets
- **Search Index**: 1M+ documents in AI Search

---

## 🧪 8. Development & Deployment

### **Local Development Setup**
```bash
# Prerequisites
node >= 18
bun >= 1.0
wrangler >= 3.0

# Frontend (TanStack Start)
cd frontend
bun install
bun run dev  # http://localhost:3001

# Backend (Cloudflare Workers)
cd backend  
bun install
bun run dev  # http://localhost:8787
```

### **Production Deployment**
```bash
# Frontend → Cloudflare Pages
cd frontend
bun run build
wrangler pages deploy dist/client

# Backend → Cloudflare Workers
cd backend
bun run deploy
```

### **Environment Configuration**
| Environment | Frontend | Backend | Database |
|-------------|----------|---------|----------|
| **Development** | Vite dev server | Wrangler local | Supabase local |
| **Staging** | Cloudflare Pages | Workers staging | Supabase staging |
| **Production** | Cloudflare Pages | Workers production | Supabase production |

---

## 📊 9. Success Metrics

### **Technical KPIs**
- **Build Time**: < 30 seconds (TanStack Start + Vite)
- **Bundle Size**: < 500KB (frontend optimized)
- **Lighthouse Score**: 95+ (performance, accessibility, SEO)
- **Type Safety**: 100% (TypeScript throughout)

### **Business KPIs**
- **Brand Onboarding**: < 60 seconds from input to results
- **Content Discovery**: 95%+ accuracy in categorization
- **User Engagement**: 80%+ completion rate on brand analysis
- **Error Rate**: < 1% in production deployment

### **Developer Experience KPIs**
- **Hot Reload**: < 200ms (Vite HMR)
- **Type Errors**: Caught at build time (TypeScript)
- **Code Quality**: 90+ (Biome linting)
- **Test Coverage**: 80%+ (Vitest integration)

---

## 🔐 10. Security & Compliance

### **Frontend Security**
- **CSP Headers**: Strict content security policy
- **HTTPS Only**: All communication encrypted
- **XSS Protection**: Sanitized user inputs
- **Type Safety**: Runtime validation with Zod

### **Backend Security**
- **Environment Variables**: Secure secret management
- **CORS Configuration**: Restricted cross-origin requests
- **Rate Limiting**: API abuse prevention
- **Input Validation**: Server-side validation

### **Data Privacy**
- **GDPR Compliance**: User data protection
- **Data Retention**: Configurable cleanup policies
- **Audit Logging**: Security event tracking
- **Access Control**: Role-based permissions

---

## 🚀 11. Deployment Strategy

### **Infrastructure**
- **Frontend**: Cloudflare Pages (global CDN)
- **Backend**: Cloudflare Workers (edge computing)
- **Database**: Supabase (managed PostgreSQL)
- **Storage**: Cloudflare R2 (object storage)
- **Search**: Cloudflare AI Search (vector database)

### **Release Process**
1. **Development**: Local testing with hot reload
2. **Testing**: Automated tests with Vitest
3. **Staging**: Preview deployments on Cloudflare
4. **Production**: Blue-green deployment strategy
5. **Monitoring**: Real-time performance tracking

---

## 📈 12. Future Roadmap

### **Q1 2025: Foundation**
- ✅ TanStack Start migration
- ✅ Cloudflare Workers backend
- ✅ Brand discovery pipeline
- ✅ Production deployment

### **Q2 2025: Enhancement**
- 🔄 Real-time analytics dashboard
- 🔄 Advanced error handling
- 🔄 Mobile optimization
- 🔄 Multi-tenant architecture

### **Q3 2025: Scale**
- 🔮 Enterprise authentication
- 🔮 Custom AI model training
- 🔮 White-label solutions
- 🔮 Advanced compliance tools

### **Q4 2025: Innovation**
- 🔮 Voice interface integration
- 🔮 AR/VR shopping experiences
- 🔮 Blockchain payment integration
- 🔮 Global marketplace launch

---

**Built with modern web standards for the AI-first future of commerce.** 🚀