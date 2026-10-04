import { NextRequest, NextResponse } from "next/server";
import { recommendationService } from "@/services/recommendation";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const categorySlug = searchParams.get("categorySlug");
    const limit = parseInt(searchParams.get("limit") || "8", 10);

    const session = getSessionFromRequest(req);

    if (productId && categorySlug) {
      const related = await recommendationService.getRelatedProducts(productId, categorySlug, limit);
      return NextResponse.json({ success: true, data: related });
    }

    const personalized = await recommendationService.getPersonalizedProducts(session?.userId, limit);
    return NextResponse.json({ success: true, data: personalized });
  } catch (err: unknown) {
    console.error("Recommendations GET error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi tải gợi ý." } }, { status: 500 });
  }
}
