import { connectDB } from "@/lib/db";
import TrafficSession from "@/models/TrafficSession";
import AnalyticsEvent from "@/models/AnalyticsEvent";
import Order from "@/models/Order";

export interface LiveMetricsData {
  activeShoppers: number;
  cartAddsLastHour: number;
  successfulOrdersLastHour: number;
  updatedAt: string;
}

interface CacheEntry {
  data: LiveMetricsData;
  expiresAt: number;
}

let cachedMetrics: CacheEntry | null = null;
const CACHE_TTL_MS = 5000; // 5 seconds in-memory cache

export class LiveMetricsService {
  /**
   * Fetches real live metrics computed from database, using a short 5-second in-memory cache.
   */
  async getLiveMetrics(): Promise<LiveMetricsData> {
    const now = Date.now();
    if (cachedMetrics && cachedMetrics.expiresAt > now) {
      return cachedMetrics.data;
    }

    try {
      await connectDB();

      const fiveMinutesAgo = new Date(now - 5 * 60 * 1000);
      const oneHourAgo = new Date(now - 60 * 60 * 1000);

      // 1. Active shoppers: visitors with shopping activity in the last 5 minutes
      const activeShoppersCount = await TrafficSession.countDocuments({
        lastShoppingActivityAt: { $gte: fiveMinutesAgo },
      });

      // 2. Items added to cart in the last 60 minutes
      const cartAddEvents = await AnalyticsEvent.find({
        eventType: "add_to_cart",
        createdAt: { $gte: oneHourAgo },
      }).select("metadata").lean();

      let cartAddsCount = 0;
      for (const ev of cartAddEvents) {
        const qty = Number(ev.metadata?.quantity) || 1;
        cartAddsCount += qty;
      }

      // 3. Successful orders in the last 60 minutes
      const successfulOrdersCount = await Order.countDocuments({
        orderStatus: "COMPLETED",
        createdAt: { $gte: oneHourAgo },
      });

      const metrics: LiveMetricsData = {
        activeShoppers: activeShoppersCount,
        cartAddsLastHour: cartAddsCount,
        successfulOrdersLastHour: successfulOrdersCount,
        updatedAt: new Date().toISOString(),
      };

      cachedMetrics = {
        data: metrics,
        expiresAt: now + CACHE_TTL_MS,
      };

      return metrics;
    } catch (err) {
      console.error("Error fetching live metrics:", err);
      // Return previous cached data if available, or zero metrics
      if (cachedMetrics) return cachedMetrics.data;
      return {
        activeShoppers: 0,
        cartAddsLastHour: 0,
        successfulOrdersLastHour: 0,
        updatedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Invalidates cache immediately (called on events like add_to_cart or order_completed).
   */
  invalidateCache(): void {
    cachedMetrics = null;
  }
}

export const liveMetricsService = new LiveMetricsService();
