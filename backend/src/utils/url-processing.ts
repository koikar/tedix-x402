/**
 * URL processing utilities for brand discovery and content analysis
 */

export interface FirecrawlMapLink {
  url: string;
  title?: string;
  description?: string;
  category?: string;
  priority?: number; // Added by our processing
}

// Generic interface for objects that can be categorized
interface CategorizableItem {
  priority?: number | null;
  url: string;
}

// Generic categorized collection interface
export interface CategorizedUrls<T extends CategorizableItem = FirecrawlMapLink> {
  info: T[]; // Company info, about, contact, homepage
  blog: T[]; // News, articles, blog posts
  docs: T[]; // Documentation, help, support, guides
  shop: T[]; // Ecommerce, products, pricing, catalog
  other: T[]; // Everything else
}

/**
 * Advanced categorization with scoring system
 */
export function categorizeUrls(links: FirecrawlMapLink[]): CategorizedUrls {
  const categories: CategorizedUrls = {
    info: [],
    blog: [],
    docs: [],
    shop: [],
    other: [],
  };

  // Simplified patterns for 4 core brand categories
  const patterns = {
    info: {
      subdomains: ["www", "main", "corporate", "about"],
      paths: [
        "about",
        "company",
        "team",
        "careers",
        "contact",
        "investors",
        "leadership",
        "mission",
        "values",
        "home",
        "",
        "/",
      ],
      titles: ["about us", "our team", "careers", "contact us", "leadership", "company", "home"],
    },
    blog: {
      subdomains: ["blog", "news", "media", "press", "stories"],
      paths: [
        "blog",
        "news",
        "articles",
        "updates",
        "press",
        "media",
        "stories",
        "insights",
        "newsroom",
      ],
      titles: ["blog", "news", "article", "press", "update", "story"],
    },
    docs: {
      subdomains: ["docs", "help", "support", "api", "developer", "dev"],
      paths: [
        "docs",
        "documentation",
        "help",
        "support",
        "guide",
        "api",
        "reference",
        "tutorial",
        "manual",
        "faq",
      ],
      titles: ["documentation", "help", "guide", "api", "reference", "tutorial", "support"],
    },
    shop: {
      subdomains: ["shop", "store", "buy", "checkout", "cart", "marketplace"],
      paths: [
        "shop",
        "store",
        "buy",
        "cart",
        "checkout",
        "products",
        "catalog",
        "marketplace",
        "order",
        "pricing",
        "plans",
        "purchase",
      ],
      titles: ["shop", "store", "buy", "product", "catalog", "marketplace", "pricing"],
    },
  };

  links.forEach((link) => {
    try {
      const urlObj = new URL(link.url);
      const hostname = urlObj.hostname.toLowerCase();
      const pathname = urlObj.pathname.toLowerCase();
      const title = (link.title || "").toLowerCase();

      let category: keyof CategorizedUrls = "other";
      let priority = 0;

      // Check each category for matches
      for (const [categoryName, categoryPatterns] of Object.entries(patterns)) {
        let categoryScore = 0;

        // Subdomain matching (highest priority)
        if (
          categoryPatterns.subdomains.some(
            (subdomain) =>
              hostname.startsWith(`${subdomain}.`) || hostname.includes(`${subdomain}.`),
          )
        ) {
          categoryScore += 100;
        }

        // Path matching (high priority)
        if (
          categoryPatterns.paths.some(
            (path) => pathname.includes(`/${path}`) || pathname.includes(path),
          )
        ) {
          categoryScore += 50;
        }

        // Title matching (medium priority)
        if (categoryPatterns.titles?.some((keyword) => title.includes(keyword))) {
          categoryScore += 25;
        }

        // Homepage gets special treatment for info category
        if (categoryName === "info" && (pathname === "/" || pathname === "/home")) {
          categoryScore += 30;
        }

        if (categoryScore > priority) {
          category = categoryName as keyof CategorizedUrls;
          priority = categoryScore;
        }
      }

      categories[category].push({ ...link, priority });
    } catch {
      categories.other.push({ ...link, priority: 0 });
    }
  });

  return categories;
}

/**
 * Select top URLs per category (works with both FirecrawlMapLink and BrandUrl)
 */
export function selectTopUrls<T extends CategorizableItem>(
  categorized: CategorizedUrls<T>,
  maxPerCategory: number = 8,
): T[] {
  const selected: T[] = [];
  const priorities: (keyof CategorizedUrls<T>)[] = ["info", "shop", "docs", "blog", "other"];

  priorities.forEach((category) => {
    const urls = categorized[category] || [];
    const sorted = urls.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    selected.push(...sorted.slice(0, maxPerCategory));

    if (sorted.length > 0) {
      console.log(
        `[URL Processor] ${category}: Selected ${Math.min(sorted.length, maxPerCategory)}/${sorted.length} URLs`,
      );
    }
  });

  return selected;
}

/**
 * Categorize content type for database storage (matches url_category_enum: info, blog, docs, shop, other)
 */
export function categorizeContent(url: string): "info" | "blog" | "docs" | "shop" | "other" {
  try {
    const path = new URL(url).pathname.toLowerCase();

    // Info: Company info, about, contact, homepage
    if (
      path === "/" ||
      path === "/home" ||
      path.includes("/about") ||
      path.includes("/company") ||
      path.includes("/contact") ||
      path.includes("/careers") ||
      path.includes("/team") ||
      path.includes("/mission")
    ) {
      return "info";
    }

    // Blog: News, articles, blog posts
    else if (
      path.includes("/blog") ||
      path.includes("/news") ||
      path.includes("/article") ||
      path.includes("/press") ||
      path.includes("/stories") ||
      path.includes("/insights")
    ) {
      return "blog";
    }

    // Docs: Documentation, help, support, guides
    else if (
      path.includes("/docs") ||
      path.includes("/documentation") ||
      path.includes("/support") ||
      path.includes("/help") ||
      path.includes("/faq") ||
      path.includes("/api") ||
      path.includes("/guide") ||
      path.includes("/reference") ||
      path.includes("/tutorial")
    ) {
      return "docs";
    }

    // Shop: Ecommerce, products, pricing, catalog
    else if (
      path.includes("/shop") ||
      path.includes("/store") ||
      path.includes("/buy") ||
      path.includes("/pricing") ||
      path.includes("/plans") ||
      path.includes("/product") ||
      path.includes("/features") ||
      path.includes("/catalog") ||
      path.includes("/marketplace")
    ) {
      return "shop";
    } else {
      return "other";
    }
  } catch {
    return "other";
  }
}

/**
 * Validate content quality before storing
 */
export function isValidContent(page: any): boolean {
  const url = page.metadata?.sourceURL || page.url || "";
  const content = page.markdown || "";

  // Skip error pages
  if (url.includes("/404") || url.includes("/500") || url.includes("error")) {
    console.log(`⏩ Skipping error page: ${url}`);
    return false;
  }

  // Skip if content is too short
  if (content && content.length < 50) {
    console.log(`⏩ Skipping short content: ${url} (${content.length} chars)`);
    return false;
  }

  // Skip if title is generic error
  if (
    page.metadata?.title &&
    (page.metadata.title.toLowerCase().includes("error") ||
      page.metadata.title.toLowerCase().includes("not found"))
  ) {
    console.log(`⏩ Skipping error title: ${url}`);
    return false;
  }

  return true;
}

/**
 * Clean and process content for better RAG performance
 */
export function cleanContent(content: string): string {
  return (
    content
      // Remove excessive whitespace
      .replace(/\n\s*\n\s*\n/g, "\n\n")
      // Remove navigation and footer patterns
      .replace(/^(Home|About|Contact|Blog|Products?)$/gm, "")
      // Remove common footer text
      .replace(/©.*\d{4}.*$/gm, "")
      // Clean up markdown artifacts
      .replace(/\[.*?\]\(.*?\)/g, "") // Remove markdown links
      .replace(/^#{1,6}\s*/gm, "") // Remove markdown headers but keep content
      .trim()
  );
}

/**
 * URL normalization
 */
export function normalizeUrl(input: string): string {
  if (!input) return "";

  try {
    let decoded = decodeURIComponent(input);
    decoded = decoded.replace(/^https?:\/\//, "");
    decoded = decoded.replace(/^www\./, "");
    decoded = decoded.split("/")[0];
    decoded = decoded.split(":")[0];
    decoded = decoded.toLowerCase().trim();

    if (!decoded || !decoded.includes(".")) {
      throw new Error(`Invalid domain format: ${input}`);
    }

    console.log(`[URL Processor] URL normalized: "${input}" → "${decoded}"`);
    return decoded;
  } catch (error) {
    console.error(`[URL Processor] URL normalization failed:`, error);
    return input
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .toLowerCase()
      .trim();
  }
}
