"use client";

import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Users,
  CreditCard,
  Download,
  Search,
  Filter,
  ArrowUpDown,
  ChevronRight,
  Eye,
  MapPin,
  Calendar,
  X,
  Phone,
  Mail,
  UserCheck,
  Sparkles,
  PieChart,
  BarChart3,
  Loader2,
  CheckCircle2,
  Clock,
  Flame,
} from "lucide-react";
import { formatVND, formatDate } from "@/lib/utils";
import { showToast } from "@/store/useToastStore";

interface SoldProductItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  originalPrice?: number;
  inStock: number;
  categoryName: string;
  totalSold: number;
  totalRevenue: number;
  orderCount: number;
  uniqueBuyersCount: number;
  latestSaleAt: string;
}

interface BuyerRecord {
  orderId: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  quantity: number;
  price: number;
  totalItemPrice: number;
  orderTotal: number;
  orderStatus: string;
  paymentMethod: string;
  purchaseDate: string;
  gender?: string;
  estimatedAgeGroup?: string;
}

interface DemographicData {
  locations: Array<{ city: string; count: number; percentage: number }>;
  gender: Array<{ gender: string; count: number; percentage: number; color: string }>;
  ageGroups: Array<{ group: string; count: number; percentage: number }>;
  customerTypes: Array<{ type: string; count: number; percentage: number }>;
}

interface ProductDetailData {
  product: {
    _id: string;
    name: string;
    slug: string;
    image: string;
    price: number;
    originalPrice?: number;
    inStock: number;
    categoryName: string;
    soldCount: number;
  };
  metrics: {
    totalSoldUnits: number;
    totalRevenue: number;
    orderCount: number;
    uniqueBuyersCount: number;
    avgOrderQuantity: number;
  };
  buyers: BuyerRecord[];
  demographics: DemographicData;
}

export default function AdminSalesPage() {
  const [products, setProducts] = useState<SoldProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("sold_desc");
  const [days, setDays] = useState(0);
  const [kpis, setKpis] = useState<{
    totalSoldUnits: number;
    totalRevenue: number;
    distinctProductsCount: number;
    totalOrdersCount: number;
    topSellingProduct: { name: string; sold: number; revenue: number } | null;
    topRevenueProduct: { name: string; revenue: number; sold: number } | null;
  } | null>(null);

  // Selected Product for Buyer / Demographic Modal
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState<ProductDetailData | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<"demographics" | "buyers">("demographics");

  const loadSalesData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/sales?sort=${sort}&days=${days}&search=${encodeURIComponent(search)}`);
      const json = await res.json();
      if (json.success && json.data) {
        setProducts(json.data.products || []);
        setKpis(json.data.kpis || null);
      }
    } catch (err) {
      console.error("Failed to load sales data:", err);
      showToast({ type: "error", message: "Lỗi tải danh sách sản phẩm đã bán" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSalesData();
  }, [sort, days]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadSalesData();
  };

  const handleOpenDetail = async (productId: string) => {
    setSelectedProductId(productId);
    setActiveModalTab("demographics");
    try {
      setDetailLoading(true);
      const res = await fetch(`/api/admin/sales/${productId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setDetailData(json.data);
      } else {
        showToast({ type: "error", message: json.error?.message || "Lỗi tải thông tin" });
      }
    } catch (err) {
      console.error("Error loading product detail:", err);
      showToast({ type: "error", message: "Lỗi kết nối máy chủ" });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleExportSalesExcel = () => {
    window.open(`/api/admin/export?type=sales&days=${days}`, "_blank");
    showToast({ type: "success", message: "Đang tải xuống file Excel sản phẩm đã bán..." });
  };

  const handleExportBuyersExcel = (prodId: string) => {
    window.open(`/api/admin/export?type=buyers&productId=${prodId}`, "_blank");
    showToast({ type: "success", message: "Đang tải xuống file Excel danh sách người mua..." });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            Sản Phẩm Đã Bán & Phân Tích Khách Mua
            <Flame className="w-5 h-5 text-pink-500" />
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Theo dõi sản phẩm bán chạy nhất, doanh thu cao nhất, hồ sơ người mua & phân tích nhân khẩu học
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportSalesExcel}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          Xuất File Excel Sản Phẩm Đã Bán
        </button>
      </div>

      {/* Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900/80 border border-white/10 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Tổng Doanh Số</span>
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{formatVND(kpis?.totalRevenue || 0)}</div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{kpis?.totalOrdersCount || 0} đơn hàng đã xuất</span>
          </div>
        </div>

        <div className="bg-neutral-900/80 border border-white/10 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Số Lượng Đã Bán</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{(kpis?.totalSoldUnits || 0).toLocaleString()}</div>
          <div className="text-[11px] text-neutral-400 mt-2">
            Từ {kpis?.distinctProductsCount || 0} mã sản phẩm khác nhau
          </div>
        </div>

        <div className="bg-neutral-900/80 border border-white/10 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Bán Chạy Nhất (Số Lượng)</span>
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-bold text-white line-clamp-1">
            {kpis?.topSellingProduct?.name || "Chưa có dữ liệu"}
          </div>
          <div className="text-xs text-yellow-400 font-bold mt-2">
            Đã bán: {(kpis?.topSellingProduct?.sold || 0).toLocaleString()} sp
          </div>
        </div>

        <div className="bg-neutral-900/80 border border-white/10 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Doanh Thu Cao Nhất</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-bold text-white line-clamp-1">
            {kpis?.topRevenueProduct?.name || "Chưa có dữ liệu"}
          </div>
          <div className="text-xs text-blue-400 font-bold mt-2">
            {formatVND(kpis?.topRevenueProduct?.revenue || 0)}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-neutral-900 border border-white/10 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm, danh mục..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-neutral-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500"
          />
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {/* Time Filter */}
          <div className="flex items-center gap-2 bg-neutral-950 border border-white/10 rounded-xl px-3 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="bg-transparent text-xs text-white outline-none cursor-pointer"
            >
              <option value={0} className="bg-neutral-900">Tất cả thời gian</option>
              <option value={1} className="bg-neutral-900">Hôm nay (24h)</option>
              <option value={7} className="bg-neutral-900">7 ngày qua</option>
              <option value={30} className="bg-neutral-900">30 ngày qua</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 bg-neutral-950 border border-white/10 rounded-xl px-3 py-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-transparent text-xs text-white outline-none cursor-pointer"
            >
              <option value="sold_desc" className="bg-neutral-900">Bán chạy nhất (Số lượng)</option>
              <option value="revenue_desc" className="bg-neutral-900">Doanh số cao nhất (Tiền)</option>
              <option value="orders_desc" className="bg-neutral-900">Số đơn hàng nhiều nhất</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Sold Products Table */}
      <div className="bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="text-xs font-bold text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-pink-500" />
            Bảng Xếp Hạng Doanh Thu & Sản Phẩm Đã Bán ({products.length} sản phẩm)
          </div>
          <span className="text-[11px] text-neutral-400">
            Nhấn vào sản phẩm để xem người mua & phân tích nhân khẩu học
          </span>
        </div>

        {loading ? (
          <div className="min-h-[300px] flex items-center justify-center text-neutral-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-pink-500" />
            <span className="text-xs">Đang tải số liệu bán hàng...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="min-h-[250px] flex flex-col items-center justify-center text-neutral-400 p-8 text-center">
            <ShoppingBag className="w-10 h-10 text-neutral-600 mb-2" />
            <p className="text-sm font-semibold text-white">Chưa có sản phẩm nào được bán trong khoảng thời gian này</p>
            <p className="text-xs text-neutral-500 mt-1">Hãy thử đổi bộ lọc ngày hoặc kiểm tra lại đơn hàng.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.02] text-neutral-400 font-semibold border-b border-white/5 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Sản Phẩm</th>
                  <th className="py-3 px-4">Danh Mục</th>
                  <th className="py-3 px-4">Đơn Giá</th>
                  <th className="py-3 px-4 text-center">Đã Bán</th>
                  <th className="py-3 px-4">Doanh Số</th>
                  <th className="py-3 px-4 text-center">Số Đơn</th>
                  <th className="py-3 px-4 text-center">Khách Mua</th>
                  <th className="py-3 px-4 text-right">Chi Tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-neutral-300">
                {products.map((item, idx) => (
                  <tr
                    key={item.productId}
                    onClick={() => handleOpenDetail(item.productId)}
                    className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono text-neutral-500">
                      {idx === 0 ? (
                        <span className="w-5 h-5 rounded-full bg-yellow-500/20 text-yellow-400 inline-flex items-center justify-center font-bold text-[10px]">
                          1
                        </span>
                      ) : idx === 1 ? (
                        <span className="w-5 h-5 rounded-full bg-slate-300/20 text-slate-200 inline-flex items-center justify-center font-bold text-[10px]">
                          2
                        </span>
                      ) : idx === 2 ? (
                        <span className="w-5 h-5 rounded-full bg-amber-600/20 text-amber-500 inline-flex items-center justify-center font-bold text-[10px]">
                          3
                        </span>
                      ) : (
                        idx + 1
                      )}
                    </td>
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-neutral-950 border border-white/10 overflow-hidden shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white group-hover:text-pink-400 transition-colors line-clamp-2">
                            {item.name}
                          </p>
                          <span className="text-[10px] text-neutral-500 font-mono">ID: {item.productId.slice(-6)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-white/5 text-neutral-300 font-medium text-[11px] border border-white/5">
                        {item.categoryName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white font-mono">{formatVND(item.price)}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-pink-500/10 text-pink-400 font-bold border border-pink-500/20 text-[11px]">
                        {item.totalSold.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-black text-emerald-400 font-mono">
                      {formatVND(item.totalRevenue)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium text-white">{item.orderCount}</td>
                    <td className="py-3.5 px-4 text-center text-neutral-400">
                      <span className="flex items-center justify-center gap-1">
                        <Users className="w-3.5 h-3.5 text-blue-400" />
                        {item.uniqueBuyersCount}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetail(item.productId);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-pink-600/10 hover:bg-pink-600 text-pink-400 hover:text-white font-bold text-[11px] transition inline-flex items-center gap-1 border border-pink-500/20"
                      >
                        Phân tích <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL MODAL: BUYERS & DEMOGRAPHICS */}
      {selectedProductId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-neutral-900 border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 flex items-start justify-between gap-4 bg-neutral-950">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-white/10 overflow-hidden shrink-0">
                  <img
                    src={detailData?.product.image || "/logo.png"}
                    alt="Product"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-400 text-[10px] font-bold">
                      {detailData?.product.categoryName || "Sản Phẩm"}
                    </span>
                    <span className="text-[11px] text-neutral-500 font-mono">
                      ID: {detailData?.product._id.slice(-8)}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white truncate mt-0.5">
                    {detailData?.product.name || "Đang tải sản phẩm..."}
                  </h3>
                  <div className="flex items-center gap-4 text-xs mt-1">
                    <span className="text-white font-mono font-bold">
                      {formatVND(detailData?.product.price || 0)}
                    </span>
                    <span className="text-neutral-400">
                      Tổng đã bán: <strong className="text-pink-400">{detailData?.metrics.totalSoldUnits || 0}</strong> sp
                    </span>
                    <span className="text-neutral-400">
                      Doanh thu: <strong className="text-emerald-400">{formatVND(detailData?.metrics.totalRevenue || 0)}</strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExportBuyersExcel(selectedProductId)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white text-xs font-bold transition flex items-center gap-1.5 border border-emerald-500/30"
                >
                  <Download className="w-3.5 h-3.5" /> Xuất Excel
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProductId(null)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 px-5 pt-3 border-b border-white/10 bg-neutral-950/60">
              <button
                onClick={() => setActiveModalTab("demographics")}
                className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                  activeModalTab === "demographics"
                    ? "border-pink-500 text-pink-400"
                    : "border-transparent text-neutral-400 hover:text-white"
                }`}
              >
                <PieChart className="w-4 h-4" />
                Nhân Khẩu Học Khách Mua (Demographics)
              </button>
              <button
                onClick={() => setActiveModalTab("buyers")}
                className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                  activeModalTab === "buyers"
                    ? "border-pink-500 text-pink-400"
                    : "border-transparent text-neutral-400 hover:text-white"
                }`}
              >
                <Users className="w-4 h-4" />
                Danh Sách Khách Hàng ({detailData?.buyers.length || 0})
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {detailLoading ? (
                <div className="min-h-[250px] flex items-center justify-center text-neutral-400 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-pink-500" />
                  <span className="text-xs">Đang phân tích nhân khẩu học...</span>
                </div>
              ) : activeModalTab === "demographics" && detailData ? (
                /* TAB 1: DEMOGRAPHICS BREAKDOWN */
                <div className="space-y-6">
                  {/* Row 1: Geographic Distribution & Gender */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Location Breakdown */}
                    <div className="bg-neutral-950/80 border border-white/10 rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-emerald-400" />
                          Phân Bố Tỉnh / Thành Phố
                        </h4>
                        <span className="text-[10px] text-neutral-400 font-mono">Địa chỉ giao hàng</span>
                      </div>

                      <div className="space-y-3">
                        {detailData.demographics.locations.map((loc) => (
                          <div key={loc.city} className="space-y-1">
                            <div className="flex justify-between text-xs font-medium">
                              <span className="text-neutral-300">{loc.city}</span>
                              <span className="text-white font-mono font-bold">
                                {loc.count} đơn ({loc.percentage}%)
                              </span>
                            </div>
                            <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                                style={{ width: `${Math.max(5, loc.percentage)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Gender Breakdown */}
                    <div className="bg-neutral-950/80 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-pink-400" />
                            Phân Bố Theo Giới Tính
                          </h4>
                          <span className="text-[10px] text-neutral-400">Tài khoản & Hồ sơ</span>
                        </div>

                        <div className="space-y-3.5">
                          {detailData.demographics.gender.map((g) => (
                            <div key={g.gender} className="space-y-1">
                              <div className="flex justify-between text-xs font-medium">
                                <span className="text-neutral-300">{g.gender}</span>
                                <span className="text-white font-mono font-bold">
                                  {g.count} người ({g.percentage}%)
                                </span>
                              </div>
                              <div className="h-2.5 bg-neutral-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{
                                    backgroundColor: g.color,
                                    width: `${Math.max(5, g.percentage)}%`,
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Customer Type summary */}
                      <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-2 gap-3 text-center">
                        <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                          <span className="text-[10px] text-neutral-400 uppercase font-bold block">Khách mới</span>
                          <span className="text-base font-black text-white">
                            {detailData.demographics.customerTypes[0]?.percentage || 0}%
                          </span>
                        </div>
                        <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                          <span className="text-[10px] text-neutral-400 uppercase font-bold block">Khách quay lại</span>
                          <span className="text-base font-black text-pink-400">
                            {detailData.demographics.customerTypes[1]?.percentage || 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Age Demographics */}
                  <div className="bg-neutral-950/80 border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <BarChart3 className="w-4 h-4 text-purple-400" />
                        Phân Khúc Độ Tuổi Khách Mua Hàng
                      </h4>
                      <span className="text-[10px] text-pink-400 font-bold">
                        Đặc trưng khách hàng thế hệ Gen Z & Millennial
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                      {detailData.demographics.ageGroups.map((age) => (
                        <div
                          key={age.group}
                          className="bg-neutral-900 border border-white/5 rounded-xl p-3.5 text-center flex flex-col justify-between"
                        >
                          <span className="text-[11px] font-bold text-neutral-300 block">{age.group}</span>
                          <div className="my-2">
                            <span className="text-lg font-black text-purple-400">{age.percentage}%</span>
                            <p className="text-[10px] text-neutral-500 font-mono mt-0.5">{age.count} khách</p>
                          </div>
                          <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-500 rounded-full"
                              style={{ width: `${Math.max(5, age.percentage)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : activeModalTab === "buyers" && detailData ? (
                /* TAB 2: BUYERS LIST TABLE */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-400">
                      Tất cả đơn hàng chứa sản phẩm này ({detailData.buyers.length} giao dịch)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleExportBuyersExcel(selectedProductId)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-200 text-xs font-bold border border-white/10 flex items-center gap-1 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      Tải File Excel Khách Mua
                    </button>
                  </div>

                  {detailData.buyers.length === 0 ? (
                    <div className="text-center py-12 text-neutral-400 text-xs">
                      Chưa ghi nhận thông tin chi tiết đơn hàng từ người mua thực tế.
                    </div>
                  ) : (
                    <div className="border border-white/10 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-neutral-950 text-neutral-400 font-bold uppercase text-[10px] border-b border-white/10">
                          <tr>
                            <th className="py-2.5 px-3">Mã Đơn</th>
                            <th className="py-2.5 px-3">Khách Hàng</th>
                            <th className="py-2.5 px-3">Số Điện Thoại</th>
                            <th className="py-2.5 px-3">Tỉnh / Thành</th>
                            <th className="py-2.5 px-3 text-center">SL</th>
                            <th className="py-2.5 px-3">Thành Tiền</th>
                            <th className="py-2.5 px-3">Thanh Toán</th>
                            <th className="py-2.5 px-3">Ngày Đặt</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-neutral-300">
                          {detailData.buyers.map((b) => (
                            <tr key={b.orderId} className="hover:bg-white/[0.02]">
                              <td className="py-2.5 px-3 font-mono font-bold text-pink-400">
                                #{b.orderNumber}
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="font-bold text-white">{b.customerName}</div>
                                <div className="text-[10px] text-neutral-500">{b.email}</div>
                              </td>
                              <td className="py-2.5 px-3 font-mono">{b.phone}</td>
                              <td className="py-2.5 px-3">
                                <span className="text-neutral-300">{b.city}</span>
                              </td>
                              <td className="py-2.5 px-3 text-center font-bold text-white font-mono">
                                {b.quantity}
                              </td>
                              <td className="py-2.5 px-3 font-bold text-emerald-400 font-mono">
                                {formatVND(b.totalItemPrice)}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-300">
                                  {b.paymentMethod}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-[11px] text-neutral-400">
                                {formatDate(b.purchaseDate)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
