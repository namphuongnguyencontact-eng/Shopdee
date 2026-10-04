"use client";

import React, { useEffect, useState } from "react";
import {
  ShoppingBag,
  Search,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  XCircle,
  X,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  FileSpreadsheet,
} from "lucide-react";
import { formatVND, formatDate } from "@/lib/utils";
import { useToastStore } from "@/store/useToastStore";

interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  items: Array<{
    name: string;
    image: string;
    price: number;
    quantity: number;
    variantName?: string;
  }>;
  shippingAddress: {
    fullName: string;
    phone: string;
    city: string;
    district: string;
    address: string;
  };
  subtotal: number;
  discount: number;
  total: number;
  voucherCode?: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: "PLACED" | "CONFIRMED" | "PREPARING" | "SHIPPING" | "READY_FOR_SIMULATED_DELIVERY" | "COMPLETED" | "CANCELLED";
  timeline: Array<{
    status: string;
    title: string;
    description: string;
    timestamp: string;
  }>;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const { addToast } = useToastStore();

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setOrders(json.data);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadOrders();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingStatus(true);
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, orderStatus: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        addToast("success", `Đã cập nhật trạng thái đơn thành ${newStatus}`);
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? json.data : o))
        );
        if (selectedOrder?._id === orderId) {
          setSelectedOrder(json.data);
        }
      } else {
        addToast("error", json.error?.message || "Lỗi cập nhật đơn hàng");
      }
    } catch {
      addToast("error", "Lỗi kết nối máy chủ");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const statusTabs = [
    { label: "Tất Cả", value: "" },
    { label: "Mới Đặt", value: "PLACED" },
    { label: "Đã Xác Nhận", value: "CONFIRMED" },
    { label: "Đang Đóng Gói", value: "PREPARING" },
    { label: "Đang Vận Chuyển (24h)", value: "SHIPPING" },
    { label: "Hoàn Thành", value: "COMPLETED" },
    { label: "Đã Hủy", value: "CANCELLED" },
  ];

  const statusBadge = (status: string) => {
    switch (status) {
      case "PLACED":
        return <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">Mới Đặt</span>;
      case "CONFIRMED":
        return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">Đã Xác Nhận</span>;
      case "PREPARING":
        return <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">Đang Đóng Gói</span>;
      case "SHIPPING":
        return <span className="bg-blue-500/15 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">🚚 Đang Vận Chuyển</span>;
      case "READY_FOR_SIMULATED_DELIVERY":
        return <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">Sẵn Sàng Giao</span>;
      case "COMPLETED":
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">Hoàn Thành</span>;
      case "CANCELLED":
        return <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">Đã Hủy</span>;
      default:
        return <span className="bg-neutral-700 text-neutral-300 px-2 py-0.5 rounded-full text-[10px]">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            Quản Lý Đơn Hàng
            <ShoppingBag className="w-5 h-5 text-purple-400" />
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Theo dõi hành trình logistics và cập nhật tiến độ đơn hàng
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            window.location.href = `/api/admin/export?type=orders${statusFilter ? `&status=${statusFilter}` : ""}`;
          }}
          className="px-4 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600/30 text-emerald-400 text-xs font-bold flex items-center gap-2 transition cursor-pointer self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          Xuất File Excel (.xlsx)
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${statusFilter === tab.value
                ? "bg-pink-600 text-white shadow-md shadow-pink-600/20"
                : "bg-neutral-900 text-neutral-400 hover:text-white border border-white/5"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative bg-neutral-900 p-3 rounded-xl border border-white/10">
        <Search className="w-4 h-4 text-neutral-400 absolute left-6 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Tìm kiếm theo mã đơn hàng, tên khách, số điện thoại..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-neutral-800 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
        />
      </div>

      {/* Orders Table */}
      <div className="bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto touch-pan-x">
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead className="bg-neutral-800/80 text-neutral-400 uppercase tracking-wider text-[10px] border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">Mã Đơn Hàng</th>
                <th className="py-3.5 px-4">Khách Hàng</th>
                <th className="py-3.5 px-4">Sản Phẩm</th>
                <th className="py-3.5 px-4">Tổng Tiền</th>
                <th className="py-3.5 px-4">Thanh Toán</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4">Ngày Đặt</th>
                <th className="py-3.5 px-4 text-right">Chi Tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400">
                    Đang tải đơn hàng...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400">
                    Không tìm thấy đơn hàng nào.
                  </td>
                </tr>
              ) : (
                orders.map((item) => (
                  <tr key={item._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-pink-400">
                      #{item.orderNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{item.shippingAddress?.fullName || "Khách SHOPDEE"}</div>
                      <div className="text-[10px] text-neutral-400">{item.shippingAddress?.phone}</div>
                    </td>
                    <td className="py-3 px-4 text-neutral-300">
                      <span className="font-semibold">{item.items?.length || 1} sản phẩm</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      {formatVND(item.total)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-full border border-white/5">
                        {item.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {statusBadge(item.orderStatus)}
                    </td>
                    <td className="py-3 px-4 text-neutral-400 text-[11px]">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(item)}
                        className="p-1.5 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 transition-colors inline-flex items-center gap-1 text-[11px] font-bold"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Xem
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  Chi Tiết Đơn Hàng #{selectedOrder.orderNumber}
                  {statusBadge(selectedOrder.orderStatus)}
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Đặt lúc {formatDate(selectedOrder.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-neutral-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status Advance Workflow */}
            <div className="bg-neutral-800/70 p-4 rounded-xl border border-white/5 mb-5">
              <label className="block text-xs font-bold text-neutral-300 mb-2">
                Cập Nhật Trạng Thái Đơn Hàng:
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "CONFIRMED", label: "Xác Nhận Đơn" },
                  { key: "PREPARING", label: "Đang Đóng Gói" },
                  { key: "SHIPPING", label: "Đang Vận Chuyển (24h)" },
                  { key: "COMPLETED", label: "Hoàn Thành Giao Hàng" },
                  { key: "CANCELLED", label: "Hủy Đơn" },
                ].map((st) => (
                  <button
                    key={st.key}
                    disabled={updatingStatus || selectedOrder.orderStatus === st.key}
                    onClick={() => handleUpdateStatus(selectedOrder._id, st.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${selectedOrder.orderStatus === st.key
                        ? "bg-pink-600 text-white cursor-default"
                        : "bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10"
                      }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer & Shipping Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-5">
              <div className="p-3.5 bg-neutral-800/40 rounded-xl border border-white/5">
                <span className="font-bold text-neutral-400 block mb-1 uppercase tracking-wider text-[10px]">
                  Thông Tin Nhận Hàng
                </span>
                <p className="font-bold text-white">{selectedOrder.shippingAddress?.fullName}</p>
                <p className="text-neutral-300 mt-0.5">{selectedOrder.shippingAddress?.phone}</p>
                <p className="text-neutral-400 mt-1">
                  {selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.district}, {selectedOrder.shippingAddress?.city}
                </p>
              </div>

              <div className="p-3.5 bg-neutral-800/40 rounded-xl border border-white/5">
                <span className="font-bold text-neutral-400 block mb-1 uppercase tracking-wider text-[10px]">
                  Thanh Toán & Mã Khuyến Mãi
                </span>
                <p className="text-neutral-300">
                  Phương thức: <strong className="text-white">{selectedOrder.paymentMethod}</strong>
                </p>
                <p className="text-neutral-300 mt-1">
                  Trạng thái: <strong className="text-emerald-400">{selectedOrder.paymentStatus}</strong>
                </p>
                {selectedOrder.voucherCode && (
                  <p className="text-yellow-400 mt-1 font-mono">Voucher: {selectedOrder.voucherCode}</p>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2 mb-5">
              <span className="font-bold text-neutral-400 block uppercase tracking-wider text-[10px]">
                Danh Sách Mặt Hàng ({selectedOrder.items?.length || 0})
              </span>
              <div className="divide-y divide-white/5 bg-neutral-800/40 rounded-xl border border-white/5 p-3">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 first:pt-0 last:pb-0 text-xs">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={item.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80"}
                        alt={item.name}
                        className="w-9 h-9 rounded-lg object-cover bg-neutral-800 border border-white/10"
                      />
                      <div>
                        <p className="font-semibold text-white">{item.name}</p>
                        {item.variantName && (
                          <p className="text-[10px] text-neutral-400">{item.variantName}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white">{formatVND(item.price)}</div>
                      <div className="text-[10px] text-neutral-400">x{item.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Timeline */}
            <div>
              <span className="font-bold text-neutral-400 block uppercase tracking-wider text-[10px] mb-2">
                Nhật Ký Hành Trình Vận Chuyển
              </span>
              <div className="space-y-2 text-xs">
                {selectedOrder.timeline?.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-2 bg-neutral-800/30 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-pink-500 mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-bold text-white text-[11px]">{step.title}</p>
                      <p className="text-[10px] text-neutral-400">{step.description}</p>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500 shrink-0">
                      {formatDate(step.timestamp)}
                    </span>
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
