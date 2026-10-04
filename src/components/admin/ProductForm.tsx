"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Package,
  Sparkles,
  Zap,
  Globe,
  FileText,
  DollarSign,
  Tag,
  Loader2,
  CheckCircle2,
  Plus,
  Trash2,
  ListPlus,
  Sliders,
  ExternalLink,
  Layers,
  HelpCircle,
  X,
} from "lucide-react";
import ImageGalleryManager, { GalleryImage } from "./ImageGalleryManager";
import RichTextEditor from "./RichTextEditor";
import { showToast } from "@/store/useToastStore";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Specification {
  label: string;
  value: string;
}

interface Variant {
  name: string;
  options: string[];
}

interface ProductFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export default function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Shopee Scraper Bar State
  const [shopeeUrl, setShopeeUrl] = useState("");
  const [isScrapingShopee, setIsScrapingShopee] = useState(false);

  // Form State
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [brand, setBrand] = useState(initialData?.brand || "Shopdee Studio");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
  const [status, setStatus] = useState<"active" | "draft" | "archived">(
    initialData?.status || "active"
  );

  const [price, setPrice] = useState(initialData?.price ? String(initialData.price) : "");
  const [originalPrice, setOriginalPrice] = useState(
    initialData?.originalPrice ? String(initialData.originalPrice) : ""
  );
  const [stock, setStock] = useState(
    initialData?.stock !== undefined ? String(initialData.stock) : "100"
  );
  const [isFlashSale, setIsFlashSale] = useState(Boolean(initialData?.isFlashSale));
  const [flashSalePrice, setFlashSalePrice] = useState(
    initialData?.flashSalePrice ? String(initialData.flashSalePrice) : ""
  );
  const [isTrending, setIsTrending] = useState(Boolean(initialData?.isTrending));
  const [isFeatured, setIsFeatured] = useState(Boolean(initialData?.isFeatured));

  // Specifications
  const [specifications, setSpecifications] = useState<Specification[]>(() => {
    if (Array.isArray(initialData?.specifications) && initialData.specifications.length > 0) {
      return initialData.specifications;
    }
    return [
      { label: "Thương hiệu", value: initialData?.brand || "Shopdee Studio" },
      { label: "Xuất xứ", value: "Việt Nam / Chính Hãng" },
      { label: "Tình trạng", value: "Mới 100% Nguyên Hộp" },
      { label: "Bảo hành", value: "12 Tháng Chính Hãng" },
    ];
  });

  // Variants (Cho khách chọn khi mua: Dung lượng 128GB, 256GB / Size S, M, L / Màu sắc)
  const [variants, setVariants] = useState<Variant[]>(() => {
    if (Array.isArray(initialData?.variants) && initialData.variants.length > 0) {
      return initialData.variants;
    }
    return [{ name: "Kích thước", options: ["Freesize"] }];
  });

  // New option inputs helper per variant
  const [newOptionInputs, setNewOptionInputs] = useState<Record<number, string>>({});

  // Media (Multiple gallery images)
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(() => {
    if (initialData?.galleryImages && initialData.galleryImages.length > 0) {
      return initialData.galleryImages;
    }
    if (initialData?.images && initialData.images.length > 0) {
      return initialData.images.map((url: string, i: number) => ({
        url,
        sortOrder: i,
        isPrimary: i === 0,
      }));
    }
    return [];
  });

  // Descriptions
  const [shortDescription, setShortDescription] = useState(
    initialData?.shortDescription || ""
  );
  const [description, setDescription] = useState(initialData?.description || "");
  const [descriptionHtml, setDescriptionHtml] = useState(
    initialData?.descriptionHtml || ""
  );

  // SEO
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(
    initialData?.seoDescription || ""
  );
  const [seoKeywords, setSeoKeywords] = useState(
    Array.isArray(initialData?.seoKeywords)
      ? initialData.seoKeywords.join(", ")
      : initialData?.seoKeywords || ""
  );

  // Fetch categories
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setCategories(json.data);
          if (!categoryId && json.data.length > 0) {
            setCategoryId(json.data[0]._id);
          }
        }
      })
      .catch(() => {});
  }, [categoryId]);

  // Handle Shopee Scrape
  const handleScrapeShopee = async () => {
    if (!shopeeUrl.trim()) {
      showToast({ type: "error", message: "Vui lòng nhập link sản phẩm Shopee." });
      return;
    }

    setIsScrapingShopee(true);
    try {
      const res = await fetch("/api/admin/products/scrape-shopee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: shopeeUrl.trim() }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        if (d.name) setName(d.name);
        if (d.price) setPrice(String(d.price));
        if (d.originalPrice) setOriginalPrice(String(d.originalPrice));
        if (d.brand) setBrand(d.brand);

        if (Array.isArray(d.galleryImages) && d.galleryImages.length > 0) {
          setGalleryImages(d.galleryImages);
        } else if (Array.isArray(d.images) && d.images.length > 0) {
          setGalleryImages(
            d.images.map((url: string, idx: number) => ({
              url,
              sortOrder: idx,
              isPrimary: idx === 0,
            }))
          );
        }

        if (Array.isArray(d.specifications) && d.specifications.length > 0) {
          setSpecifications(d.specifications);
        }

        if (Array.isArray(d.variants) && d.variants.length > 0) {
          setVariants(d.variants);
        }

        if (d.shortDescription) setShortDescription(d.shortDescription);
        if (d.description) setDescription(d.description);
        if (d.descriptionHtml) setDescriptionHtml(d.descriptionHtml);
        if (d.name) setSeoTitle(`${d.name} | Shopdee`);
        if (d.shortDescription) setSeoDescription(d.shortDescription);

        showToast({
          type: "success",
          message: "Đã quét toàn bộ thông tin từ Shopee thành công! Vui lòng chọn danh mục phù hợp.",
        });
      } else {
        showToast({
          type: "error",
          message: json.error?.message || "Không thể quét thông tin từ link này.",
        });
      }
    } catch {
      showToast({ type: "error", message: "Lỗi kết nối máy chủ khi quét dữ liệu Shopee." });
    } finally {
      setIsScrapingShopee(false);
    }
  };

  // Specification helpers
  const handleAddSpecification = (label = "", value = "") => {
    setSpecifications((prev) => [...prev, { label, value }]);
  };

  const handleUpdateSpecification = (index: number, field: "label" | "value", val: string) => {
    setSpecifications((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleDeleteSpecification = (index: number) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== index));
  };

  // Variant helpers
  const handleAddVariantGroup = (name = "Biến thể mới", options = ["Lựa chọn 1"]) => {
    setVariants((prev) => [...prev, { name, options }]);
  };

  const handleUpdateVariantName = (index: number, newName: string) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], name: newName };
      return copy;
    });
  };

  const handleAddOptionToVariant = (index: number) => {
    const text = (newOptionInputs[index] || "").trim();
    if (!text) return;
    setVariants((prev) => {
      const copy = [...prev];
      if (!copy[index].options.includes(text)) {
        copy[index] = {
          ...copy[index],
          options: [...copy[index].options, text],
        };
      }
      return copy;
    });
    setNewOptionInputs((prev) => ({ ...prev, [index]: "" }));
  };

  const handleRemoveOptionFromVariant = (vIndex: number, optIndex: number) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[vIndex] = {
        ...copy[vIndex],
        options: copy[vIndex].options.filter((_, i) => i !== optIndex),
      };
      return copy;
    });
  };

  const handleDeleteVariantGroup = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast({ type: "error", message: "Vui lòng nhập tên sản phẩm." });
      return;
    }
    if (!price || Number(price) <= 0) {
      showToast({ type: "error", message: "Vui lòng nhập giá hợp lệ." });
      return;
    }
    if (!categoryId) {
      showToast({ type: "error", message: "Vui lòng chọn danh mục." });
      return;
    }
    if (galleryImages.length === 0) {
      showToast({ type: "error", message: "Vui lòng thêm ít nhất một hình ảnh sản phẩm." });
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = {
        name: name.trim(),
        slug: slug.trim() || undefined,
        brand: brand.trim(),
        categoryId,
        status,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : Number(price),
        stock: Number(stock) || 0,
        isFlashSale,
        flashSalePrice: isFlashSale && flashSalePrice ? Number(flashSalePrice) : undefined,
        isTrending,
        isFeatured,
        galleryImages,
        images: galleryImages.map((g) => g.url),
        specifications: specifications.filter((s) => s.label.trim() && s.value.trim()),
        variants: variants.filter((v) => v.name.trim() && v.options.length > 0),
        shortDescription: shortDescription.trim(),
        description: description.trim() || shortDescription.trim() || name.trim(),
        descriptionHtml: descriptionHtml.trim(),
        seoTitle: seoTitle.trim(),
        seoDescription: seoDescription.trim(),
        seoKeywords: seoKeywords
          ? seoKeywords
              .split(",")
              .map((k: string) => k.trim())
              .filter(Boolean)
          : [],
      };

      if (isEdit && (initialData?._id || initialData?.id)) {
        payload.id = initialData._id || initialData.id;
      }

      const res = await fetch("/api/admin/products", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        showToast({
          type: "success",
          message: isEdit ? "Cập nhật sản phẩm thành công!" : "Tạo sản phẩm mới thành công!",
        });
        router.push("/admin/products");
      } else {
        showToast({ type: "error", message: json.error?.message || "Lỗi lưu sản phẩm." });
      }
    } catch {
      showToast({ type: "error", message: "Có lỗi xảy ra khi kết nối máy chủ." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-6xl mx-auto pb-20">
      {/* Top Header Sticky Bar */}
      <div className="flex items-center justify-between gap-2 sticky top-0 bg-neutral-950/90 backdrop-blur-md py-3 z-20 border-b border-white/10 -mt-4 px-2 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href="/admin/products"
            className="p-1.5 sm:p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-black text-white flex items-center gap-1.5 sm:gap-2 truncate">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 shrink-0" />
              <span className="truncate">{isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</span>
            </h1>
            <p className="text-[11px] sm:text-xs text-neutral-400 hidden sm:block">
              Quản lý thông số kỹ thuật, đa ảnh thiết bị, các biến thể lựa chọn và quét tự động Shopee
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin/products"
            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition"
          >
            Hủy
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="px-3.5 py-1.5 sm:px-5 sm:py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-blue-500/20 transition disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            <span>{isEdit ? "Lưu" : "Đăng bán"}</span>
          </button>
        </div>
      </div>

      {/* Shopee Auto-Scraper Quick Card (Highlighted feature) */}
      {!isEdit && (
        <div className="bg-gradient-to-r from-orange-950/50 via-neutral-900 to-neutral-900 border border-orange-500/30 rounded-2xl p-5 space-y-3 relative overflow-hidden shadow-lg shadow-orange-500/5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-orange-400 text-xs font-black tracking-wide uppercase">
              <Zap className="w-4 h-4 fill-orange-400" />
              <span>Tiện ích tự động: Quét thông tin từ link Shopee</span>
            </div>
            <Link
              href="/admin/products/import-shopee"
              className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 font-semibold underline cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              Nhập hàng loạt bằng nhiều link Shopee cùng lúc →
            </Link>
          </div>

          <p className="text-xs text-neutral-400">
            Dán đường link sản phẩm Shopee (ví dụ:{" "}
            <code className="text-orange-300 bg-orange-950/60 px-1 py-0.5 rounded">
              https://shopee.vn/Apple-iPhone-15-128GB...
            </code>
            ). Hệ thống sẽ tự động quét: Tên, Giá, Ảnh sản phẩm, Thông số kỹ thuật, Các lựa chọn (Dung lượng, Size...) và Mô tả sản phẩm.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="url"
              value={shopeeUrl}
              onChange={(e) => setShopeeUrl(e.target.value)}
              placeholder="Dán link sản phẩm Shopee vào đây..."
              className="w-full bg-neutral-950 border border-orange-500/40 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-orange-400 transition font-mono"
            />
            <button
              type="button"
              onClick={handleScrapeShopee}
              disabled={isScrapingShopee || !shopeeUrl.trim()}
              className="w-full sm:w-auto shrink-0 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-orange-500/25 transition disabled:opacity-50 cursor-pointer"
            >
              {isScrapingShopee ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 fill-white" />
              )}
              {isScrapingShopee ? "Đang quét..." : "Quét thông tin"}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Main Info, Specs, Variants, Gallery, Rich Text */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Basic Info */}
          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" /> Thông tin cơ bản
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Tên sản phẩm <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Apple iPhone 15 128GB Chính Hãng VN/A"
                  className="w-full bg-neutral-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-blue-500 transition"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Thương hiệu / Brand
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Ví dụ: Apple, Samsung, Shopdee Studio..."
                    className="w-full bg-neutral-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Danh mục <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-neutral-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500 transition"
                    required
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Mô tả ngắn gọn (Short Description)
                </label>
                <textarea
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="1-2 câu tóm tắt điểm nổi bật nhất của sản phẩm..."
                  rows={2}
                  className="w-full bg-neutral-800 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-neutral-500 outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Product Specifications (Thông số sản phẩm) */}
          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <ListPlus className="w-4 h-4 text-emerald-400" /> Thông số kỹ thuật / Đặc tính sản phẩm
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Bổ sung các thông số chi tiết hiển thị ở mục &quot;Chi tiết sản phẩm&quot;
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleAddSpecification("", "")}
                className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm thông số
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 pb-2">
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold mr-1">
                Gợi ý nhanh:
              </span>
              {[
                { l: "Thương hiệu", v: brand || "Apple" },
                { l: "Xuất xứ", v: "Chính Hãng" },
                { l: "Bảo hành", v: "12 Tháng Chính Hãng" },
                { l: "Dung lượng", v: "128GB" },
                { l: "Chất liệu", v: "Cotton 100% cao cấp" },
                { l: "Kích thước", v: "Freesize / Tiêu chuẩn" },
                { l: "Tình trạng", v: "Mới 100% Nguyên Hộp" },
              ].map((preset) => (
                <button
                  key={preset.l}
                  type="button"
                  onClick={() => handleAddSpecification(preset.l, preset.v)}
                  className="px-2 py-0.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] border border-white/5 transition cursor-pointer"
                >
                  +{preset.l}
                </button>
              ))}
            </div>

            {/* Specs Table */}
            <div className="space-y-2">
              {specifications.length === 0 ? (
                <div className="text-center py-6 text-xs text-neutral-500 border border-dashed border-white/10 rounded-xl">
                  Chưa có thông số nào. Nhấn nút &quot;Thêm thông số&quot; để bổ sung thông số cho sản phẩm này.
                </div>
              ) : (
                specifications.map((spec, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={spec.label}
                      onChange={(e) => handleUpdateSpecification(idx, "label", e.target.value)}
                      placeholder="Tên thông số (vd: Bộ nhớ, Chất liệu...)"
                      className="w-1/3 bg-neutral-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-emerald-500"
                    />
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => handleUpdateSpecification(idx, "value", e.target.value)}
                      placeholder="Giá trị (vd: 256GB, Cotton 100%...)"
                      className="flex-1 bg-neutral-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteSpecification(idx)}
                      className="p-2 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
                      title="Xóa thông số này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Card 3: Product Variants (Biến thể cho khách hàng chọn khi mua) */}
          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-purple-400" /> Biến thể & Thuộc tính lựa chọn
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Khách hàng có thể bấm chọn biến thể khi mua (vd: Dung lượng 128GB, 256GB; Kích cỡ S, M, L; Màu sắc...)
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleAddVariantGroup("Biến thể mới", ["Tùy chọn 1"])}
                className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm nhóm biến thể
              </button>
            </div>

            {/* Quick Preset Buttons for Common Product Types */}
            <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold mr-1">
                Mẫu nhanh:
              </span>
              <button
                type="button"
                onClick={() => {
                  setVariants([
                    { name: "Dung lượng", options: ["128GB", "256GB", "512GB", "1TB"] },
                    { name: "Màu sắc", options: ["Titan Tự Nhiên", "Titan Đen", "Titan Xanh", "Titan Trắng"] },
                  ]);
                  showToast({ type: "success", message: "Đã áp dụng mẫu biến thể Điện thoại!" });
                }}
                className="px-2.5 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-purple-300 text-xs border border-purple-500/20 transition cursor-pointer"
              >
                📱 Điện thoại (Dung lượng, Màu)
              </button>
              <button
                type="button"
                onClick={() => {
                  setVariants([
                    { name: "Kích cỡ", options: ["S", "M", "L", "XL", "XXL"] },
                    { name: "Màu sắc", options: ["Đen", "Trắng", "Xám Tiêu", "Be / Kem"] },
                  ]);
                  showToast({ type: "success", message: "Đã áp dụng mẫu biến thể Quần áo!" });
                }}
                className="px-2.5 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-purple-300 text-xs border border-purple-500/20 transition cursor-pointer"
              >
                👕 Thời trang (Size S, M, L, XL)
              </button>
              <button
                type="button"
                onClick={() => {
                  setVariants([
                    { name: "Size giày", options: ["38", "39", "40", "41", "42", "43"] },
                    { name: "Màu sắc", options: ["Trắng / Đen", "All White", "All Black"] },
                  ]);
                  showToast({ type: "success", message: "Đã áp dụng mẫu biến thể Giày dép!" });
                }}
                className="px-2.5 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-purple-300 text-xs border border-purple-500/20 transition cursor-pointer"
              >
                👟 Giày dép (Size 38-43)
              </button>
            </div>

            {/* List of Variant Groups */}
            <div className="space-y-4">
              {variants.map((v, vIdx) => (
                <div
                  key={vIdx}
                  className="bg-neutral-950/80 border border-white/10 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-neutral-300">Tên thuộc tính:</span>
                      <input
                        type="text"
                        value={v.name}
                        onChange={(e) => handleUpdateVariantName(vIdx, e.target.value)}
                        placeholder="vd: Dung lượng, Kích cỡ, Màu sắc..."
                        className="bg-neutral-800 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white font-bold outline-none focus:border-purple-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteVariantGroup(vIdx)}
                      className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                      title="Xóa nhóm biến thể này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Options tags */}
                  <div className="space-y-2">
                    <span className="text-[11px] text-neutral-400">Các lựa chọn khả dụng:</span>
                    <div className="flex flex-wrap items-center gap-2">
                      {v.options.map((opt, optIdx) => (
                        <span
                          key={optIdx}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-800 border border-white/10 text-xs text-neutral-200"
                        >
                          <span>{opt}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveOptionFromVariant(vIdx, optIdx)}
                            className="text-neutral-400 hover:text-rose-400 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}

                      {/* Add new option input */}
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={newOptionInputs[vIdx] || ""}
                          onChange={(e) =>
                            setNewOptionInputs((prev) => ({
                              ...prev,
                              [vIdx]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddOptionToVariant(vIdx);
                            }
                          }}
                          placeholder="Thêm lựa chọn..."
                          className="w-32 bg-neutral-900 border border-dashed border-white/20 rounded-lg px-2.5 py-1 text-xs text-white placeholder-neutral-500 outline-none focus:border-purple-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddOptionToVariant(vIdx)}
                          className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-purple-400 text-xs font-semibold cursor-pointer border border-white/10"
                        >
                          + Thêm
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: Multi-Image Gallery Manager (Tải từ thiết bị hoặc link) */}
          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6">
            <ImageGalleryManager images={galleryImages} onChange={setGalleryImages} />
          </div>

          {/* Card 5: Product Plain Description (Mô tả chi tiết riêng biệt) */}
          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" /> Mô tả sản phẩm (Văn bản chi tiết)
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Nhập mô tả riêng biệt, chi tiết cho sản phẩm này (không trùng lặp với sản phẩm khác)
              </p>
            </div>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả chi tiết về sản phẩm: công năng, thông số, chất lượng, cách sử dụng, cam kết..."
              rows={5}
              className="w-full bg-neutral-800 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-neutral-500 outline-none focus:border-blue-500 transition leading-relaxed"
            />
          </div>

          {/* Card 6: Rich Text Detail Description */}
          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" /> Định dạng nội dung phong phú (Rich Content)
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Định dạng tiêu đề H2, H3, in đậm, danh sách và liên kết chuẩn đẹp.
              </p>
            </div>

            <RichTextEditor
              value={descriptionHtml}
              onChange={setDescriptionHtml}
              placeholder="<h2>Đặc điểm nổi bật</h2><p>Mô tả chi tiết chất liệu, công nghệ, phong cách...</p>"
            />
          </div>

          {/* Card 7: SEO Metadata */}
          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" /> Tối ưu hóa tìm kiếm (SEO Metadata)
            </h2>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-neutral-300">
                    Tiêu đề SEO (Meta Title)
                  </label>
                  <span className="text-[10px] text-neutral-400">{seoTitle.length}/60 ký tự</span>
                </div>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder={name ? `${name} | Shopdee` : "Tiêu đề hiển thị trên Google..."}
                  className="w-full bg-neutral-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-neutral-300">
                    Mô tả SEO (Meta Description)
                  </label>
                  <span className="text-[10px] text-neutral-400">
                    {seoDescription.length}/160 ký tự
                  </span>
                </div>
                <textarea
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Mô tả tóm tắt sản phẩm thu hút lượt click từ Google..."
                  rows={2}
                  className="w-full bg-neutral-800 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-neutral-500 outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Từ khóa SEO (Keywords, phân cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  placeholder="iphone 15, chính hãng vna, điện thoại apple"
                  className="w-full bg-neutral-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Price, Stock, Badges, Status */}
        <div className="space-y-6">
          {/* Status & Visibility */}
          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-blue-400" /> Trạng thái hiển thị
            </h2>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Trạng thái</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-neutral-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500 transition"
              >
                <option value="active">🟢 Đang mở bán (Active)</option>
                <option value="draft">🟡 Bản nháp (Draft)</option>
                <option value="archived">🔴 Lưu trữ / Ẩn (Archived)</option>
              </select>
            </div>

            <div className="pt-2 border-t border-white/5 space-y-2">
              <label className="flex items-center gap-2.5 text-xs text-neutral-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTrending}
                  onChange={(e) => setIsTrending(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0 bg-neutral-800 border-white/20 w-4 h-4"
                />
                <span>🔥 Gắn nhãn Xu hướng (Trending)</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-neutral-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0 bg-neutral-800 border-white/20 w-4 h-4"
                />
                <span>⭐ Sản phẩm nổi bật (Featured)</span>
              </label>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Giá & Tồn kho
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Giá bán hiện tại (VNĐ) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="250000"
                  className="w-full bg-neutral-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-blue-500 transition font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Giá gốc gạch ngang (VNĐ)
                </label>
                <input
                  type="number"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="350000"
                  className="w-full bg-neutral-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-blue-500 transition font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Số lượng tồn kho
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="100"
                  className="w-full bg-neutral-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-blue-500 transition font-mono"
                />
              </div>

              {/* Flash Sale Settings */}
              <div className="pt-3 border-t border-white/5 space-y-3">
                <label className="flex items-center gap-2.5 text-xs text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFlashSale}
                    onChange={(e) => setIsFlashSale(e.target.checked)}
                    className="rounded text-orange-500 focus:ring-0 bg-neutral-800 border-white/20 w-4 h-4"
                  />
                  <span className="flex items-center gap-1 text-orange-400 font-bold">
                    <Zap className="w-3.5 h-3.5 fill-orange-400" /> Bật Flash Sale
                  </span>
                </label>

                {isFlashSale && (
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Giá Flash Sale đặc biệt (VNĐ)
                    </label>
                    <input
                      type="number"
                      value={flashSalePrice}
                      onChange={(e) => setFlashSalePrice(e.target.value)}
                      placeholder="199000"
                      className="w-full bg-neutral-800 border border-orange-500/40 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-orange-500 transition font-mono font-bold"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Save Bar */}
      <div className="fixed sm:hidden bottom-0 left-0 right-0 z-30 bg-neutral-950/95 backdrop-blur-md border-t border-white/10 px-4 py-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center justify-between gap-3 shadow-2xl">
        <Link
          href="/admin/products"
          className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold"
        >
          Hủy
        </Link>
        <button
          type="submit"
          disabled={isSaving}
          className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/20 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          <span>{isEdit ? "Lưu thay đổi" : "Đăng bán sản phẩm"}</span>
        </button>
      </div>
    </form>
  );
}
