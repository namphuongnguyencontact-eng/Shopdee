"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Copy, Check, ShoppingBag, ArrowRight, Eye, ShieldCheck } from "lucide-react";
import { formatVND } from "@/lib/utils";
import { showToast } from "@/store/useToastStore";

interface PublicShareViewClientProps {
  shared: {
    shareId: string;
    userName: string;
    userAvatar: string;
    orderNumber: string;
    itemCount: number;
    totalAmount: number;
    showPrice: boolean;
    quote: string;
    template: string;
    background: string;
    viewsCount: number;
    createdAt: string;
    products: Array<{
      name: string;
      image: string;
      price: number;
    }>;
  };
}

export default function PublicShareViewClient({ shared }: PublicShareViewClientProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      showToast({
        type: "success",
        title: "Đã sao chép link!",
        message: "Link Khoe Đơn đã được lưu vào bộ nhớ tạm.",
      });
      setTimeout(() => setIsCopied(false), 3000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Top Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-50 text-pink-700 text-xs font-bold rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-pink-500" /> KHOE ĐƠN HÀNG SHOPDEE
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {shared.userName} vừa chốt đơn tại SHOPDEE!
        </h1>
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <Eye className="w-3.5 h-3.5" /> {shared.viewsCount} lượt xem
        </div>
      </div>

      {/* The Visual Card */}
      <div className="flex justify-center">
        <div
          className={`w-full max-w-sm rounded-3xl p-6 sm:p-7 bg-gradient-to-br ${shared.background} text-white shadow-2xl space-y-5 border border-white/20`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/20 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-black text-xs">
                S
              </span>
              <span className="font-extrabold text-sm tracking-wider">SHOPDEE</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 uppercase tracking-wider">
              MY ORDER ✨
            </span>
          </div>

          {/* User info */}
          <div className="flex items-center gap-2.5">
            <img
              src={shared.userAvatar}
              alt=""
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white/50"
            />
            <div>
              <span className="text-xs font-bold block leading-tight">{shared.userName}</span>
              <span className="text-[10px] text-white/70">Khách hàng thân thiết</span>
            </div>
          </div>

          {/* Products preview */}
          <div className="space-y-2">
            <div className="flex -space-x-3 overflow-hidden py-1">
              {shared.products.slice(0, 4).map((p, idx) => (
                <img
                  key={idx}
                  src={p.image}
                  alt=""
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white/50 shadow-md"
                />
              ))}
            </div>
            <div className="text-xs font-semibold text-white/90">
              {shared.itemCount} món đồ tự thưởng
            </div>
          </div>

          {/* Total Amount if shown */}
          {shared.showPrice && (
            <div>
              <span className="text-[10px] text-white/70 uppercase tracking-wider block">Tổng giá trị đơn</span>
              <span className="text-2xl font-black">{formatVND(shared.totalAmount)}</span>
            </div>
          )}

          {/* Quote */}
          <div className="p-3.5 rounded-2xl bg-black/20 backdrop-blur-xs border border-white/10 text-xs italic text-white/95 leading-relaxed">
            &ldquo;{shared.quote}&rdquo;
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-white/20 text-[10px] text-white/70">
            <span className="font-bold">shopdee.local</span>
            <span className="font-mono">#{shared.orderNumber}</span>
          </div>
        </div>
      </div>

      {/* Social Note */}
      <div className="p-4 bg-slate-100 rounded-2xl text-center text-xs text-slate-600 max-w-md mx-auto leading-relaxed flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Mua sắm cực chill và khoe đơn phong cách cùng SHOPDEE!</span>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={handleCopy}
          className="w-full sm:w-auto px-6 py-3 rounded-full border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition"
        >
          {isCopied ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" /> Đã sao chép link
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" /> Sao chép link card này
            </>
          )}
        </button>

        <Link
          href="/"
          className="w-full sm:w-auto px-7 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition"
        >
          <ShoppingBag className="w-4 h-4" /> Khám phá & chốt đơn ngay <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
