import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import TrafficSession from "@/models/TrafficSession";
import { classifyTraffic, parseUserAgent } from "@/lib/trafficClassifier";
import { getSessionFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sessionId,
      visitorId,
      path = "/",
      referrer = "",
      searchParams = {},
      userAgent = req.headers.get("user-agent") || "",
    } = body;

    if (!sessionId || !visitorId) {
      return NextResponse.json({ success: false, error: { message: "Missing sessionId or visitorId" } }, { status: 400 });
    }

    await connectDB();
    const userSession = getSessionFromRequest(req);
    const userId = userSession?.userId;

    const isShoppingRoute =
      path.startsWith("/products") ||
      path.startsWith("/product/") ||
      path.startsWith("/cart") ||
      path.startsWith("/checkout") ||
      path.startsWith("/category") ||
      path.startsWith("/categories") ||
      path.includes("search");

    const now = new Date();

    // Check if TrafficSession already exists
    const existingSession = await TrafficSession.findOne({ sessionId });

    if (!existingSession) {
      // Determine if new visitor
      const previousVisitorSession = await TrafficSession.findOne({ visitorId });
      const isNewVisitor = !previousVisitorSession;

      // Classify traffic
      const traffic = classifyTraffic(referrer, searchParams);
      const clientDevice = parseUserAgent(userAgent);

      await TrafficSession.create({
        sessionId,
        visitorId,
        userId,
        firstSeenAt: now,
        lastSeenAt: now,
        lastShoppingActivityAt: isShoppingRoute ? now : undefined,
        landingPage: path,
        currentPage: path,
        referrer,
        referrerDomain: traffic.referrerDomain,
        source: traffic.source,
        category: traffic.category,
        medium: traffic.medium,
        campaign: traffic.campaign,
        term: traffic.term,
        content: traffic.content,
        device: clientDevice.device,
        browser: clientDevice.browser,
        os: clientDevice.os,
        pageViewCount: 1,
        isNewVisitor,
      });
    } else {
      existingSession.lastSeenAt = now;
      existingSession.currentPage = path;
      if (userId && !existingSession.userId) {
        existingSession.userId = userId as any;
      }
      if (isShoppingRoute) {
        existingSession.lastShoppingActivityAt = now;
      }
      await existingSession.save();
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Heartbeat error:", err);
    return NextResponse.json({ success: false, error: { message: "Heartbeat failed" } }, { status: 500 });
  }
}
