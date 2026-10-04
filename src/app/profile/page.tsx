"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  User,
  Settings,
  Package,
  ShieldCheck,
  CheckCircle2,
  Truck,
  Heart,
  ShoppingCart,
  MapPin,
  ArrowRight,
  Clock,
  Edit3,
  Camera,
  X,
  Phone,
  Calendar,
  Check,
  Upload,
  Loader2,
} from "lucide-react";
import { formatVND, formatDate } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";
import { showToast } from "@/store/useToastStore";

const AVATAR_PRESETS = [
  { id: "1", label: "Nữ Gen Z", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250" },
  { id: "2", label: "Nam Năng Động", url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=250" },
  { id: "3", label: "Cá Tính", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=250" },
  { id: "4", label: "Thanh Lịch", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250" },
  { id: "5", label: "Dịu Dàng", url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=250" },
  { id: "6", label: "Hiện Đại", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250" },
];

interface OrderSummaryItem {
  _id: string;
  orderNumber: string;
  total: number;
  orderStatus: string;
  paymentMethod: string;
  createdAt: string;
  items: Array<{
    name: string;
    image: string;
    price: number;
    quantity: number;
  }>;
}

export default function ProfilePage() {
  const { user, checkAuth } = useAuthStore();
  const { productIds: wishlistIds } = useWishlistStore();
  const { items: cartItems } = useCartStore();

  const [orders, setOrders] = useState<OrderSummaryItem[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editBirthDate, setEditBirthDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchOrders();
  }, [checkAuth]);

  useEffect(() => {
    if (user) {
      setEditName(user.name || "");
      setEditAvatar(user.avatar || "");
      setEditPhone(user.phone || "");
      setEditAddress(user.address || "");
      setEditGender(user.gender || "");
      setEditBirthDate(user.birthDate || "");
    }
  }, [user, isEditModalOpen]);

  const openEditModal = () => {
    if (user) {
      setEditName(user.name || "");
      setEditAvatar(user.avatar || "");
      setEditPhone(user.phone || "");
      setEditAddress(user.address || "");
      setEditGender(user.gender || "");
      setEditBirthDate(user.birthDate || "");
    }
    setIsEditModalOpen(true);
  };

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast({ type: "error", message: "Vui lòng chọn tệp hình ảnh (JPEG, PNG, WebP...)." });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast({ type: "error", message: "Kích thước ảnh tối đa 5MB." });
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success && json.data?.url) {
        setEditAvatar(json.data.url);
        await checkAuth();
        showToast({
          type: "success",
          title: "Tải ảnh thành công!",
          message: "Ảnh đại diện mới đã được cập nhật.",
        });
      } else {
        // Fallback to FileReader base64
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = reader.result as string;
          setEditAvatar(base64);
          await fetch("/api/upload/avatar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageBase64: base64 }),
          });
          await checkAuth();
          showToast({
            type: "success",
            title: "Tải ảnh thành công!",
            message: "Ảnh đại diện mới đã được cập nhật.",
          });
        };
        reader.readAsDataURL(file);
      }
    } catch {
      showToast({ type: "error", message: "Không thể tải ảnh lên. Vui lòng thử lại." });
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      showToast({ type: "error", message: "Vui lòng nhập họ và tên của bạn." });
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          avatar: editAvatar.trim(),
          phone: editPhone.trim(),
          address: editAddress.trim(),
          gender: editGender.trim(),
          birthDate: editBirthDate.trim(),
        }),
      });

      const json = await res.json();
      if (json.success) {
        showToast({
          type: "success",
          title: "Cập nhật thành công!",
          message: "Thông tin hồ sơ cá nhân đã được lưu an toàn.",
        });
        await checkAuth();
        setIsEditModalOpen(false);
      } else {
        showToast({
          type: "error",
          message: json.error?.message || "Lỗi cập nhật thông tin hồ sơ.",
        });
      }
    } catch {
      showToast({ type: "error", message: "Lỗi kết nối máy chủ." });
    } finally {
      setIsSaving(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setIsLoadingOrders(true);
      const res = await fetch("/api/orders");
      const json = await res.json();
      if (json.success) {
        setOrders(json.data || []);
      }
    } catch {
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const shippingCount = orders.filter((o) => o.orderStatus === "SHIPPING").length;
  const completedCount = orders.filter((o) => o.orderStatus === "COMPLETED").length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hidden file input for uploading from machine */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleAvatarFileSelect}
        className="hidden"
      />

      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-subtle flex flex-col md:flex-row items-center md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left">
          {/* Big Profile Avatar */}
          <div
            className="relative group cursor-pointer shrink-0"
            onClick={() => {
              openEditModal();
            }}
            title="Bấm để đổi ảnh đại diện hoặc tải ảnh từ máy"
          >
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400"}
              alt={user?.name || "Tài khoản"}
              className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full object-cover ring-4 ring-slate-100 shadow-xl border-4 border-white transition-all group-hover:brightness-90"
            />
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition gap-1">
              <Camera className="w-6 h-6" />
              <span className="text-[11px] font-bold">Đổi ảnh</span>
            </div>
            <div className="absolute bottom-1 right-1 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#192841] text-white flex items-center justify-center shadow-lg border-2 border-white group-hover:scale-110 transition-transform">
              <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {user?.name || "Tài khoản SHOPDEE"}
              </h1>
              {user?.role === "admin" && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-700">
                  ADMIN
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-mono mt-1">@{user?.username || "customer"}</p>
            <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
            <button
              type="button"
              onClick={() => {
                fileInputRef.current?.click();
              }}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-1.5 transition"
            >
              <Upload className="w-3.5 h-3.5" /> Tải ảnh mới từ máy tính
            </button>
          </div>
        </div>

        {/* Quick buttons */}
        <div className="flex flex-wrap items-center gap-2.5 self-stretch md:self-auto">
          <button
            type="button"
            onClick={openEditModal}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition flex items-center justify-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" /> Sửa hồ sơ
          </button>
          <Link
            href="/orders"
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition flex items-center justify-center gap-1.5"
          >
            <Package className="w-4 h-4 text-[#192841]" /> Đơn hàng
          </Link>
          <Link
            href="/wishlist"
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition flex items-center justify-center gap-1.5"
          >
            <Heart className="w-4 h-4 text-rose-500" /> Yêu thích
          </Link>
          {user?.role === "admin" && (
            <Link
              href="/admin"
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-[#192841] hover:bg-[#132034] text-white text-xs font-bold shadow transition flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" /> Admin
            </Link>
          )}
        </div>
      </div>

      {/* 4 Quick Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/orders?status=SHIPPING"
          className="bg-white rounded-3xl border border-slate-100 p-5 shadow-subtle hover:border-blue-200 transition group"
        >
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Truck className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-slate-500 block">Đang vận chuyển</span>
          <div className="text-2xl font-black text-slate-900 mt-0.5">{shippingCount}</div>
          <span className="text-[11px] text-blue-600 font-semibold mt-1 block">Dự kiến giao trong 24h</span>
        </Link>

        <Link
          href="/orders?status=COMPLETED"
          className="bg-white rounded-3xl border border-slate-100 p-5 shadow-subtle hover:border-emerald-200 transition group"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-slate-500 block">Đã giao thành công</span>
          <div className="text-2xl font-black text-slate-900 mt-0.5">{completedCount}</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Đã hoàn thành</span>
        </Link>

        <Link
          href="/wishlist"
          className="bg-white rounded-3xl border border-slate-100 p-5 shadow-subtle hover:border-rose-200 transition group"
        >
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Heart className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-slate-500 block">Sản phẩm yêu thích</span>
          <div className="text-2xl font-black text-slate-900 mt-0.5">{wishlistIds.length}</div>
          <span className="text-[11px] text-rose-500 font-semibold mt-1 block">Xem danh sách</span>
        </Link>

        <Link
          href="/cart"
          className="bg-white rounded-3xl border border-slate-100 p-5 shadow-subtle hover:border-slate-300 transition group"
        >
          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-[#192841] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-slate-500 block">Giỏ hàng hiện tại</span>
          <div className="text-2xl font-black text-slate-900 mt-0.5">
            {cartItems.reduce((acc, i) => acc + i.quantity, 0)}
          </div>
          <span className="text-[11px] text-slate-600 font-semibold mt-1 block">Vào giỏ hàng</span>
        </Link>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-subtle space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#192841]" /> Đơn Hàng Gần Đây
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Theo dõi trực tiếp hành trình đơn hàng của bạn
            </p>
          </div>

          <Link
            href="/orders"
            className="text-xs font-bold text-[#192841] hover:underline flex items-center gap-1"
          >
            Xem tất cả ({orders.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoadingOrders ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-slate-50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {orders.slice(0, 4).map((order) => {
              const isCompleted = order.orderStatus === "COMPLETED";
              const isShipping = order.orderStatus === "SHIPPING";

              return (
                <div key={order._id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={order.items[0]?.image || ""}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">#{order.orderNumber}</span>
                        <span className="text-slate-400 text-[10px]">•</span>
                        <span className="text-slate-500 text-[11px]">{formatDate(order.createdAt)}</span>
                      </div>
                      <span className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                        {order.items.map((i) => i.name).join(", ")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 text-xs">
                    <div className="text-right">
                      <span className="font-extrabold text-[#192841] block">{formatVND(order.total)}</span>
                      <span
                        className={`text-[10px] font-bold ${
                          isCompleted
                            ? "text-emerald-600"
                            : isShipping
                            ? "text-blue-600"
                            : "text-amber-600"
                        }`}
                      >
                        {isCompleted
                          ? "✓ Đã giao hàng"
                          : isShipping
                          ? "🚚 Đang vận chuyển (24h)"
                          : "Đang xử lý"}
                      </span>
                    </div>

                    <Link
                      href={`/orders/${order._id}`}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition"
                    >
                      Chi tiết
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-400">
            Bạn chưa có đơn hàng nào gần đây.
          </div>
        )}
      </div>

      {/* Delivery Address & Security Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" /> Thông Tin & Địa Chỉ Giao Hàng
            </h3>
            <button
              type="button"
              onClick={openEditModal}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" /> Sửa thông tin
            </button>
          </div>

          <div className="text-xs text-slate-600 leading-relaxed space-y-1">
            <p>
              <strong className="text-slate-900">{user?.name}</strong> •{" "}
              <span className="font-medium text-slate-700">
                {user?.phone ? user.phone : "Chưa có số điện thoại"}
              </span>
            </p>
            <p className="text-slate-700">
              {user?.address ? (
                user.address
              ) : (
                <span className="text-slate-400 italic">
                  Chưa thiết lập địa chỉ nhận hàng mặc định. Bấm &quot;Sửa thông tin&quot; để thêm.
                </span>
              )}
            </p>
            {user?.gender && (
              <p className="text-slate-500 text-[11px]">
                Giới tính:{" "}
                <span className="font-medium text-slate-700">
                  {user.gender === "male"
                    ? "Nam"
                    : user.gender === "female"
                    ? "Nữ"
                    : user.gender === "other"
                    ? "Khác"
                    : user.gender}
                </span>
                {user?.birthDate && ` • Ngày sinh: ${user.birthDate}`}
              </p>
            )}
          </div>

          <span className="inline-block text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
            Chuẩn bị giao hàng hỏa tốc trong 24 giờ
          </span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-subtle space-y-3">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Chính Sách Khách Hàng
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Mọi giao dịch tại SHOPDEE đều được cam kết bảo mật 100%. Hỗ trợ đồng kiểm hàng khi nhận và bảo hành đổi trả miễn phí trong 7 ngày.
          </p>
          <Link href="/how-it-works" className="inline-block text-xs text-[#192841] font-bold hover:underline">
            Xem chính sách bảo vệ người mua →
          </Link>
        </div>
      </div>

      {/* Profile Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Chỉnh Sửa Hồ Sơ</h3>
                  <p className="text-[11px] text-slate-500">Cập nhật ảnh đại diện, thông tin cá nhân và địa chỉ</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
              {/* Avatar Selector Section */}
              <div className="space-y-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 block text-xs">Ảnh đại diện</label>
                  <span className="text-[11px] text-slate-500 font-medium">Hỗ trợ JPG, PNG, WebP (tối đa 5MB)</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <div
                    className="relative group cursor-pointer shrink-0"
                    onClick={() => fileInputRef.current?.click()}
                    title="Bấm để tải ảnh từ máy tính"
                  >
                    <img
                      src={editAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250"}
                      alt="Preview Avatar"
                      className="w-20 h-20 rounded-full object-cover ring-2 ring-blue-500 shadow-md group-hover:brightness-90 transition"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition">
                      <Camera className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <button
                      type="button"
                      disabled={isUploadingAvatar}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-[#192841] hover:bg-[#132034] text-white text-xs font-bold rounded-xl shadow-xs transition inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isUploadingAvatar ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Đang tải ảnh lên...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Tải ảnh từ máy tính của bạn</span>
                        </>
                      )}
                    </button>

                    <div className="pt-1">
                      <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Hoặc chọn nhanh avatar mẫu theo phong cách:
                      </span>
                      <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                        {AVATAR_PRESETS.map((preset) => (
                          <button
                            type="button"
                            key={preset.id}
                            onClick={() => setEditAvatar(preset.url)}
                            className={`relative rounded-xl overflow-hidden ring-2 transition ${
                              editAvatar === preset.url
                                ? "ring-blue-600 scale-105 shadow-xs"
                                : "ring-transparent hover:ring-slate-300 opacity-80 hover:opacity-100"
                            }`}
                            title={preset.label}
                          >
                            <img src={preset.url} alt={preset.label} className="w-8 h-8 object-cover" />
                            {editAvatar === preset.url && (
                              <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center text-white">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[11px] text-slate-500 block mb-1">Hoặc dán URL ảnh đại diện tùy chỉnh:</span>
                  <input
                    type="url"
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500 font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Personal Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    Họ và tên <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Nhập họ và tên đầy đủ"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số điện thoại nhận hàng</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="Ví dụ: 0912 345 678"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Giới tính</label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Ngày sinh</label>
                  <input
                    type="date"
                    value={editBirthDate}
                    onChange={(e) => setEditBirthDate(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Địa chỉ giao hàng mặc định</label>
                  <textarea
                    rows={2}
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                    className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20 transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSaving ? "Đang lưu..." : "Lưu Thay Đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
