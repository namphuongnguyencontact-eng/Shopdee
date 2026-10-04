import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { analyticsService } from "@/services/analytics";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: { message: "Không có quyền Admin." } }, { status: 403 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: { message: "Thiếu ID sản phẩm." } }, { status: 400 });
    }

    const data = await analyticsService.getProductAnalytics(id);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err: unknown) {
    console.error("Product analytics error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi tải thông tin analytics sản phẩm." } }, { status: 500 });
  }
}
