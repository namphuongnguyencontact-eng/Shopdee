"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Users,
  ExternalLink,
  Package,
  Calendar,
  Layers,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { formatVND, formatDate } from "@/lib/utils";

interface ProductAnalyticsData {
  product: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    brand: string;
    images: string[];
    stock: number;
    soldCount: number;
  };
  views: number;
  uniqueVisitors: number;
  cartAdds: number;
  cartAddRate: number;
  orders: number;
  conversionRate: number;
  totalUnitsSold: number;
  totalRevenue: number;
  trafficSources: Array<{
    source: string;
    views: number;
    orders: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    _id: string;
    orderCode: string;
    createdAt: string;
    quantity: number;
    totalAmount: number;
    status: string;
    userName: string;
  }>;
}

export default function ProductAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<ProductAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/products/${id}/analytics?days=${days}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setData(json.data);
        }
      })
      .catch((err) => console.error("Failed to load product analytics:", err))
      .finally(() => setLoading(false));
  }, [id, days]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-neutral-400 gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        <span className="text-xs">Đang phân tích số liệu sản phẩm...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-neutral-400 space-y-4">
        <p className="text-sm">Không tìm thấy thông tin phân tích cho sản phẩm này.</p>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-xs text-blue-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách sản phẩm
        </Link>
      </div>
    );
  }

  const { product } = data;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-xl bg-neutral-900 border border-white/10 hover:bg-neutral-800 text-neutral-300 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white">Phân tích chuyên sâu sản phẩm</h1>
              <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 text-[11px] font-bold rounded-full border border-blue-500/30">
                Funnel Metrics
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Đo lường traffic thực tế, phễu chuyển đổi và doanh số chính xác theo đơn hàng
            </p>
          </div>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-neutral-400" />
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="bg-neutral-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value={7}>7 ngày qua</option>
            <option value={30}>30 ngày qua</option>
            <option value={90}>90 ngày qua</option>
            <option value={365}>1 năm qua</option>
          </select>
        </div>
      </div>

      {/* Product Summary Banner */}
      <div className="bg-neutral-900 border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <img
            src={product.images?.[0] || "/placeholder.png"}
            alt={product.name}
            className="w-16 h-16 rounded-xl object-cover bg-neutral-800 border border-white/10 shrink-0"
          />
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400">
              {product.brand}
            </span>
            <h2 className="text-base font-bold text-white line-clamp-1">{product.name}</h2>
            <div className="flex items-center gap-3 mt-1 text-xs text-neutral-400">
              <span className="font-bold text-pink-400">{formatVND(product.price)}</span>
              <span>•</span>
              <span>Tồn kho: {product.stock}</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">Đã bán: {product.soldCount} món</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <Link
            href={`/products/${product.slug}`}
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Xem trang sản phẩm
          </Link>
          <Link
            href={`/admin/products/${product._id}/edit`}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm"
          >
            Chỉnh sửa sản phẩm
          </Link>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-white/10 rounded-2xl p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
            <span>Lượt xem chi tiết</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{data.views.toLocaleString()}</div>
          <div className="text-[11px] text-neutral-400 flex items-center gap-1">
            <Users className="w-3 h-3 text-neutral-500" />
            <span>{data.uniqueVisitors.toLocaleString()} khách truy cập duy nhất</span>
          </div>
        </div>

        <div className="bg-neutral-900 border border-white/10 rounded-2xl p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
            <span>Thêm giỏ hàng</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{data.cartAdds.toLocaleString()}</div>
          <div className="text-[11px] text-purple-400 font-semibold">
            Tỷ lệ thêm giỏ: {data.cartAddRate}%
          </div>
        </div>

        <div className="bg-neutral-900 border border-white/10 rounded-2xl p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
            <span>Đơn chốt thành công</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{data.orders.toLocaleString()} đơn</div>
          <div className="text-[11px] text-emerald-400 font-semibold">
            {data.totalUnitsSold.toLocaleString()} sản phẩm đã bán ({data.conversionRate}% CVR)
          </div>
        </div>

        <div className="bg-neutral-900 border border-white/10 rounded-2xl p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
            <span>Doanh thu thu về</span>
            <div className="p-2 bg-pink-500/10 text-pink-400 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-pink-400">{formatVND(data.totalRevenue)}</div>
          <div className="text-[11px] text-neutral-400">
            Từ các đơn hàng COMPLETED thực tế
          </div>
        </div>
      </div>

      {/* Conversion Funnel Card */}
      <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 space-y-6 shadow-xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-400" /> Phễu chuyển đổi sản phẩm (Conversion Funnel)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-neutral-800/60 border border-white/5 rounded-2xl space-y-1 relative">
            <span className="text-xs text-neutral-400 uppercase tracking-wider font-bold">1. Lượt xem</span>
            <div className="text-xl font-black text-white">{data.views}</div>
            <span className="text-[10px] text-neutral-500 block">100% traffic vào trang</span>
          </div>

          <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl space-y-1 relative">
            <span className="text-xs text-purple-300 uppercase tracking-wider font-bold">2. Thêm vào giỏ</span>
            <div className="text-xl font-black text-purple-300">{data.cartAdds}</div>
            <span className="text-[10px] text-purple-400 block">{data.cartAddRate}% tỷ lệ quan tâm</span>
          </div>

          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-1 relative">
            <span className="text-xs text-emerald-300 uppercase tracking-wider font-bold">3. Đặt hàng thành công</span>
            <div className="text-xl font-black text-emerald-300">{data.orders}</div>
            <span className="text-[10px] text-emerald-400 block">{data.conversionRate}% tỷ lệ chuyển đổi cuối</span>
          </div>
        </div>

        {/* Visual Progress Funnel */}
        <div className="space-y-3 pt-2">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1 text-neutral-400">
              <span>Xem trang → Thêm giỏ hàng</span>
              <span className="text-purple-400">{data.cartAddRate}%</span>
            </div>
            <div className="w-full h-2.5 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, data.cartAddRate))}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1 text-neutral-400">
              <span>Xem trang → Chốt đơn thành công</span>
              <span className="text-emerald-400">{data.conversionRate}%</span>
            </div>
            <div className="w-full h-2.5 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, data.conversionRate))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Two columns: Traffic Sources & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Traffic Sources Breakdown */}
        <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-400" /> Nguồn Traffic đưa khách tới sản phẩm
          </h3>

          <div className="divide-y divide-white/5">
            {data.trafficSources.length === 0 ? (
              <p className="text-xs text-neutral-500 py-6 text-center">Chưa ghi nhận traffic nguồn ngoài.</p>
            ) : (
              data.trafficSources.map((ts, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="font-bold text-white capitalize">{ts.source}</span>
                  </div>
                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <span className="text-neutral-300 block font-semibold">{ts.views} views</span>
                      <span className="text-[10px] text-neutral-500">{ts.orders} đơn</span>
                    </div>
                    <div className="font-bold text-pink-400 min-w-[80px]">
                      {formatVND(ts.revenue)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Purchases */}
        <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-400" /> Các đơn hàng mua gần đây
          </h3>

          <div className="divide-y divide-white/5">
            {data.recentOrders.length === 0 ? (
              <p className="text-xs text-neutral-500 py-6 text-center">Chưa có đơn hàng nào cho sản phẩm này.</p>
            ) : (
              data.recentOrders.map((ord) => (
                <div key={ord._id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white">#{ord.orderCode}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                        {ord.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-400 mt-0.5 block">
                      {ord.userName} • {formatDate(ord.createdAt)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-white block">SL: {ord.quantity}</span>
                    <span className="font-bold text-pink-400 text-xs">{formatVND(ord.totalAmount)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
