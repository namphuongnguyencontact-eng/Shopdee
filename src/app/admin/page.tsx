"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  CreditCard,
  Eye,
  Share2,
  ArrowUpRight,
  Sparkles,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  ChevronRight,
} from "lucide-react";
import { formatVND, formatDate } from "@/lib/utils";

interface StatsData {
  kpis: {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    virtualGMV: number;
    conversionRate: number;
    cartAbandonmentRate: number;
    totalShares: number;
    activeUsers: number;
  };
  funnel: {
    views: number;
    cartAdds: number;
    checkoutStarts: number;
    orders: number;
    shares: number;
  };
  topSoldProducts: Array<{
    _id: string;
    name: string;
    price: number;
    soldCount: number;
    images: string[];
    categoryName: string;
  }>;
  recentOrders: Array<{
    _id: string;
    orderNumber: string;
    total: number;
    orderStatus: string;
    shippingAddress: { fullName: string };
    createdAt: string;
    items: Array<{ name: string; quantity: number }>;
  }>;
}

interface RealtimeSummary {
  activeShoppers: number;
  recentActiveSessions: number;
  platformBreakdown: Array<{ platform: string; activeCount: number; percentage: number }>;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [realtime, setRealtime] = useState<RealtimeSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setData(json.data);
        }
      })
      .catch((err) => console.error("Error fetching admin stats:", err))
      .finally(() => setLoading(false));

    const fetchRealtime = () => {
      fetch("/api/admin/analytics/realtime")
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setRealtime(json.data);
          }
        })
        .catch(() => {});
    };

    fetchRealtime();
    const interval = setInterval(fetchRealtime, 6000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-neutral-400 text-sm">Đang tải số liệu thời gian thực...</p>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis;
  const funnel = data?.funnel;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-neutral-900 via-neutral-900 to-blue-950/40 p-6 rounded-2xl border border-white/10">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            Bảng Điều Khiển Quản Trị
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Tổng quan hiệu suất bán hàng, phễu chuyển đổi, traffic đa nền tảng và nhân khẩu học người mua.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/sales"
            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-orange-600/20"
          >
            <TrendingUp className="w-4 h-4" />
            Sản Phẩm Đã Bán
          </Link>
          <Link
            href="/admin/products"
            className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
          >
            <Package className="w-4 h-4" />
            + Thêm Sản Phẩm
          </Link>
          <Link
            href="/admin/orders"
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-200 font-bold text-xs transition-colors border border-white/10"
          >
            Duyệt Đơn Hàng
          </Link>
        </div>
      </div>

      {/* Realtime Traffic Highlight Strip */}
      <div className="bg-neutral-900/90 border border-blue-500/20 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute" />
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              Lưu Lượng Trực Tiếp (Real-time Live Traffic)
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                {realtime?.activeShoppers ?? 0} online
              </span>
            </div>
            <div className="text-[11px] text-neutral-400 mt-0.5">
              Định danh nguồn truy cập từ Threads, TikTok, Facebook, Google, Zalo...
            </div>
          </div>
        </div>

        {/* Platform Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {realtime?.platformBreakdown && realtime.platformBreakdown.length > 0 ? (
            realtime.platformBreakdown.slice(0, 5).map((p, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-neutral-300 font-bold flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {p.platform}: <strong className="text-white font-mono">{p.activeCount}</strong>
              </span>
            ))
          ) : (
            <span className="text-[11px] text-neutral-500">Đang lắng nghe tín hiệu heartbeat...</span>
          )}
          <Link
            href="/admin/analytics"
            className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 ml-2"
          >
            Xem chi tiết →
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900/80 border border-white/10 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Tổng Doanh Thu (GMV)</span>
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{formatVND(kpis?.virtualGMV || 0)}</div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Tăng trưởng doanh thu</span>
          </div>
        </div>

        <div className="bg-neutral-900/80 border border-white/10 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Tổng Đơn Hàng</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{kpis?.totalOrders || 0}</div>
          <div className="text-[11px] text-neutral-400 mt-2">
            {kpis?.totalProducts || 0} sản phẩm đang niêm yết
          </div>
        </div>

        <div className="bg-neutral-900/80 border border-white/10 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Tỷ Lệ Chuyển Đổi</span>
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
              <BarChart2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{kpis?.conversionRate || 0}%</div>
          <div className="text-[11px] text-yellow-400/90 font-medium mt-2">
            Bỏ giỏ: {kpis?.cartAbandonmentRate || 0}%
          </div>
        </div>

        <div className="bg-neutral-900/80 border border-white/10 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Cộng Đồng Gen Z</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{kpis?.totalUsers || 0}</div>
          <div className="flex items-center gap-1.5 text-[11px] text-pink-400 font-semibold mt-2">
            <Share2 className="w-3.5 h-3.5" />
            <span>{kpis?.totalShares || 0} lượt Khoe Đơn</span>
          </div>
        </div>
      </div>

      {/* Conversion Funnel Breakdown */}
      <div className="bg-neutral-900/80 border border-white/10 p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-pink-500" />
              Phễu Chuyển Đổi Hành Trình Khách Hàng
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Từ lúc xem sản phẩm đến lúc thanh toán và lan tỏa xã hội (Khoe Đơn).
            </p>
          </div>
          <Link href="/admin/analytics" className="text-xs text-pink-400 font-bold hover:underline flex items-center gap-1">
            Chi tiết phân tích <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {funnel && (
          <div className="space-y-4">
            {[
              { label: "1. Lượt Xem Sản Phẩm (Product Views)", count: funnel.views, max: Math.max(funnel.views, 1), color: "bg-blue-500" },
              { label: "2. Thêm Vào Giỏ Hàng (Add to Cart)", count: funnel.cartAdds, max: Math.max(funnel.views, 1), color: "bg-indigo-500" },
              { label: "3. Bắt Đầu Checkout (Initiate Checkout)", count: funnel.checkoutStarts, max: Math.max(funnel.views, 1), color: "bg-purple-500" },
              { label: "4. Chốt Đơn Hoàn Tất (Orders Placed)", count: funnel.orders, max: Math.max(funnel.views, 1), color: "bg-pink-500" },
              { label: "5. Chia Sẻ Khoe Đơn (Social Viral Shares)", count: funnel.shares, max: Math.max(funnel.views, 1), color: "bg-emerald-500" },
            ].map((step, idx) => {
              const pct = Math.min(100, Math.round((step.count / step.max) * 100));
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-neutral-300">{step.label}</span>
                    <span className="text-white font-mono">{step.count.toLocaleString()} ({pct}%)</span>
                  </div>
                  <div className="h-3 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${step.color} transition-all duration-700 rounded-full`}
                      style={{ width: `${Math.max(4, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Two Columns: Recent Orders & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-neutral-900/80 border border-white/10 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              Đơn Hàng Gần Đây
            </h2>
            <Link href="/admin/orders" className="text-xs text-pink-400 font-bold hover:underline">
              Xem tất cả
            </Link>
          </div>

          <div className="space-y-3">
            {data?.recentOrders && data.recentOrders.length > 0 ? (
              data.recentOrders.slice(0, 5).map((order) => {
                const statusColors: Record<string, string> = {
                  PLACED: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
                  CONFIRMED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
                  PREPARING: "bg-purple-500/10 text-purple-400 border-purple-500/20",
                  READY_FOR_SIMULATED_DELIVERY: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
                  COMPLETED: "bg-green-500/10 text-green-400 border-green-500/20",
                  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
                };

                return (
                  <div
                    key={order._id}
                    className="p-3.5 bg-neutral-800/50 hover:bg-neutral-800 rounded-xl border border-white/5 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white">#{order.orderNumber}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[order.orderStatus] || "bg-neutral-700 text-neutral-300"}`}>
                          {order.orderStatus}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-1 truncate">
                        {order.shippingAddress?.fullName} • {order.items?.length || 1} món
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-white">{formatVND(order.total)}</div>
                      <div className="text-[10px] text-neutral-500">{formatDate(order.createdAt)}</div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-neutral-500 text-center py-6">Chưa có đơn hàng nào.</p>
            )}
          </div>
        </div>

        {/* Top Sold Products */}
        <div className="bg-neutral-900/80 border border-white/10 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              Sản Phẩm Bán Chạy Nhất
            </h2>
            <Link href="/admin/products" className="text-xs text-pink-400 font-bold hover:underline">
              Quản lý kho
            </Link>
          </div>

          <div className="space-y-3">
            {data?.topSoldProducts && data.topSoldProducts.length > 0 ? (
              data.topSoldProducts.map((prod, idx) => (
                <div
                  key={prod._id}
                  className="p-3 bg-neutral-800/50 rounded-xl border border-white/5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="w-5 text-center font-mono font-bold text-xs text-neutral-400">
                      {idx + 1}
                    </span>
                    <img
                      src={prod.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100"}
                      alt={prod.name}
                      className="w-10 h-10 rounded-lg object-cover bg-neutral-800 shrink-0"
                    />
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-white truncate">{prod.name}</p>
                      <p className="text-[10px] text-neutral-400">{prod.categoryName}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-white">{formatVND(prod.price)}</div>
                    <div className="text-[10px] text-pink-400 font-semibold">Đã bán {prod.soldCount}</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-neutral-500 text-center py-6">Chưa có dữ liệu bán hàng.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
