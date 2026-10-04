import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { scrapeShopeeProduct, scrapeMultipleShopeeProducts } from "@/lib/shopeeScraper";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, error: { message: "Bạn không có quyền thực hiện thao tác này." } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { url, urls } = body;

    // Single product scrape
    if (url && typeof url === "string") {
      const data = await scrapeShopeeProduct(url);
      return NextResponse.json({ success: true, data });
    }

    // Bulk product scrape
    if (Array.isArray(urls) && urls.length > 0) {
      const data = await scrapeMultipleShopeeProducts(urls);
      return NextResponse.json({
        success: true,
        data,
        total: data.length,
      });
    }

    return NextResponse.json(
      { success: false, error: { message: "Vui lòng cung cấp link Shopee hợp lệ (url hoặc danh sách urls)." } },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("Scrape Shopee error:", err);
    return NextResponse.json(
      { success: false, error: { message: err?.message || "Lỗi khi quét thông tin từ Shopee." } },
      { status: 500 }
    );
  }
}
