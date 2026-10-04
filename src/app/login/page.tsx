"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck, Sparkles, User, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import { showToast } from "@/store/useToastStore";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const { checkAuth } = useAuthStore();
  const { syncGuestCartToUser } = useCartStore();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [understood, setUnderstood] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!understood) {
      setError("Vui lòng đồng ý với Điều khoản dịch vụ & Chính sách bảo mật.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });
      const json = await res.json();

      if (json.success) {
        showToast({
          type: "success",
          title: "Đăng nhập thành công!",
          message: `Chào mừng bạn trở lại, ${json.data.user.name}!`,
        });
        await checkAuth();
        await syncGuestCartToUser();
        router.push(redirectUrl);
      } else {
        setError(json.error?.message || "Tài khoản hoặc mật khẩu không chính xác.");
      }
    } catch {
      setError("Lỗi kết nối máy chủ. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Shopee Auth Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="SHOPDEE Logo" className="w-10 h-10 object-contain" />
              <span className="font-black text-2xl tracking-tight text-[#192841]">SHOPDEE</span>
            </Link>
            <span className="text-xl sm:text-2xl font-bold text-slate-800">Đăng Nhập</span>
          </div>

          <Link href="/how-it-works" className="text-xs text-red-600 hover:underline font-medium">
            Bạn cần giúp đỡ?
          </Link>
        </div>
      </header>

      {/* Shopee Auth Split Body */}
      <div className="flex-1 bg-[#192841] flex items-center justify-center py-10 sm:py-16 px-4">
        <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Promotional Banner (Shopee Style) */}
          <div className="hidden lg:flex flex-col items-center justify-center text-white space-y-6 text-center pr-8">
            <div className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center border-4 border-white/20 shadow-2xl">
              <img src="/logo.png" alt="Shopdee" className="w-32 h-32 object-contain drop-shadow" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight leading-tight">
                MUA ĐEE CHỜ CHI!
              </h2>
              <p className="text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
                Nền tảng mua sắm thương mại điện tử xu hướng hàng đầu Việt Nam. Giao nhanh 24h & Freeship 0₫.
              </p>
            </div>
          </div>

          {/* Right: Shopee Auth Card */}
          <div className="w-full max-w-md mx-auto bg-white rounded-xs shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Đăng nhập</h2>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 rounded-xs bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
              <div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Email / Tên đăng nhập"
                  className="w-full h-10 px-3.5 rounded-xs border border-slate-300 outline-none focus:border-[#192841] text-xs font-normal"
                />
              </div>

              <div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu"
                  className="w-full h-10 px-3.5 rounded-xs border border-slate-300 outline-none focus:border-[#192841] text-xs font-normal"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-[#192841] hover:bg-[#132034] text-white font-bold text-xs sm:text-sm rounded-xs shadow-xs transition disabled:opacity-50 uppercase tracking-wider cursor-pointer"
              >
                {isLoading ? "Đang xử lý..." : "ĐĂNG NHẬP"}
              </button>

              <div className="flex items-center justify-between text-[11px] text-blue-600 pt-1">
                <Link href="/how-it-works" className="hover:underline">
                  Quên mật khẩu
                </Link>
                <Link href="/how-it-works" className="hover:underline">
                  Đăng nhập với SMS
                </Link>
              </div>
            </form>

            <div className="text-center text-xs text-slate-500 pt-4 border-t border-slate-100">
              Bạn mới biết đến SHOPDEE?{" "}
              <Link href="/register" className="font-bold text-red-600 hover:underline">
                Đăng ký
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Shopee Auth Simple Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-[11px] text-slate-500 space-y-1">
        <div>
          © 2026 SHOPDEE. Tất cả các quyền được bảo lưu.
        </div>
        <div className="flex justify-center gap-4 text-slate-400">
          <Link href="/terms" className="hover:underline">Điều Khoản Shopdee</Link>
          <span>|</span>
          <Link href="/privacy" className="hover:underline">Chính Sách Bảo Mật</Link>
          <span>|</span>
          <Link href="/how-it-works" className="hover:underline">Quy Chế Hoạt Động</Link>
        </div>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#192841] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
