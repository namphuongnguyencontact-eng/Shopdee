"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Search,
  ShieldAlert,
  ShieldCheck,
  Eye,
  ShoppingBag,
  CreditCard,
  Package,
  Calendar,
  Phone,
  MapPin,
  X,
  ExternalLink,
  CheckCircle2,
  Truck,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { formatDate, formatVND } from "@/lib/utils";
import { useToastStore } from "@/store/useToastStore";

interface UserItem {
  _id: string;
  name: string;
  username?: string;
  email: string;
  role: "user" | "admin";
  isActive: boolean;
  avatar?: string;
  phone?: string;
  address?: string;
  gender?: string;
  birthDate?: string;
  level?: number;
  xp?: number;
  walletBalance?: number;
  orderCount?: number;
  totalSpent?: number;
  createdAt: string;
}

interface PurchasedItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  totalQuantity: number;
  totalSpent: number;
  lastPurchasedAt: string;
  orderNumbers: string[];
}

interface OrderDetail {
  _id: string;
  orderNumber: string;
  total: number;
  subtotal?: number;
  shippingFee?: number;
  discount?: number;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  items: Array<{
    productId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    variantName?: string;
  }>;
  shippingAddress?: {
    fullName: string;
    phone: string;
    address: string;
    district: string;
    city: string;
  };
}

interface UserDetailResponse {
  user: UserItem;
  stats: {
    totalOrders: number;
    completedOrders: number;
    shippingOrders: number;
    cancelledOrders: number;
    totalSpent: number;
  };
  purchasedItems: PurchasedItem[];
  orders: OrderDetail[];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { addToast } = useToastStore();

  // User detail modal state
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [userDetail, setUserDetail] = useState<UserDetailResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "info">("products");

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setUsers(json.data);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const loadUserDetail = async (userId: string) => {
    setSelectedUserId(userId);
    setDetailLoading(true);
    setActiveTab("products");
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      const json = await res.json();
      if (json.success) {
        setUserDetail(json.data);
      } else {
        addToast("error", json.error?.message || "Không thể tải chi tiết người dùng.");
      }
    } catch {
      addToast("error", "Lỗi tải thông tin chi tiết người dùng.");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleToggleActive = async (user: UserItem) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id, isActive: !user.isActive }),
      });
      const json = await res.json();
      if (json.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, isActive: !user.isActive } : u))
        );
        addToast("success", `Đã ${!user.isActive ? "kích hoạt lại" : "khóa"} tài khoản ${user.name}`);
      }
    } catch {
      addToast("error", "Lỗi cập nhật người dùng");
    }
  };

  const handleToggleRole = async (user: UserItem) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    if (!confirm(`Bạn có chắc muốn chuyển quyền ${user.name} thành "${newRole}"?`)) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id, role: newRole }),
      });
      const json = await res.json();
      if (json.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, role: newRole } : u))
        );
        addToast("success", `Đã cập nhật vai trò thành ${newRole}`);
      }
    } catch {
      addToast("error", "Lỗi cập nhật vai trò");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-pink-500" /> Quản Lý Người Dùng & Khách Hàng
        </h1>
        <p className="text-neutral-400 text-xs mt-1">
          Theo dõi tài khoản, phân quyền, xem thống kê chi tiêu và chi tiết sản phẩm khách hàng đã mua
        </p>
      </div>

      {/* Filter / Search bar */}
      <div className="bg-neutral-900 border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên, email, tên đăng nhập..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-950 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500"
          />
        </div>

        <div className="text-xs text-neutral-400 font-semibold">
          Tổng số: <span className="text-white font-bold">{users.length}</span> người dùng
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-neutral-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950 text-neutral-400 uppercase tracking-wider text-[10px] border-b border-white/5">
              <tr>
                <th className="py-3.5 px-4">Thành Viên</th>
                <th className="py-3.5 px-4">Vai Trò</th>
                <th className="py-3.5 px-4 text-center">Đơn Hàng</th>
                <th className="py-3.5 px-4 text-right">Tổng Chi Tiêu</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4">Ngày Tham Gia</th>
                <th className="py-3.5 px-4 text-right">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    Đang tải danh sách người dùng...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    Không tìm thấy người dùng phù hợp.
                  </td>
                </tr>
              ) : (
                users.map((item) => (
                  <tr key={item._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        {item.avatar ? (
                          <img
                            src={item.avatar}
                            alt={item.name}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10 shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                            {item.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-white hover:text-pink-400 cursor-pointer" onClick={() => loadUserDetail(item._id)}>
                            {item.name}
                          </p>
                          <p className="text-[10px] text-neutral-400">
                            {item.email} {item.username ? `(@${item.username})` : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleRole(item)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors ${
                          item.role === "admin"
                            ? "bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30"
                            : "bg-white/5 text-neutral-400 border-white/10 hover:text-white"
                        }`}
                        title="Bấm để chuyển đổi vai trò"
                      >
                        {item.role.toUpperCase()}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 text-neutral-300 font-bold text-[11px]">
                        <ShoppingBag className="w-3 h-3 text-pink-400" />
                        {item.orderCount || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-bold text-emerald-400 text-[11px]">
                        {formatVND(item.totalSpent || 0)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          item.isActive
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}
                      >
                        {item.isActive ? "Hoạt Động" : "Bị Khóa"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-400 text-[11px]">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => loadUserDetail(item._id)}
                          className="px-2.5 py-1.5 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 font-semibold text-[11px] transition-colors flex items-center gap-1"
                          title="Xem chi tiết khách hàng & sản phẩm đã mua"
                        >
                          <Eye className="w-3.5 h-3.5" /> Chi tiết
                        </button>
                        <button
                          onClick={() => handleToggleActive(item)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            item.isActive
                              ? "bg-red-500/10 hover:bg-red-500/20 text-red-400"
                              : "bg-green-500/10 hover:bg-green-500/20 text-green-400"
                          }`}
                          title={item.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                        >
                          {item.isActive ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUserId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-neutral-950">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    Chi Tiết Khách Hàng: {userDetail?.user?.name || "Đang tải..."}
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Hồ sơ cá nhân, lịch sử đơn hàng và thống kê sản phẩm đã mua
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserId(null)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            {detailLoading ? (
              <div className="p-16 flex flex-col items-center justify-center gap-3 text-neutral-400">
                <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs">Đang tải toàn bộ dữ liệu đơn hàng & sản phẩm...</p>
              </div>
            ) : userDetail ? (
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                {/* User Summary Top Card */}
                <div className="bg-neutral-950 border border-white/5 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {userDetail.user.avatar ? (
                      <img
                        src={userDetail.user.avatar}
                        alt={userDetail.user.name}
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-pink-500/30"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white font-black text-xl flex items-center justify-center">
                        {userDetail.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{userDetail.user.name}</h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {userDetail.user.role}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {userDetail.user.email} • @{userDetail.user.username || "user"}
                      </p>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Tham gia: {formatDate(userDetail.user.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-stretch sm:self-auto">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        userDetail.user.isActive
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      {userDetail.user.isActive ? "Tài khoản đang hoạt động" : "Tài khoản đang bị khóa"}
                    </span>
                  </div>
                </div>

                {/* 4 Shopping Stats Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-neutral-950 border border-white/5 rounded-xl p-3.5">
                    <span className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-400" /> Tổng Chi Tiêu
                    </span>
                    <div className="text-lg font-black text-emerald-400 mt-1">
                      {formatVND(userDetail.stats.totalSpent)}
                    </div>
                    <span className="text-[10px] text-neutral-500">Đơn hàng không hủy</span>
                  </div>

                  <div className="bg-neutral-950 border border-white/5 rounded-xl p-3.5">
                    <span className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-pink-400" /> Tổng Đơn Hàng
                    </span>
                    <div className="text-lg font-black text-white mt-1">
                      {userDetail.stats.totalOrders} đơn
                    </div>
                    <span className="text-[10px] text-neutral-500">Lịch sử toàn thời gian</span>
                  </div>

                  <div className="bg-neutral-950 border border-white/5 rounded-xl p-3.5">
                    <span className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Đơn Giao Thành Công
                    </span>
                    <div className="text-lg font-black text-blue-400 mt-1">
                      {userDetail.stats.completedOrders} đơn
                    </div>
                    <span className="text-[10px] text-neutral-500">Đã nhận hàng thành công</span>
                  </div>

                  <div className="bg-neutral-950 border border-white/5 rounded-xl p-3.5">
                    <span className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-amber-400" /> Đang Giao / Đã Hủy
                    </span>
                    <div className="text-lg font-black text-amber-400 mt-1">
                      {userDetail.stats.shippingOrders} / {userDetail.stats.cancelledOrders}
                    </div>
                    <span className="text-[10px] text-neutral-500">Đang ship / Đã hủy</span>
                  </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                  <button
                    onClick={() => setActiveTab("products")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      activeTab === "products"
                        ? "bg-pink-600 text-white shadow-sm"
                        : "text-neutral-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Package className="w-3.5 h-3.5" /> Sản Phẩm Đã Mua ({userDetail.purchasedItems.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      activeTab === "orders"
                        ? "bg-pink-600 text-white shadow-sm"
                        : "text-neutral-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Lịch Sử Đơn Hàng ({userDetail.orders.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("info")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      activeTab === "info"
                        ? "bg-pink-600 text-white shadow-sm"
                        : "text-neutral-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" /> Thông Tin Cá Nhân & Ví
                  </button>
                </div>

                {/* Tab 1: Purchased Items Detail */}
                {activeTab === "products" && (
                  <div className="space-y-3">
                    <div className="text-xs text-neutral-400 flex items-center justify-between">
                      <span>Danh sách các mặt hàng người dùng đã mua, tổng số lượng và chi tiêu:</span>
                      <span className="font-bold text-white">Tổng cộng {userDetail.purchasedItems.length} sản phẩm</span>
                    </div>

                    {userDetail.purchasedItems.length === 0 ? (
                      <div className="py-12 text-center text-neutral-500 text-xs bg-neutral-950/50 rounded-xl border border-white/5">
                        Người dùng này chưa có đơn mua hàng nào.
                      </div>
                    ) : (
                      <div className="bg-neutral-950 rounded-xl border border-white/5 overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-neutral-900 text-neutral-400 uppercase text-[10px] border-b border-white/5">
                            <tr>
                              <th className="py-3 px-4">Sản Phẩm</th>
                              <th className="py-3 px-4 text-center">Đơn Giá</th>
                              <th className="py-3 px-4 text-center">Đã Mua</th>
                              <th className="py-3 px-4 text-right">Tổng Chi</th>
                              <th className="py-3 px-4 text-center">Lần Mua Gần Nhất</th>
                              <th className="py-3 px-4">Mã Đơn Hàng</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {userDetail.purchasedItems.map((prod, idx) => (
                              <tr key={idx} className="hover:bg-white/[0.02] transition">
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={prod.image || "/logo.png"}
                                      alt={prod.name}
                                      className="w-10 h-10 object-cover rounded-lg border border-white/10 shrink-0"
                                    />
                                    <div>
                                      <p className="font-bold text-white line-clamp-1">{prod.name}</p>
                                      {prod.slug && (
                                        <a
                                          href={`/products/${prod.slug}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-[10px] text-pink-400 hover:underline inline-flex items-center gap-0.5 mt-0.5"
                                        >
                                          Xem trên shop <ExternalLink className="w-2.5 h-2.5" />
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-center text-neutral-300">
                                  {formatVND(prod.price)}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className="px-2 py-0.5 bg-pink-500/20 text-pink-300 rounded font-bold text-[11px]">
                                    x{prod.totalQuantity}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right font-bold text-emerald-400">
                                  {formatVND(prod.totalSpent)}
                                </td>
                                <td className="py-3 px-4 text-center text-neutral-400 text-[11px]">
                                  {formatDate(prod.lastPurchasedAt)}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex flex-wrap gap-1">
                                    {prod.orderNumbers.map((num) => (
                                      <span
                                        key={num}
                                        className="px-1.5 py-0.5 bg-white/5 text-neutral-300 rounded text-[10px] font-mono border border-white/10"
                                      >
                                        #{num}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Orders History */}
                {activeTab === "orders" && (
                  <div className="space-y-4">
                    {userDetail.orders.length === 0 ? (
                      <div className="py-12 text-center text-neutral-500 text-xs bg-neutral-950/50 rounded-xl border border-white/5">
                        Chưa có đơn hàng nào được ghi nhận.
                      </div>
                    ) : (
                      userDetail.orders.map((order) => (
                        <div
                          key={order._id}
                          className="bg-neutral-950 border border-white/5 rounded-xl p-4 space-y-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2.5 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-pink-400">
                                #{order.orderNumber}
                              </span>
                              <span className="text-neutral-500">•</span>
                              <span className="text-neutral-400 text-[11px]">
                                {formatDate(order.createdAt)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  order.orderStatus === "COMPLETED"
                                    ? "bg-emerald-500/20 text-emerald-300"
                                    : order.orderStatus === "SHIPPING"
                                    ? "bg-blue-500/20 text-blue-300"
                                    : order.orderStatus === "CANCELLED"
                                    ? "bg-red-500/20 text-red-300"
                                    : "bg-amber-500/20 text-amber-300"
                                }`}
                              >
                                {order.orderStatus}
                              </span>
                              <span className="font-bold text-emerald-400 text-xs">
                                {formatVND(order.total)}
                              </span>
                            </div>
                          </div>

                          {/* Order items */}
                          <div className="divide-y divide-white/5">
                            {order.items?.map((it, idx) => (
                              <div
                                key={idx}
                                className="py-2 flex items-center justify-between gap-3 text-xs"
                              >
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={it.image || "/logo.png"}
                                    alt={it.name}
                                    className="w-9 h-9 object-cover rounded-md border border-white/10 shrink-0"
                                  />
                                  <div>
                                    <p className="font-semibold text-white line-clamp-1">{it.name}</p>
                                    <p className="text-[10px] text-neutral-400">
                                      {it.variantName ? `Phân loại: ${it.variantName} • ` : ""}SL: x{it.quantity}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="font-bold text-neutral-200">
                                    {formatVND((it.price || 0) * (it.quantity || 1))}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Shipping address footer */}
                          {order.shippingAddress && (
                            <div className="pt-2 border-t border-white/5 text-[11px] text-neutral-400 flex items-center gap-1.5">
                              <MapPin className="w-3 h-3 text-neutral-500 shrink-0" />
                              <span>
                                Giao tới: <strong className="text-white">{order.shippingAddress.fullName}</strong> ({order.shippingAddress.phone}) - {order.shippingAddress.address}, {order.shippingAddress.district}, {order.shippingAddress.city}
                              </span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Tab 3: Detailed Profile Information */}
                {activeTab === "info" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="bg-neutral-950 border border-white/5 rounded-xl p-4 space-y-3">
                      <h4 className="font-bold text-white text-sm border-b border-white/5 pb-2">
                        Thông Tin Liên Hệ & Cá Nhân
                      </h4>
                      <div className="space-y-2 text-neutral-300">
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-neutral-500">Họ và tên:</span>
                          <span className="font-bold text-white">{userDetail.user.name}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-neutral-500">Email:</span>
                          <span className="font-mono text-white">{userDetail.user.email}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-neutral-500">Tên đăng nhập:</span>
                          <span className="font-mono text-white">{userDetail.user.username || "Chưa đặt"}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-neutral-500">Số điện thoại:</span>
                          <span className="text-white">{userDetail.user.phone || "Chưa cập nhật"}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-neutral-500">Giới tính:</span>
                          <span className="text-white capitalize">{userDetail.user.gender || "Chưa cập nhật"}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-neutral-500">Ngày sinh:</span>
                          <span className="text-white">{userDetail.user.birthDate || "Chưa cập nhật"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-neutral-950 border border-white/5 rounded-xl p-4 space-y-3">
                      <h4 className="font-bold text-white text-sm border-b border-white/5 pb-2">
                        Ví Điện Tử & Điểm Thưởng
                      </h4>
                      <div className="space-y-2 text-neutral-300">
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-neutral-500">Số dư ví SHOPDEE:</span>
                          <span className="font-bold text-emerald-400">
                            {formatVND(userDetail.user.walletBalance || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-neutral-500">Cấp độ tài khoản (Level):</span>
                          <span className="font-bold text-amber-400">
                            Level {userDetail.user.level || 1}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-neutral-500">Điểm kinh nghiệm (XP):</span>
                          <span className="font-bold text-purple-400">
                            {userDetail.user.xp || 0} XP
                          </span>
                        </div>
                        <div className="pt-2">
                          <span className="text-neutral-500 block mb-1">Địa chỉ giao hàng mặc định:</span>
                          <p className="text-white bg-white/5 p-2.5 rounded-lg text-[11px] leading-relaxed">
                            {userDetail.user.address || "Khách hàng chưa lưu địa chỉ mặc định."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 bg-neutral-950 flex items-center justify-between">
              <span className="text-xs text-neutral-500">
                User ID: <span className="font-mono text-neutral-400">{selectedUserId}</span>
              </span>
              <button
                onClick={() => setSelectedUserId(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
