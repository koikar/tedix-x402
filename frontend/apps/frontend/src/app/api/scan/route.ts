import { env } from "@/env";

const processingCache = new Map<string, Promise<any>>();

export async function POST(request: Request) {
  try {
    const { domain } = await request.json();

    if (!domain) {
      return new Response(JSON.stringify({ error: "Domain is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const cleanDomain = normalizeUrl(domain);

    if (processingCache.has(cleanDomain)) {
      console.log(
        `[Playground] Duplicate request detected for ${cleanDomain}, returning cached result`,
      );
      return await processingCache.get(cleanDomain);
    }

    const processingPromise = callWorkerBrandDiscovery(cleanDomain);
    processingCache.set(cleanDomain, processingPromise);

    try {
      const result = await processingPromise;
      return result;
    } finally {
      setTimeout(() => processingCache.delete(cleanDomain), 30000);
    }
  } catch (error) {
    console.error("[Playground] Brand discovery error:", error);
    return new Response(
      JSON.stringify({
        error: "Brand discovery failed",
        details:
          env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

async function callWorkerBrandDiscovery(domain: string) {
  try {
    console.log(`[Playground] Calling worker for brand discovery: ${domain}`);

    const workerUrl = env.BACKEND_URL;
    console.log(workerUrl, "workerUrl");
    const response = await fetch(`${workerUrl}/api/brand-discovery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Worker request failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();

    console.log(`[Playground] ✅ Worker brand discovery completed for ${domain}`);

    return new Response(JSON.stringify(result), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[Playground] Worker call failed:", error);
    throw error;
  }
}

function normalizeUrl(input: string): string {
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

    console.log(`[Playground] URL normalized: "${input}" → "${decoded}"`);
    return decoded;
  } catch (error) {
    console.error(`[Playground] URL normalization failed for "${input}":`, error);
    return input
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/$/, "")
      .toLowerCase()
      .trim();
  }
}
