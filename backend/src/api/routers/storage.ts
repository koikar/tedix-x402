import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { deleteBrandContent, listObjects, uploadBrandContent } from "../../utils/r2";
import { BrandContentUploadRequestSchema, CleanupRequestSchema } from "../schema";

export const storageRouter = new Hono<{ Bindings: Env }>();

// R2 content upload endpoint
storageRouter.post(
  "/upload-brand-content",
  zValidator("json", BrandContentUploadRequestSchema),
  async (c) => {
    try {
      const { brandId, domain, content } = c.req.valid("json");

      const results = await uploadBrandContent(c.env.DEV_TEDIX_BUCKET, brandId, domain, content, {
        overwrite: false,
      });

      const successful = results.filter((r) => r.success).length;
      const failed = results.length - successful;

      console.log(
        `[R2Upload] Processed ${results.length} items for ${domain}: ${successful} successful, ${failed} failed`,
      );

      return c.json({
        success: successful > 0,
        summary: {
          total: results.length,
          successful,
          failed,
        },
        results,
        aiSearchInfo: {
          bucket: c.env.R2_BUCKET_NAME || "brands",
          folderStructure: `brands/${domain}/content/`,
          autoIndexing: "AI Search will automatically index new content",
          estimatedTime: "1-5 minutes for indexing to complete",
        },
      });
    } catch (error) {
      console.error("[R2Upload] Upload error:", error);
      return c.json(
        {
          success: false,
          error: "Upload failed",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        500,
      );
    }
  },
);

// R2 bucket cleanup endpoint
storageRouter.post("/cleanup-r2", zValidator("json", CleanupRequestSchema), async (c) => {
  try {
    const { brandsToKeep: requestedBrands } = c.req.valid("json");
    const brandsToKeep = requestedBrands || ["nosana.io", "mastra"];

    console.log(`🧹 [R2Cleanup] Starting cleanup, keeping brands: ${brandsToKeep.join(", ")}`);

    // List all brand folders
    const allObjects = await listObjects(c.env.DEV_TEDIX_BUCKET, "brands/");

    if (allObjects.length === 0) {
      console.log("🧹 [R2Cleanup] No brand content found");
      return c.json({
        success: true,
        message: "No brand content found",
        brandsKept: brandsToKeep,
        deletedFolders: [],
        errors: [],
        summary: {
          totalBrandFolders: 0,
          deleted: 0,
          kept: 0,
          errors: 0,
        },
      });
    }

    // Extract unique brand folders
    const brandFolders = new Set<string>();
    for (const obj of allObjects) {
      const pathParts = obj.key.split("/");
      if (pathParts.length >= 2 && pathParts[0] === "brands") {
        brandFolders.add(pathParts[1]);
      }
    }

    console.log(`🧹 [R2Cleanup] Found ${brandFolders.size} brand folders`);

    // Delete content for brands not in keep list
    const deletedFolders: string[] = [];
    const errors: string[] = [];

    for (const brandDomain of brandFolders) {
      if (!brandsToKeep.includes(brandDomain)) {
        console.log(`🗑️ [R2Cleanup] Deleting content for: ${brandDomain}`);

        try {
          // TODO: Update cleanup function for UUID-based folder structure
          // For now, using domain as brandId (this needs to be updated)
          const deletedCount = await deleteBrandContent(c.env.DEV_TEDIX_BUCKET, brandDomain, brandDomain);

          if (deletedCount > 0) {
            deletedFolders.push(brandDomain);
            console.log(`✅ [R2Cleanup] Deleted ${deletedCount} objects from ${brandDomain}`);
          }
        } catch (error) {
          const errorMsg = `Failed to delete ${brandDomain}: ${error}`;
          console.error(`❌ [R2Cleanup] ${errorMsg}`);
          errors.push(errorMsg);
        }
      } else {
        console.log(`✅ [R2Cleanup] Keeping brand: ${brandDomain}`);
      }
    }

    console.log(
      `🎉 [R2Cleanup] Cleanup completed. Deleted: ${deletedFolders.length} brands, Errors: ${errors.length}`,
    );

    return c.json({
      success: true,
      message: `Cleanup completed successfully`,
      brandsKept: brandsToKeep,
      deletedFolders,
      errors,
      summary: {
        totalBrandFolders: brandFolders.size,
        deleted: deletedFolders.length,
        kept: brandsToKeep.filter((brand) => brandFolders.has(brand)).length,
        errors: errors.length,
      },
    });
  } catch (error) {
    console.error("[R2Cleanup] Cleanup error:", error);
    return c.json(
      {
        success: false,
        error: "Cleanup failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});

// R2 bucket inspection endpoint
storageRouter.get("/list-bucket", async (c) => {
  try {
    const prefix = c.req.query("prefix") || "";
    const limit = Number(c.req.query("limit") || "100");

    const objects = await listObjects(c.env.DEV_TEDIX_BUCKET, prefix, limit);

    return c.json({
      success: true,
      prefix,
      count: objects.length,
      objects: objects.map(obj => ({
        key: obj.key,
        size: obj.size,
        lastModified: obj.uploaded,
      })),
    });
  } catch (error) {
    console.error("[R2List] Error listing bucket:", error);
    return c.json(
      {
        success: false,
        error: "Failed to list bucket",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});

// R2 bucket complete cleanup endpoint 
storageRouter.post("/cleanup-all", async (c) => {
  try {
    const objects = await listObjects(c.env.DEV_TEDIX_BUCKET, "", 1000);

    if (objects.length === 0) {
      return c.json({
        success: true,
        message: "Bucket already empty",
        deleted: 0,
      });
    }

    // Delete all objects in batches
    const BATCH_SIZE = 100;
    let totalDeleted = 0;

    for (let i = 0; i < objects.length; i += BATCH_SIZE) {
      const batch = objects.slice(i, i + BATCH_SIZE);
      const keys = batch.map(obj => obj.key);

      try {
        await c.env.DEV_TEDIX_BUCKET.delete(keys);
        totalDeleted += batch.length;
        console.log(`[R2Cleanup] Deleted batch ${i / BATCH_SIZE + 1}: ${batch.length} objects`);
      } catch (error) {
        console.error(`[R2Cleanup] Failed to delete batch starting at ${i}:`, error);
      }
    }

    return c.json({
      success: true,
      message: `Cleaned up entire bucket`,
      deleted: totalDeleted,
      total: objects.length,
    });

  } catch (error) {
    console.error("[R2Cleanup] Complete cleanup error:", error);
    return c.json(
      {
        success: false,
        error: "Complete cleanup failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});
