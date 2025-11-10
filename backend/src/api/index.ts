import { Hono } from "hono";
import { cors } from "hono/cors";
import { brandDiscoveryRouter } from "./routers/brand-discovery";
import { storageRouter } from "./routers/storage";
import { testCronRouter } from "./routers/test-cron";
import { webhooksRouter } from "./routers/webhooks";

// Create main API router
export const apiRouter = new Hono<{ Bindings: Env }>();

// Add CORS middleware
apiRouter.use(
  "*",
  cors({
    origin: "*", // Configure this properly for production
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

// Mount sub-routers
apiRouter.route("/brand-discovery", brandDiscoveryRouter);
apiRouter.route("/webhook", webhooksRouter);
apiRouter.route("/test-cron", testCronRouter); // For testing cron jobs in development
apiRouter.route("/", storageRouter); // For upload-brand-content and cleanup-r2

// Health check endpoint
apiRouter.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "tedix-backend",
  });
});
