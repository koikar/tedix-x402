/**
 * R2 utility functions for brand content operations
 * Following Cloudflare Workers best practices with simple function patterns
 */

import { categorizeContent } from "./url-processing";

export interface BrandContent {
  url: string;
  title: string;
  content: string;
  processed_content?: string;
  contentType?: string;
  images?: string[];
}

export interface R2UploadOptions {
  overwrite?: boolean;
  generateMetadata?: boolean;
}

export interface R2UploadResult {
  url: string;
  r2Key: string;
  success: boolean;
  size?: number;
  error?: string;
}

/**
 * Upload brand content to R2 with proper folder structure
 */
export async function uploadBrandContent(
  r2Bucket: R2Bucket,
  brandId: string,
  domain: string,
  content: BrandContent[],
  options: R2UploadOptions = {},
): Promise<R2UploadResult[]> {
  if (!content || content.length === 0) {
    console.warn(`[R2] No content provided for ${domain}`);
    return [];
  }

  const results: R2UploadResult[] = [];
  const BATCH_SIZE = 5;

  // Process content in batches to avoid overwhelming R2
  for (let i = 0; i < content.length; i += BATCH_SIZE) {
    const batch = content.slice(i, i + BATCH_SIZE);

    const batchPromises = batch.map(async (item, batchIndex) => {
      const globalIndex = i + batchIndex;
      return uploadSingleContent(
        r2Bucket,
        brandId,
        domain,
        item,
        globalIndex,
        options,
      );
    });

    const batchResults = await Promise.allSettled(batchPromises);

    // Process batch results
    batchResults.forEach((result, batchIndex) => {
      const item = batch[batchIndex];

      if (result.status === "fulfilled") {
        results.push(result.value);
      } else {
        results.push({
          url: item.url,
          r2Key: "",
          success: false,
          error: result.reason?.message || "Upload failed",
        });
      }
    });

    // Small delay between batches
    if (i + BATCH_SIZE < content.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  const successful = results.filter((r) => r.success).length;
  console.log(
    `[R2] Upload completed for ${domain}: ${successful}/${results.length} successful`,
  );

  return results;
}

/**
 * Upload single content item to R2
 */
async function uploadSingleContent(
  r2Bucket: R2Bucket,
  brandId: string,
  domain: string,
  contentItem: BrandContent,
  index: number,
  options: R2UploadOptions,
): Promise<R2UploadResult> {
  try {
    const r2Key = generateR2Key(brandId, domain, contentItem.url, index);

    // Check if file exists (unless overwrite is enabled)
    if (!options.overwrite) {
      const existing = await r2Bucket.head(r2Key);
      if (existing) {
        return {
          url: contentItem.url,
          r2Key,
          success: true,
          size: existing.size,
        };
      }
    }

    // Format content as markdown
    const markdownContent = formatAsMarkdown(contentItem, index);
    const contentBuffer = new TextEncoder().encode(markdownContent);

    // Prepare metadata
    const metadata: Record<string, string> = {
      "original-url": contentItem.url,
      "content-type": contentItem.contentType || "page",
      "uploaded-at": new Date().toISOString(),
      domain: domain,
    };

    if (contentItem.title) {
      metadata.title = contentItem.title;
    }

    // Upload to R2
    await r2Bucket.put(r2Key, contentBuffer, {
      httpMetadata: {
        contentType: "text/markdown",
        contentEncoding: "utf-8",
      },
      customMetadata: metadata,
    });

    return {
      url: contentItem.url,
      r2Key,
      success: true,
      size: contentBuffer.length,
    };
  } catch (error) {
    console.error(`[R2] Failed to upload ${contentItem.url}:`, error);
    return {
      url: contentItem.url,
      r2Key: "",
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

/**
 * List objects in R2 bucket with optional prefix
 */
export async function listObjects(
  r2Bucket: R2Bucket,
  prefix?: string,
  limit?: number,
): Promise<R2Object[]> {
  try {
    const options: R2ListOptions = {};
    if (prefix) options.prefix = prefix;
    if (limit) options.limit = limit;

    const result = await r2Bucket.list(options);
    return result.objects;
  } catch (error) {
    console.error(`[R2] Failed to list objects with prefix ${prefix}:`, error);
    return [];
  }
}

/**
 * List content for a specific brand domain
 */
export async function listBrandContent(
  r2Bucket: R2Bucket,
  brandId: string,
  domain: string,
  contentType?: string,
): Promise<R2Object[]> {
  const brandPrefix = getBrandPrefix(brandId, domain);
  const prefix = contentType
    ? `${brandPrefix}/content/${contentType}/`
    : `${brandPrefix}/content/`;

  return listObjects(r2Bucket, prefix);
}

/**
 * Delete all content for a specific brand domain
 */
export async function deleteBrandContent(
  r2Bucket: R2Bucket,
  brandId: string,
  domain: string,
  contentType?: string,
): Promise<number> {
  const objects = await listBrandContent(
    r2Bucket,
    brandId,
    domain,
    contentType,
  );

  if (objects.length === 0) {
    console.log(`[R2] No content found for deletion: ${domain}`);
    return 0;
  }

  // Delete in batches (R2 supports up to 1000 keys per delete call)
  const BATCH_SIZE = 100;
  let deleted = 0;

  for (let i = 0; i < objects.length; i += BATCH_SIZE) {
    const batch = objects.slice(i, i + BATCH_SIZE);
    const keys = batch.map((obj) => obj.key);

    try {
      await r2Bucket.delete(keys);
      deleted += batch.length;
    } catch (error) {
      console.error(`[R2] Failed to delete batch starting at ${i}:`, error);
    }
  }

  console.log(
    `[R2] Deleted ${deleted}/${objects.length} objects for ${domain}`,
  );
  return deleted;
}

/**
 * Generate R2 key following multitenancy folder structure
 */
function generateR2Key(
  brandId: string,
  domain: string,
  url: string,
  index: number,
): string {
  try {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split("/").filter(Boolean);

    // Create descriptive filename
    let filename =
      pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : "index";

    // Remove file extension if present
    filename = filename.replace(/\.[^/.]+$/, "");
    filename = filename || `page-${index}`;

    // Sanitize filename for R2
    filename = filename
      .replace(/[^a-zA-Z0-9\-_]/g, "-")
      .replace(/--+/g, "-")
      .replace(/^-|-$/g, "");

    // Create hierarchical structure using standard categorization
    const contentType = categorizeContent(url);
    const timestamp = Date.now();
    const brandPrefix = getBrandPrefix(brandId, domain);

    return `${brandPrefix}/content/${contentType}/${filename}-${timestamp}.md`;
  } catch (error) {
    // Fallback for invalid URLs
    const brandPrefix = getBrandPrefix(brandId, domain);
    return `${brandPrefix}/content/other/page-${index}-${Date.now()}.md`;
  }
}

/**
 * Get brand-specific R2 prefix for multitenancy
 */
function getBrandPrefix(brandId: string, domain: string): string {
  const normalizedDomain = domain
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .toLowerCase();

  return `brands/${brandId}/${normalizedDomain}`;
}

/**
 * Format extracted content as markdown for R2 storage
 */
function formatAsMarkdown(contentItem: BrandContent, index: number): string {
  const timestamp = new Date().toISOString();
  const imageSection =
    contentItem.images && contentItem.images.length > 0
      ? `\n## Product Images\n${contentItem.images.map((img, i) => `![Product Image ${i + 1}](${img})`).join("\n")}\n`
      : "";

  return `---
title: ${contentItem.title || "Untitled"}
url: ${contentItem.url}
extracted_at: ${timestamp}
content_type: ${contentItem.contentType || "page"}
index: ${index}
images: ${JSON.stringify(contentItem.images || [])}
---

# ${contentItem.title || "Untitled"}

**Source URL:** [${contentItem.url}](${contentItem.url})
**Extracted:** ${timestamp}
**Content Type:** ${contentItem.contentType || "page"}
${contentItem.images?.length ? `**Images Found:** ${contentItem.images.length}` : ""}
${imageSection}
## Content

${contentItem.processed_content || contentItem.content || "No content available"}

---

*Content extracted and processed by Tedix*
*Stored with multitenancy isolation in R2*
`;
}
