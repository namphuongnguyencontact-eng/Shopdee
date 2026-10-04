"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  Truck,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ShieldCheck,
  MapPin,
} from "lucide-react";
import { formatVND, formatDate } from "@/lib/utils";

interface OrderDetailClientProps {
  order: {
    _id: string;
    orderNumber: string;
    total: number;
    subtotal: number;
    discount: number;
    shippingFee: number;
    voucherCode?: string;
    paymentMethod: string;
    orderStatus: string;
    createdAt: string;
    shippingAddress: {
      fullName: string;
      phone: string;
      city: string;
      district: string;
      address: string;
      isSimulated: boolean;
    };
    items: Array<{
      name: string;
      image: string;
      price: number;
      quantity: number;
      variantName?: string;
    }>;
    timeline: Array<{
      status: string;
      title: string;
      description: string;
      timestamp: string;
    }>;
  };
}

export default function OrderDetailClient({ order }: OrderDetailClientProps) {
  const isCompleted = order.orderStatus === "COMPLETED";
  const isShipping = order.orderStatus === "SHIPPING";

  // Calculate 24-hour remaining delivery countdown
  const [remainingText, setRemainingText] = useState<string>("");

  useEffect(() => {
    const updateCountdown = () => {
      const createdTime = new Date(order.createdAt).getTime();
      const elapsed = Date.now() - createdTime;
      const twentyFourHours = 24 * 60 * 60 * 1000;
      const remainingMs = twentyFourHours - elapsed;

      if (remainingMs <= 0 || isCompleted) {
        setRemainingText("Đơn hàng đã hoàn thành thời gian giao.");
      } else {
        const hours = Math.floor(remainingMs / (1000 * 60 * 60));
        const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        setRemainingText(`Dự kiến giao hàng trong khoảng ${hours} giờ ${minutes} phút nữa`);
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 60000);
    return () => clearInterval(timer);
  }, [order.createdAt, isCompleted]);

  const paymentLabel =
    order.paymentMethod === "SIMULATED_COD" || order.paymentMethod === "COD"
      ? "Thanh toán khi nhận hàng (COD)"
      : order.paymentMethod === "WALLET"
      ? "Thanh toán trực tuyến"
      : "Thẻ thanh toán quốc tế / ATM";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Status Header */}
      <div>
        <Link
          href="/orders"
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#192841] mb-3 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Quay lại danh sách đơn hàng
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Đơn Hàng #{order.orderNumber}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                  isCompleted
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : isShipping
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Đã giao thành công
                  </>
                ) : isShipping ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" /> Đang trên đường vận chuyển
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5 text-amber-600" /> Đang xử lý
                  </>
                )}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Đặt lúc {formatDate(order.createdAt)}</p>
          </div>

          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 self-start sm:self-auto transition"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>

      {/* Real-time Order Status Notice */}
      <div
        className={`p-5 rounded-2xl border flex items-start gap-3.5 text-xs leading-relaxed ${
          isCompleted
            ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
            : "bg-blue-50/80 border-blue-200 text-blue-950"
        }`}
      >
        {isCompleted ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        ) : (
          <Truck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        )}
        <div className="space-y-1">
          <div className="font-extrabold text-sm">
            {isCompleted
              ? "Đơn hàng đã được giao thành công!"
              : "Đơn hàng đang trên đường vận chuyển (SHOPDEE Express)"}
          </div>
          <p className="text-slate-600 text-xs">
            {isCompleted
              ? "Kiện hàng đã được phát thành công đến địa chỉ người nhận. Cảm ơn bạn đã mua sắm tại SHOPDEE!"
              : `${remainingText}. Đơn vị vận chuyển đang phát hàng đến bạn. Sau đúng 1 ngày (24 giờ), hệ thống sẽ cập nhật trạng thái giao hàng thành công.`}
          </p>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-subtle space-y-6">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#192841]" /> Hành Trình Vận Chuyển
        </h2>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {order.timeline && order.timeline.length > 0 ? (
            order.timeline.map((event, idx) => {
              const isLast = idx === order.timeline.length - 1;
              return (
                <div key={idx} className="relative group">
                  <div
                    className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full ring-4 ${
                      isLast
                        ? isCompleted
                          ? "bg-emerald-600 ring-emerald-100"
                          : "bg-blue-600 ring-blue-100"
                        : "bg-slate-400 ring-slate-100"
                    }`}
                  />
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-slate-400 block">
                      {formatDate(event.timestamp)}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{event.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{event.description}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="relative">
              <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-blue-600 ring-4 ring-blue-50" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Đơn hàng đang xử lý</h4>
                <p className="text-xs text-slate-500">Đang chuẩn bị vận chuyển.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Items & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 shadow-subtle space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Sản phẩm trong đơn ({order.items.length})
          </h3>
          <div className="divide-y divide-slate-100">
            {order.items.map((it, i) => (
              <div key={i} className="py-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <img src={it.image} alt="" className="w-14 h-14 rounded-xl object-cover border border-slate-100" />
                  <div>
                    <h4 className="font-bold text-slate-900 line-clamp-1">{it.name}</h4>
                    {it.variantName && (
                      <span className="text-[11px] text-slate-400 block">{it.variantName}</span>
                    )}
                    <span className="text-slate-500">Số lượng: x{it.quantity}</span>
                  </div>
                </div>
                <span className="font-extrabold text-slate-900 shrink-0">
                  {formatVND(it.price * it.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-subtle space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider">
            Chi tiết thanh toán
          </h3>

          <div className="space-y-2 text-slate-600">
            <div className="flex justify-between">
              <span>Tạm tính:</span>
              <span className="font-bold text-slate-900">{formatVND(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Voucher giảm giá:</span>
                <span className="font-bold">-{formatVND(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Phí giao hàng:</span>
              <span className="font-bold text-emerald-600">0₫ (Miễn phí)</span>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
              <span className="text-sm font-extrabold text-slate-900">Tổng thanh toán:</span>
              <span className="text-lg font-black text-[#192841]">{formatVND(order.total)}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1.5">
            <div>
              Phương thức: <strong className="text-slate-800">{paymentLabel}</strong>
            </div>
            {order.shippingAddress && (
              <div className="flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  Người nhận: <strong className="text-slate-800">{order.shippingAddress.fullName}</strong> ({order.shippingAddress.phone})
                  <div className="text-slate-500">{order.shippingAddress.address}, {order.shippingAddress.city}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
