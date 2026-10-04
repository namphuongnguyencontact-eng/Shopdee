"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Zap,
  Package,
  Layers,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Loader2,
  Sparkles,
  Info,
  CheckSquare,
  Square,
  RefreshCw,
} from "lucide-react";
import { formatVND } from "@/lib/utils";
import { showToast } from "@/store/useToastStore";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface ScrapedItem {
  id: string;
  selected: boolean;
  sourceUrl: string;
  name: string;
  price: number;
  originalPrice: number;
  brand: string;
  categoryId: string;
  images: string[];
  galleryImages: Array<{
    url: string;
    alt: string;
    sortOrder: number;
    isPrimary: boolean;
  }>;
  specifications: Array<{ label: string; value: string }>;
  variants: Array<{ name: string; options: string[] }>;
  shortDescription: string;
  description: string;
  descriptionHtml: string;
}

const SAMPLE_LINKS = [
  "https://shopee.vn/Apple-iPhone-15-128GB-Ch%C3%ADnh-h%C3%A3ng-VN-A-i.308461157.21684104015?is_from_login=true",
  "https://shopee.vn/product/88201654/18274910284",
  "https://shopee.vn/product/12345678/9876543210",
];

export default function BulkImportShopeePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [linksText, setLinksText] = useState("");
  const [isScraping, setIsScraping] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [items, setItems] = useState<ScrapedItem[]>([]);
  const [globalCategoryId, setGlobalCategoryId] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setCategories(json.data);
          if (json.data.length > 0) {
            setGlobalCategoryId(json.data[0]._id);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleInsertSample = () => {
    setLinksText(SAMPLE_LINKS.join("\n"));
  };

  const handleStartScrape = async () => {
    const rawLines = linksText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 10 && l.includes("shopee.vn"));

    if (rawLines.length === 0) {
      showToast({
        type: "error",
        message: "Vui lòng nhập ít nhất một link sản phẩm Shopee hợp lệ (chứa shopee.vn).",
      });
      return;
    }

    setIsScraping(true);
    try {
      const res = await fetch("/api/admin/products/scrape-shopee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: rawLines }),
      });

      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const defaultCat = globalCategoryId || (categories[0] ? categories[0]._id : "");

        const newItems: ScrapedItem[] = json.data.map((prod: any, idx: number) => ({
          id: `item_${Date.now()}_${idx}`,
          selected: true,
          sourceUrl: prod.sourceUrl || rawLines[idx] || "",
          name: prod.name || "Sản phẩm Shopee",
          price: prod.price || 100000,
          originalPrice: prod.originalPrice || prod.price * 1.2 || 120000,
          brand: prod.brand || "Chính Hãng",
          categoryId: defaultCat,
          images: prod.images || [],
          galleryImages: prod.galleryImages || [],
          specifications: prod.specifications || [],
          variants: prod.variants || [],
          shortDescription: prod.shortDescription || "",
          description: prod.description || "",
          descriptionHtml: prod.descriptionHtml || "",
        }));

        setItems(newItems);
        showToast({
          type: "success",
          message: `Quét thành công ${newItems.length} sản phẩm từ Shopee! Vui lòng chọn danh mục và xác nhận lưu.`,
        });
      } else {
        showToast({
          type: "error",
          message: json.error?.message || "Không thể quét sản phẩm từ các liên kết đã nhập.",
        });
      }
    } catch {
      showToast({
        type: "error",
        message: "Có lỗi xảy ra khi kết nối máy chủ quét dữ liệu Shopee.",
      });
    } finally {
      setIsScraping(false);
    }
  };

  const handleApplyGlobalCategory = () => {
    if (!globalCategoryId) return;
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        categoryId: globalCategoryId,
      }))
    );
    const catName = categories.find((c) => c._id === globalCategoryId)?.name || "";
    showToast({
      type: "success",
      message: `Đã áp dụng danh mục "${catName}" cho toàn bộ ${items.length} sản phẩm.`,
    });
  };

  const handleToggleSelectAll = () => {
    const allSelected = items.every((i) => i.selected);
    setItems((prev) => prev.map((i) => ({ ...i, selected: !allSelected })));
  };

  const handleItemCategoryChange = (id: string, catId: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, categoryId: catId } : i))
    );
  };

  const handleItemNameChange = (id: string, name: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, name } : i))
    );
  };

  const handleItemDelete = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleToggleSelect = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, selected: !i.selected } : i))
    );
  };

  const selectedCount = items.filter((i) => i.selected).length;

  const handleSaveAll = async () => {
    const toSave = items.filter((i) => i.selected);
    if (toSave.length === 0) {
      showToast({ type: "error", message: "Chưa chọn sản phẩm nào để thêm." });
      return;
    }

    const missingCategory = toSave.some((i) => !i.categoryId);
    if (missingCategory) {
      showToast({
        type: "error",
        message: "Vui lòng chọn danh mục cho tất cả các sản phẩm được đánh dấu.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: toSave }),
      });

      const json = await res.json();
      if (json.success) {
        showToast({
          type: "success",
          message: `Đã thêm thành công ${json.count} sản phẩm từ Shopee vào cửa hàng!`,
        });
        router.push("/admin/products");
      } else {
        showToast({
          type: "error",
          message: json.error?.message || "Lỗi khi lưu sản phẩm hàng loạt.",
        });
      }
    } catch {
      showToast({
        type: "error",
        message: "Lỗi kết nối máy chủ khi lưu sản phẩm hàng loạt.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 sticky top-0 bg-neutral-950/80 backdrop-blur-md py-4 z-20 border-b border-white/10 -mt-4 px-2">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" />
              Nhập Hàng Loạt Từ Shopee
            </h1>
            <p className="text-xs text-neutral-400">
              Quét tự động thông tin từ nhiều link Shopee cùng lúc và thêm nhanh vào danh mục
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition"
          >
            Quay lại
          </Link>
          {items.length > 0 && (
            <button
              onClick={handleSaveAll}
              disabled={isSaving || selectedCount === 0}
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-orange-500/25 transition disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Thêm ({selectedCount}) sản phẩm vào web
            </button>
          )}
        </div>
      </div>

      {/* Input Links Card */}
      <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-white text-sm font-bold">
            <Layers className="w-4 h-4 text-orange-400" />
            <span>Dán danh sách liên kết sản phẩm Shopee</span>
          </div>
          <button
            type="button"
            onClick={handleInsertSample}
            className="text-xs text-orange-400 hover:text-orange-300 underline font-medium cursor-pointer"
          >
            + Chèn link mẫu demo
          </button>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed">
          Mỗi dòng là một link sản phẩm Shopee (ví dụ:{" "}
          <code className="bg-neutral-800 px-1 py-0.5 rounded text-neutral-300">
            https://shopee.vn/Ten-San-Pham-i.123456.789012
          </code>
          ). Hệ thống sẽ quét tên, các ảnh, giá gốc/giá bán, thông số kỹ thuật, biến thể và mô tả chi tiết của từng sản phẩm.
        </p>

        <textarea
          value={linksText}
          onChange={(e) => setLinksText(e.target.value)}
          placeholder={`https://shopee.vn/Apple-iPhone-15-128GB-Ch%C3%ADnh-h%C3%A3ng-VN-A-i.308461157.21684104015\nhttps://shopee.vn/product/12345678/9876543210\n... (mỗi link 1 dòng)`}
          rows={5}
          className="w-full bg-neutral-950 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-neutral-500 font-mono outline-none focus:border-orange-500 transition"
        />

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="text-xs text-neutral-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-neutral-400" />
            <span>Hỗ trợ quét đa luồng nhiều link song song siêu nhanh</span>
          </div>

          <button
            type="button"
            onClick={handleStartScrape}
            disabled={isScraping || !linksText.trim()}
            className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-orange-600/30 transition disabled:opacity-50 cursor-pointer"
          >
            {isScraping ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 fill-white" />
            )}
            {isScraping ? "Đang quét dữ liệu từ Shopee..." : "Bắt đầu quét hàng loạt"}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {items.length > 0 && (
        <div className="space-y-4">
          {/* Batch Tools Bar */}
          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white transition cursor-pointer font-medium"
              >
                {items.every((i) => i.selected) ? (
                  <CheckSquare className="w-4 h-4 text-orange-500" />
                ) : (
                  <Square className="w-4 h-4 text-neutral-500" />
                )}
                <span>Chọn tất cả ({items.length})</span>
              </button>
              <span className="text-neutral-600">|</span>
              <span className="text-xs text-neutral-400">
                Đã chọn: <strong className="text-white font-bold">{selectedCount}</strong> /{" "}
                {items.length}
              </span>
            </div>

            {/* Quick Assign Category to All */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 shrink-0">Danh mục chung:</span>
              <select
                value={globalCategoryId}
                onChange={(e) => setGlobalCategoryId(e.target.value)}
                className="bg-neutral-800 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-orange-500"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleApplyGlobalCategory}
                className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-orange-400 border border-orange-500/20 text-xs font-semibold transition cursor-pointer"
              >
                Áp dụng cho tất cả
              </button>
            </div>
          </div>

          {/* List of Scraped Products */}
          <div className="space-y-3">
            {items.map((item, index) => {
              const mainImg = item.galleryImages[0]?.url || item.images[0] || "";
              return (
                <div
                  key={item.id}
                  className={`bg-neutral-900 border rounded-2xl p-4 transition ${
                    item.selected
                      ? "border-orange-500/40 bg-neutral-900/90 shadow-md shadow-orange-500/5"
                      : "border-white/5 opacity-60"
                  }`}
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => handleToggleSelect(item.id)}
                      className="cursor-pointer pt-1 md:pt-0 shrink-0"
                    >
                      {item.selected ? (
                        <CheckSquare className="w-5 h-5 text-orange-500" />
                      ) : (
                        <Square className="w-5 h-5 text-neutral-600" />
                      )}
                    </button>

                    {/* Image thumbnail & gallery count badge */}
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-neutral-800 shrink-0 border border-white/10">
                      {mainImg ? (
                        <img
                          src={mainImg}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-500">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                      <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-white text-center py-0.5 font-bold">
                        {item.galleryImages.length || item.images.length} ảnh
                      </span>
                    </div>

                    {/* Middle Info: Name & Specs summary */}
                    <div className="flex-1 space-y-1.5 min-w-0 w-full">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 shrink-0">
                          #{index + 1}
                        </span>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleItemNameChange(item.id, e.target.value)}
                          className="w-full bg-transparent border-b border-transparent hover:border-neutral-700 focus:border-orange-500 px-1 py-0.5 text-xs sm:text-sm font-bold text-white outline-none transition"
                        />
                      </div>

                      {/* Details Strip */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-400">
                        <span className="font-semibold text-emerald-400">
                          {formatVND(item.price)}
                        </span>
                        {item.originalPrice > item.price && (
                          <span className="line-through text-neutral-500 text-[11px]">
                            {formatVND(item.originalPrice)}
                          </span>
                        )}
                        <span className="text-neutral-600">•</span>
                        <span>Brand: {item.brand}</span>
                        <span className="text-neutral-600">•</span>
                        <span>{item.specifications.length} thông số</span>
                        <span className="text-neutral-600">•</span>
                        <span>
                          {item.variants.length > 0
                            ? item.variants.map((v) => `${v.name} (${v.options.length})`).join(", ")
                            : "Mặc định"}
                        </span>
                      </div>
                    </div>

                    {/* Category Selector for this item */}
                    <div className="shrink-0 flex items-center gap-3 w-full md:w-auto justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-semibold text-neutral-400">
                          Danh mục:
                        </label>
                        <select
                          value={item.categoryId}
                          onChange={(e) => handleItemCategoryChange(item.id, e.target.value)}
                          className="bg-neutral-800 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-orange-500"
                        >
                          {categories.map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleItemDelete(item.id)}
                        className="p-2 rounded-xl text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer self-end mb-0.5"
                        title="Xóa khỏi danh sách"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Save Bar */}
          <div className="sticky bottom-4 bg-neutral-900/95 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-2xl z-20">
            <div className="text-xs text-neutral-300">
              Đã sẵn sàng thêm{" "}
              <strong className="text-orange-400 font-bold text-sm">{selectedCount}</strong> sản
              phẩm vào hệ thống bán hàng.
            </div>

            <button
              onClick={handleSaveAll}
              disabled={isSaving || selectedCount === 0}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-orange-500/30 transition disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Xác nhận thêm hàng loạt ({selectedCount} sản phẩm)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
