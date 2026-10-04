"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  ShoppingCart,
  Heart,
  Bell,
  User,
  ShieldCheck,
  LogOut,
  Sparkles,
  HelpCircle,
  Globe,
  ChevronDown,
  Tag,
  Package,
  Clock,
  Flame,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { formatVND } from "@/lib/utils";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, checkAuth, logout } = useAuthStore();
  const { items: cartItems, setIsDrawerOpen, fetchCart } = useCartStore();
  const { productIds: wishlistIds, fetchWishlist } = useWishlistStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<{
    products: Array<{ slug: string; name: string; price: number; image?: string; images?: string[] }>;
    popularSearches: string[];
  } | null>(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ _id: string; title: string; message: string; isRead: boolean }>>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuth();
    fetchCart();
    fetchWishlist();
  }, [checkAuth, fetchCart, fetchWishlist]);

  // Fetch real popular searches from database
  useEffect(() => {
    fetch("/api/search")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.popularSearches) {
          setPopularSearches(data.data.popularSearches);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (user) {
      fetch("/api/notifications")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setNotifications(data.data.notifications || []);
            setUnreadNotifCount(data.data.unreadCount || 0);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // Search autocomplete debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        const json = await res.json();
        if (json.success) {
          setSuggestions(json.data);
          if (json.data?.popularSearches) {
            setPopularSearches(json.data.popularSearches);
          }
        }
      } catch {}
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifDropdown(false);
      }
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) {
        setShowCartDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery.trim() }),
      }).catch(() => {});
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    setShowSearchDropdown(false);
    fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: tag }),
    }).catch(() => {});
    router.push(`/products?search=${encodeURIComponent(tag)}`);
  };

  const markNotificationsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      setUnreadNotifCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  // Hide header completely on admin, login, and register pages
  if (pathname.startsWith("/admin") || pathname === "/login" || pathname === "/register") {
    return null;
  }

  const totalCartQty = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-[#192841] text-white shadow-md transition-all">
      {/* 1. TOP UTILITY BAR (Shopee Style) */}
      <div className="border-b border-white/10 text-xs text-slate-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between h-7 sm:h-8 text-[11px] sm:text-[12px]">
          {/* Left: Slogan on mobile / Social connect on tablet+ */}
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-[10px] sm:hidden text-amber-300 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Freeship 0Đ Toàn Quốc
            </span>
            <div className="hidden sm:flex items-center gap-1.5 text-slate-300">
              <span>Kết nối</span>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="hover:text-white transition"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="hover:text-white transition"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.13-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right: Notifications, Help, Language, User Account */}
          <div className="flex items-center gap-2.5 sm:gap-5">
            {/* Notification Popover */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => {
                  setShowNotifDropdown(!showNotifDropdown);
                  if (!showNotifDropdown && unreadNotifCount > 0) {
                    markNotificationsRead();
                  }
                }}
                className="flex items-center gap-1 hover:text-white transition py-0.5 sm:py-1 cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Thông Báo</span>
                {unreadNotifCount > 0 && (
                  <span className="px-1 py-0.2 bg-red-500 text-white text-[9px] font-bold rounded-full">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 top-8 w-72 sm:w-80 bg-white text-slate-800 shadow-xl border border-slate-200 rounded-sm p-3 z-50 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-bold text-xs text-slate-800">Thông báo mới nhận</span>
                    <button
                      onClick={markNotificationsRead}
                      className="text-[11px] text-[#192841] hover:underline"
                    >
                      Đã đọc tất cả
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 py-1">
                    {notifications.length > 0 ? (
                      notifications.slice(0, 5).map((n) => (
                        <div key={n._id} className="py-2 px-1 hover:bg-slate-50 transition text-left">
                          <div className="text-xs font-semibold text-slate-800">{n.title}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{n.message}</div>
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center text-xs text-slate-400">Không có thông báo mới</div>
                    )}
                  </div>
                  <div className="pt-2 border-t border-slate-100 text-center">
                    <Link
                      href="/notifications"
                      onClick={() => setShowNotifDropdown(false)}
                      className="text-xs text-[#192841] hover:underline font-semibold"
                    >
                      Xem tất cả thông báo →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Help */}
            <Link href="/how-it-works" className="hidden sm:flex items-center gap-1 hover:text-white transition">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Hỗ Trợ</span>
            </Link>

            {/* Language */}
            <div className="hidden sm:flex items-center gap-1 hover:text-white transition cursor-pointer">
              <Globe className="w-3.5 h-3.5" />
              <span>Tiếng Việt</span>
              <ChevronDown className="w-3 h-3 text-slate-300" />
            </div>

            {/* Wishlist Link */}
            <Link
              href="/wishlist"
              className="flex items-center gap-1 hover:text-rose-300 transition"
              title="Sản phẩm yêu thích"
            >
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden md:inline">Yêu thích</span>
              {wishlistIds.length > 0 && (
                <span className="text-[10px] font-bold text-rose-300">({wishlistIds.length})</span>
              )}
            </Link>

            <span className="text-white/30 hidden sm:inline">|</span>

            {/* User Auth Info / Links */}
            {user ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-1.5 hover:text-white transition font-medium cursor-pointer"
                >
                  <img
                    src={user.avatar || "/avatar.png"}
                    alt={user.name}
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover border border-white/40"
                  />
                  <span className="max-w-[80px] sm:max-w-[110px] truncate">{user.name}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 top-8 w-52 sm:w-56 bg-white text-slate-800 shadow-xl border border-slate-200 rounded-sm py-1.5 z-50 animate-in fade-in">
                    <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
                      <div className="text-xs font-bold text-slate-900 truncate">{user.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-50 transition"
                    >
                      <User className="w-4 h-4 text-slate-400" /> Tài khoản của tôi
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-50 transition"
                    >
                      <Package className="w-4 h-4 text-slate-400" /> Đơn Mua
                    </Link>
                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setShowUserDropdown(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#192841] hover:bg-slate-50 transition"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#192841]" /> Quản trị Admin
                      </Link>
                    )}
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 transition text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2 font-semibold">
                <Link href="/register" className="hover:text-white transition">
                  Đăng Ký
                </Link>
                <span className="text-white/30">|</span>
                <Link href="/login" className="hover:text-white transition">
                  Đăng Nhập
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER (Logo, Large Search Bar, Cart Icon) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-4">
        <div className="flex items-center justify-between gap-2.5 sm:gap-4 lg:gap-8">
          {/* Logo SHOPDEE */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-3 group shrink-0" aria-label="SHOPDEE Trang Chủ">
            <img
              src="/logo.png"
              alt="SHOPDEE"
              className="w-8 h-8 sm:w-12 sm:h-12 object-contain group-hover:scale-105 transition-transform drop-shadow shrink-0"
            />
            <div className="flex flex-col">
              <span className="font-black text-xl sm:text-3xl tracking-tight text-white leading-none">
                SHOPDEE
              </span>
              <span className="text-[10px] font-bold tracking-widest text-slate-300 uppercase mt-0.5 hidden md:block">
                MUA ĐEE CHỜ CHI
              </span>
            </div>
          </Link>

          {/* Shopee Large Search Bar */}
          <div ref={searchRef} className="flex-1 max-w-2xl relative min-w-0">
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white rounded-sm p-0.5 sm:p-1 flex items-center shadow-md border border-white"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                className="flex-1 px-2.5 sm:px-3 py-1.5 text-slate-800 text-xs sm:text-sm placeholder:text-slate-400 outline-none bg-transparent min-w-0"
              />
              <button
                type="submit"
                aria-label="Tìm kiếm sản phẩm"
                className="w-9 sm:w-16 h-7 sm:h-9 bg-[#192841] hover:bg-[#132034] text-white rounded-xs flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
              >
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </form>

            {/* Popular Search Tags below Search Bar (Classic Shopee Style) */}
            <div className="hidden sm:flex items-center gap-3 mt-1.5 text-[11px] text-slate-300 overflow-hidden whitespace-nowrap">
              {(popularSearches.length > 0
                ? popularSearches.slice(0, 7)
                : ["Áo thun", "Bàn phím cơ", "Son môi", "Mô hình", "Tai nghe", "Sneaker"]
              ).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className="hover:text-white transition hover:underline"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Autocomplete Dropdown */}
            {showSearchDropdown && (
              <div className="absolute top-12 left-0 right-0 bg-white text-slate-800 shadow-xl border border-slate-200 rounded-sm p-3 z-50 animate-in fade-in">
                {suggestions?.products && suggestions.products.length > 0 ? (
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Sản phẩm gợi ý
                    </div>
                    <div className="divide-y divide-slate-100">
                      {suggestions.products.map((p) => (
                        <Link
                          key={p.slug}
                          href={`/products/${p.slug}`}
                          onClick={() => setShowSearchDropdown(false)}
                          className="flex items-center justify-between py-2 px-2 hover:bg-slate-50 transition rounded"
                        >
                          <span className="text-xs font-medium text-slate-800 truncate pr-2">
                            {p.name}
                          </span>
                          <span className="text-xs font-bold text-[#192841] shrink-0">
                            {formatVND(p.price)}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Tìm kiếm phổ biến
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(suggestions?.popularSearches || popularSearches).length > 0 ? (
                        (suggestions?.popularSearches || popularSearches).map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleTagClick(tag)}
                            className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-[#192841] hover:text-white text-slate-700 rounded-sm transition font-medium"
                          >
                            {tag}
                          </button>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">Đang tải xu hướng tìm kiếm...</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Shopee Cart Icon with Hover Popover */}
          <div
            ref={cartRef}
            className="relative"
            onMouseEnter={() => setShowCartDropdown(true)}
            onMouseLeave={() => setShowCartDropdown(false)}
          >
            <Link
              href="/cart"
              className="relative p-2.5 sm:p-3 text-white hover:text-slate-200 transition flex items-center justify-center cursor-pointer"
              title="Giỏ hàng"
            >
              <ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.8]" />
              {totalCartQty > 0 && (
                <span className="absolute top-1 right-1 px-1.5 py-0.5 bg-red-500 text-white text-[11px] font-black rounded-full min-w-[20px] text-center shadow-md animate-in zoom-in border-2 border-[#192841]">
                  {totalCartQty}
                </span>
              )}
            </Link>

            {/* Shopee Cart Hover Dropdown Popover */}
            {showCartDropdown && (
              <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white text-slate-800 shadow-2xl border border-slate-200 rounded-sm z-50 animate-in fade-in slide-in-from-top-1 overflow-hidden">
                <div className="p-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500">
                  Sản phẩm mới thêm ({cartItems.length})
                </div>

                {cartItems.length > 0 ? (
                  <div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                      {cartItems.slice(0, 5).map((item) => (
                        <div
                          key={`${item.productId}-${item.variantName}`}
                          className="p-3 flex items-center gap-3 hover:bg-slate-50 transition"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 object-cover rounded-xs border border-slate-200 shrink-0"
                          />
                          <div className="flex-1 min-w-0 text-left">
                            <div className="text-xs font-medium text-slate-800 truncate">
                              {item.name}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Phân loại: {item.variantName || "Mặc định"} • x{item.quantity}
                            </div>
                          </div>
                          <div className="text-xs font-bold text-[#192841] shrink-0">
                            {formatVND(item.price)}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        {cartItems.length > 5 ? `Thêm ${cartItems.length - 5} sản phẩm khác vào giỏ` : ""}
                      </span>
                      <Link
                        href="/cart"
                        onClick={() => setShowCartDropdown(false)}
                        className="px-4 py-2 bg-[#192841] hover:bg-[#132034] text-white text-xs font-bold rounded-sm shadow-xs transition"
                      >
                        Xem Giỏ Hàng
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center flex flex-col items-center">
                    <ShoppingCart className="w-12 h-12 text-slate-300 mb-2 stroke-1" />
                    <span className="text-xs text-slate-500">Chưa có sản phẩm nào trong giỏ</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. SUB NAVIGATION BAR (Quick Shopee Links) */}
      <div className="bg-[#132034] border-t border-white/10 text-xs font-medium text-slate-200 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-9">
          <nav className="flex items-center gap-6 overflow-x-auto no-scrollbar">
            <Link href="/" className="hover:text-white transition py-1 flex items-center gap-1.5 font-bold text-white">
              Trang Chủ
            </Link>
            <Link href="/categories" className="hover:text-white transition py-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> Danh Mục
            </Link>
            <Link
              href="/products?sort=flash_sale"
              className="text-red-400 hover:text-red-300 font-bold transition py-1 flex items-center gap-1"
            >
              <Clock className="w-3.5 h-3.5 animate-pulse" /> FLASH SALE
            </Link>
            <Link
              href="/products?isTrending=true"
              className="text-amber-300 hover:text-amber-200 transition py-1 flex items-center gap-1 font-semibold"
            >
              <Flame className="w-3.5 h-3.5" /> Top Bán Chạy
            </Link>
            <Link href="/orders" className="hover:text-white transition py-1 flex items-center gap-1">
              <Package className="w-3.5 h-3.5" /> Tra Cứu Đơn Hàng
            </Link>
            <Link href="/about" className="hover:text-white transition py-1">
              Về Shopdee
            </Link>
            <Link href="/how-it-works" className="hover:text-white transition py-1">
              Chính Sách Giao Nhận 24h
            </Link>
          </nav>

          <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-medium">Freeship đơn từ 0₫ toàn quốc</span>
          </div>
        </div>
      </div>
    </header>
  );
}
