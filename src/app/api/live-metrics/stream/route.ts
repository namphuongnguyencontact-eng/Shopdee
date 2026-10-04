import { NextRequest } from "next/server";
import { liveMetricsService } from "@/services/liveMetrics";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // 1. Send initial metrics immediately
      try {
        const initial = await liveMetricsService.getLiveMetrics();
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(initial)}\n\n`));
      } catch (err) {
        console.error("SSE initial fetch error:", err);
      }

      // 2. Interval update every 10 seconds
      const intervalId = setInterval(async () => {
        if (req.signal.aborted) {
          clearInterval(intervalId);
          controller.close();
          return;
        }

        try {
          const metrics = await liveMetricsService.getLiveMetrics();
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(metrics)}\n\n`));
        } catch (err) {
          console.error("SSE interval push error:", err);
        }
      }, 10000);

      req.signal.addEventListener("abort", () => {
        clearInterval(intervalId);
        try {
          controller.close();
        } catch {
          // Stream already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
