"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Eye,
  ShoppingBag,
  Users,
  Target,
  ArrowDownRight,
  Sparkles,
  Download,
  Calendar,
  Compass,
  Smartphone,
  Globe,
  Radio,
  ExternalLink,
  Loader2,
  RefreshCw,
  Layers,
  Activity,
} from "lucide-react";
import { formatVND } from "@/lib/utils";
import { showToast } from "@/store/useToastStore";

interface TrafficOverview {
  totalSessions: number;
  uniqueVisitors: number;
  pageviews: number;
  totalOrders: number;
  totalRevenue: number;
  conversionRate: number;
  avgOrderValue: number;
}

interface SourceItem {
  source: string;
  medium?: string;
  category?: string;
  sessions?: number;
  uniqueVisitors?: number;
  visitors?: number;
  orders?: number;
  revenue?: number;
  gmv?: number;
  conversionRate?: number;
}

interface DeviceItem {
  device: string;
  sessions: number;
  percentage: number;
}

interface RealtimeData {
  activeShoppers: number;
  recentActiveSessions: number;
  activePages: Array<{ path: string; count: number }>;
}

interface BehavioralData {
  kpis: {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    virtualGMV: number;
    conversionRate: number;
    cartAbandonmentRate: number;
    totalShares: number;
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
    categoryName: string;
  }>;
  topViewedProducts: Array<{
    _id: string;
    name: string;
    price: number;
    viewCount: number;
    categoryName: string;
  }>;
}

export default function AdminAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<"traffic" | "funnel">("traffic");
  const [days, setDays] = useState<number>(30);
  const [loading, setLoading] = useState<boolean>(true);

  // Traffic State
  const [trafficOverview, setTrafficOverview] = useState<TrafficOverview | null>(null);
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [realtime, setRealtime] = useState<RealtimeData | null>(null);

  // Behavioral State
  const [behavioral, setBehavioral] = useState<BehavioralData | null>(null);

  const loadTrafficData = async () => {
    try {
      setLoading(true);
      const [trafficRes, sourcesRes, behavioralRes] = await Promise.all([
        fetch(`/api/admin/analytics/traffic?days=${days}`),
        fetch(`/api/admin/analytics/sources?days=${days}`),
        fetch("/api/admin/stats"),
      ]);

      const [trafficJson, sourcesJson, behavioralJson] = await Promise.all([
        trafficRes.json(),
        sourcesRes.json(),
        behavioralRes.json(),
      ]);

      if (trafficJson.success && trafficJson.data) {
        setTrafficOverview(trafficJson.data.overview || null);
        const rawDevices = trafficJson.data.devices;
        if (Array.isArray(rawDevices)) {
          setDevices(rawDevices);
        } else if (rawDevices && typeof rawDevices === "object") {
          if (Array.isArray(rawDevices.list)) {
            setDevices(rawDevices.list);
          } else {
            const devObj = rawDevices.devices || rawDevices;
            const pctObj = rawDevices.percentages || {};
            setDevices([
              { device: "Desktop", sessions: devObj.desktop || 0, percentage: pctObj.desktop || 0 },
              { device: "Mobile", sessions: devObj.mobile || 0, percentage: pctObj.mobile || 0 },
              { device: "Tablet", sessions: devObj.tablet || 0, percentage: pctObj.tablet || 0 },
            ]);
          }
        } else {
          setDevices([]);
        }
      }
      if (sourcesJson.success && sourcesJson.data) {
        setSources(Array.isArray(sourcesJson.data.sources) ? sourcesJson.data.sources : []);
      }
      if (behavioralJson.success && behavioralJson.data) {
        setBehavioral(behavioralJson.data);
      }
    } catch (err) {
      console.error("Failed to load traffic analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadRealtime = async () => {
    try {
      const res = await fetch("/api/admin/analytics/realtime");
      const json = await res.json();
      if (json.success && json.data) {
        setRealtime(json.data);
      }
    } catch {}
  };

  useEffect(() => {
    loadTrafficData();
  }, [days]);

  useEffect(() => {
    loadRealtime();
    const interval = setInterval(loadRealtime, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleExportCSV = (type: "sources" | "traffic" | "orders") => {
    window.open(`/api/admin/analytics/export?type=${type}&days=${days}`, "_blank");
    showToast({ type: "success", message: "Đang tải xuống tệp dữ liệu CSV..." });
  };

  const funnel = behavioral?.funnel;
  const viewCount = Math.max(funnel?.views || 1, 1);
  const cartCount = funnel?.cartAdds || 0;
  const checkoutCount = funnel?.checkoutStarts || 0;
  const orderCount = funnel?.orders || 0;
  const shareCount = funnel?.shares || 0;

  const viewToCartRate = Number(((cartCount / viewCount) * 100).toFixed(1));
  const cartToCheckoutRate = cartCount > 0 ? Number(((checkoutCount / cartCount) * 100).toFixed(1)) : 0;
  const checkoutToOrderRate = checkoutCount > 0 ? Number(((orderCount / checkoutCount) * 100).toFixed(1)) : 0;
  const orderToShareRate = orderCount > 0 ? Number(((shareCount / orderCount) * 100).toFixed(1)) : 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            Phân Tích & Đo Lường Toàn Diện
            <BarChart3 className="w-5 h-5 text-blue-500" />
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Hệ thống đo traffic thực, nguồn truy cập (TikTok, Google, FB, Zalo...), phễu chuyển đổi & doanh số
          </p>
        </div>

        {/* Controls: Date Filter & Export CSV */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-neutral-900 border border-white/10 rounded-xl px-3 py-1.5">
            <Calendar className="w-4 h-4 text-neutral-400" />
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="bg-transparent text-xs text-white outline-none cursor-pointer"
            >
              <option value={1} className="bg-neutral-900">Hôm nay (24h)</option>
              <option value={7} className="bg-neutral-900">7 ngày qua</option>
              <option value={30} className="bg-neutral-900">30 ngày qua</option>
              <option value={90} className="bg-neutral-900">90 ngày qua</option>
              <option value={365} className="bg-neutral-900">1 năm qua</option>
            </select>
          </div>

          <div className="relative group">
            <button
              type="button"
              onClick={() => handleExportCSV("sources")}
              className="px-3.5 py-2 rounded-xl bg-neutral-900 border border-white/10 hover:bg-neutral-800 text-neutral-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              Xuất CSV
            </button>
          </div>
        </div>
      </div>

      {/* Realtime Live Monitor Ticker */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-950/40 to-neutral-900 border border-blue-500/20 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute" />
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              Realtime Active Shoppers
            </div>
            <div className="text-[11px] text-neutral-400">
              Người dùng đang hoạt động trong 5 phút gần nhất
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-2xl font-black text-emerald-400">
              {realtime ? realtime.activeShoppers : "..."}
            </div>
            <div className="text-[10px] text-neutral-400 uppercase font-semibold">Đang mua sắm</div>
          </div>

          <div className="hidden sm:block h-8 w-px bg-white/10" />

          <div className="hidden sm:block text-right">
            <div className="text-xl font-bold text-white">
              {realtime ? realtime.recentActiveSessions : "..."}
            </div>
            <div className="text-[10px] text-neutral-400 uppercase font-semibold">Phiên 15 phút</div>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab("traffic")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "traffic"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Compass className="w-4 h-4" /> Nguồn Traffic & Phân bổ (Attribution)
        </button>
        <button
          onClick={() => setActiveTab("funnel")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "funnel"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Target className="w-4 h-4" /> Phễu Chuyển Đổi & Hành Vi Gen Z
        </button>
      </div>

      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center text-neutral-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          <span className="text-xs">Đang xử lý số liệu phân tích...</span>
        </div>
      ) : activeTab === "traffic" ? (
        /* TAB 1: TRAFFIC & ATTRIBUTION */
        <div className="space-y-8">
          {/* Overview KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-neutral-900 border border-white/10 rounded-2xl space-y-1 shadow-lg">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                Tổng Khách Ghé Thăm (Visitors)
              </span>
              <div className="text-2xl font-black text-white">
                {(trafficOverview?.uniqueVisitors ?? 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-neutral-500">
                {(trafficOverview?.totalSessions ?? 0).toLocaleString()} phiên truy cập (Sessions)
              </p>
            </div>

            <div className="p-5 bg-neutral-900 border border-white/10 rounded-2xl space-y-1 shadow-lg">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                Lượt Xem Trang (Pageviews)
              </span>
              <div className="text-2xl font-black text-blue-400">
                {(trafficOverview?.pageviews ?? 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-neutral-500">
                Được ghi nhận từ các tuyến đường trang
              </p>
            </div>

            <div className="p-5 bg-neutral-900 border border-white/10 rounded-2xl space-y-1 shadow-lg">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                Đơn Hàng Ghi Nhận
              </span>
              <div className="text-2xl font-black text-emerald-400">
                {(trafficOverview?.totalOrders ?? 0).toLocaleString()} đơn
              </div>
              <p className="text-[11px] text-emerald-400/80 font-semibold">
                Tỷ lệ chuyển đổi CVR: {trafficOverview?.conversionRate ?? 0}%
              </p>
            </div>

            <div className="p-5 bg-neutral-900 border border-white/10 rounded-2xl space-y-1 shadow-lg">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                Doanh Thu Đơn Hàng
              </span>
              <div className="text-2xl font-black text-pink-400">
                {formatVND(trafficOverview?.totalRevenue ?? 0)}
              </div>
              <p className="text-[11px] text-neutral-500">
                AOV: {formatVND(trafficOverview?.avgOrderValue ?? 0)}
              </p>
            </div>
          </div>

          {/* Sources Breakdown Table */}
          <div className="bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl space-y-4 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-blue-400" />
                  Bảng Đo Nguồn Traffic Thực & Chuyển Đổi
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Phân tích lưu lượng từ TikTok, Google, Facebook, Threads, Instagram, YouTube, Zalo, Direct và các link UTM
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-800/80 text-neutral-400 uppercase tracking-wider text-[10px] border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Nguồn Truy Cập</th>
                    <th className="py-3 px-4">Kênh (Medium)</th>
                    <th className="py-3 px-4 text-right">Phiên (Sessions)</th>
                    <th className="py-3 px-4 text-right">Khách Duy Nhất</th>
                    <th className="py-3 px-4 text-right">Đơn Hàng</th>
                    <th className="py-3 px-4 text-right">Doanh Số</th>
                    <th className="py-3 px-4 text-right">Tỷ Lệ CVR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sources.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-neutral-500">
                        Chưa có dữ liệu phiên truy cập nào trong khoảng thời gian này.
                      </td>
                    </tr>
                  ) : (
                    sources.map((item, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02] transition">
                        <td className="py-3.5 px-4 font-bold text-white capitalize flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                          {item.source}
                        </td>
                        <td className="py-3.5 px-4 text-neutral-400 font-mono text-[11px]">
                          {item.medium || item.category || "none"}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-neutral-300 font-semibold">
                          {(item.sessions ?? 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-neutral-400">
                          {((item.uniqueVisitors ?? item.visitors) ?? 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-emerald-400 font-bold">
                          {(item.orders ?? 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-pink-400">
                          {formatVND(item.revenue ?? item.gmv ?? 0)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-neutral-300 font-semibold">
                          {item.conversionRate ?? 0}%
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Device Breakdown & Realtime Top Pages */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Device share */}
            <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-purple-400" /> Thiết Bị Truy Cập
              </h3>
              <div className="space-y-3">
                {(!Array.isArray(devices) || devices.length === 0) ? (
                  <p className="text-xs text-neutral-500 py-6 text-center">Chưa có dữ liệu thiết bị.</p>
                ) : (
                  devices.map((d, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-white capitalize">{d.device}</span>
                        <span className="text-neutral-400 font-mono">
                          {d.percentage ?? 0}% ({((d.sessions ?? 0)).toLocaleString()} phiên)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${Math.min(100, Math.max(0, d.percentage ?? 0))}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Active pages */}
            <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" /> Trang Đang Được Xem Nhiều Nhất
              </h3>
              <div className="divide-y divide-white/5">
                {(!realtime?.activePages || realtime.activePages.length === 0) ? (
                  <p className="text-xs text-neutral-500 py-6 text-center">Chưa có trang đang truy cập tức thời.</p>
                ) : (
                  realtime.activePages.map((p, i) => (
                    <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                      <span className="text-neutral-300 font-mono truncate max-w-xs">{p.path}</span>
                      <span className="font-bold text-emerald-400 shrink-0 font-mono">{p.count} người</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* TAB 2: FUNNEL & BEHAVIORAL */
        <div className="space-y-8">
          {/* Conversion Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-neutral-900 border border-white/10 rounded-2xl shadow-lg">
              <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Tỷ Lệ Xem → Thêm Giỏ
              </div>
              <div className="text-3xl font-black text-white">{viewToCartRate}%</div>
              <p className="text-[11px] text-neutral-400 mt-2">
                {cartCount} lượt thêm vào giỏ từ {viewCount} lượt xem
              </p>
            </div>

            <div className="p-5 bg-neutral-900 border border-white/10 rounded-2xl shadow-lg">
              <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Tỷ Lệ Giỏ Hàng → Chốt Đơn
              </div>
              <div className="text-3xl font-black text-white">
                {cartCount > 0 ? ((orderCount / cartCount) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-[11px] text-yellow-400 mt-2">
                Tỷ lệ bỏ giỏ hàng: {behavioral?.kpis?.cartAbandonmentRate || 0}%
              </p>
            </div>

            <div className="p-5 bg-neutral-900 border border-white/10 rounded-2xl shadow-lg">
              <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Viral Rate (Đơn → Khoe Đơn)
              </div>
              <div className="text-3xl font-black text-white">{orderToShareRate}%</div>
              <p className="text-[11px] text-emerald-400 mt-2">
                {shareCount} thẻ Khoe Đơn được tạo từ {orderCount} đơn hàng
              </p>
            </div>
          </div>

          {/* Detailed Funnel Visualization */}
          <div className="bg-neutral-900 border border-white/10 p-6 rounded-2xl shadow-xl">
            <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Target className="w-4 h-4 text-pink-500" />
              Phễu Chuyển Đổi Mua Sắm & Rớt Đơn (Drop-Off Funnel)
            </h2>
            <p className="text-xs text-neutral-400 mb-6">
              Chi tiết từng chặng trong hành trình khách hàng
            </p>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {[
                {
                  step: "1. Khám Phá",
                  name: "Xem Chi Tiết",
                  count: viewCount,
                  pctOfTotal: "100%",
                  nextDrop: `${100 - viewToCartRate}% thoát`,
                  color: "border-blue-500/30 bg-blue-500/10 text-blue-400",
                },
                {
                  step: "2. Hứng Thú",
                  name: "Thêm Vào Giỏ",
                  count: cartCount,
                  pctOfTotal: `${((cartCount / viewCount) * 100).toFixed(1)}%`,
                  nextDrop: `${100 - cartToCheckoutRate}% dừng`,
                  color: "border-indigo-500/30 bg-indigo-500/10 text-indigo-400",
                },
                {
                  step: "3. Quyết Định",
                  name: "Vào Checkout",
                  count: checkoutCount,
                  pctOfTotal: `${((checkoutCount / viewCount) * 100).toFixed(1)}%`,
                  nextDrop: `${100 - checkoutToOrderRate}% chưa mua`,
                  color: "border-purple-500/30 bg-purple-500/10 text-purple-400",
                },
                {
                  step: "4. Chốt Đơn",
                  name: "Đặt Hàng Thành Công",
                  count: orderCount,
                  pctOfTotal: `${((orderCount / viewCount) * 100).toFixed(1)}%`,
                  nextDrop: `${orderToShareRate}% khoe đơn`,
                  color: "border-pink-500/30 bg-pink-500/10 text-pink-400",
                },
                {
                  step: "5. Lan Tỏa",
                  name: "Khoe Đơn Story",
                  count: shareCount,
                  pctOfTotal: `${((shareCount / viewCount) * 100).toFixed(1)}%`,
                  nextDrop: "Hoàn tất viral",
                  color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
                },
              ].map((col, idx) => (
                <div key={idx} className={`p-4 rounded-xl border ${col.color} flex flex-col justify-between`}>
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold opacity-75">{col.step}</span>
                    <h4 className="font-bold text-sm text-white mt-1 mb-2">{col.name}</h4>
                    <div className="text-xl font-black text-white font-mono">{(col.count ?? 0).toLocaleString()}</div>
                    <div className="text-[11px] opacity-90 mt-0.5">Tỷ lệ: {col.pctOfTotal}</div>
                  </div>
                  <div className="mt-4 pt-2 border-t border-white/10 text-[10px] flex items-center gap-1 opacity-75">
                    <ArrowDownRight className="w-3 h-3" />
                    {col.nextDrop}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Two Column: Top Views vs Top Sells */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-neutral-900 border border-white/10 p-6 rounded-2xl shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-400" />
                Top 5 Sản Phẩm Được Xem Nhiều Nhất
              </h3>
              <div className="space-y-3">
                {behavioral?.topViewedProducts?.map((item, i) => (
                  <div key={item._id} className="p-3 bg-neutral-800/50 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="font-mono text-neutral-400 font-bold">{i + 1}.</span>
                      <div className="overflow-hidden">
                        <p className="font-semibold text-white truncate">{item.name}</p>
                        <p className="text-[10px] text-neutral-400">{item.categoryName}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-blue-400">{(item.viewCount ?? 0).toLocaleString()}</span>
                      <span className="text-[10px] text-neutral-500 block">lượt xem</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-neutral-900 border border-white/10 p-6 rounded-2xl shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-pink-400" />
                Top 5 Sản Phẩm Chốt Đơn Nhiều Nhất
              </h3>
              <div className="space-y-3">
                {behavioral?.topSoldProducts?.map((item, i) => (
                  <div key={item._id} className="p-3 bg-neutral-800/50 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="font-mono text-neutral-400 font-bold">{i + 1}.</span>
                      <div className="overflow-hidden">
                        <p className="font-semibold text-white truncate">{item.name}</p>
                        <p className="text-[10px] text-neutral-400">{item.categoryName}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-pink-400">{(item.soldCount ?? 0).toLocaleString()}</span>
                      <span className="text-[10px] text-neutral-500 block">đã bán</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
