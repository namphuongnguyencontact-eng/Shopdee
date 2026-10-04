import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import AnalyticsEvent, { AnalyticsEventType } from "@/models/AnalyticsEvent";
import TrafficSession from "@/models/TrafficSession";
import Product from "@/models/Product";
import Order from "@/models/Order";
import { liveMetricsService } from "@/services/liveMetrics";

export interface LogEventParams {
  userId?: string;
  sessionId?: string;
  visitorId?: string;
  eventType: AnalyticsEventType;
  path?: string;
  referrer?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  productId?: string;
  categoryId?: string;
  metadata?: Record<string, unknown>;
  device?: string;
  ip?: string;
}

export class AnalyticsService {
  /**
   * Logs an analytics event and updates associated sessions, products, and metrics.
   */
  async logEvent(params: LogEventParams): Promise<void> {
    try {
      await connectDB();

      // 1. Create Event
      await AnalyticsEvent.create({
        ...params,
        createdAt: new Date(),
      });

      // 2. Invalidate live metrics cache on key actions
      if (params.eventType === "add_to_cart" || params.eventType === "order_completed" || params.eventType === "order_created") {
        liveMetricsService.invalidateCache();
      }

      // 3. Update TrafficSession if sessionId is provided
      if (params.sessionId) {
        const isShoppingAction = [
          "product_view",
          "search",
          "add_to_wishlist",
          "add_to_cart",
          "remove_from_cart",
          "checkout_start",
          "virtual_payment_start",
        ].includes(params.eventType);

        const updateFields: Record<string, unknown> = {
          lastSeenAt: new Date(),
        };

        if (params.path) {
          updateFields.currentPage = params.path;
        }
        if (params.userId) {
          updateFields.userId = params.userId;
        }
        if (isShoppingAction) {
          updateFields.lastShoppingActivityAt = new Date();
        }

        const incFields: Record<string, number> = {};
        if (params.eventType === "page_view") {
          incFields.pageViewCount = 1;
        }

        await TrafficSession.updateOne(
          { sessionId: params.sessionId },
          {
            $set: updateFields,
            ...(Object.keys(incFields).length > 0 ? { $inc: incFields } : {}),
          }
        );
      }

      // 4. Update Product counters (views, likes, cartAdds, shares, trendScore)
      if (params.productId) {
        const product = await Product.findById(params.productId);
        if (product) {
          if (params.eventType === "product_view") product.viewCount = (product.viewCount || 0) + 1;
          if (params.eventType === "product_like") product.likeCount = (product.likeCount || 0) + 1;
          if (params.eventType === "add_to_cart") product.cartAddCount = (product.cartAddCount || 0) + 1;
          if (params.eventType === "share_order") product.shareCount = (product.shareCount || 0) + 1;

          // Recalculate trend score
          product.trendScore =
            (product.viewCount || 0) * 0.2 +
            (product.likeCount || 0) * 0.2 +
            (product.cartAddCount || 0) * 0.3 +
            (product.soldCount || 0) * 0.2 +
            (product.shareCount || 0) * 0.1;

          await product.save();
        }
      }
    } catch (err) {
      console.error("Analytics log error:", err);
    }
  }

  /**
   * Legacy funnel stats for admin summary.
   */
  async getFunnelStats(): Promise<{
    views: number;
    cartAdds: number;
    checkoutStarts: number;
    orders: number;
    shares: number;
  }> {
    await connectDB();
    const [views, cartAdds, checkoutStarts, orders, shares] = await Promise.all([
      AnalyticsEvent.countDocuments({ eventType: "product_view" }),
      AnalyticsEvent.countDocuments({ eventType: "add_to_cart" }),
      AnalyticsEvent.countDocuments({ eventType: "checkout_start" }),
      AnalyticsEvent.countDocuments({ eventType: "order_created" }),
      AnalyticsEvent.countDocuments({ eventType: "share_order" }),
    ]);

    return { views, cartAdds, checkoutStarts, orders, shares };
  }

  /**
   * Fetches comprehensive Traffic Overview and time-series metrics.
   */
  async getTrafficOverview(startDate: Date, endDate: Date) {
    await connectDB();

    const matchQuery = { createdAt: { $gte: startDate, $lte: endDate } };

    const [totalVisits, pageViews, uniqueVisitorsAgg, sessionsCount, newVisitorsCount, completedOrdersAgg] = await Promise.all([
      TrafficSession.countDocuments(matchQuery),
      AnalyticsEvent.countDocuments({ eventType: "page_view", ...matchQuery }),
      TrafficSession.distinct("visitorId", matchQuery),
      TrafficSession.countDocuments(matchQuery),
      TrafficSession.countDocuments({ isNewVisitor: true, ...matchQuery }),
      Order.aggregate([
        { $match: { orderStatus: "COMPLETED", ...matchQuery } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: "$total" },
          },
        },
      ]),
    ]);

    const uniqueVisitors = uniqueVisitorsAgg.length;
    const returningVisitors = Math.max(0, uniqueVisitors - newVisitorsCount);
    const orderStats = completedOrdersAgg[0] || { totalOrders: 0, totalRevenue: 0 };
    const totalOrders = orderStats.totalOrders;
    const totalRevenue = orderStats.totalRevenue;
    const conversionRate = sessionsCount > 0 ? Number(((totalOrders / sessionsCount) * 100).toFixed(2)) : 0;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Time-series aggregation (by day or hour)
    const diffHours = Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 3600);
    const isHourly = diffHours <= 48; // group by hour if <= 2 days, else by day

    const dateFormat = isHourly ? "%Y-%m-%d %H:00" : "%Y-%m-%d";

    const timeSeries = await TrafficSession.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$createdAt", timezone: "Asia/Ho_Chi_Minh" } },
          visits: { $sum: 1 },
          uniqueVisitors: { $addToSet: "$visitorId" },
          pageViews: { $sum: "$pageViewCount" },
        },
      },
      {
        $project: {
          _id: 1,
          visits: 1,
          pageViews: 1,
          uniqueVisitors: { $size: "$uniqueVisitors" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const overview = {
      totalSessions: sessionsCount,
      uniqueVisitors,
      pageviews: pageViews,
      totalOrders,
      totalRevenue,
      conversionRate,
      avgOrderValue,
    };

    return {
      kpis: {
        totalVisits,
        pageViews,
        uniqueVisitors,
        sessions: sessionsCount,
        newVisitors: newVisitorsCount,
        returningVisitors,
        totalOrders,
        totalRevenue,
        conversionRate,
        avgOrderValue,
      },
      overview,
      isHourly,
      timeSeries: timeSeries.map((t) => ({
        label: t._id,
        visits: t.visits,
        pageViews: t.pageViews,
        uniqueVisitors: t.uniqueVisitors,
      })),
    };
  }

  /**
   * Fetches breakdown of traffic sources with orders and conversion rate.
   */
  async getTrafficSources(startDate: Date, endDate: Date) {
    await connectDB();

    const matchQuery = { createdAt: { $gte: startDate, $lte: endDate } };

    // 1. Group TrafficSession by Source & Category
    const sourcesAgg = await TrafficSession.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { source: "$source", category: "$category" },
          visits: { $sum: 1 },
          uniqueVisitors: { $addToSet: "$visitorId" },
          sessions: { $sum: 1 },
        },
      },
      {
        $project: {
          source: "$_id.source",
          category: "$_id.category",
          visits: 1,
          sessions: 1,
          visitors: { $size: "$uniqueVisitors" },
        },
      },
      { $sort: { visits: -1 } },
    ]);

    // 2. Count completed orders attributed to each source
    const ordersAttributionAgg = await Order.aggregate([
      {
        $match: {
          orderStatus: "COMPLETED",
          createdAt: { $gte: startDate, $lte: endDate },
          "analyticsAttribution.lastTouchSource": { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: "$analyticsAttribution.lastTouchSource",
          orderCount: { $sum: 1 },
          gmv: { $sum: "$total" },
        },
      },
    ]);

    const ordersMap: Record<string, { count: number; gmv: number }> = {};
    for (const o of ordersAttributionAgg) {
      if (o._id) {
        ordersMap[o._id] = { count: o.orderCount, gmv: o.gmv };
      }
    }

    // Combine stats
    let totalVisits = 0;
    const sources = sourcesAgg.map((s) => {
      totalVisits += s.visits;
      const orderData = ordersMap[s.source] || { count: 0, gmv: 0 };
      const conversionRate = s.visits > 0 ? Number(((orderData.count / s.visits) * 100).toFixed(2)) : 0;

      return {
        source: s.source || "direct",
        category: s.category || "direct",
        medium: s.category || "none",
        visits: s.visits || 0,
        visitors: s.visitors || 0,
        uniqueVisitors: s.visitors || 0,
        sessions: s.sessions || 0,
        orders: orderData.count || 0,
        revenue: orderData.gmv || 0,
        gmv: orderData.gmv || 0,
        conversionRate: conversionRate || 0,
      };
    });

    // Calculate share percentage
    const enrichedSources = sources.map((s) => ({
      ...s,
      percentage: totalVisits > 0 ? Number(((s.visits / totalVisits) * 100).toFixed(1)) : 0,
    }));

    return {
      totalVisits,
      sources: enrichedSources,
    };
  }

  /**
   * Fetches device distribution (Desktop, Mobile, Tablet).
   */
  async getDeviceStats(startDate: Date, endDate: Date) {
    await connectDB();

    const matchQuery = { createdAt: { $gte: startDate, $lte: endDate } };

    const deviceAgg = await TrafficSession.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$device",
          count: { $sum: 1 },
        },
      },
    ]);

    const total = deviceAgg.reduce((sum, d) => sum + d.count, 0) || 1;

    const devices = {
      desktop: 0,
      mobile: 0,
      tablet: 0,
    };

    for (const d of deviceAgg) {
      if (d._id === "desktop") devices.desktop = d.count;
      else if (d._id === "mobile") devices.mobile = d.count;
      else if (d._id === "tablet") devices.tablet = d.count;
    }

    const desktopPct = Number(((devices.desktop / total) * 100).toFixed(1));
    const mobilePct = Number(((devices.mobile / total) * 100).toFixed(1));
    const tabletPct = Number(((devices.tablet / total) * 100).toFixed(1));

    const list = [
      { device: "Desktop", sessions: devices.desktop, percentage: desktopPct },
      { device: "Mobile", sessions: devices.mobile, percentage: mobilePct },
      { device: "Tablet", sessions: devices.tablet, percentage: tabletPct },
    ];

    return {
      total,
      devices,
      percentages: {
        desktop: desktopPct,
        mobile: mobilePct,
        tablet: tabletPct,
      },
      list,
    };
  }

  /**
   * Realtime active monitor: shoppers, active visitors now, and top pages.
   */
  async getRealtimeMonitor() {
    await connectDB();

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const [activeShoppers, activeSessions, topPagesAgg] = await Promise.all([
      TrafficSession.countDocuments({ lastShoppingActivityAt: { $gte: fiveMinutesAgo } }),
      TrafficSession.countDocuments({ lastSeenAt: { $gte: fiveMinutesAgo } }),
      TrafficSession.aggregate([
        { $match: { lastSeenAt: { $gte: fiveMinutesAgo } } },
        { $group: { _id: "$currentPage", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]),
    ]);

    return {
      activeShoppers,
      activeSessions,
      pages: topPagesAgg.map((p) => ({
        path: p._id || "/",
        count: p.count,
      })),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Product conversion & analytics details.
   */
  async getProductAnalytics(productId: string) {
    await connectDB();

    const targetId = Types.ObjectId.isValid(productId) ? new Types.ObjectId(productId) : productId;

    const [product, views, cartAdds, ordersAgg] = await Promise.all([
      Product.findById(productId).lean(),
      AnalyticsEvent.countDocuments({ eventType: "product_view", productId }),
      AnalyticsEvent.countDocuments({ eventType: "add_to_cart", productId }),
      Order.aggregate([
        { $match: { orderStatus: "COMPLETED", "items.productId": targetId } },
        { $unwind: "$items" },
        { $match: { "items.productId": targetId } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalUnitsSold: { $sum: "$items.quantity" },
            totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          },
        },
      ]),
    ]);

    const orderStats = ordersAgg[0] || { totalOrders: 0, totalUnitsSold: 0, totalRevenue: 0 };
    const effectiveViews = Math.max(views, product?.viewCount || 0, 1);
    const conversionRate = Number(((orderStats.totalOrders / effectiveViews) * 100).toFixed(2));

    return {
      product,
      views: effectiveViews,
      cartAdds: Math.max(cartAdds, product?.cartAddCount || 0),
      orders: orderStats.totalOrders,
      unitsSold: Math.max(orderStats.totalUnitsSold, product?.soldCount || 0),
      revenue: orderStats.totalRevenue,
      conversionRate,
    };
  }
}

export const analyticsService = new AnalyticsService();
