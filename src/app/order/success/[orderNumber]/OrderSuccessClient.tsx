"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  Truck,
  Package,
  ArrowRight,
  ShieldCheck,
  Clock,
  MapPin,
} from "lucide-react";
import { formatVND } from "@/lib/utils";

interface OrderSuccessClientProps {
  order: {
    _id: string;
    orderNumber: string;
    total: number;
    subtotal: number;
    discount: number;
    shippingFee?: number;
    paymentMethod: string;
    orderStatus: string;
    shippingAddress?: {
      fullName: string;
      phone: string;
      city: string;
      district: string;
      address: string;
    };
    items: Array<{
      name: string;
      image: string;
      price: number;
      quantity: number;
      variantName?: string;
    }>;
    createdAt: string;
  };
}

export default function OrderSuccessClient({ order }: OrderSuccessClientProps) {
  useEffect(() => {
    // Fire festive celebration confetti animation
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-8">
      {/* Top Celebration Card */}
      <div className="bg-white rounded-3xl border border-slate-100 p-8 sm:p-12 shadow-hover text-center space-y-6">
        {/* Animated Checkmark */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/10 animate-in zoom-in-50">
            <Truck className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-6 w-6">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-6 w-6 bg-blue-600 items-center justify-center text-white text-[10px]">
              ✓
            </span>
          </span>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-800 text-xs font-black rounded-full uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> ĐẶT HÀNG THÀNH CÔNG
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            ĐƠN HÀNG ĐANG TRÊN ĐƯỜNG VẬN CHUYỂN
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Cảm ơn bạn đã mua sắm tại SHOPDEE. Đơn hàng <strong className="text-slate-900">#{order.orderNumber}</strong> đã được xác nhận và đang được SHOPDEE Express vận chuyển đến bạn.
          </p>
        </div>

        {/* Real-time 24h Shipping Status Card */}
        <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-100 max-w-lg mx-auto text-left space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-900 font-extrabold text-xs uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              SHOPDEE Express • Tiêu chuẩn 24h
            </div>
            <span className="text-[11px] font-bold text-blue-600 px-2 py-0.5 bg-white rounded-full border border-blue-200">
              Đang vận chuyển
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-700">
            <Clock className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Thời gian giao hàng dự kiến: <strong>Trong vòng 24 giờ tới</strong> (sau 1 ngày đơn sẽ tự động hoàn tất).
            </span>
          </div>

          {order.shippingAddress && (
            <div className="flex items-start gap-3 text-xs text-slate-600 pt-2 border-t border-blue-100/80">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800">{order.shippingAddress.fullName}</span> ({order.shippingAddress.phone})
                <div className="text-slate-500 text-[11px]">
                  {order.shippingAddress.address}, {order.shippingAddress.city}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Info Summary */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 max-w-lg mx-auto flex items-center justify-between text-xs">
          <div className="text-left">
            <span className="text-slate-500 block">Phương thức thanh toán:</span>
            <strong className="text-slate-800 font-bold">
              {order.paymentMethod === "SIMULATED_COD" || order.paymentMethod === "COD"
                ? "Thanh toán khi nhận hàng (COD)"
                : "Thẻ thanh toán quốc tế / ATM"}
            </strong>
          </div>
          <div className="text-right">
            <span className="text-slate-500 block">Tổng thanh toán:</span>
            <strong className="text-base font-black text-blue-600">{formatVND(order.total)}</strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 max-w-md mx-auto space-y-3">
          <Link
            href={`/orders/${order._id}`}
            className="w-full h-12 rounded-2xl bg-[#192841] hover:bg-[#132034] text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition"
          >
            <Package className="w-4 h-4" /> Theo dõi hành trình đơn hàng
          </Link>

          <Link
            href="/"
            className="w-full h-11 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition"
          >
            Tiếp tục mua sắm <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
