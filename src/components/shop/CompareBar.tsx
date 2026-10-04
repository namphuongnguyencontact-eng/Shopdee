"use client";

import React from "react";
import { ArrowLeftRight, X, Sparkles } from "lucide-react";
import { useCompareStore } from "@/store/useCompareStore";

export default function CompareBar() {
  const { items, setModalOpen, clearCompare, removeFromCompare } = useCompareStore();

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#192841] text-white px-4 py-3 shadow-2xl border border-white/20 flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 animate-in slide-in-from-bottom-5 duration-300 max-w-[95vw] sm:max-w-xl">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-white flex items-center justify-center text-[#192841] shrink-0 shadow-sm">
          <ArrowLeftRight className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs font-bold leading-tight">So Sánh Sản Phẩm</p>
          <p className="text-[10px] text-slate-300 font-semibold">{items.length}/3 món đồ đã chọn</p>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex items-center gap-1.5">
        {items.map((item) => (
          <div
            key={item._id}
            className="relative group w-9 h-9 overflow-hidden bg-slate-800 border border-white/15 shrink-0"
          >
            <img src={item.images[0] || ""} alt={item.name} className="w-full h-full object-cover" />
            <button
              onClick={() => removeFromCompare(item._id)}
              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition cursor-pointer"
              title="Xóa"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        ))}
        {Array.from({ length: 3 - items.length }).map((_, i) => (
          <div
            key={i}
            className="w-9 h-9 border border-dashed border-white/20 flex items-center justify-center text-[10px] text-slate-400 font-bold shrink-0"
          >
            +{i + 1}
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-white hover:bg-slate-100 text-[#192841] text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#192841]" />
          <span>So Sánh Ngay</span>
        </button>
        <button
          onClick={clearCompare}
          className="p-2 text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          title="Xóa danh sách so sánh"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
