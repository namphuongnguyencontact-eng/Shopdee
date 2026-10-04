import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { analyticsService } from "@/services/analytics";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: { message: "Không có quyền Admin." } }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "7d";
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    const now = new Date();
    let startDate = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
    let endDate = now;

    if (range === "today") {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
    } else if (range === "7d") {
      startDate = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
    } else if (range === "30d") {
      startDate = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
    } else if (range === "90d") {
      startDate = new Date(now.getTime() - 90 * 24 * 3600 * 1000);
    } else if (fromParam && toParam) {
      startDate = new Date(fromParam);
      endDate = new Date(toParam);
    }

    const [trafficData, devices] = await Promise.all([
      analyticsService.getTrafficOverview(startDate, endDate),
      analyticsService.getDeviceStats(startDate, endDate),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        overview: trafficData.overview,
        kpis: trafficData.kpis,
        timeSeries: trafficData.timeSeries,
        devices: devices.list,
        deviceDetails: devices,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          range,
        },
      },
    });
  } catch (err: unknown) {
    console.error("Traffic analytics error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi tải traffic analytics." } }, { status: 500 });
  }
}
