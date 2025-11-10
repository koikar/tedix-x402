import { z } from "zod";

// Zod schemas for API validation with type inference
export const BrandDiscoveryRequestSchema = z.object({
  domain: z.string().min(1, "Domain is required"),
  options: z
    .object({
      priority: z.enum(["high", "normal"]).optional(),
      skipExtract: z.boolean().optional(),
    })
    .optional(),
});

export const BrandDiscoveryResponseSchema = z.object({
  success: z.boolean(),
  brandId: z.string().optional(),
  status: z.string(),
  message: z.string(),
  extractJobId: z.string().optional(),
  crawlJobId: z.string().optional(),
  estimatedTime: z.string().optional(),
});

export const WebhookRequestSchema = z.object({
  type: z.enum(["extract_completed", "crawl_completed", "extract_failed", "crawl_failed"]),
  data: z.any(),
  jobId: z.string(),
});

export const CleanupRequestSchema = z.object({
  brandsToKeep: z.array(z.string()).optional(),
});

export const CleanupResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  brandsKept: z.array(z.string()),
  deletedFolders: z.array(z.string()),
  errors: z.array(z.string()),
  summary: z.object({
    totalBrandFolders: z.number(),
    deleted: z.number(),
    kept: z.number(),
    errors: z.number(),
  }),
});

// Brand content upload schemas
export const BrandContentUploadRequestSchema = z.object({
  brandId: z.string(),
  domain: z.string(),
  content: z.array(
    z.object({
      title: z.string(),
      content: z.string(),
      url: z.string(),
      metadata: z.record(z.any()).optional(),
    }),
  ),
});

export const BrandContentUploadResultSchema = z.object({
  success: z.boolean(),
  summary: z.object({
    total: z.number(),
    successful: z.number(),
    failed: z.number(),
  }),
  results: z.array(
    z.object({
      success: z.boolean(),
      url: z.string().optional(),
      key: z.string().optional(),
      error: z.string().optional(),
    }),
  ),
});

// Enhanced brand discovery schemas
export const BrandDiscoveryResultSchema = z.object({
  success: z.boolean(),
  brandId: z.string().optional(),
  brand: z.any().optional(), // Supabase Brand type - using any for flexibility
  extractJobId: z.string().optional(),
  mapJobId: z.string().optional(),
  scrapeJobId: z.string().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export const ProcessedContentSchema = z.object({
  url: z.string(),
  title: z.string(),
  content: z.string(),
  processed_content: z.string(),
  contentType: z.string(),
  images: z.array(z.string()).optional(),
});

// Inferred TypeScript types from schemas
export type BrandDiscoveryRequest = z.infer<typeof BrandDiscoveryRequestSchema>;
export type BrandDiscoveryResponse = z.infer<typeof BrandDiscoveryResponseSchema>;
export type BrandDiscoveryResult = z.infer<typeof BrandDiscoveryResultSchema>;
export type ProcessedContent = z.infer<typeof ProcessedContentSchema>;
export type WebhookRequest = z.infer<typeof WebhookRequestSchema>;
export type CleanupRequest = z.infer<typeof CleanupRequestSchema>;
export type CleanupResponse = z.infer<typeof CleanupResponseSchema>;
export type BrandContentUploadRequest = z.infer<typeof BrandContentUploadRequestSchema>;
export type BrandContentUploadResult = z.infer<typeof BrandContentUploadResultSchema>;

// AI Search sync schemas
export const AiSearchSyncRequestSchema = z.object({
  accountId: z.string(),
  ragId: z.string().min(1).max(32),
});

export const AiSearchSyncResponseSchema = z.object({
  success: z.boolean(),
  result: z.object({
    job_id: z.string(),
  }),
  errors: z.array(z.any()).optional(),
  messages: z.array(z.any()).optional(),
});

export type AiSearchSyncRequest = z.infer<typeof AiSearchSyncRequestSchema>;
export type AiSearchSyncResponse = z.infer<typeof AiSearchSyncResponseSchema>;
