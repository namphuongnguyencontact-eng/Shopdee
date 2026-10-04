"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, X, HelpCircle } from "lucide-react";

export default function SimulationNoticeBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-[#192841] text-white text-xs py-2.5 px-3 sm:px-4 border-b border-white/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="flex items-center justify-center w-5 h-5 bg-white/15 shrink-0">
            <Sparkles className="w-3 h-3 text-amber-300" />
          </span>
          <span className="font-medium">
            <strong className="font-bold">Ưu đãi hôm nay:</strong> Miễn phí vận chuyển toàn quốc cho mọi đơn hàng • Giao nhanh 24h!
          </span>
          <Link
            href="/products"
            className="hidden sm:inline-flex items-center gap-1 underline underline-offset-2 text-slate-200 hover:text-white ml-1 font-medium"
          >
            <Sparkles className="w-3 h-3" /> Mua sắm ngay
          </Link>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          aria-label="Đóng thông báo"
          className="text-slate-300 hover:text-white p-1 hover:bg-white/10 shrink-0 transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
