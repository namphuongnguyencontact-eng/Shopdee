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
  FileSpreadsheet,
  Clock,
  MapPin,
  Laptop,
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

interface PlatformRealtime {
  platform: string;
  activeCount: number;
  percentage: number;
}

interface LiveVisitor {
  sessionId: string;
  platform: string;
  currentPath: string;
  device: string;
  city?: string;
  country?: string;
  lastActiveAt: string;
  secondsAgo: number;
}

interface RealtimeData {
  activeShoppers: number;
  recentActiveSessions: number;
  activePages: Array<{ path: string; count: number }>;
  platformBreakdown?: PlatformRealtime[];
  liveVisitors?: LiveVisitor[];
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

const PLATFORM_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Threads: { bg: "bg-neutral-900", text: "text-white", border: "border-white/30", dot: "bg-white" },
  TikTok: { bg: "bg-black", text: "text-cyan-400", border: "border-cyan-500/40", dot: "bg-pink-500" },
  Facebook: { bg: "bg-blue-950/60", text: "text-blue-400", border: "border-blue-500/40", dot: "bg-blue-500" },
  Instagram: { bg: "bg-pink-950/60", text: "text-pink-400", border: "border-pink-500/40", dot: "bg-pink-500" },
  Google: { bg: "bg-red-950/40", text: "text-red-400", border: "border-red-500/40", dot: "bg-red-500" },
  Zalo: { bg: "bg-sky-950/60", text: "text-sky-400", border: "border-sky-500/40", dot: "bg-sky-400" },
  YouTube: { bg: "bg-red-950/60", text: "text-red-500", border: "border-red-600/40", dot: "bg-red-600" },
  Twitter: { bg: "bg-neutral-900", text: "text-sky-400", border: "border-sky-500/30", dot: "bg-sky-400" },
  Shopee: { bg: "bg-orange-950/60", text: "text-orange-400", border: "border-orange-500/40", dot: "bg-orange-500" },
  Lazada: { bg: "bg-indigo-950/60", text: "text-indigo-400", border: "border-indigo-500/40", dot: "bg-indigo-500" },
  Telegram: { bg: "bg-cyan-950/60", text: "text-cyan-400", border: "border-cyan-500/40", dot: "bg-cyan-400" },
  Direct: { bg: "bg-emerald-950/40", text: "text-emerald-400", border: "border-emerald-500/40", dot: "bg-emerald-400" },
};

export default function AdminAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<"realtime" | "traffic" | "funnel">("realtime");
  const [days, setDays] = useState<number>(30);
  const [loading, setLoading] = useState<boolean>(true);
  const [exporting, setExporting] = useState<boolean>(false);

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
    } catch (err) {
      console.error("Realtime load error:", err);
    }
  };

  useEffect(() => {
    loadTrafficData();
  }, [days]);

  useEffect(() => {
    loadRealtime();
    const interval = setInterval(loadRealtime, 5000); // 5s realtime polling
    return () => clearInterval(interval);
  }, []);

  const handleExportExcel = async (type: "traffic" | "orders" | "sales") => {
    try {
      setExporting(true);
      showToast({ type: "info", message: "Đang tạo tệp Excel chuẩn..." });
      window.location.href = `/api/admin/export?type=${type}&days=${days}`;
      setTimeout(() => {
        setExporting(false);
        showToast({ type: "success", message: "Đã bắt đầu tải file Excel!" });
      }, 1200);
    } catch {
      setExporting(false);
      showToast({ type: "error", message: "Lỗi tải tệp Excel." });
    }
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
            Phân Tích Dữ Liệu & Nguồn Traffic
            <BarChart3 className="w-5 h-5 text-blue-500" />
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Nhận diện đa nền tảng theo thời gian thực (Facebook, TikTok, Threads, Google, Zalo...) & Xuất báo cáo Excel
          </p>
        </div>

        {/* Controls: Date Filter & Export Excel */}
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

          <button
            type="button"
            onClick={() => handleExportExcel("traffic")}
            disabled={exporting}
            className="px-3.5 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            {exporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            )}
            Xuất File Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* Realtime Live Monitor Master Banner */}
      <div className="bg-gradient-to-r from-blue-950/80 via-indigo-950/50 to-neutral-900 border border-blue-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping absolute" />
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                Đang Mua Sắm Trực Tiếp Theo Thời Gian Thực
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-mono">
                  LIVE 5s
                </span>
              </div>
              <div className="text-xs text-neutral-400 mt-0.5">
                Nhận diện chính xác người dùng đến từ mọi nền tảng (Threads, TikTok, Facebook, Google, Zalo...)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
                {realtime ? realtime.activeShoppers : "..."}
              </div>
              <div className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Khách đang online (5p)</div>
            </div>

            <div className="h-10 w-px bg-white/10" />

            <div className="text-right">
              <div className="text-2xl font-bold text-white font-mono">
                {realtime ? realtime.recentActiveSessions : "..."}
              </div>
              <div className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Phiên 15 phút</div>
            </div>
          </div>
        </div>

        {/* Real-time Multi-Platform Breakdown Grid */}
        <div className="pt-3 border-t border-white/10">
          <div className="text-xs font-bold text-neutral-300 mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              Phân Bổ Nền Tảng Khách Đang Truy Cập (Real-time Platforms):
            </span>
            <span className="text-[11px] text-neutral-500 font-normal">
              Cập nhật tự động mỗi 5 giây
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {realtime?.platformBreakdown && realtime.platformBreakdown.length > 0 ? (
              realtime.platformBreakdown.map((item, idx) => {
                const style = PLATFORM_COLORS[item.platform] || {
                  bg: "bg-neutral-800/60",
                  text: "text-neutral-300",
                  border: "border-white/10",
                  dot: "bg-neutral-400",
                };
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border ${style.border} ${style.bg} transition hover:scale-105 duration-200 shadow-md flex flex-col justify-between`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${style.dot} animate-pulse`} />
                        <span className={`text-xs font-bold ${style.text}`}>{item.platform}</span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400">{item.percentage}%</span>
                    </div>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-lg font-black text-white font-mono">{item.activeCount}</span>
                      <span className="text-[10px] text-neutral-500">người</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-3 text-center text-xs text-neutral-500">
                Đang chờ người dùng truy cập... Hệ thống sẵn sàng nhận diện Facebook, TikTok, Threads, Google, Zalo...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab("realtime")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "realtime"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          Nhật Ký Trực Tiếp (Live Stream Feed)
        </button>
        <button
          onClick={() => setActiveTab("traffic")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "traffic"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Compass className="w-4 h-4" /> Báo Cáo Nguồn Traffic & Chuyển Đổi
        </button>
        <button
          onClick={() => setActiveTab("funnel")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "funnel"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Target className="w-4 h-4" /> Phễu Chuyển Đổi & Hành Vi
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === "realtime" ? (
        /* TAB 0: REALTIME LIVE VISITOR FEED & TOP PAGES */
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Visitors Feed Table */}
            <div className="lg:col-span-2 bg-neutral-900 border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Nhật Ký Khách Đang Hoạt Động (Live Visitors Stream)
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Danh sách 20 khách gần nhất đang lướt Shopdee theo thời gian thực
                  </p>
                </div>
                <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" /> Tự động làm mới
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-800/80 text-neutral-400 uppercase tracking-wider text-[10px] border-b border-white/10">
                    <tr>
                      <th className="py-3 px-3">Thời Gian</th>
                      <th className="py-3 px-3">Nguồn / Nền Tảng</th>
                      <th className="py-3 px-3">Trang Đang Xem</th>
                      <th className="py-3 px-3">Thiết Bị</th>
                      <th className="py-3 px-3 text-right">Vị Trí</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {(!realtime?.liveVisitors || realtime.liveVisitors.length === 0) ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-neutral-500">
                          Chưa có phiên khách truy cập trực tiếp nào trong vài phút qua.
                        </td>
                      </tr>
                    ) : (
                      realtime.liveVisitors.map((vis, idx) => {
                        const style = PLATFORM_COLORS[vis.platform] || {
                          bg: "bg-neutral-800",
                          text: "text-neutral-300",
                          border: "border-white/10",
                          dot: "bg-neutral-400",
                        };
                        const timeText =
                          vis.secondsAgo <= 5
                            ? "Vừa xong"
                            : vis.secondsAgo < 60
                            ? `${vis.secondsAgo}s trước`
                            : `${Math.floor(vis.secondsAgo / 60)}m trước`;

                        return (
                          <tr key={idx} className="hover:bg-white/[0.02] transition">
                            <td className="py-3 px-3 font-mono text-neutral-400 whitespace-nowrap">
                              <span className="flex items-center gap-1 text-[11px]">
                                <Clock className="w-3 h-3 text-neutral-500" />
                                {timeText}
                              </span>
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${style.border} ${style.bg} ${style.text}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                                {vis.platform}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-neutral-300 font-mono text-[11px] max-w-[200px] truncate">
                              {vis.currentPath}
                            </td>
                            <td className="py-3 px-3 text-neutral-400 whitespace-nowrap capitalize">
                              <span className="flex items-center gap-1 text-[11px]">
                                {vis.device === "mobile" ? (
                                  <Smartphone className="w-3 h-3 text-purple-400" />
                                ) : (
                                  <Laptop className="w-3 h-3 text-blue-400" />
                                )}
                                {vis.device}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right font-medium text-neutral-400 whitespace-nowrap text-[11px]">
                              {vis.city || vis.country || "Việt Nam"}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: Active Pages & Device Split */}
            <div className="space-y-6">
              <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  Trang Đang Được Xem Nhiều Nhất
                </h3>
                <div className="divide-y divide-white/5">
                  {(!realtime?.activePages || realtime.activePages.length === 0) ? (
                    <p className="text-xs text-neutral-500 py-6 text-center">Chưa có trang đang truy cập tức thời.</p>
                  ) : (
                    realtime.activePages.map((p, i) => (
                      <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                        <span className="text-neutral-300 font-mono truncate max-w-[180px]">{p.path}</span>
                        <span className="font-bold text-emerald-400 shrink-0 font-mono">{p.count} đang xem</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Supported Platforms Notice */}
              <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-white/10 rounded-2xl p-5 text-xs space-y-2">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  Hệ Thống Nhận Diện Nền Tảng Tự Động
                </div>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  Hỗ trợ định danh chính xác tất cả nền tảng: <strong className="text-neutral-200">Threads, TikTok, Facebook, Instagram, Google, Zalo, YouTube, X/Twitter, Shopee, Lazada, Telegram</strong> qua Referrer URL, In-App Webview User-Agent và chiến dịch UTM.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : loading ? (
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
                  Bảng Đo Nguồn Traffic Đa Kênh & Chuyển Đổi
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Phân tích lưu lượng từ TikTok, Google, Facebook, Threads, Instagram, YouTube, Zalo, Direct và các link UTM
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleExportExcel("traffic")}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-white/10 rounded-xl text-xs font-semibold text-neutral-300 flex items-center gap-1.5 transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                Xuất Báo Cáo Excel
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-800/80 text-neutral-400 uppercase tracking-wider text-[10px] border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Nền Tảng / Nguồn</th>
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
                    sources.map((item, idx) => {
                      const style = PLATFORM_COLORS[item.source] || {
                        dot: "bg-blue-400",
                        text: "text-white",
                      };
                      return (
                        <tr key={idx} className="hover:bg-white/[0.02] transition">
                          <td className="py-3.5 px-4 font-bold text-white capitalize flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${style.dot} shrink-0`} />
                            {item.source}
                          </td>
                          <td className="py-3.5 px-4 text-neutral-400 font-mono text-[11px]">
                            {item.medium || item.category || "organic"}
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
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Device Breakdown */}
          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-purple-400" /> Thiết Bị Truy Cập
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(!Array.isArray(devices) || devices.length === 0) ? (
                <p className="text-xs text-neutral-500 py-6 text-center col-span-full">Chưa có dữ liệu thiết bị.</p>
              ) : (
                devices.map((d, i) => (
                  <div key={i} className="p-4 rounded-xl bg-neutral-800/40 border border-white/5 space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-white capitalize flex items-center gap-1.5">
                        {d.device === "mobile" ? <Smartphone className="w-3.5 h-3.5 text-purple-400" /> : <Laptop className="w-3.5 h-3.5 text-blue-400" />}
                        {d.device}
                      </span>
                      <span className="text-neutral-400 font-mono">
                        {d.percentage ?? 0}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-neutral-700/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(0, d.percentage ?? 0))}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      {((d.sessions ?? 0)).toLocaleString()} phiên truy cập
                    </div>
                  </div>
                ))
              )}
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
