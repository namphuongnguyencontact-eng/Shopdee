"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Ticket,
  ShieldCheck,
  Sparkles,
  Check,
  AlertCircle,
  Truck,
} from "lucide-react";
import { useCartStore, AppliedVoucher } from "@/store/useCartStore";
import { formatVND } from "@/lib/utils";
import { showToast } from "@/store/useToastStore";

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    fetchCart,
    updateQuantity,
    removeItem,
    clearCart,
    toggleSelect,
    toggleSelectAll,
    appliedVoucher,
    applyVoucher,
  } = useCartStore();

  const [voucherInput, setVoucherInput] = useState("");
  const [voucherError, setVoucherError] = useState("");
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const selectedItems = items.filter((i) => i.selected !== false);
  const allSelected = items.length > 0 && selectedItems.length === items.length;

  const subtotal = selectedItems.reduce((acc, it) => acc + it.price * it.quantity, 0);

  const discountAmount = appliedVoucher ? appliedVoucher.discountAmount : 0;
  const shippingFee = 0; // Free simulated shipping
  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyVoucher = async () => {
    if (!voucherInput.trim()) return;
    setVoucherError("");
    setIsValidatingVoucher(true);

    try {
      const res = await fetch("/api/vouchers/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: voucherInput.trim(), subtotal }),
      });
      const json = await res.json();

      if (json.success) {
        applyVoucher(json.data);
        showToast({
          type: "success",
          title: "Áp dụng voucher thành công!",
          message: `Mã ${json.data.code} giảm ${formatVND(json.data.discountAmount)}`,
        });
        setVoucherInput("");
      } else {
        setVoucherError(json.error?.message || "Mã giảm giá không hợp lệ.");
        applyVoucher(null);
      }
    } catch {
      setVoucherError("Lỗi kiểm tra voucher. Vui lòng thử lại.");
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="max-w-md mx-auto bg-white rounded-3xl border border-slate-100 p-8 shadow-subtle flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Giỏ hàng của bạn đang trống</h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Bạn chưa chọn món đồ nào. Hãy khám phá hàng trăm món đồ Gen Z cực hot và tận hưởng niềm vui mua sắm thỏa thích!
          </p>
          <Link
            href="/products"
            className="mt-6 px-6 py-3 bg-[#192841] hover:bg-[#132034] text-white font-bold text-xs shadow-xs transition flex items-center gap-2"
          >
            Bắt đầu khám phá ngay <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-4">
      {/* Shopee Free Shipping Promo Notice Banner */}
      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xs text-xs flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Nhấn vào đây để nhận <strong>Mã Miễn Phí Vận Chuyển</strong> cho đơn hàng từ 0₫!
          </span>
        </div>
        <Link href="/how-it-works" className="font-bold underline text-emerald-900 shrink-0">
          Tìm hiểu thêm
        </Link>
      </div>

      {/* Shopee Cart Table Header (Desktop) */}
      <div className="hidden md:grid grid-cols-12 gap-4 bg-white border border-slate-200 rounded-sm p-4 text-xs font-semibold text-slate-500 shadow-2xs items-center">
        <div className="col-span-6 flex items-center gap-3">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => toggleSelectAll(e.target.checked)}
            className="w-4 h-4 rounded-xs text-[#192841] focus:ring-[#192841] border-slate-300 cursor-pointer"
          />
          <span className="text-slate-800 font-bold">Sản Phẩm</span>
        </div>
        <div className="col-span-2 text-center">Đơn Giá</div>
        <div className="col-span-2 text-center">Số Lượng</div>
        <div className="col-span-1 text-center">Số Tiền</div>
        <div className="col-span-1 text-center">Thao Tác</div>
      </div>

      {/* Shopee Shop Group Container */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden">
        {/* Shop Label Header */}
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => toggleSelectAll(e.target.checked)}
              className="w-4 h-4 rounded-xs text-[#192841] focus:ring-[#192841] border-slate-300 cursor-pointer"
            />
            <span className="px-1.5 py-0.5 bg-[#192841] text-white text-[9px] font-bold rounded-r-xs">
              Yêu thích
            </span>
            <span className="hover:text-[#192841] cursor-pointer">Shopdee Official Store</span>
          </div>

          <button
            onClick={clearCart}
            className="text-xs text-slate-400 hover:text-rose-600 transition flex items-center gap-1 font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" /> Xóa tất cả
          </button>
        </div>

        {/* Product Items List */}
        <div className="divide-y divide-slate-100">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.variantName}`}
              className="p-3.5 sm:p-4 grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center hover:bg-slate-50/50 transition"
            >
              {/* Product Info & Checkbox (6 cols on md) */}
              <div className="col-span-1 md:col-span-6 flex items-start sm:items-center gap-3">
                <input
                  type="checkbox"
                  checked={item.selected !== false}
                  onChange={() => toggleSelect(item.productId, item.variantName)}
                  className="w-4 h-4 rounded-xs text-[#192841] focus:ring-[#192841] border-slate-300 mt-1 sm:mt-0 cursor-pointer shrink-0"
                />

                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xs object-cover border border-slate-200 shrink-0"
                />

                <div className="min-w-0 flex-1 space-y-1">
                  <Link
                    href={`/products/${item.slug}`}
                    className="text-xs sm:text-sm font-normal text-slate-800 hover:text-[#192841] transition line-clamp-2 leading-snug"
                  >
                    {item.name}
                  </Link>
                  {item.variantName && (
                    <span className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-2xs text-[10px]">
                      Phân loại: {item.variantName}
                    </span>
                  )}
                  <div className="md:hidden flex items-baseline gap-2 pt-1">
                    <span className="text-xs font-bold text-[#192841]">
                      {formatVND(item.price)}
                    </span>
                    {item.originalPrice > item.price && (
                      <span className="text-[10px] text-slate-400 line-through">
                        {formatVND(item.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Unit Price (2 cols on md) */}
              <div className="hidden md:flex col-span-2 flex-col items-center justify-center text-xs">
                {item.originalPrice > item.price && (
                  <span className="text-[11px] text-slate-400 line-through">
                    {formatVND(item.originalPrice)}
                  </span>
                )}
                <span className="font-bold text-slate-800">
                  {formatVND(item.price)}
                </span>
              </div>

              {/* Quantity Stepper (2 cols on md) */}
              <div className="col-span-1 md:col-span-2 flex items-center justify-between md:justify-center">
                <span className="md:hidden text-xs text-slate-500">Số lượng:</span>
                <div className="flex items-center border border-slate-300 rounded-xs overflow-hidden h-7 bg-white">
                  <button
                    onClick={() => updateQuantity(item.productId, item.variantName, item.quantity - 1)}
                    className="px-2 text-slate-600 hover:bg-slate-100 transition h-full flex items-center justify-center border-r border-slate-200"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="px-3 text-xs font-bold text-slate-800 min-w-[28px] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.variantName, item.quantity + 1)}
                    className="px-2 text-slate-600 hover:bg-slate-100 transition h-full flex items-center justify-center border-l border-slate-200"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Line Total (1 col on md) */}
              <div className="col-span-1 md:col-span-1 flex items-center justify-between md:justify-center text-right">
                <span className="md:hidden text-xs text-slate-500">Thành tiền:</span>
                <span className="text-xs sm:text-sm font-bold text-[#192841]">
                  {formatVND(item.price * item.quantity)}
                </span>
              </div>

              {/* Actions (1 col on md) */}
              <div className="col-span-1 md:col-span-1 flex items-center justify-end md:justify-center">
                <button
                  onClick={() => removeItem(item.productId, item.variantName)}
                  className="text-xs text-slate-500 hover:text-red-600 transition"
                  title="Xóa món này"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shopee Voucher Bar */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-800 font-bold">
          <Ticket className="w-4 h-4 text-red-500" />
          <span>Shopdee Voucher</span>
        </div>

        {appliedVoucher ? (
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-300 text-emerald-700 font-bold text-xs rounded-2xs">
              Mã: {appliedVoucher.code} (-{formatVND(appliedVoucher.discountAmount)})
            </span>
            <button
              onClick={() => applyVoucher(null)}
              className="text-xs text-red-600 hover:underline font-semibold"
            >
              Gỡ bỏ
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={voucherInput}
              onChange={(e) => {
                setVoucherInput(e.target.value.toUpperCase());
                setVoucherError("");
              }}
              placeholder="Nhập mã voucher giảm giá..."
              className="h-8 px-3 rounded-xs border border-slate-300 text-xs font-mono uppercase outline-none focus:border-[#192841] flex-1 sm:w-56"
            />
            <button
              onClick={handleApplyVoucher}
              disabled={isValidatingVoucher}
              className="h-8 px-4 bg-[#192841] hover:bg-[#132034] text-white font-bold text-xs rounded-xs shadow-2xs transition disabled:opacity-50 cursor-pointer shrink-0"
            >
              {isValidatingVoucher ? "..." : "Áp Dụng"}
            </button>
          </div>
        )}
      </div>
      {voucherError && (
        <p className="text-[11px] text-red-600 flex items-center gap-1 pl-1">
          <AlertCircle className="w-3 h-3" /> {voucherError}
        </p>
      )}

      {/* Shopee Sticky Bottom Bar (Fixed at bottom on desktop & mobile) */}
      <div className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xl rounded-sm p-3.5 sm:p-4 pb-[max(0.8rem,env(safe-area-inset-bottom))] flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 mt-6">
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start text-xs font-semibold text-slate-700">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => toggleSelectAll(e.target.checked)}
              className="w-4 h-4 rounded-xs text-[#192841] focus:ring-[#192841] border-slate-300 cursor-pointer"
            />
            <span>Chọn Tất Cả ({items.length})</span>
          </label>

          <button
            onClick={clearCart}
            className="text-slate-500 hover:text-red-600 transition"
          >
            Xóa ({selectedItems.length})
          </button>
        </div>

        {/* Right side: Total & Checkout Button */}
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-2.5 sm:pt-0 border-slate-100">
          <div className="text-left sm:text-right">
            <div className="flex items-baseline gap-1 text-xs text-slate-800">
              <span className="hidden sm:inline">Tổng thanh toán ({selectedItems.length} sản phẩm):</span>
              <span className="sm:hidden">Tổng:</span>
              <span className="text-base sm:text-2xl font-black text-[#192841]">
                {formatVND(total)}
              </span>
            </div>
            {discountAmount > 0 && (
              <span className="text-[10px] sm:text-[11px] text-red-600 block">
                Tiết kiệm {formatVND(discountAmount)}
              </span>
            )}
          </div>

          <button
            disabled={selectedItems.length === 0}
            onClick={() => router.push("/checkout")}
            className="h-10 sm:h-12 px-6 sm:px-12 bg-[#192841] hover:bg-[#132034] active:bg-[#0f172a] text-white font-extrabold text-xs sm:text-sm rounded-xs shadow-md transition disabled:opacity-50 disabled:pointer-events-none cursor-pointer tracking-wide uppercase shrink-0 active:scale-[0.98]"
          >
            Mua Hàng ({selectedItems.length})
          </button>
        </div>
      </div>
    </div>
  );
}
