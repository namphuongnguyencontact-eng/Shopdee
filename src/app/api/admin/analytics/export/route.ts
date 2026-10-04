import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import TrafficSession from "@/models/TrafficSession";
import Order from "@/models/Order";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: { message: "Không có quyền Admin." } }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "sources"; // sources | traffic | products | orders

    await connectDB();

    let csvContent = "";
    let filename = `shopdee_analytics_${type}_${Date.now()}.csv`;

    if (type === "sources") {
      const sessions = await TrafficSession.aggregate([
        {
          $group: {
            _id: { source: "$source", category: "$category" },
            visits: { $sum: 1 },
            visitors: { $addToSet: "$visitorId" },
          },
        },
        { $sort: { visits: -1 } },
      ]);

      csvContent = "Source,Category,Visits,UniqueVisitors\n";
      for (const s of sessions) {
        csvContent += `"${s._id.source}","${s._id.category}",${s.visits},${s.visitors.length}\n`;
      }
    } else if (type === "products") {
      const products = await Product.find({}).sort({ soldCount: -1 }).lean();
      csvContent = "ID,Name,Category,Price,SoldCount,ViewCount,Stock,Status\n";
      for (const p of products) {
        const cleanName = (p.name || "").replace(/"/g, '""');
        csvContent += `"${p._id}","${cleanName}","${p.categoryName}",${p.price},${p.soldCount || 0},${p.viewCount || 0},${p.stock || 0},"${p.status}"\n`;
      }
    } else if (type === "orders") {
      const orders = await Order.find({}).sort({ createdAt: -1 }).limit(500).lean();
      csvContent = "OrderNumber,Customer,Total,Status,PaymentMethod,Source,CreatedAt\n";
      for (const o of orders) {
        const customer = (o.shippingAddress?.fullName || "").replace(/"/g, '""');
        const src = o.analyticsAttribution?.lastTouchSource || "Direct";
        csvContent += `"${o.orderNumber}","${customer}",${o.total},"${o.orderStatus}","${o.paymentMethod}","${src}","${o.createdAt}"\n`;
      }
    } else {
      const sessions = await TrafficSession.find({}).sort({ createdAt: -1 }).limit(1000).lean();
      csvContent = "SessionID,VisitorID,Source,Category,Device,LandingPage,CurrentPage,PageViewCount,CreatedAt\n";
      for (const s of sessions) {
        csvContent += `"${s.sessionId}","${s.visitorId}","${s.source}","${s.category}","${s.device}","${s.landingPage}","${s.currentPage}",${s.pageViewCount},"${s.createdAt}"\n`;
      }
    }

    return new NextResponse("\uFEFF" + csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err: unknown) {
    console.error("Export error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi xuất báo cáo CSV." } }, { status: 500 });
  }
}
