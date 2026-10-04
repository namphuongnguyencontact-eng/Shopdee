"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Lock,
  Bell,
  Trash2,
  Check,
  ShieldCheck,
  Sparkles,
  Upload,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { showToast } from "@/store/useToastStore";

const AVAILABLE_CATEGORIES = [
  { slug: "fashion", label: "Thời Trang Gen Z 👕" },
  { slug: "beauty", label: "Mỹ Phẩm & Skincare 💄" },
  { slug: "tech", label: "Công Nghệ & Chill 🎧" },
  { slug: "gaming", label: "Góc Setup & Gaming 🎮" },
  { slug: "room-decor", label: "Decor Phòng & Đèn Led 🏠" },
  { slug: "cute-stuff", label: "Đồ Cute & Blind Box 🧸" },
  { slug: "lifestyle", label: "Phong Cách Sống ☕" },
  { slug: "food", label: "Snack & Đồ Ăn Vặt 🍜" },
];

export default function SettingsPage() {
  const { user, checkAuth, logout, setUser } = useAuthStore();

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setAvatar(user.avatar);
      setSelectedCats(user.favoriteCategories || []);
    }
  }, [user]);

  const handleDeviceAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast({ type: "error", message: "Vui lòng chọn tệp hình ảnh (JPEG, PNG, WebP...)." });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast({ type: "error", message: "Kích thước ảnh tối đa 10MB." });
      return;
    }

    // Instant load: hiển thị ngay lập tức
    const instantUrl = URL.createObjectURL(file);
    setAvatar(instantUrl);
    if (user) {
      setUser({ ...user, avatar: instantUrl });
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success && json.data?.url) {
        setAvatar(json.data.url);
        if (user) {
          setUser({ ...user, avatar: json.data.url });
        }
        await checkAuth();
        showToast({
          type: "success",
          title: "Tải ảnh thành công!",
          message: "Ảnh đại diện đã được cập nhật.",
        });
      } else {
        // Fallback base64
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = reader.result as string;
          setAvatar(base64);
          if (user) {
            setUser({ ...user, avatar: base64 });
          }
          await fetch("/api/upload/avatar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageBase64: base64 }),
          });
          await checkAuth();
          showToast({
            type: "success",
            title: "Tải ảnh thành công!",
            message: "Ảnh đại diện đã được cập nhật.",
          });
        };
        reader.readAsDataURL(file);
      }
    } catch {
      showToast({ type: "error", message: "Lỗi tải ảnh lên." });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const toggleCategory = (slug: string) => {
    setSelectedCats((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          avatar: avatar.trim(),
          favoriteCategories: selectedCats,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast({
          type: "success",
          title: "Đã lưu cài đặt!",
          message: "Thông tin tài khoản đã được cập nhật thành công.",
        });
        await checkAuth();
      } else {
        showToast({ type: "error", message: json.error?.message || "Lỗi cập nhật cài đặt." });
      }
    } catch {
      showToast({ type: "error", message: "Lỗi kết nối máy chủ." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    if (confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) {
      logout();
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <Link
          href="/profile"
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-blue-600 mb-3 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Quay lại hồ sơ
        </Link>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Cài Đặt Tài Khoản
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Quản lý thông tin cá nhân và sở thích mua sắm
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Profile Info */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-7 shadow-subtle space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" /> Thông tin cơ bản
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Tên hiển thị</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Email tài khoản</label>
              <input
                type="email"
                disabled
                value={user?.email || ""}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Ảnh đại diện (Avatar)</label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 shrink-0">
                  <img
                    src={avatar || user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"}
                    alt="Avatar Preview"
                    className="w-full h-full object-cover"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleDeviceAvatarUpload}
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-blue-200 disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" /> Tải ảnh từ máy tính / điện thoại
                    </button>
                    <span className="text-[11px] text-slate-400">Load ảnh tức thì</span>
                  </div>
                  <input
                    type="text"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="Hoặc dán URL ảnh trực tiếp..."
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 text-xs text-slate-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Favorite Categories Personalization */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-7 shadow-subtle space-y-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" /> Sở thích mua sắm của bạn
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Hệ thống gợi ý sẽ ưu tiên hiển thị các món đồ thuộc danh mục bạn yêu thích
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {AVAILABLE_CATEGORIES.map((cat) => {
              const isSelected = selectedCats.includes(cat.slug);
              return (
                <button
                  type="button"
                  key={cat.slug}
                  onClick={() => toggleCategory(cat.slug)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-semibold border transition ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition disabled:opacity-50"
          >
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>

          <button
            type="button"
            onClick={handleDeleteAccount}
            className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> Xóa tài khoản
          </button>
        </div>
      </form>
    </div>
  );
}
