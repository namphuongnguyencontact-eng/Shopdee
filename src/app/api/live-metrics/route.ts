import { NextResponse } from "next/server";
import { liveMetricsService } from "@/services/liveMetrics";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await liveMetricsService.getLiveMetrics();
    return NextResponse.json(
      { success: true, data },
      {
        headers: {
          "Cache-Control": "public, s-maxage=5, stale-while-revalidate=10",
        },
      }
    );
  } catch (err: unknown) {
    console.error("Live metrics error:", err);
    return NextResponse.json(
      {
        success: false,
        data: {
          activeShoppers: 0,
          cartAddsLastHour: 0,
          successfulOrdersLastHour: 0,
          updatedAt: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
