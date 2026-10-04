import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";
import Order from "@/models/Order";
import SharedOrder from "@/models/SharedOrder";
import Category from "@/models/Category";
import { getSessionFromRequest } from "@/lib/auth";
import { analyticsService } from "@/services/analytics";

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: { message: "Không có quyền Admin." } }, { status: 403 });
    }

    await connectDB();

    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalShares,
      orders,
      funnel,
      topSoldProducts,
      topViewedProducts,
      categories,
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments({ status: "active" }),
      Order.countDocuments(),
      SharedOrder.countDocuments(),
      Order.find().sort({ createdAt: -1 }).limit(10).lean(),
      analyticsService.getFunnelStats(),
      Product.find({ status: "active" }).sort({ soldCount: -1 }).limit(5).select("name price soldCount images categoryName").lean(),
      Product.find({ status: "active" }).sort({ viewCount: -1 }).limit(5).select("name price viewCount images categoryName").lean(),
      Category.find({ isActive: true }).select("name slug productCount").lean(),
    ]);

    // Calculate Virtual GMV
    const gmvAgg = await Order.aggregate([
      { $group: { _id: null, totalGMV: { $sum: "$total" } } },
    ]);
    const virtualGMV = gmvAgg[0]?.totalGMV || 0;

    // Conversion rate & Cart abandonment calculation
    const views = Math.max(1, funnel.views);
    const cartAdds = funnel.cartAdds;
    const checkoutStarts = funnel.checkoutStarts;
    const completedOrders = totalOrders;

    const conversionRate = Number(((completedOrders / views) * 100).toFixed(2));
    const cartAbandonmentRate = cartAdds > 0
      ? Number((((cartAdds - completedOrders) / cartAdds) * 100).toFixed(1))
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          totalUsers,
          totalProducts,
          totalOrders,
          virtualGMV,
          conversionRate,
          cartAbandonmentRate,
          totalShares,
          activeUsers: Math.max(1, Math.round(totalUsers * 0.7)),
        },
        funnel: {
          views: funnel.views,
          cartAdds: funnel.cartAdds,
          checkoutStarts: funnel.checkoutStarts,
          orders: funnel.orders,
          shares: funnel.shares,
        },
        topSoldProducts,
        topViewedProducts,
        categories,
        recentOrders: orders,
      },
    });
  } catch (err: unknown) {
    console.error("Admin stats error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi tải thống kê." } }, { status: 500 });
  }
}
