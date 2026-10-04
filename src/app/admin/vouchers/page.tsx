"use client";

import React, { useEffect, useState } from "react";
import {
  Ticket,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  X,
  Calendar,
  Percent,
  FileSpreadsheet,
} from "lucide-react";
import { formatVND, formatDate } from "@/lib/utils";
import { useToastStore } from "@/store/useToastStore";

interface VoucherItem {
  _id: string;
  code: string;
  title: string;
  description: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  usedCount: number;
  usageLimit: number;
  isActive: boolean;
  endDate: string;
}

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<VoucherItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVoucher, setNewVoucher] = useState({
    code: "",
    title: "",
    description: "",
    discountType: "PERCENT" as "PERCENT" | "FIXED",
    discountValue: 20,
    minOrderValue: 200000,
    maxDiscount: 100000,
    usageLimit: 500,
  });
  const { addToast } = useToastStore();

  const loadVouchers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/vouchers");
      const json = await res.json();
      if (json.success) {
        setVouchers(json.data);
      }
    } catch (err) {
      console.error("Failed to load vouchers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVouchers();
  }, []);

  const handleToggleActive = async (v: VoucherItem) => {
    try {
      const res = await fetch("/api/admin/vouchers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: v._id, isActive: !v.isActive }),
      });
      const json = await res.json();
      if (json.success) {
        setVouchers((prev) =>
          prev.map((item) => (item._id === v._id ? { ...item, isActive: !v.isActive } : item))
        );
        addToast("success", `Đã ${!v.isActive ? "kích hoạt" : "tạm dừng"} mã ${v.code}`);
      }
    } catch {
      addToast("error", "Lỗi cập nhật mã");
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Bạn có chắc muốn xóa mã voucher "${code}"?`)) return;

    try {
      const res = await fetch(`/api/admin/vouchers?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setVouchers((prev) => prev.filter((item) => item._id !== id));
        addToast("success", "Đã xóa voucher thành công");
      }
    } catch {
      addToast("error", "Lỗi xóa voucher");
    }
  };

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVoucher.code || !newVoucher.title) {
      addToast("error", "Vui lòng nhập đủ mã và tiêu đề");
      return;
    }

    try {
      const res = await fetch("/api/admin/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVoucher),
      });
      const json = await res.json();
      if (json.success) {
        addToast("success", "Đã tạo mã giảm giá mới");
        setIsModalOpen(false);
        loadVouchers();
      } else {
        addToast("error", json.error?.message || "Lỗi tạo voucher");
      }
    } catch {
      addToast("error", "Lỗi kết nối máy chủ");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            Quản Lý Mã Giảm Giá
            <Ticket className="w-5 h-5 text-yellow-400" />
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Thiết lập các chương trình khuyến mãi và voucher kích cầu mua sắm
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              window.location.href = "/api/admin/export?type=vouchers";
            }}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600/30 text-emerald-400 font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer"
            title="Xuất danh sách mã giảm giá ra file Excel .xlsx"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Xuất Excel</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-lg shadow-pink-600/25 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tạo Voucher Mới
          </button>
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-800/80 text-neutral-400 uppercase tracking-wider text-[10px] border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">Mã Code</th>
                <th className="py-3.5 px-4">Tiêu Đề</th>
                <th className="py-3.5 px-4">Mức Giảm</th>
                <th className="py-3.5 px-4">Đơn Tối Thiểu</th>
                <th className="py-3.5 px-4">Đã Dùng / Giới Hạn</th>
                <th className="py-3.5 px-4">Hạn Dùng</th>
                <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400">
                    Đang tải danh sách voucher...
                  </td>
                </tr>
              ) : vouchers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400">
                    Chưa có mã voucher nào.
                  </td>
                </tr>
              ) : (
                vouchers.map((item) => (
                  <tr key={item._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-yellow-400">
                      {item.code}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{item.title}</div>
                      <div className="text-[10px] text-neutral-400 truncate max-w-xs">{item.description}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-pink-400">
                      {item.discountType === "PERCENT"
                        ? `${item.discountValue}% (Tối đa ${formatVND(item.maxDiscount || 0)})`
                        : formatVND(item.discountValue)}
                    </td>
                    <td className="py-3 px-4 text-neutral-300">
                      {formatVND(item.minOrderValue)}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className="text-white font-bold">{item.usedCount}</span> / {item.usageLimit}
                    </td>
                    <td className="py-3 px-4 text-neutral-400 text-[11px]">
                      {formatDate(item.endDate)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleActive(item)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          item.isActive
                            ? "bg-green-500/20 text-green-300 border-green-500/40"
                            : "bg-white/5 text-neutral-500 border-white/10 hover:text-neutral-300"
                        }`}
                        title={item.isActive ? "Ngưng kích hoạt" : "Kích hoạt voucher"}
                      >
                        {item.isActive ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(item._id, item.code)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                        title="Xóa voucher"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Voucher Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="font-bold text-sm text-white">Tạo Mã Giảm Giá Mới</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-neutral-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateVoucher} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Mã Voucher (Code) *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: GENZ20"
                    value={newVoucher.code}
                    onChange={(e) => setNewVoucher({ ...newVoucher, code: e.target.value.toUpperCase() })}
                    className="w-full bg-neutral-800 border border-white/10 rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Loại Giảm Giá</label>
                  <select
                    value={newVoucher.discountType}
                    onChange={(e) => setNewVoucher({ ...newVoucher, discountType: e.target.value as "PERCENT" | "FIXED" })}
                    className="w-full bg-neutral-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-pink-500"
                  >
                    <option value="PERCENT">Phần Trăm (%)</option>
                    <option value="FIXED">Số Tiền Cố Định (VND)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold mb-1">Tiêu Đề Voucher *</label>
                <input
                  type="text"
                  required
                  placeholder="Giảm 20% cho đơn từ 200k"
                  value={newVoucher.title}
                  onChange={(e) => setNewVoucher({ ...newVoucher, title: e.target.value })}
                  className="w-full bg-neutral-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">
                    Giá Trị Giảm ({newVoucher.discountType === "PERCENT" ? "%" : "VND"}) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newVoucher.discountValue}
                    onChange={(e) => setNewVoucher({ ...newVoucher, discountValue: Number(e.target.value) })}
                    className="w-full bg-neutral-800 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Đơn Tối Thiểu (VND)</label>
                  <input
                    type="number"
                    min={0}
                    value={newVoucher.minOrderValue}
                    onChange={(e) => setNewVoucher({ ...newVoucher, minOrderValue: Number(e.target.value) })}
                    className="w-full bg-neutral-800 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Giảm Tối Đa (VND)</label>
                  <input
                    type="number"
                    min={0}
                    value={newVoucher.maxDiscount || 100000}
                    onChange={(e) => setNewVoucher({ ...newVoucher, maxDiscount: Number(e.target.value) })}
                    className="w-full bg-neutral-800 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Số Lượng Giới Hạn</label>
                  <input
                    type="number"
                    min={1}
                    value={newVoucher.usageLimit}
                    onChange={(e) => setNewVoucher({ ...newVoucher, usageLimit: Number(e.target.value) })}
                    className="w-full bg-neutral-800 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold"
                >
                  Tạo Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
