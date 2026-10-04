"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Shield, Heart, HelpCircle, Truck, CreditCard, Smartphone, CheckCircle2 } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin") || pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <footer className="bg-[#fbfbfb] text-slate-600 border-t-4 border-[#192841] pt-12 pb-24 md:pb-12 text-xs font-normal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main 5 Columns (Classic Shopee Footer Directory) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 pb-10 border-b border-slate-200">
          {/* Column 1: Chăm Sóc Khách Hàng */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 text-xs tracking-wider uppercase">
              Chăm Sóc Khách Hàng
            </h4>
            <ul className="space-y-2 text-slate-500 text-[12px]">
              <li>
                <Link href="/how-it-works" className="hover:text-[#192841] transition">
                  Trung Tâm Trợ Giúp
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-[#192841] transition">
                  Hướng Dẫn Mua Hàng
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-[#192841] transition">
                  Hướng Dẫn Bán Hàng
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#192841] transition">
                  Trả Hàng & Hoàn Tiền 100%
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-[#192841] transition">
                  Tra Cứu Vận Chuyển Đơn Hàng
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#192841] transition">
                  Chính Sách Bảo Hành
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Về Shopdee */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 text-xs tracking-wider uppercase">
              Về SHOPDEE
            </h4>
            <ul className="space-y-2 text-slate-500 text-[12px]">
              <li>
                <Link href="/about" className="hover:text-[#192841] transition">
                  Giới Thiệu Về Shopdee Việt Nam
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#192841] transition">
                  Tuyển Dụng
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#192841] transition">
                  Điều Khoản Shopdee
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#192841] transition">
                  Chính Sách Bảo Mật
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-[#192841] transition">
                  Chính Hãng Shopdee Mall
                </Link>
              </li>
              <li>
                <Link href="/products?sort=flash_sale" className="hover:text-[#192841] transition">
                  Flash Sales Độc Quyền
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Thanh Toán & Vận Chuyển Grid */}
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-slate-800 text-xs tracking-wider uppercase mb-2.5">
                Thanh Toán
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {["VISA", "Mastercard", "JCB", "COD", "ShopeePay", "Trả Góp"].map((pay) => (
                  <div
                    key={pay}
                    className="h-8 bg-white border border-slate-200 rounded-sm flex items-center justify-center font-bold text-[10px] text-slate-700 shadow-xs"
                  >
                    {pay}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 text-xs tracking-wider uppercase mb-2.5">
                Đơn Vị Vận Chuyển
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {["SPX Express", "Giao Hàng Nhanh", "J&T Express", "Viettel Post", "VNPost", "Ninja Van"].map(
                  (ship) => (
                    <div
                      key={ship}
                      className="h-8 bg-white border border-slate-200 rounded-sm flex items-center justify-center font-semibold text-[9px] text-slate-600 shadow-xs px-1 text-center"
                    >
                      {ship}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Column 4: Theo Dõi Chúng Tôi */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 text-xs tracking-wider uppercase">
              Theo Dõi Chúng Tôi Trên
            </h4>
            <ul className="space-y-2 text-slate-500 text-[12px]">
              <li>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#192841] transition flex items-center gap-2"
                >
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                    f
                  </span>
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#192841] transition flex items-center gap-2"
                >
                  <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center text-[10px] font-bold">
                    ig
                  </span>
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#192841] transition flex items-center gap-2"
                >
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                    tt
                  </span>
                  TikTok
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#192841] transition flex items-center gap-2"
                >
                  <span className="w-5 h-5 rounded-full bg-sky-700 text-white flex items-center justify-center text-[10px] font-bold">
                    in
                  </span>
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>

          {/* Column 5: Tải Ứng Dụng Shopdee */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 text-xs tracking-wider uppercase">
              Tải Ứng Dụng SHOPDEE Ngay
            </h4>
            <div className="flex gap-2.5 items-start">
              {/* QR Code Mock */}
              <div className="w-20 h-20 bg-white border border-slate-200 p-1.5 rounded-sm shadow-xs flex flex-col items-center justify-center shrink-0">
                <div className="w-full h-full bg-slate-100 border border-slate-300 grid grid-cols-3 gap-0.5 p-1">
                  <div className="bg-[#192841]" />
                  <div className="bg-slate-300" />
                  <div className="bg-[#192841]" />
                  <div className="bg-slate-300" />
                  <div className="bg-[#192841]" />
                  <div className="bg-slate-300" />
                  <div className="bg-[#192841]" />
                  <div className="bg-slate-300" />
                  <div className="bg-[#192841]" />
                </div>
              </div>

              {/* App badges */}
              <div className="flex flex-col gap-1.5 justify-between">
                <div className="h-6 px-2.5 bg-white border border-slate-200 rounded-sm shadow-xs flex items-center justify-center text-[10px] font-bold text-slate-700">
                  App Store
                </div>
                <div className="h-6 px-2.5 bg-white border border-slate-200 rounded-sm shadow-xs flex items-center justify-center text-[10px] font-bold text-slate-700">
                  Google Play
                </div>
                <div className="h-6 px-2.5 bg-white border border-slate-200 rounded-sm shadow-xs flex items-center justify-center text-[10px] font-bold text-slate-700">
                  AppGallery
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Geographic / Country Coverage Bar (Shopee Signature) */}
        <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-slate-500 text-[12px] border-b border-slate-200">
          <div>
            © {new Date().getFullYear()} SHOPDEE. Tất cả các quyền được bảo lưu.
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-center text-slate-500">
            <span>Quốc gia & Khu vực:</span>
            {["Singapore", "Indonesia", "Thái Lan", "Malaysia", "Việt Nam", "Philippines", "Brazil", "Đài Loan"].map(
              (country, idx, arr) => (
                <span key={country}>
                  <span className="hover:text-[#192841] cursor-pointer">{country}</span>
                  {idx < arr.length - 1 && <span className="mx-1 text-slate-300">|</span>}
                </span>
              )
            )}
          </div>
        </div>

        {/* Corporate Legal & Compliance Bottom Bar */}
        <div className="pt-8 text-center text-[11px] text-slate-400 space-y-2 max-w-4xl mx-auto leading-relaxed">
          <div className="flex flex-wrap justify-center gap-4 text-slate-600 font-semibold uppercase text-[11px]">
            <Link href="/terms" className="hover:text-[#192841]">Chính Sách Bảo Mật</Link>
            <span>|</span>
            <Link href="/terms" className="hover:text-[#192841]">Quy Chế Hoạt Động</Link>
            <span>|</span>
            <Link href="/how-it-works" className="hover:text-[#192841]">Chính Sách Vận Chuyển</Link>
            <span>|</span>
            <Link href="/terms" className="hover:text-[#192841]">Chính Sách Trả Hàng & Hoàn Tiền</Link>
          </div>

          <div className="pt-3">
            <strong className="text-slate-600">CÔNG TY TNHH SHOPDEE VIỆT NAM</strong>
          </div>
          <div>
            Địa chỉ: Tầng 18, Tòa nhà Landmark 81, 720A Điện Biên Phủ, Phường 22, Quận Bình Thạnh, Thành phố Hồ Chí Minh, Việt Nam.
          </div>
          <div>
            Chịu Trách Nhiệm Quản Lý Nội Dung: Ban Quản Trị SHOPDEE - Điện thoại liên hệ: 1900 1221 (miễn phí)
          </div>
          <div>
            Mã số doanh nghiệp: 0106773786 do Sở Kế hoạch & Đầu tư TP Hồ Chí Minh cấp lần đầu ngày 10/02/2020.
          </div>
          <div>
            © 2026 - Bản quyền thuộc về Công ty TNHH Shopdee.
          </div>
        </div>
      </div>
    </footer>
  );
}
