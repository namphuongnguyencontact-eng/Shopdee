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

    const isAdmin = session?.role === "admin";
    const targetPath = path || "/";

    // Strictly exclude admin dashboard activities and admin accounts from visitor/pageview analytics
    if (isAdmin || targetPath.startsWith("/admin")) {
      return NextResponse.json({ success: true, ignored: true });
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip")?.trim() ||
      (req as unknown as { ip?: string }).ip ||
      "127.0.0.1";

    await analyticsService.logEvent({
      userId: session?.userId,
      isAdmin: false,
      sessionId,
      visitorId,
      eventType,
      path: targetPath,
      referrer,
      source,
      medium,
      campaign,
      productId,
      categoryId,
      metadata,
      device: device || "desktop",
      ip,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Analytics log error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi ghi nhận analytics." } }, { status: 500 });
  }
}
