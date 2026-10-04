"use client";

import React, { useState } from "react";
import { Ticket, Check, Copy } from "lucide-react";
import { formatVND } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";
import { showToast } from "@/store/useToastStore";

export interface VoucherItem {
  _id: string;
  code: string;
  title: string;
  description: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  endDate: string | Date;
}

export default function VoucherCard({ voucher }: { voucher: VoucherItem }) {
  const [copied, setCopied] = useState(false);
  const { applyVoucher } = useCartStore();

  const handleCopy = () => {
    navigator.clipboard.writeText(voucher.code);
    setCopied(true);
    showToast({
      type: "success",
      title: "Đã sao chép mã!",
      message: `Mã ${voucher.code} đã sẵn sàng trong bộ nhớ tạm.`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const isPercent = voucher.discountType === "PERCENT";

  return (
    <div className="relative bg-white border border-slate-200 shadow-subtle hover:shadow-card hover:border-[#192841] transition-all p-3.5 sm:p-4 flex items-center justify-between gap-3 overflow-hidden">
      {/* Decorative colored strip on left */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#192841]" />

      <div className="flex items-start gap-3 pl-2">
        <div className="w-10 h-10 bg-slate-100 border border-slate-200 flex items-center justify-center text-[#192841] shrink-0">
          <Ticket className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-extrabold text-xs px-2 py-0.5 bg-slate-100 text-[#192841] border border-slate-300">
              {voucher.code}
            </span>
            <span className="text-[11px] font-bold text-rose-600">
              {isPercent ? `Giảm ${voucher.discountValue}%` : `Giảm ${formatVND(voucher.discountValue)}`}
            </span>
          </div>
          <h4 className="text-xs font-semibold text-slate-800 mt-1 line-clamp-1">{voucher.title}</h4>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Đơn tối thiểu {formatVND(voucher.minOrderValue)}
            {voucher.maxDiscount ? ` • Tối đa ${formatVND(voucher.maxDiscount)}` : ""}
          </p>
        </div>
      </div>

      <button
        onClick={handleCopy}
        className={`px-3 py-1.5 text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer ${
          copied
            ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
            : "bg-[#192841] hover:bg-[#132034] text-white shadow-xs"
        }`}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5" /> Đã lưu
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" /> Lưu mã
          </>
        )}
      </button>
    </div>
  );
}
