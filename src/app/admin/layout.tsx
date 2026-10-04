"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  Ticket,
  Trophy,
  BarChart3,
  ExternalLink,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  Sparkles,
  Zap,
  Flame,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, checkAuth, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    checkAuth().finally(() => {
      if (mounted) setIsChecking(false);
    });
    return () => {
      mounted = false;
    };
  }, [checkAuth]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-neutral-400 text-sm">Đang xác thực quyền Quản trị viên...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 text-white">
        <div className="max-w-md w-full bg-neutral-900 border border-red-500/30 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Quyền Truy Cập Bị Giới Hạn</h2>
          <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
            Khu vực này chỉ dành riêng cho tài khoản Quản Trị Viên (Admin). Vui lòng đăng nhập bằng tài khoản Admin để tiếp tục.
          </p>
          <div className="space-y-2">
            <Link
              href="/login"
              className="block w-full py-2.5 px-4 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-sm transition-colors"
            >
              Đăng Nhập Tài Khoản Admin
            </Link>
            <Link
              href="/"
              className="block w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 font-semibold text-sm transition-colors"
            >
              Quay Lại Cửa Hàng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/admin", label: "Tổng Quan", icon: LayoutDashboard, exact: true },
    { href: "/admin/products", label: "Sản Phẩm", icon: Package },
    { href: "/admin/sales", label: "Sản Phẩm Đã Bán", icon: Flame },
    { href: "/admin/products/import-shopee", label: "Nhập Shopee", icon: Zap },
    { href: "/admin/categories", label: "Danh Mục", icon: FolderTree },
    { href: "/admin/orders", label: "Đơn Hàng", icon: ShoppingBag },
    { href: "/admin/users", label: "Người Dùng", icon: Users },
    { href: "/admin/vouchers", label: "Mã Giảm Giá", icon: Ticket },
    { href: "/admin/analytics", label: "Phân Tích Dữ Liệu", icon: BarChart3 },
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 max-w-[85vw] bg-neutral-900 border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-5 sm:px-6 border-b border-white/10 flex items-center justify-between">
          <Link href="/admin" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2.5">
            <img src="/logo.png" alt="SHOPDEE Admin Logo" className="w-8 h-8 object-contain shrink-0" />
            <div>
              <span className="font-extrabold text-sm tracking-tight text-white block">SHOPDEE ADMIN</span>
              <span className="text-[10px] text-pink-400 font-semibold block -mt-1">Management Portal</span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-neutral-300 lg:hidden cursor-pointer"
            aria-label="Đóng menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Back to Shop */}
        <div className="p-3.5 sm:p-4 border-b border-white/5">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-300 text-xs font-bold hover:bg-pink-500/20 active:scale-98 transition-all group"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              Xem Cửa Hàng (Store)
            </span>
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-98 ${
                  isActive
                    ? "bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-white shadow-sm"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-pink-400" : "text-neutral-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer / User Profile */}
        <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-white/10 bg-neutral-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-pink-500/20 text-pink-300 flex items-center justify-center font-bold text-xs shrink-0 border border-pink-500/30">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user?.name || "Admin ShopDee"}</p>
              <p className="text-[10px] text-neutral-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Đăng xuất"
            className="p-2 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-red-400 transition-colors shrink-0 cursor-pointer active:scale-95"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="h-16 bg-neutral-900/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-30 px-3 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl bg-white/5 active:bg-white/15 text-neutral-200 hover:bg-white/10 lg:hidden cursor-pointer"
              aria-label="Mở menu quản trị"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
              <span className="text-xs font-semibold text-neutral-300 hidden sm:inline">Hệ Thống Hoạt Động (Online)</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="px-2.5 sm:px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-300 text-xs font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Hệ Thống Quản Trị SHOPDEE</span>
              <span className="sm:hidden font-bold">Admin Portal</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
