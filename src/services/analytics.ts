import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import AnalyticsEvent, { AnalyticsEventType } from "@/models/AnalyticsEvent";
import TrafficSession from "@/models/TrafficSession";
import Product from "@/models/Product";
import Order from "@/models/Order";
import User from "@/models/User";
import { liveMetricsService } from "@/services/liveMetrics";

export interface LogEventParams {
  userId?: string;
  isAdmin?: boolean;
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
   * Helper to retrieve all admin user ObjectIds to strictly exclude them from analytics reports.
   */
  async getAdminUserIds(): Promise<Types.ObjectId[]> {
    try {
      await connectDB();
      const admins = await User.find({ role: "admin" }).select("_id").lean();
      return admins.map((u) => u._id);
    } catch {
      return [];
    }
  }

  /**
   * Logs an analytics event and updates associated sessions, products, and metrics.
   * If the event belongs to an Admin, it is flagged with isAdmin: true and excluded from product ranking/views.
   */
  async logEvent(params: LogEventParams): Promise<void> {
    try {
      await connectDB();

      let isAdmin = Boolean(params.isAdmin);
      if (!isAdmin && params.userId) {
        const u = await User.findById(params.userId).select("role").lean();
        if (u?.role === "admin") {
          isAdmin = true;
        }
      }

      // 1. Create Event
      await AnalyticsEvent.create({
        ...params,
        isAdmin,
        createdAt: new Date(),
      });

      // 2. Invalidate live metrics cache on key actions (only if not admin)
      if (!isAdmin && (params.eventType === "add_to_cart" || params.eventType === "order_completed" || params.eventType === "order_created")) {
        liveMetricsService.invalidateCache();
      }

      // 3. Update TrafficSession if sessionId is provided
      if (params.sessionId) {
        const isShoppingAction =
          !isAdmin &&
          [
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

        if (isAdmin) {
          updateFields.isAdmin = true;
        }
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
        if (params.eventType === "page_view" && !isAdmin) {
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

      // 4. Update Product counters only for real shoppers, NOT for Admin actions
      if (params.productId && !isAdmin) {
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
   * Funnel stats for admin summary - completely excludes Admin data.
   */
  async getFunnelStats(): Promise<{
    views: number;
    cartAdds: number;
    checkoutStarts: number;
    orders: number;
    shares: number;
  }> {
    await connectDB();
    const adminIds = await this.getAdminUserIds();
    const baseFilter = { isAdmin: { $ne: true }, userId: { $nin: adminIds } };

    const [views, cartAdds, checkoutStarts, orders, shares] = await Promise.all([
      AnalyticsEvent.countDocuments({ eventType: "product_view", ...baseFilter }),
      AnalyticsEvent.countDocuments({ eventType: "add_to_cart", ...baseFilter }),
      AnalyticsEvent.countDocuments({ eventType: "checkout_start", ...baseFilter }),
      AnalyticsEvent.countDocuments({ eventType: "order_created", ...baseFilter }),
      AnalyticsEvent.countDocuments({ eventType: "share_order", ...baseFilter }),
    ]);

    return { views, cartAdds, checkoutStarts, orders, shares };
  }

  /**
   * Fetches comprehensive Traffic Overview and time-series metrics - strictly excludes Admin data.
   */
  /**
   * Fetches comprehensive Traffic Overview and time-series metrics - strictly excludes Admin data.
   * Visitor and Pageviews are strictly deduplicated by unique device / IP address.
   */
  async getTrafficOverview(startDate: Date, endDate: Date) {
    await connectDB();
    const adminIds = await this.getAdminUserIds();

    const matchQuery = {
      createdAt: { $gte: startDate, $lte: endDate },
      isAdmin: { $ne: true },
      userId: { $nin: adminIds },
      currentPage: { $not: /^\/admin/ },
      landingPage: { $not: /^\/admin/ },
    };

    const eventMatchQuery = {
      createdAt: { $gte: startDate, $lte: endDate },
      isAdmin: { $ne: true },
      userId: { $nin: adminIds },
      path: { $not: /^\/admin/ },
    };

    const [
      uniqueVisitorsAgg,
      pageViewsAgg,
      newVisitorsAgg,
      completedOrdersAgg,
    ] = await Promise.all([
      // 1. Unique Visitors strictly deduplicated by unique device / IP address
      TrafficSession.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: { $ifNull: ["$ip", "$visitorId"] },
          },
        },
        { $count: "total" },
      ]),

      // 2. Pageviews strictly deduplicated by unique device / IP per path
      AnalyticsEvent.aggregate([
        { $match: { eventType: "page_view", ...eventMatchQuery } },
        {
          $group: {
            _id: {
              deviceKey: { $ifNull: ["$ip", "$visitorId"] },
              path: "$path",
            },
          },
        },
        { $count: "total" },
      ]),

      // 3. New visitors strictly by unique device / IP
      TrafficSession.aggregate([
        { $match: { isNewVisitor: true, ...matchQuery } },
        {
          $group: {
            _id: { $ifNull: ["$ip", "$visitorId"] },
          },
        },
        { $count: "total" },
      ]),

      // 4. Completed Orders
      Order.aggregate([
        {
          $match: {
            orderStatus: "COMPLETED",
            userId: { $nin: adminIds },
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: "$total" },
          },
        },
      ]),
    ]);

    const uniqueVisitors = uniqueVisitorsAgg[0]?.total || 0;
    const pageViews = pageViewsAgg[0]?.total || 0;
    const newVisitorsCount = newVisitorsAgg[0]?.total || 0;
    const totalVisits = uniqueVisitors;
    const sessionsCount = uniqueVisitors;
    const returningVisitors = Math.max(0, uniqueVisitors - newVisitorsCount);
    const orderStats = completedOrdersAgg[0] || { totalOrders: 0, totalRevenue: 0 };
    const totalOrders = orderStats.totalOrders;
    const totalRevenue = orderStats.totalRevenue;
    const conversionRate = uniqueVisitors > 0 ? Number(((totalOrders / uniqueVisitors) * 100).toFixed(2)) : 0;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Time-series aggregation (by day or hour)
    const diffHours = Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 3600);
    const isHourly = diffHours <= 48; // group by hour if <= 2 days, else by day
    const dateFormat = isHourly ? "%Y-%m-%d %H:00" : "%Y-%m-%d";

    // Deduplicated time-series by device / IP
    const timeSeries = await AnalyticsEvent.aggregate([
      { $match: { eventType: "page_view", ...eventMatchQuery } },
      {
        $group: {
          _id: {
            time: { $dateToString: { format: dateFormat, date: "$createdAt", timezone: "Asia/Ho_Chi_Minh" } },
            deviceKey: { $ifNull: ["$ip", "$visitorId"] },
            path: "$path",
          },
        },
      },
      {
        $group: {
          _id: "$_id.time",
          pageViews: { $sum: 1 },
          uniqueVisitorsSet: { $addToSet: "$_id.deviceKey" },
        },
      },
      {
        $project: {
          _id: 1,
          pageViews: 1,
          uniqueVisitors: { $size: "$uniqueVisitorsSet" },
          visits: { $size: "$uniqueVisitorsSet" },
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
   * Fetches breakdown of traffic sources with orders and conversion rate - strictly excludes Admin data.
   * Visitors are deduplicated by device / IP.
   */
  async getTrafficSources(startDate: Date, endDate: Date) {
    await connectDB();
    const adminIds = await this.getAdminUserIds();

    const matchQuery = {
      createdAt: { $gte: startDate, $lte: endDate },
      isAdmin: { $ne: true },
      userId: { $nin: adminIds },
      currentPage: { $not: /^\/admin/ },
      landingPage: { $not: /^\/admin/ },
    };

    // 1. Group TrafficSession by Source & Category with distinct device / IP
    const sourcesAgg = await TrafficSession.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { source: "$source", category: "$category" },
          uniqueVisitors: { $addToSet: { $ifNull: ["$ip", "$visitorId"] } },
          sessions: { $sum: 1 },
        },
      },
      {
        $project: {
          source: "$_id.source",
          category: "$_id.category",
          visits: { $size: "$uniqueVisitors" },
          sessions: { $size: "$uniqueVisitors" },
          visitors: { $size: "$uniqueVisitors" },
        },
      },
      { $sort: { visits: -1 } },
    ]);

    // 2. Count completed orders attributed to each source (exclude Admin orders)
    const ordersAttributionAgg = await Order.aggregate([
      {
        $match: {
          orderStatus: "COMPLETED",
          userId: { $nin: adminIds },
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

    // Combine stats and normalize platform names
    const normalizedSourcesMap = new Map<string, any>();
    let totalVisits = 0;
    for (const s of sourcesAgg) {
      let sourceName = s.source || "Direct";
      let category = s.category || "Referral";
      if (sourceName.toLowerCase().includes("threads")) {
        sourceName = "Threads";
        category = "Social";
      } else if (sourceName.toLowerCase().includes("tiktok")) {
        sourceName = "TikTok";
        category = "Social";
      } else if (sourceName.toLowerCase().includes("facebook") || sourceName === "fb") {
        sourceName = "Facebook";
        category = "Social";
      } else if (sourceName.toLowerCase().includes("instagram") || sourceName === "ig") {
        sourceName = "Instagram";
        category = "Social";
      } else if (sourceName.toLowerCase().includes("google")) {
        sourceName = "Google";
        category = "Organic Search";
      } else if (sourceName.toLowerCase().includes("zalo")) {
        sourceName = "Zalo";
        category = "Social";
      } else if (sourceName.toLowerCase() === "localhost") {
        sourceName = "Direct";
        category = "Direct";
      }

      totalVisits += s.visits;
      const orderData = ordersMap[s.source] || ordersMap[sourceName] || { count: 0, gmv: 0 };

      if (normalizedSourcesMap.has(sourceName)) {
        const item = normalizedSourcesMap.get(sourceName);
        item.visits += s.visits || 0;
        item.visitors += s.visitors || 0;
        item.uniqueVisitors += s.visitors || 0;
        item.sessions += s.sessions || 0;
        item.orders += orderData.count || 0;
        item.revenue += orderData.gmv || 0;
        item.gmv += orderData.gmv || 0;
      } else {
        normalizedSourcesMap.set(sourceName, {
          source: sourceName,
          category,
          medium: category.toLowerCase(),
          visits: s.visits || 0,
          visitors: s.visitors || 0,
          uniqueVisitors: s.visitors || 0,
          sessions: s.sessions || 0,
          orders: orderData.count || 0,
          revenue: orderData.gmv || 0,
          gmv: orderData.gmv || 0,
          conversionRate: 0,
        });
      }
    }

    const sources = Array.from(normalizedSourcesMap.values()).map((s) => ({
      ...s,
      conversionRate: s.visits > 0 ? Number(((s.orders / s.visits) * 100).toFixed(2)) : 0,
      percentage: totalVisits > 0 ? Number(((s.visits / totalVisits) * 100).toFixed(1)) : 0,
    }));

    return {
      totalVisits,
      sources,
    };
  }

  /**
   * Fetches device distribution (Desktop, Mobile, Tablet) - strictly excludes Admin data.
   */
  async getDeviceStats(startDate: Date, endDate: Date) {
    await connectDB();
    const adminIds = await this.getAdminUserIds();

    const matchQuery = {
      createdAt: { $gte: startDate, $lte: endDate },
      isAdmin: { $ne: true },
      userId: { $nin: adminIds },
    };

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
   * Realtime active monitor: shoppers, active visitors now, platform breakdown, live visitors, and top pages.
   * Strictly excludes Admin sessions and /admin/* pages.
   */
  async getRealtimeMonitor() {
    await connectDB();
    const adminIds = await this.getAdminUserIds();

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    const baseFilter = {
      isAdmin: { $ne: true },
      userId: { $nin: adminIds },
      currentPage: { $not: /^\/admin/ },
      landingPage: { $not: /^\/admin/ },
    };

    const [activeShoppersAgg, activeSessionsAgg, topPagesAgg, platformAgg, recentSessions] = await Promise.all([
      TrafficSession.aggregate([
        {
          $match: {
            ...baseFilter,
            lastShoppingActivityAt: { $gte: fiveMinutesAgo },
          },
        },
        {
          $group: {
            _id: { $ifNull: ["$ip", "$visitorId"] },
          },
        },
        { $count: "total" },
      ]),
      TrafficSession.aggregate([
        {
          $match: {
            ...baseFilter,
            lastSeenAt: { $gte: fiveMinutesAgo },
          },
        },
        {
          $group: {
            _id: { $ifNull: ["$ip", "$visitorId"] },
          },
        },
        { $count: "total" },
      ]),
      TrafficSession.aggregate([
        {
          $match: {
            ...baseFilter,
            lastSeenAt: { $gte: fifteenMinutesAgo },
            currentPage: { $not: /^\/admin/ },
          },
        },
        { $group: { _id: "$currentPage", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
      TrafficSession.aggregate([
        {
          $match: {
            ...baseFilter,
            lastSeenAt: { $gte: fifteenMinutesAgo },
          },
        },
        {
          $group: {
            _id: "$source",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),
      TrafficSession.find({
        ...baseFilter,
        lastSeenAt: { $gte: fifteenMinutesAgo },
      })
        .sort({ lastSeenAt: -1 })
        .limit(20)
        .lean(),
    ]);

    const activeShoppers = activeShoppersAgg[0]?.total || 0;
    const activeSessions = activeSessionsAgg[0]?.total || 0;

    const totalActiveInWindow = platformAgg.reduce((sum, p) => sum + p.count, 0) || 1;

    const platformBreakdown = platformAgg.map((p) => {
      let sourceName = p._id || "Direct";
      if (sourceName.toLowerCase().includes("threads")) sourceName = "Threads";
      if (sourceName.toLowerCase() === "localhost") sourceName = "Direct";
      return {
        source: sourceName,
        count: p.count,
        percentage: Number(((p.count / totalActiveInWindow) * 100).toFixed(1)),
      };
    });

    // Merge duplicate sources if normalization caused any
    const mergedPlatformsMap = new Map<string, { source: string; count: number; percentage: number }>();
    for (const item of platformBreakdown) {
      if (mergedPlatformsMap.has(item.source)) {
        const existing = mergedPlatformsMap.get(item.source)!;
        existing.count += item.count;
        existing.percentage = Number(((existing.count / totalActiveInWindow) * 100).toFixed(1));
      } else {
        mergedPlatformsMap.set(item.source, item);
      }
    }

    const formattedPlatformBreakdown = Array.from(mergedPlatformsMap.values()).map((p) => ({
      source: p.source,
      platform: p.source,
      count: p.count,
      activeCount: p.count,
      percentage: p.percentage,
    }));

    const formattedLiveVisitors = recentSessions.map((s) => {
      let sourceName = s.source || "Direct";
      if (sourceName.toLowerCase().includes("threads")) sourceName = "Threads";
      if (sourceName.toLowerCase() === "localhost") sourceName = "Direct";

      const secondsAgo = Math.max(0, Math.floor((Date.now() - new Date(s.lastSeenAt).getTime()) / 1000));
      const curPage = s.currentPage || "/";

      return {
        sessionId: s.sessionId,
        visitorId: s.visitorId,
        source: sourceName,
        platform: sourceName,
        category: s.category || "Direct",
        medium: s.medium || "",
        currentPage: curPage,
        currentPath: curPage,
        landingPage: s.landingPage || "/",
        device: s.device || "desktop",
        browser: s.browser || "Unknown",
        os: s.os || "Unknown",
        city: s.city || "Việt Nam",
        pageViewCount: s.pageViewCount || 1,
        isNewVisitor: !!s.isNewVisitor,
        lastSeenAt: s.lastSeenAt,
        secondsAgo,
      };
    });

    const activePagesList = topPagesAgg.map((p) => ({
      path: p._id || "/",
      count: p.count,
    }));

    return {
      activeShoppers,
      activeSessions,
      recentActiveSessions: activeSessions,
      platformBreakdown: formattedPlatformBreakdown,
      liveVisitors: formattedLiveVisitors,
      activePages: activePagesList,
      pages: activePagesList,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Product conversion & analytics details - excludes Admin actions and orders.
   */
  async getProductAnalytics(productId: string) {
    await connectDB();
    const adminIds = await this.getAdminUserIds();

    const targetId = Types.ObjectId.isValid(productId) ? new Types.ObjectId(productId) : productId;
    const baseFilter = {
      isAdmin: { $ne: true },
      userId: { $nin: adminIds },
    };

    const [product, views, cartAdds, ordersAgg] = await Promise.all([
      Product.findById(productId).lean(),
      AnalyticsEvent.countDocuments({ eventType: "product_view", productId, ...baseFilter }),
      AnalyticsEvent.countDocuments({ eventType: "add_to_cart", productId, ...baseFilter }),
      Order.aggregate([
        {
          $match: {
            orderStatus: "COMPLETED",
            userId: { $nin: adminIds },
            "items.productId": targetId,
          },
        },
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
