"use client";

import React, { useState, useRef } from "react";
import { X, Sparkles, Download, Copy, Check, Share2, Eye, EyeOff } from "lucide-react";
import { formatVND } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { showToast } from "@/store/useToastStore";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    _id: string;
    orderNumber: string;
    total: number;
    items: Array<{
      name: string;
      image: string;
      price: number;
      quantity: number;
    }>;
  };
}

const TEMPLATES = [
  { id: "modern", name: "Modern Blue", bg: "from-blue-600 via-indigo-600 to-sky-600" },
  { id: "pastel", name: "Pastel Dream", bg: "from-pink-400 via-rose-400 to-amber-300" },
  { id: "cyber", name: "Cyberpunk Vibe", bg: "from-purple-900 via-indigo-950 to-cyan-900" },
  { id: "minimal", name: "Dark Chic", bg: "from-slate-900 via-slate-800 to-slate-950" },
];

const QUOTES = [
  "Tự thưởng cho bản thân một chút hôm nay ✨",
  "Một ngày chill cùng ShopDee 🛍️",
  "Sắm đồ xinh, tâm trạng lung linh! 💖",
  "Cả tuần nỗ lực, cuối tuần tự yêu mình 🥰",
];

export default function ShareModal({ isOpen, onClose, order }: ShareModalProps) {
  const { user } = useAuthStore();
  const cardRef = useRef<HTMLDivElement>(null);

  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [selectedQuote, setSelectedQuote] = useState(QUOTES[0]);
  const [customQuote, setCustomQuote] = useState("");
  const [showPrice, setShowPrice] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const displayQuote = customQuote || selectedQuote;
  const username = user?.username ? `@${user.username}` : "@genz_shopper";

  const handleCopyLink = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order._id,
          quote: displayQuote,
          template: selectedTemplate.id,
          background: selectedTemplate.bg,
          showPrice,
        }),
      });
      const json = await res.json();
      if (json.success) {
        const shareUrl = `${window.location.origin}/share/order/${json.data.shareId}`;
        navigator.clipboard.writeText(shareUrl);
        setIsCopied(true);
        showToast({
          type: "success",
          title: "Đã sao chép link chia sẻ!",
          message: "Link chia sẻ đơn hàng đã sẵn sàng để gửi bạn bè.",
        });
        setTimeout(() => setIsCopied(false), 3000);
      }
    } catch {
      showToast({ type: "error", message: "Lỗi tạo link chia sẻ." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = async () => {
    try {
      showToast({
        type: "success",
        title: "Đang tạo ảnh chia sẻ...",
        message: "Card Khoe Đơn đang được render.",
      });
      await handleCopyLink();
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in" />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-500" /> Share Order Generator ✨
            </h2>
            <p className="text-xs text-slate-500">Tùy biến card khoe đơn để up story hoặc gửi bạn bè</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* The Card Preview */}
        <div className="flex justify-center">
          <div
            ref={cardRef}
            className={`w-full max-w-sm rounded-3xl p-6 bg-gradient-to-br ${selectedTemplate.bg} text-white shadow-2xl space-y-5 transition-all duration-300 border border-white/20`}
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

            {/* Products preview */}
            <div className="space-y-2">
              <div className="flex -space-x-3 overflow-hidden py-1">
                {order.items.slice(0, 3).map((it, idx) => (
                  <img
                    key={idx}
                    src={it.image}
                    alt=""
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white/50 shadow-md"
                  />
                ))}
              </div>
              <div className="text-xs font-semibold text-white/90">
                {order.items.length} món đồ tự thưởng
              </div>
            </div>

            {/* Total Amount if enabled */}
            {showPrice && (
              <div>
                <span className="text-[11px] text-white/70 block uppercase tracking-wider">Tổng giá trị đơn</span>
                <span className="text-2xl font-black">{formatVND(order.total)}</span>
              </div>
            )}

            {/* Quote */}
            <div className="p-3.5 rounded-2xl bg-black/20 backdrop-blur-xs border border-white/10 text-xs italic text-white/95 leading-relaxed">
              &ldquo;{displayQuote}&rdquo;
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-white/20 text-[11px] text-white/80">
              <span className="font-bold">{username}</span>
              <span className="font-mono text-[10px]">#{order.orderNumber}</span>
            </div>
          </div>
        </div>

        {/* Customization Controls */}
        <div className="space-y-4 pt-2">
          {/* 1. Template selection */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-2">Chọn phong cách màu:</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => setSelectedTemplate(tmpl)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition text-left ${
                    selectedTemplate.id === tmpl.id
                      ? "border-blue-600 bg-blue-50/50 text-blue-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {tmpl.name}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Quote selection */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-2">Chọn lời nhắn:</label>
            <div className="space-y-1.5">
              {QUOTES.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setSelectedQuote(q);
                    setCustomQuote("");
                  }}
                  className={`w-full text-left p-2 rounded-xl text-xs border transition ${
                    selectedQuote === q && !customQuote
                      ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold"
                      : "border-slate-100 hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  &ldquo;{q}&rdquo;
                </button>
              ))}
              <input
                type="text"
                value={customQuote}
                onChange={(e) => setCustomQuote(e.target.value)}
                placeholder="Hoặc tự viết lời nhắn của riêng bạn..."
                className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* 3. Hide / Show Price */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-slate-800">Hiển thị giá tiền trên card:</span>
            <button
              onClick={() => setShowPrice(!showPrice)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                showPrice
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "bg-slate-50 border-slate-200 text-slate-500"
              }`}
            >
              {showPrice ? (
                <>
                  <Eye className="w-3.5 h-3.5" /> Hiện giá
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5" /> Ẩn giá
                </>
              )}
            </button>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={handleCopyLink}
            disabled={isSaving}
            className="h-11 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition disabled:opacity-50"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4" /> Đã sao chép link!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Sao chép link chia sẻ
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="h-11 rounded-2xl border-2 border-slate-300 hover:border-slate-400 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-2 transition"
          >
            <Download className="w-4 h-4" /> Lưu hình ảnh
          </button>
        </div>
      </div>
    </div>
  );
}
