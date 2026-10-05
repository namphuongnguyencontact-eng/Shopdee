"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Zap,
  Flame,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Users,
  ShoppingBag,
  TrendingUp,
  Gift,
  Trophy,
  Tag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Clock,
} from "lucide-react";
import ProductCard, { ProductItem } from "@/components/shop/ProductCard";
import FlashSaleTimer from "@/components/shop/FlashSaleTimer";
import QuickViewModal from "@/components/shop/QuickViewModal";
import VoucherCard, { VoucherItem } from "@/components/shop/VoucherCard";

interface HomeClientViewProps {
  flashSaleProducts: ProductItem[];
  trendingProducts: ProductItem[];
  forYouProducts: ProductItem[];
  categories: Array<{ _id: string; name: string; slug: string; icon: string; image?: string }>;
  vouchers: VoucherItem[];
}

const HERO_SLIDES = [
  {
    id: 1,
    image: "/banners/hero-banner-1.png",
    alt: "SHOPDEE Flash Sale Deal Hot Giờ Vàng Freeship 0Đ",
    link: "https://shopdeevn.online/products",
    isExternal: false,
    hasCta: false,
  },
  {
    id: 2,
    image: "/banners/hero-banner-2.png",
    alt: "F88 Vay Siêu Tốc X6 Thu Nhập 15 Phút Có Tiền",
    link: "https://ctv.f88.vn/pawn/08df1df1-fbde-4099-8b66-ce0d323094d2",
    isExternal: true,
    hasCta: true,
    ctaText: "Vay ngay",
  },
];

const MINI_BANNERS = [
  {
    id: 1,
    image: "/banners/mini-banner-1.png",
    alt: "SHOPDEE Style - Nâng Trend Đồng Chất Voucher 25% - 50% Freeship 0Đ",
    link: "https://www.shopdeevn.online/category/thoi-trang-nu",
  },
  {
    id: 2,
    image: "/banners/mini-banner-2.png",
    alt: "SHOPDEE Flash Sale Đồ Dùng Xịn Giá Hời Back To School Laptop",
    link: "https://www.shopdeevn.online/products?category=laptop",
  },
];

export default function HomeClientView({
  flashSaleProducts,
  trendingProducts,
  forYouProducts,
  categories,
  vouchers,
}: HomeClientViewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState<ProductItem | null>(null);
  const [activeDiscoverTab, setActiveDiscoverTab] = useState<"for_you" | "trending">("for_you");

  const [liveMetrics, setLiveMetrics] = useState<{
    activeShoppers: number;
    cartAddsLastHour: number;
    successfulOrdersLastHour: number;
    loading: boolean;
  }>({
    activeShoppers: 0,
    cartAddsLastHour: 0,
    successfulOrdersLastHour: 0,
    loading: true,
  });

  // Auto carousel timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Realtime Live Shopping Metrics (SSE stream with polling fallback)
  useEffect(() => {
    let isMounted = true;

    const fetchDirect = () => {
      fetch("/api/live-metrics")
        .then((res) => res.json())
        .then((json) => {
          if (isMounted && json.success && json.data) {
            setLiveMetrics({
              activeShoppers: json.data.activeShoppers || 0,
              cartAddsLastHour: json.data.cartAddsLastHour || 0,
              successfulOrdersLastHour: json.data.successfulOrdersLastHour || 0,
              loading: false,
            });
          }
        })
        .catch(() => { });
    };

    fetchDirect();

    let eventSource: EventSource | null = null;
    let pollInterval: NodeJS.Timeout | null = null;

    try {
      eventSource = new EventSource("/api/live-metrics/stream");
      eventSource.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const data = JSON.parse(event.data);
          setLiveMetrics({
            activeShoppers: data.activeShoppers || 0,
            cartAddsLastHour: data.cartAddsLastHour || 0,
            successfulOrdersLastHour: data.successfulOrdersLastHour || 0,
            loading: false,
          });
        } catch { }
      };

      eventSource.onerror = () => {
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        if (!pollInterval) {
          pollInterval = setInterval(fetchDirect, 12000);
        }
      };
    } catch {
      pollInterval = setInterval(fetchDirect, 12000);
    }

    return () => {
      isMounted = false;
      if (eventSource) eventSource.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  const formatMetricNumber = (n: number): string => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return n.toString();
  };

  const displayedDiscoverProducts =
    activeDiscoverTab === "trending"
      ? (trendingProducts.length > 0 ? trendingProducts : forYouProducts)
      : forYouProducts;

  return (
    <div className="space-y-10 sm:space-y-14 pb-16">
      {/* 1. SHOPEE HERO SECTION (2/3 Carousel + 2 Stacked Right Banners) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5 sm:gap-3">
          {/* Main Slider (2/3 width) */}
          <div className="lg:col-span-2 relative overflow-hidden rounded-xs shadow-xs border border-slate-200/80 aspect-[1024/341] w-full bg-slate-900 group">
            {HERO_SLIDES.map((slide, idx) => {
              const isActive = currentSlide === idx;
              return (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-700 ${
                    isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 pointer-events-none z-0"
                  }`}
                >
                  <Link
                    href={slide.link}
                    target={slide.isExternal ? "_blank" : undefined}
                    rel={slide.isExternal ? "noopener noreferrer" : undefined}
                    className="relative block w-full h-full cursor-pointer select-none group/slide"
                  >
                    <img
                      src={slide.image}
                      alt={slide.alt}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/slide:scale-[1.01]"
                      loading={idx === 0 ? "eager" : "lazy"}
                    />

                    {slide.hasCta && (
                      <div className="absolute left-[46%] -translate-x-1/2 bottom-[10%] sm:bottom-[11%] md:bottom-[12%] z-10 pointer-events-none">
                        <span className="inline-flex items-center gap-1 sm:gap-2 px-3 py-1 sm:px-4 sm:py-1.5 md:px-5 md:py-2 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-extrabold text-[10px] sm:text-xs md:text-sm uppercase tracking-wider rounded-full shadow-lg shadow-black/30 border border-white/70 transition-transform duration-200 group-hover/slide:scale-105 active:scale-95 pointer-events-auto">
                          {slide.ctaText}
                          <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
                        </span>
                      </div>
                    )}
                  </Link>
                </div>
              );
            })}

            {/* Slider Navigation Arrows */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
              }}
              aria-label="Slide trước"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-9 sm:w-8 sm:h-10 bg-black/40 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-r-xs cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
              }}
              aria-label="Slide tiếp theo"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-9 sm:w-8 sm:h-10 bg-black/40 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-l-xs cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Carousel Dots */}
            <div className="absolute bottom-2 sm:bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide(i);
                  }}
                  aria-label={`Slide ${i + 1}`}
                  className={`h-1.5 transition-all rounded-full cursor-pointer ${
                    currentSlide === i ? "w-5 bg-white shadow-xs" : "w-1.5 bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Shopee Right Stacked Mini Banners (1/3 width) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-col gap-2.5 sm:gap-3">
            {MINI_BANNERS.map((banner) => (
              <Link
                key={banner.id}
                href={banner.link}
                className="flex-1 relative overflow-hidden rounded-xs shadow-xs border border-slate-200/80 aspect-[1024/342] lg:aspect-auto group cursor-pointer block select-none bg-slate-900"
              >
                <img
                  src={banner.image}
                  alt={banner.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  loading="lazy"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 2. SHOPEE SERVICE ICONS ROW (Circular shortcuts) */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="bg-white rounded-sm border border-slate-200/80 p-3 sm:p-4 shadow-xs">
          <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-2 text-center">
            {[
              { label: "Săn Sale", icon: <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />, link: "/products?sort=flash_sale" },
              { label: "Freeship", icon: <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />, link: "/how-it-works" },
              { label: "Voucher", icon: <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />, link: "/rewards" },
              { label: "Outlet", icon: <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#192841]" />, link: "/products" },
              { label: "Shopdee Xu", icon: <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />, link: "/rewards" },
              { label: "Xả Kho 50%", icon: <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />, link: "/products?sort=flash_sale" },
              { label: "Giao 24h", icon: <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />, link: "/how-it-works" },
              { label: "Mall", icon: <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />, link: "/products" },
              { label: "Bán Chạy", icon: <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />, link: "/products?isTrending=true" },
              { label: "Mã Giảm", icon: <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />, link: "/rewards" },
            ].map((item, idx) => (
              <Link
                key={idx}
                href={item.link}
                className="group flex flex-col items-center justify-start transition hover:-translate-y-0.5 active:scale-95"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center mb-1 shadow-2xs group-hover:border-[#192841] group-hover:bg-slate-100 transition">
                  {item.icon}
                </div>
                <span className="text-[10px] sm:text-[11px] font-medium text-slate-700 leading-snug line-clamp-2 max-w-[68px] sm:max-w-[72px] group-hover:text-[#192841] transition">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SHOPEE DANH MỤC (Bordered Category Grid) */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="bg-white rounded-sm border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3 sm:p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
              DANH MỤC SẢN PHẨM
            </h2>
            <Link
              href="/categories"
              className="text-xs font-semibold text-[#192841] hover:underline flex items-center gap-1"
            >
              Xem tất cả ({categories.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-12 divide-x divide-y divide-slate-100 text-center">
            {categories.slice(0, 16).map((cat) => (
              <Link
                key={cat._id}
                href={`/category/${cat.slug}`}
                className="group p-2 sm:p-3 flex flex-col items-center justify-center hover:shadow-md hover:z-10 transition bg-white active:bg-slate-50"
              >
                <div className="w-11 h-11 sm:w-14 sm:h-14 overflow-hidden mb-1.5 bg-slate-50 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform border border-slate-100/80">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          const fallback = parent.querySelector('.fallback-icon');
                          if (fallback) fallback.classList.remove('hidden');
                        }
                      }}
                    />
                  ) : null}
                  <Tag className={`w-5 h-5 text-[#192841] ${cat.image ? 'hidden fallback-icon' : ''}`} />
                </div>
                <h3 className="text-[10px] sm:text-xs font-medium text-slate-700 group-hover:text-[#192841] line-clamp-2 leading-tight">
                  {cat.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SHOPEE "GỢI Ý HÔM NAY" & "TOP BÁN CHẠY" (Daily Discover) */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Sticky Tab Header */}
        <div className="sticky top-14 sm:top-16 z-20 bg-white border-b-2 border-slate-200 shadow-2xs mb-4 rounded-t-sm">
          <div className="flex items-center justify-center sm:justify-start">
            <button
              type="button"
              onClick={() => setActiveDiscoverTab("for_you")}
              className={`py-3 px-6 sm:px-8 text-xs sm:text-sm font-black uppercase tracking-wide transition cursor-pointer ${
                activeDiscoverTab === "for_you"
                  ? "text-[#192841] border-b-4 border-[#192841] -mb-[2px]"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              GỢI Ý HÔM NAY
            </button>
            <button
              type="button"
              onClick={() => setActiveDiscoverTab("trending")}
              className={`py-3 px-6 sm:px-8 text-xs sm:text-sm font-black uppercase tracking-wide transition cursor-pointer ${
                activeDiscoverTab === "trending"
                  ? "text-[#192841] border-b-4 border-[#192841] -mb-[2px]"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              TOP BÁN CHẠY
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {displayedDiscoverProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>

        {/* Shopee "Xem Thêm" Button */}
        <div className="mt-8 text-center">
          <Link
            href={activeDiscoverTab === "trending" ? "/products?isTrending=true" : "/products"}
            className="inline-block w-64 sm:w-96 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xs shadow-2xs transition"
          >
            Xem Thêm
          </Link>
        </div>
      </section>

      {/* 5. SHOPEE FLASH SALE SECTION */}
      {flashSaleProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-sm border border-slate-200 shadow-xs p-4 sm:p-5">
            {/* Flash Sale Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <FlashSaleTimer />
              <Link
                href="/products?sort=flash_sale"
                className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
              >
                Xem tất cả &gt;
              </Link>
            </div>

            {/* Flash Sale Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
              {flashSaleProducts.slice(0, 12).map((product) => {
                const activePrice = product.flashSalePrice || product.price;
                const soldCount = typeof product.soldCount === "number" ? Math.max(0, product.soldCount) : 0;
                // Tính % tiến độ dựa trên số lượng bán thật
                const soldPercentage =
                  soldCount > 0
                    ? Math.min(100, Math.max(12, Math.round((soldCount / Math.max(soldCount + 5, 20)) * 100)))
                    : 0;

                return (
                  <div
                    key={product._id}
                    className="group bg-white border border-slate-200/90 rounded-xs hover:border-red-500 hover:shadow-md transition-all flex flex-col overflow-hidden"
                  >
                    <div className="relative aspect-square bg-slate-50 overflow-hidden">
                      <Link href={`/products/${product.slug}`}>
                        <img
                          src={product.images[0] || "/placeholder.png"}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>

                      {/* Discount ribbon */}
                      <div className="absolute top-0 right-0 bg-yellow-400 text-red-600 px-1.5 py-0.5 text-center font-black text-[10px] leading-tight shadow-xs">
                        -{product.discountPercent || 30}%
                      </div>
                    </div>

                    <div className="p-2.5 flex flex-col flex-1 justify-between text-center">
                      <div className="text-sm font-bold text-red-600">
                        ₫{activePrice.toLocaleString("vi-VN")}
                      </div>

                      {/* Shopee Fire Sale Progress Bar with Real Data */}
                      <div
                        className={`mt-2 relative w-full h-4 rounded-full overflow-hidden flex items-center justify-center ${
                          soldCount > 0 ? "bg-red-100" : "bg-slate-100 border border-slate-200"
                        }`}
                      >
                        {soldCount > 0 ? (
                          <>
                            <div
                              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-red-500 to-amber-500 rounded-full transition-all duration-500"
                              style={{ width: `${soldPercentage}%` }}
                            />
                            <span className="relative z-10 text-[9px] font-black text-white uppercase flex items-center gap-0.5 drop-shadow-xs">
                              🔥 ĐÃ BÁN {soldCount}
                            </span>
                          </>
                        ) : (
                          <span className="relative z-10 text-[9px] font-bold text-slate-500 uppercase flex items-center gap-0.5">
                            ĐÃ BÁN 0
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 5. SHOPDEE MALL SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-sm border border-slate-200 shadow-xs overflow-hidden">
          {/* Mall Header Bar */}
          <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 sm:gap-6">
              <Link href="/products" className="font-black text-sm sm:text-base text-red-600 uppercase tracking-tight flex items-center gap-1.5">
                <span className="px-2 py-0.5 bg-red-600 text-white rounded-xs text-xs font-black">MALL</span>
                SHOPDEE MALL
              </Link>
              <div className="hidden md:flex items-center gap-5 text-xs text-slate-600 font-medium">
                <span className="flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5 text-red-600" /> 7 Ngày Miễn Phí Trả Hàng
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-red-600" /> 100% Hàng Chính Hãng
                </span>
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-red-600" /> Miễn Phí Vận Chuyển
                </span>
              </div>
            </div>

            <Link
              href="/products"
              className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
            >
              Xem Tất Cả &gt;
            </Link>
          </div>

          {/* Mall Featured Products */}
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
            {trendingProducts.slice(0, 6).map((product) => (
              <ProductCard
                key={product._id}
                product={{ ...product, isFeatured: true }}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 6. VOUCHER CARDS (Kho Voucher) */}
      {vouchers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-sm border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h2 className="text-xs sm:text-sm font-bold text-slate-800 uppercase flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-rose-500" /> KHO VOUCHER GIẢM GIÁ
              </h2>
              <span className="text-[11px] text-slate-500">Thu thập mã giảm giá cho mọi đơn hàng</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {vouchers.map((v) => (
                <VoucherCard key={v._id} voucher={v} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
