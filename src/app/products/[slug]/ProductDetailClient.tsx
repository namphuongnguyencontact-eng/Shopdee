"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star,
  Heart,
  ShoppingCart,
  Zap,
  Share2,
  ShieldCheck,
  Check,
  Truck,
  RotateCcw,
  Sparkles,
  ChevronRight,
  MessageSquare,
  ThumbsUp,
  ArrowLeftRight,
} from "lucide-react";
import { formatVND, formatDate } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCompareStore } from "@/store/useCompareStore";
import { useAuthStore } from "@/store/useAuthStore";
import { showToast } from "@/store/useToastStore";
import ProductCard, { ProductItem } from "@/components/shop/ProductCard";
import ProductGallery, { GalleryImageItem } from "@/components/shop/ProductGallery";
import { getVisitorId, getSessionId } from "@/components/analytics/TrafficTracker";

interface ReviewItem {
  _id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  variantName?: string;
  createdAt: string;
}

interface ProductDetailClientProps {
  product: ProductItem & {
    description: string;
    descriptionHtml?: string;
    shortDescription?: string;
    seoTitle?: string;
    seoDescription?: string;
    galleryImages?: GalleryImageItem[];
    brand: string;
    categorySlug: string;
    categoryName: string;
    specifications?: Array<{ label: string; value: string }>;
    variants?: Array<{ name: string; options: string[] }>;
  };
  initialReviews: ReviewItem[];
  relatedProducts: ProductItem[];
}

export default function ProductDetailClient({
  product,
  initialReviews,
  relatedProducts,
}: ProductDetailClientProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addItem } = useCartStore();
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const { isInCompare, toggleCompare } = useCompareStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (product.variants) {
      product.variants.forEach((v) => {
        initial[v.name] = v.options[0];
      });
    }
    return initial;
  });
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "reviews" | "policy">("desc");

  // Review submission state
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const isLiked = isInWishlist(product._id);
  const activePrice = product.isFlashSale && product.flashSalePrice ? product.flashSalePrice : product.price;
  const discount = product.originalPrice > activePrice
    ? Math.round(((product.originalPrice - activePrice) / product.originalPrice) * 100)
    : 0;

  const currentVariantString = Object.entries(selectedVariants)
    .map(([_, val]) => val)
    .join(" / ");

  // Track product_view event
  React.useEffect(() => {
    try {
      const vid = getVisitorId();
      const sid = getSessionId();
      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "product_view",
          productId: product._id,
          visitorId: vid,
          sessionId: sid,
          path: window.location.pathname,
        }),
      }).catch(() => {});
    } catch {}
  }, [product._id]);

  const handleAddToCart = () => {
    if (!user) {
      showToast({
        type: "info",
        title: "Yêu cầu đăng nhập",
        message: "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.",
      });
      const currentPath = typeof window !== "undefined" ? window.location.pathname + window.location.search : `/products/${product.slug}`;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    addItem({
      productId: product._id,
      name: product.name,
      slug: product.slug,
      image: product.images[activeImageIndex] || product.images[0],
      price: activePrice,
      originalPrice: product.originalPrice,
      quantity,
      variantName: currentVariantString || "Mặc định",
    });

    // Track add_to_cart event for funnel & live ticker
    try {
      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "add_to_cart",
          productId: product._id,
          value: activePrice * quantity,
          visitorId: getVisitorId(),
          sessionId: getSessionId(),
          path: window.location.pathname,
        }),
      }).catch(() => {});
    } catch {}
  };

  const handleBuyNow = () => {
    if (!user) {
      showToast({
        type: "info",
        title: "Yêu cầu đăng nhập",
        message: "Vui lòng đăng nhập để tiến hành mua ngay sản phẩm.",
      });
      const currentPath = typeof window !== "undefined" ? window.location.pathname + window.location.search : `/products/${product.slug}`;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    addItem({
      productId: product._id,
      name: product.name,
      slug: product.slug,
      image: product.images[activeImageIndex] || product.images[0],
      price: activePrice,
      originalPrice: product.originalPrice,
      quantity,
      variantName: currentVariantString || "Mặc định",
    });
    router.push("/checkout");
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      showToast({
        type: "success",
        title: "Đã sao chép link!",
        message: "Bạn có thể gửi link sản phẩm này cho bạn bè.",
      });
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast({ type: "error", message: "Vui lòng đăng nhập để gửi đánh giá." });
      return;
    }
    if (!reviewComment.trim()) {
      showToast({ type: "error", message: "Vui lòng nhập nội dung đánh giá." });
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          rating: reviewRating,
          comment: reviewComment.trim(),
          variantName: currentVariantString,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setReviews([json.data, ...reviews]);
        setReviewComment("");
        showToast({
          type: "success",
          title: "Đánh giá thành công!",
          message: "Cảm ơn bạn đã gửi đánh giá và chia sẻ trải nghiệm.",
        });
      } else {
        showToast({ type: "error", message: json.error?.message || "Lỗi gửi đánh giá." });
      }
    } catch {
      showToast({ type: "error", message: "Có lỗi xảy ra khi gửi đánh giá." });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4">
      {/* Shopee Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-normal">
        <Link href="/" className="hover:text-[#192841] transition">Trang chủ</Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <Link href={`/category/${product.categorySlug}`} className="hover:text-[#192841] transition">
          {product.categoryName}
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="text-slate-800 font-medium truncate max-w-sm">{product.name}</span>
      </nav>

      {/* Main Top Card: Gallery & Purchase Information */}
      <div className="bg-white rounded-xs border border-slate-200/80 p-6 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Images Gallery + Social Share (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <ProductGallery
            images={product.images}
            galleryImages={product.galleryImages}
            productName={product.name}
            discount={discount}
            isFlashSale={product.isFlashSale}
            onActiveIndexChange={(idx) => setActiveImageIndex(idx)}
          />

          {/* Social share & Wishlist strip */}
          <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <span>Chia sẻ:</span>
              <button
                onClick={handleShare}
                className="hover:text-[#192841] flex items-center gap-1 text-slate-500"
                title="Sao chép liên kết"
              >
                <Share2 className="w-3.5 h-3.5" /> Link
              </button>
              <button
                onClick={() => toggleCompare(product)}
                className={`flex items-center gap-1 transition ${
                  isInCompare(product._id) ? "text-[#192841] font-bold" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <ArrowLeftRight className="w-3.5 h-3.5" /> So sánh
              </button>
            </div>

            <button
              onClick={() => toggleWishlist(product._id)}
              className="flex items-center gap-1.5 text-slate-600 hover:text-rose-500 transition"
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
              <span>Đã thích ({isLiked ? (product.reviewCount || 10) + 1 : (product.reviewCount || 10)})</span>
            </button>
          </div>
        </div>

        {/* Right: Product Info & Purchase Form (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Title & Brand with Mall / Yêu thích badge */}
          <div>
            <h1 className="text-xl sm:text-2xl font-medium text-slate-900 leading-snug">
              <span className="inline-block px-1.5 py-0.5 mr-2 rounded-xs bg-[#192841] text-white text-[11px] font-bold uppercase tracking-wider align-middle">
                Yêu thích
              </span>
              {product.name}
            </h1>

            {/* Shopee Ratings & Sold stats strip */}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-600 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#192841] text-sm underline">{product.ratingAverage.toFixed(1)}</span>
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < Math.floor(product.ratingAverage) ? "fill-amber-400" : "fill-slate-200 text-slate-200"}`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-slate-300">|</span>
              <span className="hover:text-[#192841] cursor-pointer" onClick={() => setActiveTab("reviews")}>
                <strong className="text-slate-800 underline font-semibold mr-1">{reviews.length}</strong> Đánh Giá
              </span>
              <span className="text-slate-300">|</span>
              <span>
                <strong className="text-slate-800 font-semibold mr-1">
                  {product.soldCount > 1000 ? (product.soldCount / 1000).toFixed(1) + "k" : product.soldCount}
                </strong>
                Đã Bán
              </span>
            </div>
          </div>

          {/* Shopee Pricing Box */}
          <div className="bg-[#fafafa] p-4 rounded-xs flex items-center gap-4">
            {product.originalPrice > activePrice && (
              <span className="text-sm text-slate-400 line-through">
                {formatVND(product.originalPrice)}
              </span>
            )}
            <span className="text-2xl sm:text-3xl font-bold text-[#192841]">
              {formatVND(activePrice)}
            </span>
            {discount > 0 && (
              <span className="px-1.5 py-0.5 bg-[#ff4d4f] text-white text-[11px] font-bold uppercase tracking-wider rounded-xs">
                {discount}% GIẢM
              </span>
            )}
            {product.isFlashSale && (
              <span className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-xs border border-red-200">
                <Zap className="w-3.5 h-3.5 fill-red-600" /> FLASH SALE
              </span>
            )}
          </div>

          {/* Shopee Vouchers & Shipping Rows */}
          <div className="space-y-3 text-xs pt-1">
            {/* Vouchers row */}
            <div className="flex items-center gap-4">
              <span className="w-24 text-slate-500 shrink-0">Mã Giảm Giá:</span>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded-xs font-medium">
                  Giảm ₫15k
                </span>
                <span className="px-2 py-0.5 bg-blue-50 text-[#192841] border border-blue-200 rounded-xs font-medium">
                  Giảm ₫30k
                </span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xs font-medium">
                  Freeship 0Đ
                </span>
              </div>
            </div>

            {/* Shipping row */}
            <div className="flex items-start gap-4">
              <span className="w-24 text-slate-500 shrink-0 pt-0.5">Vận Chuyển:</span>
              <div className="space-y-1 text-slate-700">
                <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Miễn phí vận chuyển cho đơn hàng từ ₫50.000</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Vận chuyển tới Toàn quốc • Phí vận chuyển: ₫0 - ₫16.500
                </div>
              </div>
            </div>
          </div>

          {/* Variants Selectors */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3.5 pt-2">
              {product.variants.map((v) => {
                const currentChoice = selectedVariants[v.name] || v.options[0];
                return (
                  <div key={v.name} className="flex items-start gap-4 text-xs">
                    <span className="w-24 text-slate-500 shrink-0 pt-2 font-medium">
                      {v.name}:
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {v.options.map((opt) => {
                        const isSelected = currentChoice === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() =>
                              setSelectedVariants((prev) => ({ ...prev, [v.name]: opt }))
                            }
                            className={`relative px-4 py-2 text-xs rounded-xs border transition cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? "border-[#192841] text-[#192841] font-bold bg-[#192841]/5 shadow-xs"
                                : "border-slate-200 text-slate-700 bg-white hover:border-slate-400"
                            }`}
                          >
                            <span>{opt}</span>
                            {isSelected && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#192841]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center gap-4 pt-2 text-xs">
            <span className="w-24 text-slate-500 shrink-0">Số Lượng:</span>
            <div className="flex items-center border border-slate-300 rounded-xs overflow-hidden h-8 bg-white">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-full text-slate-600 hover:bg-slate-100 transition cursor-pointer flex items-center justify-center font-bold"
              >
                -
              </button>
              <span className="w-12 text-center text-xs font-medium text-slate-900 border-x border-slate-300">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-full text-slate-600 hover:bg-slate-100 transition cursor-pointer flex items-center justify-center font-bold"
              >
                +
              </button>
            </div>
            <span className="text-slate-400 text-xs">999+ sản phẩm có sẵn</span>
          </div>

          {/* Shopee Dual CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-4">
            <button
              onClick={handleAddToCart}
              className="h-11 px-6 rounded-xs bg-[#192841]/10 text-[#192841] border border-[#192841] font-bold text-xs sm:text-sm hover:bg-[#192841]/15 flex items-center gap-2 transition cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" /> Thêm Vào Giỏ Hàng
            </button>
            <button
              onClick={handleBuyNow}
              className="h-11 px-8 rounded-xs bg-[#192841] hover:bg-[#132034] text-white font-bold text-xs sm:text-sm shadow-xs flex items-center gap-2 transition cursor-pointer uppercase tracking-wider"
            >
              Mua Ngay
            </button>
          </div>

          {/* Shopee Guarantee banner */}
          <div className="pt-3 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 text-[#192841] font-medium">
              <ShieldCheck className="w-4 h-4 text-[#192841]" />
              <span>Shopdee Đảm Bảo</span>
            </div>
            <span className="text-slate-400 text-[11px]">Trả hàng miễn phí 15 ngày • Đổi ý miễn phí</span>
          </div>
        </div>
      </div>

      {/* Shopee Official Shop Card */}
      <div className="bg-white rounded-xs border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full border border-slate-200 overflow-hidden shrink-0 bg-slate-50 flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
              alt="Shopdee Mall"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900">Shopdee Official Store</h3>
              <span className="px-1.5 py-0.2 bg-[#192841] text-white text-[10px] font-bold rounded-xs">
                MALL
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Online 1 phút trước</p>
            <div className="flex items-center gap-2 pt-1">
              <button className="px-3 py-1 rounded-xs border border-[#192841] text-[#192841] bg-blue-50/50 hover:bg-blue-50 text-xs font-medium flex items-center gap-1 transition">
                <MessageSquare className="w-3 h-3" /> Chat Ngay
              </button>
              <Link
                href="/products"
                className="px-3 py-1 rounded-xs border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium transition"
              >
                Xem Shop
              </Link>
            </div>
          </div>
        </div>

        {/* Shop Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-2 text-xs border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-8">
          <div>
            <span className="text-slate-400 block text-[11px]">Đánh Giá</span>
            <span className="font-bold text-[#192841]">4.9 (42.5k)</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Sản Phẩm</span>
            <span className="font-bold text-[#192841]">180+</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Tỉ Lệ Phản Hồi</span>
            <span className="font-bold text-[#192841]">99%</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Thời Gian Phản Hồi</span>
            <span className="font-bold text-[#192841]">trong vài phút</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Tham Gia</span>
            <span className="font-bold text-[#192841]">2 năm trước</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Người Theo Dõi</span>
            <span className="font-bold text-[#192841]">120.4k</span>
          </div>
        </div>
      </div>

      {/* Shopee Details & Specifications Card */}
      <div className="bg-white rounded-xs border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider bg-slate-50 p-3 rounded-xs mb-4">
            CHI TIẾT SẢN PHẨM
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-xs max-w-3xl">
            <div className="flex">
              <span className="w-32 text-slate-400 font-normal shrink-0">Danh Mục:</span>
              <span className="font-medium text-slate-800">{product.categoryName}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-slate-400 font-normal shrink-0">Thương hiệu:</span>
              <span className="font-medium text-slate-800">{product.brand || "Shopdee"}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-slate-400 font-normal shrink-0">Xuất xứ:</span>
              <span className="font-medium text-slate-800">Việt Nam / Chính Hãng</span>
            </div>
            <div className="flex">
              <span className="w-32 text-slate-400 font-normal shrink-0">Kho hàng:</span>
              <span className="font-medium text-slate-800">999</span>
            </div>
            <div className="flex">
              <span className="w-32 text-slate-400 font-normal shrink-0">Gửi từ:</span>
              <span className="font-medium text-slate-800">Hà Nội / TP. Hồ Chí Minh</span>
            </div>
            {product.specifications?.map((spec, i) => (
              <div key={i} className="flex">
                <span className="w-32 text-slate-400 font-normal shrink-0">{spec.label}:</span>
                <span className="font-medium text-slate-800">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider bg-slate-50 p-3 rounded-xs mb-4">
            MÔ TẢ SẢN PHẨM
          </h2>
          <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4">
            {product.descriptionHtml ? (
              <div
                className="prose prose-sm max-w-none text-slate-700 leading-relaxed product-rich-description"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />
            ) : (
              <p className="whitespace-pre-line">{product.description}</p>
            )}

            <div className="p-4 bg-slate-50 rounded-xs border border-slate-200/60 space-y-2 mt-4">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                CHÍNH SÁCH BÁN HÀNG CỦA SHOPDEE:
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
                <li>Cam kết 100% hàng chính hãng, có nguồn gốc xuất xứ minh bạch.</li>
                <li>Đổi trả miễn phí trong vòng 15 ngày nếu phát hiện lỗi nhà sản xuất.</li>
                <li>Hỗ trợ kiểm tra hàng trước khi nhận (đồng kiểm).</li>
                <li>Bảo hành chính hãng 12 tháng trên toàn quốc.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Shopee Ratings & Reviews Card */}
      <div className="bg-white rounded-xs border border-slate-200/80 p-6 shadow-xs space-y-6">
        <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
          ĐÁNH GIÁ SẢN PHẨM
        </h2>

        {/* Shopee Rating Summary Banner */}
        <div className="bg-[#fbf7f4] border border-[#f5dfd5] p-5 rounded-xs flex flex-col md:flex-row items-center gap-6">
          <div className="text-center md:text-left shrink-0">
            <div className="text-3xl font-bold text-[#192841]">
              {product.ratingAverage.toFixed(1)} <span className="text-sm font-normal text-slate-500">trên 5</span>
            </div>
            <div className="flex text-amber-400 mt-1 justify-center md:justify-start">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(product.ratingAverage) ? "fill-amber-400" : "fill-slate-200 text-slate-200"}`}
                />
              ))}
            </div>
          </div>

          {/* Rating Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              `Tất Cả (${reviews.length})`,
              "5 Sao",
              "4 Sao",
              "3 Sao",
              "Có Hình Ảnh / Video",
              "Có Bình Luận",
            ].map((tab, idx) => (
              <button
                key={tab}
                className={`px-3 py-1.5 rounded-xs border text-xs font-medium transition cursor-pointer ${
                  idx === 0
                    ? "border-[#192841] text-[#192841] bg-white font-bold"
                    : "border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Add Review Box */}
        <form onSubmit={handleSubmitReview} className="p-4 bg-slate-50 rounded-xs border border-slate-200 space-y-3">
          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-[#192841]" /> Viết đánh giá sản phẩm của bạn
          </h4>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600">Chọn số sao:</span>
            <div className="flex gap-1 text-amber-400 cursor-pointer">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  onClick={() => setReviewRating(star)}
                  className={`w-4 h-4 ${star <= reviewRating ? "fill-amber-400" : "fill-slate-200 text-slate-200"}`}
                />
              ))}
            </div>
          </div>
          <textarea
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Hãy chia sẻ trải nghiệm về chất lượng sản phẩm, đóng gói và dịch vụ giao hàng..."
            rows={3}
            className="w-full p-2.5 rounded-xs border border-slate-200 text-xs outline-none focus:border-[#192841] bg-white"
          />
          <button
            type="submit"
            disabled={isSubmittingReview}
            className="px-5 py-2 rounded-xs bg-[#192841] hover:bg-[#132034] text-white font-bold text-xs transition disabled:opacity-50 cursor-pointer uppercase tracking-wider"
          >
            {isSubmittingReview ? "Đang gửi..." : "Gửi Đánh Giá"}
          </button>
        </form>

        {/* Reviews List */}
        <div className="divide-y divide-slate-100">
          {reviews.length > 0 ? (
            reviews.map((r) => (
              <div key={r._id} className="py-4 first:pt-0 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img src={r.userAvatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <span className="text-xs font-semibold text-slate-900 block">{r.userName}</span>
                      <span className="text-[10px] text-slate-400">{formatDate(r.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < r.rating ? "fill-amber-400" : "fill-slate-200 text-slate-200"}`}
                      />
                    ))}
                  </div>
                </div>
                {r.variantName && (
                  <div className="text-[11px] text-slate-400">Phân loại hàng: {r.variantName}</div>
                )}
                <p className="text-xs text-slate-700 leading-relaxed">{r.comment}</p>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              Chưa có đánh giá nào cho sản phẩm này. Hãy mua hàng và để lại đánh giá đầu tiên!
            </div>
          )}
        </div>
      </div>

      {/* Shopee Related Products ("CÓ THỂ BẠN CŨNG THÍCH") */}
      {relatedProducts.length > 0 && (
        <section className="space-y-3 pt-4">
          <div className="bg-white p-3 rounded-xs border border-slate-200/80">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              CÓ THỂ BẠN CŨNG THÍCH
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Sticky Mobile Bottom CTA Bar (Shopee / TikTok Shop Style) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] flex items-center gap-2 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        {/* Wishlist button */}
        <button
          onClick={() => toggleWishlist(product._id)}
          className={`w-10 h-10 rounded-xs border flex flex-col items-center justify-center shrink-0 active:scale-95 transition-all ${
            isLiked ? "bg-rose-50 border-rose-300 text-rose-500" : "border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
          title="Yêu thích"
        >
          <Heart className={`w-4 h-4 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
          <span className="text-[9px] mt-0.5 leading-none">Thích</span>
        </button>

        {/* Cart shortcut */}
        <Link
          href="/cart"
          className="relative w-10 h-10 rounded-xs border border-slate-200 text-slate-700 hover:bg-slate-50 flex flex-col items-center justify-center shrink-0 active:scale-95 transition-all"
          title="Giỏ hàng"
        >
          <ShoppingCart className="w-4 h-4" />
          <span className="text-[9px] mt-0.5 leading-none">Giỏ</span>
          {useCartStore.getState().items.length > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-white">
              {useCartStore.getState().items.reduce((acc, i) => acc + i.quantity, 0)}
            </span>
          )}
        </Link>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          className="flex-1 h-10 rounded-xs bg-[#192841]/10 active:bg-[#192841]/20 text-[#192841] border border-[#192841] font-bold text-xs flex items-center justify-center gap-1 active:scale-[0.98] transition cursor-pointer"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Thêm Vào Giỏ</span>
        </button>

        {/* Buy Now */}
        <button
          onClick={handleBuyNow}
          className="flex-1 h-10 rounded-xs bg-[#192841] active:bg-[#132034] text-white font-extrabold text-xs flex items-center justify-center gap-1 shadow-sm uppercase tracking-wide active:scale-[0.98] transition cursor-pointer"
        >
          <span>Mua Ngay</span>
        </button>
      </div>
    </div>
  );
}
