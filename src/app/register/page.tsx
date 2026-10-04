"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, User, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import { showToast } from "@/store/useToastStore";

export default function RegisterPage() {
  const router = useRouter();
  const { checkAuth } = useAuthStore();
  const { syncGuestCartToUser } = useCartStore();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [understood, setUnderstood] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gender) {
      setError("Vui lòng chọn giới tính (thông tin bắt buộc).");
      return;
    }

    if (!birthDate) {
      setError("Vui lòng chọn ngày sinh (thông tin bắt buộc).");
      return;
    }

    if (!understood) {
      setError("Vui lòng đồng ý với Điều khoản sử dụng & Chính sách bảo mật.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không trùng khớp.");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu tối thiểu 6 ký tự.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim().toLowerCase(),
          email: email.trim().toLowerCase(),
          password,
          gender,
          birthDate,
        }),
      });
      const json = await res.json();

      if (json.success) {
        showToast({
          type: "success",
          title: "🎉 Đăng ký thành công!",
          message: "Chào mừng bạn đến với SHOPDEE. Chúc bạn mua sắm vui vẻ!",
        });
        await checkAuth();
        await syncGuestCartToUser();
        router.push("/");
      } else {
        setError(json.error?.message || "Đăng ký không thành công. Vui lòng thử lại.");
      }
    } catch {
      setError("Lỗi kết nối máy chủ. Vui lòng thử lại sau.");
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
            <span className="text-xl sm:text-2xl font-bold text-slate-800">Đăng Ký</span>
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
                Đăng ký tài khoản Shopdee ngay hôm nay để nhận voucher giảm đến 100K và ưu đãi freeship 0₫ cho đơn đầu tiên!
              </p>
            </div>
          </div>

          {/* Right: Shopee Auth Card */}
          <div className="w-full max-w-md mx-auto bg-white rounded-xs shadow-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Đăng ký</h2>

            {/* Error message */}
            {error && (
              <div className="p-3 rounded-xs bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-3 text-xs">
              <div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Họ và tên của bạn"
                  className="w-full h-10 px-3.5 rounded-xs border border-slate-300 outline-none focus:border-[#192841] text-xs font-normal"
                />
              </div>

              <div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Tên đăng nhập (username)"
                  className="w-full h-10 px-3.5 rounded-xs border border-slate-300 outline-none focus:border-[#192841] text-xs font-normal"
                />
              </div>

              <div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Địa chỉ Email"
                  className="w-full h-10 px-3.5 rounded-xs border border-slate-300 outline-none focus:border-[#192841] text-xs font-normal"
                />
              </div>

              <div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                  className="w-full h-10 px-3.5 rounded-xs border border-slate-300 outline-none focus:border-[#192841] text-xs font-normal"
                />
              </div>

              <div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  className="w-full h-10 px-3.5 rounded-xs border border-slate-300 outline-none focus:border-[#192841] text-xs font-normal"
                />
              </div>

              {/* Giới tính (Bắt buộc) */}
              <div>
                <label className="block text-slate-700 font-bold mb-1 text-[11px]">
                  Giới tính <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: "Nam", label: "Nam 👨" },
                    { val: "Nữ", label: "Nữ 👩" },
                    { val: "Khác", label: "Khác ✨" },
                  ].map((g) => (
                    <button
                      key={g.val}
                      type="button"
                      onClick={() => setGender(g.val)}
                      className={`h-9 px-2 rounded-xs border text-xs font-semibold flex items-center justify-center transition cursor-pointer ${
                        gender === g.val
                          ? "border-[#192841] bg-[#192841] text-white shadow-xs"
                          : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ngày sinh (Bắt buộc) */}
              <div>
                <label className="block text-slate-700 font-bold mb-1 text-[11px]">
                  Ngày sinh <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  max={new Date().toISOString().split("T")[0]}
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xs border border-slate-300 outline-none focus:border-[#192841] text-xs font-normal bg-white"
                />
              </div>

              <label className="flex items-start gap-2 cursor-pointer pt-1 text-slate-600 font-normal leading-tight">
                <input
                  type="checkbox"
                  required
                  checked={understood}
                  onChange={(e) => setUnderstood(e.target.checked)}
                  className="mt-0.5 w-3.5 h-3.5 text-[#192841] rounded-xs border-slate-300 focus:ring-[#192841] shrink-0"
                />
                <span className="text-[11px] text-slate-500">
                  Tôi đồng ý với{" "}
                  <Link href="/terms" className="text-blue-600 hover:underline">
                    Điều khoản sử dụng
                  </Link>{" "}
                  &{" "}
                  <Link href="/privacy" className="text-blue-600 hover:underline">
                    Chính sách bảo mật
                  </Link>{" "}
                  của SHOPDEE.
                </span>
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-[#192841] hover:bg-[#132034] text-white font-bold text-xs sm:text-sm rounded-xs shadow-xs transition disabled:opacity-50 uppercase tracking-wider cursor-pointer mt-2"
              >
                {isLoading ? "Đang xử lý..." : "ĐĂNG KÝ"}
              </button>
            </form>

            <div className="text-center text-xs text-slate-500 pt-4 border-t border-slate-100">
              Bạn đã có tài khoản?{" "}
              <Link href="/login" className="font-bold text-red-600 hover:underline">
                Đăng nhập
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
