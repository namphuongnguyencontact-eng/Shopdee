import { NextRequest, NextResponse } from "next/server";
import { shareService } from "@/services/share";
import { getSessionFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: { message: "Vui lòng đăng nhập để chia sẻ đơn hàng." } }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, quote, template, background, showPrice } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: { message: "Thiếu mã đơn hàng." } }, { status: 400 });
    }

    const shared = await shareService.createSharedOrder({
      userId: session.userId,
      orderId,
      quote,
      template,
      background,
      showPrice,
    });

    return NextResponse.json({
      success: true,
      data: shared,
    });
  } catch (err: unknown) {
    console.error("Share order error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi tạo link chia sẻ đơn hàng." } }, { status: 500 });
  }
}
