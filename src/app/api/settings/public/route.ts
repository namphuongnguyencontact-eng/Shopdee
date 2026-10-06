import { NextResponse } from "next/server";
import { getGoogleAnalyticsConfig, getSiteInfoConfig } from "@/services/siteSettings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [ga, siteInfo] = await Promise.all([
      getGoogleAnalyticsConfig(),
      getSiteInfoConfig(),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          googleAnalytics: {
            enabled: ga.enabled,
            measurementId: ga.measurementId,
            excludeAdmin: ga.excludeAdmin,
          },
          siteInfo,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (err: unknown) {
    console.error("Public settings GET error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Lỗi tải thông tin cài đặt công khai." } },
      { status: 500 }
    );
  }
}
