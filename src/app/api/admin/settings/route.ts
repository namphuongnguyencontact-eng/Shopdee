import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import {
  getGoogleAnalyticsConfig,
  getSiteInfoConfig,
  setSetting,
  extractMeasurementId,
} from "@/services/siteSettings";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, error: { message: "Không có quyền Admin." } },
        { status: 403 }
      );
    }

    const [googleAnalytics, siteInfo] = await Promise.all([
      getGoogleAnalyticsConfig(),
      getSiteInfoConfig(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        googleAnalytics,
        siteInfo,
      },
    });
  } catch (err: unknown) {
    console.error("Admin settings GET error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Lỗi tải cài đặt hệ thống." } },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, error: { message: "Không có quyền Admin." } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { googleAnalytics, siteInfo } = body;

    let updatedGA = null;
    let updatedSiteInfo = null;

    if (googleAnalytics) {
      const code = (googleAnalytics.code || "").trim();
      let measurementId = (googleAnalytics.measurementId || "").trim().toUpperCase();

      // If user pasted code but didn't fill measurementId, auto-extract
      if (!measurementId && code) {
        measurementId = extractMeasurementId(code);
      }

      // If user provided a measurement ID but no full snippet, generate standard Google tag snippet
      let finalCode = code;
      if (!finalCode && measurementId) {
        finalCode = `<!-- Google tag (gtag.js) -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag('js', new Date());\n\n  gtag('config', '${measurementId}');\n</script>`;
      }

      const gaPayload = {
        code: finalCode,
        measurementId: measurementId || extractMeasurementId(finalCode),
        enabled: googleAnalytics.enabled ?? true,
        excludeAdmin: googleAnalytics.excludeAdmin ?? true,
      };

      await setSetting("google_analytics", gaPayload, session.email || session.username);
      updatedGA = gaPayload;
    }

    if (siteInfo) {
      const sitePayload = {
        siteName: siteInfo.siteName || "SHOPDEE Việt Nam",
        contactEmail: siteInfo.contactEmail || "support@shopdeevn.online",
        hotline: siteInfo.hotline || "1900 6868",
        description: siteInfo.description || "",
      };
      await setSetting("site_info", sitePayload, session.email || session.username);
      updatedSiteInfo = sitePayload;
    }

    return NextResponse.json({
      success: true,
      message: "Lưu cài đặt thành công!",
      data: {
        googleAnalytics: updatedGA || (await getGoogleAnalyticsConfig()),
        siteInfo: updatedSiteInfo || (await getSiteInfoConfig()),
      },
    });
  } catch (err: unknown) {
    console.error("Admin settings PUT error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Lỗi lưu cài đặt hệ thống." } },
      { status: 500 }
    );
  }
}
