"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  Sparkles,
  ShoppingBag,
  Trophy,
  Gift,
  CheckCheck,
  ArrowRight,
  Shield,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: "order" | "promotion" | "reward" | "system" | "achievement";
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/notifications");
      const json = await res.json();
      if (json.success) {
        setNotifications(json.data.notifications || []);
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  const filtered = notifications.filter((n) => {
    if (filterType === "all") return true;
    return n.type === filterType;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" /> Trung Tâm Thông Báo
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cập nhật về đơn hàng, vận chuyển và ưu đãi Flash Sale
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition self-start sm:self-auto"
        >
          <CheckCheck className="w-4 h-4 text-blue-600" /> Đánh dấu đã đọc tất cả
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 text-xs font-bold text-slate-600">
        {[
          { id: "all", label: "Tất cả" },
          { id: "order", label: "Đơn hàng" },
          { id: "promotion", label: "Khuyến mãi" },
          { id: "system", label: "Hệ thống" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3.5 py-1.5 rounded-full transition whitespace-nowrap ${
              filterType === tab.id
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-subtle divide-y divide-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((n) => (
            <div
              key={n._id}
              className={`p-4 sm:p-5 flex items-start gap-4 transition hover:bg-slate-50/50 ${
                !n.isRead ? "bg-blue-50/30" : ""
              }`}
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  n.type === "order"
                    ? "bg-blue-100 text-blue-600"
                    : n.type === "achievement"
                    ? "bg-amber-100 text-amber-600"
                    : n.type === "reward"
                    ? "bg-pink-100 text-pink-600"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {n.type === "order" && <ShoppingBag className="w-5 h-5" />}
                {n.type === "achievement" && <Trophy className="w-5 h-5" />}
                {n.type === "reward" && <Gift className="w-5 h-5" />}
                {n.type === "promotion" && <Sparkles className="w-5 h-5" />}
                {n.type === "system" && <Shield className="w-5 h-5" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                    {n.title}
                  </h3>
                  <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                    {formatDate(n.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                {n.link && (
                  <Link
                    href={n.link}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline mt-2"
                  >
                    Xem chi tiết <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>

              {!n.isRead && (
                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-2" />
              )}
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-xs text-slate-400">
            Không có thông báo nào trong mục này.
          </div>
        )}
      </div>
    </div>
  );
}
