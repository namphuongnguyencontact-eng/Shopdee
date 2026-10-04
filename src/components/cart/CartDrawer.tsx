"use client";

import React from "react";
import Link from "next/link";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { formatVND } from "@/lib/utils";

export default function CartDrawer() {
  const { items, isDrawerOpen, setIsDrawerOpen, updateQuantity, removeItem } = useCartStore();

  if (!isDrawerOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsDrawerOpen(false)}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#192841]" />
              <h2 className="text-base font-bold text-slate-900">
                Giỏ hàng của bạn ({items.reduce((sum, i) => sum + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Notice inside Drawer */}
          <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex items-center gap-2 text-[11px] text-[#192841] font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#192841] shrink-0" />
            <span>Ưu đãi chốt đơn hôm nay — Freeship 0₫ toàn quốc</span>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100">
            {items.length > 0 ? (
              items.map((item) => (
                <div key={`${item.productId}-${item.variantName}`} className="pt-3 first:pt-0 flex gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1 leading-tight">
                      {item.name}
                    </h4>
                    {item.variantName && (
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        Phân loại: {item.variantName}
                      </span>
                    )}
                    <div className="text-xs font-extrabold text-[#192841] mt-1">
                      {formatVND(item.price)}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-slate-300 overflow-hidden h-7 bg-slate-50">
                        <button
                          onClick={() => updateQuantity(item.productId, item.variantName, item.quantity - 1)}
                          className="px-2 text-slate-600 hover:bg-slate-200 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-xs font-semibold text-slate-800 min-w-[24px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.variantName, item.quantity + 1)}
                          className="px-2 text-slate-600 hover:bg-slate-200 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.productId, item.variantName)}
                        className="text-slate-400 hover:text-rose-500 p-1 transition"
                        title="Xóa món này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-3">
                <div className="w-14 h-14 bg-slate-100 flex items-center justify-center text-slate-400">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Giỏ hàng đang trống</h3>
                  <p className="text-xs text-slate-500 mt-1">Hãy khám phá các món đồ Gen Z cực hot ngay!</p>
                </div>
                <Link
                  href="/products"
                  onClick={() => setIsDrawerOpen(false)}
                  className="mt-2 inline-flex items-center gap-1 px-4 py-2 bg-[#192841] hover:bg-[#132034] text-white text-xs font-bold shadow-xs transition"
                >
                  Khám phá ngay <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 font-medium">Tạm tính:</span>
                <span className="text-base font-extrabold text-slate-900">{formatVND(subtotal)}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/cart"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center justify-center h-11 border border-slate-300 text-slate-800 font-bold text-xs hover:bg-white transition"
                >
                  Xem giỏ hàng
                </Link>
                <Link
                  href="/checkout"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center justify-center gap-1.5 h-11 bg-[#192841] hover:bg-[#132034] text-white font-bold text-xs shadow-sm transition"
                >
                  Thanh toán ngay <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
