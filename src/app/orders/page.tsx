"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  ArrowRight,
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { formatVND, formatDate } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";

interface OrderItem {
  _id: string;
  orderNumber: string;
  total: number;
  subtotal: number;
  discount: number;
  orderStatus: string;
  paymentMethod: string;
  createdAt: string;
  items: Array<{
    name: string;
    image: string;
    price: number;
    quantity: number;
    variantName?: string;
  }>;
}

export default function MyOrdersPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [activeTab, setActiveTab] = useState<"ALL" | "SHIPPING" | "COMPLETED">("ALL");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/orders");
      const json = await res.json();
      if (json.success) {
        setOrders(json.data || []);
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (activeTab === "SHIPPING") return ["SHIPPING", "PLACED", "CONFIRMED", "PREPARING"].includes(o.orderStatus);
    if (activeTab === "COMPLETED") return o.orderStatus === "COMPLETED";
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Đơn Hàng Của Tôi
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi trạng thái và hành trình các đơn hàng của bạn
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-2xl border border-slate-200 p-1 text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === "ALL" ? "bg-[#192841] text-white shadow-xs" : "hover:text-slate-900"
            }`}
          >
            Tất cả ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("SHIPPING")}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === "SHIPPING" ? "bg-[#192841] text-white shadow-xs" : "hover:text-slate-900"
            }`}
          >
            Đang vận chuyển
          </button>
          <button
            onClick={() => setActiveTab("COMPLETED")}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === "COMPLETED" ? "bg-[#192841] text-white shadow-xs" : "hover:text-slate-900"
            }`}
          >
            Đã giao hàng
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-white rounded-3xl border border-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isCompleted = order.orderStatus === "COMPLETED";
            const isShipping = order.orderStatus === "SHIPPING";

            return (
              <div
                key={order._id}
                className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-6 shadow-subtle hover:shadow-card hover:border-blue-100 transition space-y-4"
              >
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#192841]" />
                    <span className="font-extrabold text-slate-900">Đơn hàng #{order.orderNumber}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500">{formatDate(order.createdAt)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700">
                      SHOPDEE EXPRESS
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1.5 ${
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
                </div>

                {/* Order Items */}
                <div className="divide-y divide-slate-100">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="py-2.5 first:pt-0 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <img src={it.image} alt="" className="w-12 h-12 rounded-xl object-cover border border-slate-100" />
                        <div>
                          <span className="font-bold text-slate-900 line-clamp-1">{it.name}</span>
                          {it.variantName && (
                            <span className="text-[10px] text-slate-400 block">{it.variantName}</span>
                          )}
                          <span className="text-[11px] text-slate-500">x{it.quantity}</span>
                        </div>
                      </div>
                      <span className="font-extrabold text-slate-800 shrink-0">
                        {formatVND(it.price * it.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Order Footer & CTAs */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="text-xs">
                    <span className="text-slate-500 font-medium">Tổng thanh toán: </span>
                    <strong className="text-base font-black text-[#192841]">{formatVND(order.total)}</strong>
                    <span className="text-[11px] text-slate-400 ml-2">
                      ({order.paymentMethod === "SIMULATED_COD" || order.paymentMethod === "COD" ? "COD" : "Thẻ"})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Link
                      href={`/orders/${order._id}`}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#192841] hover:bg-[#132034] text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Truck className="w-3.5 h-3.5" /> Xem chi tiết & Theo dõi <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Bạn chưa có đơn hàng nào</h3>
          <p className="text-xs text-slate-500">Khám phá hàng trăm sản phẩm hot trend và đặt hàng ngay hôm nay!</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#192841] text-white font-bold text-xs shadow transition"
          >
            Mua sắm ngay <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
