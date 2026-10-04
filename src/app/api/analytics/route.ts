import { NextRequest, NextResponse } from "next/server";
import { analyticsService } from "@/services/analytics";
import { getSessionFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    const body = await req.json();
    const {
      eventType,
      productId,
      categoryId,
      metadata,
      sessionId,
      visitorId,
      path,
      referrer,
      source,
      medium,
      campaign,
      device,
    } = body;

    if (!eventType) {
      return NextResponse.json({ success: false, error: { message: "Thiếu eventType." } }, { status: 400 });
    }

    await analyticsService.logEvent({
      userId: session?.userId,
      sessionId,
      visitorId,
      eventType,
      path: path || "/",
      referrer,
      source,
      medium,
      campaign,
      productId,
      categoryId,
      metadata,
      device: device || "desktop",
      ip: req.headers.get("x-forwarded-for") || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Analytics log error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi ghi nhận analytics." } }, { status: 500 });
  }
}
