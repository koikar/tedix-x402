import { Hono } from "hono";
import { processPendingExtractJobs } from "../../jobs/cron";

export const testCronRouter = new Hono<{ Bindings: Env }>();

// Test endpoint to manually trigger cron job processing
testCronRouter.post("/trigger", async (c) => {
  try {
    console.log("🕒 [Test Cron] Manually triggering extract job processing...");
    await processPendingExtractJobs(c.env);

    return c.json({
      success: true,
      message: "Cron job processing completed",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Test Cron] Error:", error);
    return c.json(
      {
        success: false,
        error: "Cron job failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});
