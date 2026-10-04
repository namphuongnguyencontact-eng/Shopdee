"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, SlidersHorizontal, ArrowUpDown, X, Sparkles, ChevronLeft, ChevronRight, PackageSearch } from "lucide-react";
import ProductCard, { ProductItem } from "@/components/shop/ProductCard";
import QuickViewModal from "@/components/shop/QuickViewModal";

interface CategoryOption {
  _id: string;
  name: string;
  slug: string;
  productCount: number;
}

interface ProductListingClientProps {
  products: ProductItem[];
  categories: CategoryOption[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function ProductListingClient({
  products,
  categories,
  pagination,
}: ProductListingClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") || "all";
  const currentSort = searchParams.get("sort") || "relevance";
  const currentSearch = searchParams.get("search") || "";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";
  const currentFlash = searchParams.get("isFlashSale") === "true";
  const currentTrend = searchParams.get("isTrending") === "true";

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<ProductItem | null>(null);

  // Price range input state
  const [minInput, setMinInput] = useState(currentMinPrice);
  const [maxInput, setMaxInput] = useState(currentMaxPrice);

  const updateFilters = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === "" || val === "all") {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    // Reset to page 1 on filter changes
    if (!newParams.page) {
      params.delete("page");
    }
    router.push(`/products?${params.toString()}`);
  };

  const clearAllFilters = () => {
    setMinInput("");
    setMaxInput("");
    router.push("/products");
  };

  const hasActiveFilters =
    currentCategory !== "all" ||
    !!currentSearch ||
    !!currentMinPrice ||
    !!currentMaxPrice ||
    currentFlash ||
    currentTrend;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
        <span className="hover:text-[#192841] cursor-pointer" onClick={() => router.push("/")}>Trang chủ</span>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="text-slate-800 font-medium">
          {currentSearch ? `Kết quả tìm kiếm cho '${currentSearch}'` : "Tất cả sản phẩm"}
        </span>
      </div>

      {/* Main Layout: Shopee Sidebar + Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {/* Desktop Shopee Filter Sidebar */}
        <aside className="hidden md:block md:col-span-1 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <Filter className="w-4 h-4 text-[#192841]" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              BỘ LỌC TÌM KIẾM
            </h2>
          </div>

          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div className="p-3 bg-blue-50/60 rounded-xs border border-blue-100 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                <span>Đang áp dụng</span>
                <button onClick={clearAllFilters} className="text-[11px] text-blue-600 hover:underline">
                  Xóa tất cả
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {currentCategory !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-white text-[11px] font-medium text-slate-700 border border-slate-200">
                    {categories.find((c) => c.slug === currentCategory)?.name || currentCategory}
                    <X
                      className="w-3 h-3 cursor-pointer text-slate-400 hover:text-slate-700"
                      onClick={() => updateFilters({ category: null })}
                    />
                  </span>
                )}
                {currentFlash && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-red-100 text-[11px] font-medium text-red-700">
                    Flash Sale
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => updateFilters({ isFlashSale: null })}
                    />
                  </span>
                )}
                {currentTrend && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-amber-100 text-[11px] font-medium text-amber-800">
                    Hot Trend
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => updateFilters({ isTrending: null })}
                    />
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Category Filter */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
              Theo Danh Mục
            </h3>
            <div className="space-y-1 text-xs">
              <button
                onClick={() => updateFilters({ category: "all" })}
                className={`w-full text-left px-2 py-1.5 rounded-xs font-medium transition flex items-center gap-2 ${
                  currentCategory === "all"
                    ? "text-[#192841] font-bold bg-slate-100"
                    : "text-slate-600 hover:text-[#192841]"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${currentCategory === "all" ? "bg-[#192841]" : "bg-transparent"}`} />
                Tất cả sản phẩm
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => updateFilters({ category: cat.slug })}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-xs font-medium transition ${
                    currentCategory === cat.slug
                      ? "text-[#192841] font-bold bg-slate-100"
                      : "text-slate-600 hover:text-[#192841]"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className={`w-1.5 h-1.5 rounded-full ${currentCategory === cat.slug ? "bg-[#192841]" : "bg-transparent"}`} />
                    <span className="truncate">{cat.name}</span>
                  </div>
                  {cat.productCount > 0 && (
                    <span className="text-[10px] text-slate-400">({cat.productCount})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Location Filter (Shopee Nơi Bán) */}
          <div className="pt-3 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
              Nơi Bán
            </h3>
            <div className="space-y-2 text-xs text-slate-700">
              {["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Bình Dương", "Nước Ngoài"].map((loc) => (
                <label key={loc} className="flex items-center gap-2 cursor-pointer hover:text-[#192841]">
                  <input type="checkbox" className="rounded-xs border-slate-300 text-[#192841] focus:ring-[#192841]" />
                  <span>{loc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Shipping Unit (Shopee Đơn Vị Vận Chuyển) */}
          <div className="pt-3 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
              Đơn Vị Vận Chuyển
            </h3>
            <div className="space-y-2 text-xs text-slate-700">
              {["Hỏa Tốc 2H", "Nhanh", "Tiết Kiệm", "Hàng Cồng Kềnh"].map((ship) => (
                <label key={ship} className="flex items-center gap-2 cursor-pointer hover:text-[#192841]">
                  <input type="checkbox" className="rounded-xs border-slate-300 text-[#192841] focus:ring-[#192841]" />
                  <span>{ship}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="pt-3 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
              Khoảng Giá (₫)
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="₫ TỪ"
                  value={minInput}
                  onChange={(e) => setMinInput(e.target.value)}
                  className="w-full h-8 px-2 rounded-xs border border-slate-300 text-xs text-slate-800 outline-none focus:border-[#192841]"
                />
                <span className="text-slate-400 text-xs">-</span>
                <input
                  type="number"
                  placeholder="₫ ĐẾN"
                  value={maxInput}
                  onChange={(e) => setMaxInput(e.target.value)}
                  className="w-full h-8 px-2 rounded-xs border border-slate-300 text-xs text-slate-800 outline-none focus:border-[#192841]"
                />
              </div>
              <button
                onClick={() => updateFilters({ minPrice: minInput || null, maxPrice: maxInput || null })}
                className="w-full h-8 bg-[#192841] hover:bg-[#132034] text-white font-bold text-xs uppercase tracking-wide rounded-xs transition cursor-pointer"
              >
                ÁP DỤNG
              </button>
            </div>
          </div>

          {/* Quick Badges Filter */}
          <div className="pt-3 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
              Dịch Vụ & Khuyến Mãi
            </h3>
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium hover:text-[#192841]">
                <input
                  type="checkbox"
                  checked={currentFlash}
                  onChange={(e) => updateFilters({ isFlashSale: e.target.checked ? "true" : null })}
                  className="rounded-xs border-slate-300 text-[#192841] focus:ring-[#192841]"
                />
                ⚡ Đang Flash Sale
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium hover:text-[#192841]">
                <input
                  type="checkbox"
                  checked={currentTrend}
                  onChange={(e) => updateFilters({ isTrending: e.target.checked ? "true" : null })}
                  className="rounded-xs border-slate-300 text-[#192841] focus:ring-[#192841]"
                />
                🔥 Hàng Bán Chạy / Hot Trend
              </label>
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="pt-3 border-t border-slate-200">
              <button
                onClick={clearAllFilters}
                className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-xs transition cursor-pointer"
              >
                XÓA TẤT CẢ BỘ LỌC
              </button>
            </div>
          )}
        </aside>

        {/* Products Area */}
        <div className="md:col-span-3 lg:col-span-4 space-y-4">
          {/* Shopee Sorting Toolbar */}
          <div className="bg-[#ededed] p-3 rounded-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Left: Sort buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-600 font-medium mr-1">Sắp xếp theo</span>

              <button
                onClick={() => updateFilters({ sort: "relevance" })}
                className={`px-4 py-2 font-medium rounded-xs transition cursor-pointer ${
                  currentSort === "relevance"
                    ? "bg-[#192841] text-white shadow-xs font-bold"
                    : "bg-white text-slate-800 hover:bg-slate-50"
                }`}
              >
                Phổ biến
              </button>

              <button
                onClick={() => updateFilters({ sort: "newest" })}
                className={`px-4 py-2 font-medium rounded-xs transition cursor-pointer ${
                  currentSort === "newest"
                    ? "bg-[#192841] text-white shadow-xs font-bold"
                    : "bg-white text-slate-800 hover:bg-slate-50"
                }`}
              >
                Mới nhất
              </button>

              <button
                onClick={() => updateFilters({ sort: "best_seller" })}
                className={`px-4 py-2 font-medium rounded-xs transition cursor-pointer ${
                  currentSort === "best_seller"
                    ? "bg-[#192841] text-white shadow-xs font-bold"
                    : "bg-white text-slate-800 hover:bg-slate-50"
                }`}
              >
                Bán chạy
              </button>

              {/* Price Dropdown Selector */}
              <div className="relative">
                <select
                  value={currentSort.startsWith("price_") ? currentSort : ""}
                  onChange={(e) => updateFilters({ sort: e.target.value })}
                  className="h-8 px-3 rounded-xs bg-white text-slate-800 font-medium outline-none cursor-pointer border border-transparent hover:border-slate-300"
                >
                  <option value="" disabled>Giá</option>
                  <option value="price_asc">Giá: Thấp đến Cao</option>
                  <option value="price_desc">Giá: Cao đến Thấp</option>
                </select>
              </div>

              {/* Mobile Filter Button */}
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="md:hidden flex items-center gap-1 px-3 py-2 rounded-xs bg-white text-slate-800 font-bold"
              >
                <Filter className="w-3.5 h-3.5 text-[#192841]" /> Lọc
              </button>
            </div>

            {/* Right: Mini Pagination */}
            {pagination.totalPages > 1 && (
              <div className="hidden sm:flex items-center gap-3">
                <span className="text-slate-600">
                  <strong className="text-[#192841]">{pagination.page}</strong>/{pagination.totalPages}
                </span>
                <div className="flex items-center">
                  <button
                    disabled={pagination.page <= 1}
                    onClick={() => updateFilters({ page: (pagination.page - 1).toString() })}
                    className="w-8 h-8 bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none rounded-l-xs cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => updateFilters({ page: (pagination.page + 1).toString() })}
                    className="w-8 h-8 bg-white border border-l-0 border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none rounded-r-xs cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Products Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {products.map((p) => (
                <ProductCard
                  key={p._id}
                  product={p}
                  onQuickView={(prod) => setQuickViewProduct(prod)}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center flex flex-col items-center justify-center space-y-3 bg-white border border-slate-200 p-8 rounded-xs">
              <div className="w-16 h-16 bg-slate-100 text-[#192841] flex items-center justify-center rounded-full">
                <PackageSearch className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Không tìm thấy sản phẩm phù hợp</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Hãy thử nới lỏng bộ lọc giá hoặc tìm kiếm với từ khóa khác nhé!
              </p>
              <button
                onClick={clearAllFilters}
                className="px-5 py-2 bg-[#192841] hover:bg-[#132034] text-white text-xs font-bold transition rounded-xs cursor-pointer uppercase tracking-wider"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          )}

          {/* Bottom Pagination */}
          {pagination.totalPages > 1 && (() => {
            const total = pagination.totalPages;
            const current = pagination.page;
            let start = 1;
            let end = Math.min(5, total);

            if (total > 5) {
              start = Math.max(1, current - 2);
              end = start + 4;
              if (end > total) {
                end = total;
                start = Math.max(1, end - 4);
              }
            }

            const visiblePages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

            return (
              <div className="flex items-center justify-center gap-2 pt-8 pb-4">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => updateFilters({ page: (pagination.page - 1).toString() })}
                  className="w-9 h-8 border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer flex items-center justify-center rounded-xs"
                  title="Trang trước"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {visiblePages.map((num) => (
                  <button
                    key={num}
                    onClick={() => updateFilters({ page: num.toString() })}
                    className={`w-9 h-8 text-xs font-bold transition cursor-pointer rounded-xs ${
                      pagination.page === num
                        ? "bg-[#192841] text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {num}
                  </button>
                ))}

                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => updateFilters({ page: (pagination.page + 1).toString() })}
                  className="w-9 h-8 border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer flex items-center justify-center rounded-xs"
                  title="Trang sau"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      {/* Mobile Filters Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            onClick={() => setIsMobileFilterOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl flex flex-col justify-between overflow-y-auto z-10 animate-in slide-in-from-right">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-[#192841]" /> BỘ LỌC TÌM KIẾM
                </h2>
                <button onClick={() => setIsMobileFilterOpen(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Category options */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                  Danh mục
                </h4>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      updateFilters({ category: "all" });
                      setIsMobileFilterOpen(false);
                    }}
                    className="w-full text-left py-1.5 text-xs font-semibold text-slate-700"
                  >
                    Tất cả danh mục
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c._id}
                      onClick={() => {
                        updateFilters({ category: c.slug });
                        setIsMobileFilterOpen(false);
                      }}
                      className="w-full text-left py-1.5 text-xs font-semibold text-slate-700"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  clearAllFilters();
                  setIsMobileFilterOpen(false);
                }}
                className="w-full py-2.5 rounded-xs border border-slate-300 text-xs font-bold text-slate-700"
              >
                Xóa tất cả
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
