"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, Package, ShoppingCart, User } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";

export default function MobileNav() {
  const pathname = usePathname();
  const { items: cartItems, setIsDrawerOpen } = useCartStore();
  const { user } = useAuthStore();

  const totalCartQty = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Hide on admin, login, register, cart, checkout, and product detail pages
  // because these pages have their own dedicated sticky bottom bars!
  if (
    pathname.startsWith("/admin") ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/cart" ||
    pathname === "/checkout" ||
    pathname.startsWith("/products/")
  ) {
    return null;
  }

  const navItems = [
    {
      href: "/",
      label: "Trang chủ",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      href: "/categories",
      label: "Danh mục",
      icon: Grid,
      isActive: pathname.startsWith("/categories") || pathname.startsWith("/category/"),
    },
    {
      href: "/orders",
      label: "Đơn mua",
      icon: Package,
      isActive: pathname.startsWith("/orders") || pathname.startsWith("/order/"),
    },
    {
      action: () => setIsDrawerOpen(true),
      label: "Giỏ hàng",
      icon: ShoppingCart,
      isButton: true,
      badge: totalCartQty,
    },
    {
      href: user ? "/profile" : "/login",
      label: user ? "Tôi" : "Đăng nhập",
      icon: User,
      isActive: pathname === "/profile" || pathname.startsWith("/profile/"),
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center justify-around select-none"
    >
      {navItems.map((item, idx) => {
        const Icon = item.icon;

        if (item.isButton) {
          return (
            <button
              key={idx}
              type="button"
              onClick={item.action}
              className="relative flex flex-col items-center justify-center py-1 px-3 min-w-[56px] text-slate-600 hover:text-[#192841] active:scale-95 transition-transform cursor-pointer"
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-in zoom-in">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] font-semibold mt-1 leading-none">{item.label}</span>
            </button>
          );
        }

        const isAct = item.isActive;

        return (
          <Link
            key={idx}
            href={item.href!}
            className={`relative flex flex-col items-center justify-center py-1 px-3 min-w-[56px] transition-all active:scale-95 ${
              isAct
                ? "text-[#192841] font-bold"
                : "text-slate-500 hover:text-slate-900 font-medium"
            }`}
          >
            <div className={`p-1 rounded-xl transition-colors ${isAct ? "bg-[#192841]/10" : ""}`}>
              <Icon className={`w-5 h-5 ${isAct ? "stroke-[2.4]" : "stroke-[1.8]"}`} />
            </div>
            <span className="text-[10px] mt-0.5 leading-none">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
