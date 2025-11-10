import type { AiSearchSyncResponse } from "../schema";

/**
 * Trigger Cloudflare AI Search sync to vectorize uploaded R2 content
 */
export async function aiSearchSync(env: Env): Promise<AiSearchSyncResponse | null> {
  try {
    // AI Search configuration from environment
    const ACCOUNT_ID = env.AI_SEARCH_ACCOUNT_ID;
    const RAG_ID = env.AI_SEARCH_INSTANCE;

    if (!ACCOUNT_ID || !RAG_ID || !env.AI_SEARCH_API_TOKEN) {
      console.error("[AiSearch] Missing required environment variables");
      return null;
    }

    console.log(`[AiSearch] Triggering sync for instance: ${RAG_ID}`);

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/autorag/rags/${RAG_ID}/sync`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${env.AI_SEARCH_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[AiSearch] Sync failed: ${response.status} - ${errorText}`);
      return null;
    }

    const result: AiSearchSyncResponse = await response.json();
    console.log(`✅ [AiSearch] Sync triggered successfully`);
    console.log(`   📊 Job ID: ${result.result.job_id}`);
    console.log(`   ✅ Success: ${result.success}`);

    return result;
  } catch (error) {
    console.error("[AiSearch] Error triggering sync:", error);
    return null;
  }
}
