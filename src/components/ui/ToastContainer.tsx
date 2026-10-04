"use client";

import React from "react";
import { useToastStore, ToastItem } from "@/store/useToastStore";
import { CheckCircle2, AlertCircle, Info, Sparkles, Trophy, X } from "lucide-react";

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-3 left-3 right-3 sm:left-auto sm:right-6 sm:top-auto sm:bottom-6 z-[9999] flex flex-col items-center sm:items-end gap-2.5 max-w-sm sm:w-full mx-auto sm:mx-0 pointer-events-none">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const isXp = toast.type === "xp";
  const isLevelUp = toast.type === "level_up";
  const isBadge = toast.type === "badge";

  return (
    <div
      className={`pointer-events-auto w-full flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-top-2 sm:slide-in-from-bottom-2 ${
        isXp
          ? "bg-gradient-to-r from-blue-600/95 to-indigo-600/95 text-white border-blue-400 shadow-blue-500/25"
          : isLevelUp
          ? "bg-gradient-to-r from-amber-500/95 to-orange-500/95 text-white border-amber-300 shadow-orange-500/25"
          : isBadge
          ? "bg-gradient-to-r from-purple-600/95 to-pink-600/95 text-white border-purple-400 shadow-purple-500/25"
          : toast.type === "success"
          ? "bg-emerald-900/95 text-white border-emerald-500/40 shadow-emerald-900/30"
          : toast.type === "error"
          ? "bg-rose-900/95 text-white border-rose-500/40 shadow-rose-900/30"
          : "bg-slate-900/95 text-white border-white/15 shadow-black/40"
      }`}
    >
      <div className="shrink-0 mt-0.5">
        {isXp && <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />}
        {isLevelUp && <Trophy className="w-5 h-5 text-yellow-200 animate-bounce" />}
        {isBadge && <span className="text-xl">🏆</span>}
        {!isXp && !isLevelUp && !isBadge && toast.type === "success" && (
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        )}
        {!isXp && !isLevelUp && !isBadge && toast.type === "error" && (
          <AlertCircle className="w-5 h-5 text-rose-400" />
        )}
        {!isXp && !isLevelUp && !isBadge && toast.type === "info" && (
          <Info className="w-5 h-5 text-blue-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        {toast.title && (
          <div className="font-bold text-xs sm:text-sm leading-tight break-words text-white mb-0.5">
            {toast.title}
          </div>
        )}
        <div className="text-[11px] sm:text-xs leading-snug break-words text-white/90">
          {toast.message}
        </div>
      </div>

      <button
        onClick={onDismiss}
        className="p-1 -mr-1 -mt-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
        aria-label="Đóng thông báo"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
