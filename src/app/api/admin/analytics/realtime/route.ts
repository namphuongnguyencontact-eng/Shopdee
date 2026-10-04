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

    const data = await analyticsService.getRealtimeMonitor();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err: unknown) {
    console.error("Realtime monitor error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi tải realtime monitor." } }, { status: 500 });
  }
}
