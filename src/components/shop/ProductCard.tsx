"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingCart, Eye, Star, Flame, Zap, ArrowLeftRight } from "lucide-react";
import { formatVND } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCompareStore } from "@/store/useCompareStore";

export interface ProductItem {
  _id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number;
  discountPercent?: number;
  images: string[];
  ratingAverage: number;
  soldCount: number;
  isFlashSale?: boolean;
  flashSalePrice?: number;
  isTrending?: boolean;
  isFeatured?: boolean;
  categoryName?: string;
  brand?: string;
  stock?: number;
  reviewCount?: number;
  variants?: Array<{ name: string; options: string[] }>;
}

interface ProductCardProps {
  product: ProductItem;
  onQuickView?: (product: ProductItem) => void;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const { isInCompare, toggleCompare } = useCompareStore();
  const [isHovered, setIsHovered] = useState(false);

  const isLiked = isInWishlist(product._id);
  const inCompare = isInCompare(product._id);
  const activePrice = product.isFlashSale && product.flashSalePrice ? product.flashSalePrice : product.price;
  const discount = product.discountPercent || (product.originalPrice > activePrice ? Math.round(((product.originalPrice - activePrice) / product.originalPrice) * 100) : 0);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product._id,
      name: product.name,
      slug: product.slug,
      image: product.images[0] || "",
      price: activePrice,
      originalPrice: product.originalPrice,
      quantity: 1,
      variantName: product.variants?.[0]?.options?.[0] || "Mặc định",
    });
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product._id);
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCompare(product);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white border border-slate-200 rounded-sm shadow-xs hover:shadow-md hover:border-[#192841] hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden"
    >
      {/* Thumbnail with Badges */}
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <img
            src={product.images[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-300"
            loading="lazy"
          />
        </Link>

        {/* Shopee Top Left Badge (Mall / Yêu Thích) */}
        <div className="absolute top-1.5 left-0 flex flex-col gap-1 items-start z-10">
          {product.isFeatured ? (
            <span className="px-1.5 py-0.5 bg-red-600 text-white font-bold text-[9px] rounded-r-xs shadow-xs tracking-tight">
              Mall
            </span>
          ) : (
            <span className="px-1.5 py-0.5 bg-[#192841] text-white font-bold text-[9px] rounded-r-xs shadow-xs tracking-tight">
              Yêu thích
            </span>
          )}
        </div>

        {/* Shopee Top Right Discount Ribbon */}
        {discount > 0 && (
          <div className="absolute top-0 right-0 bg-yellow-400 text-red-600 px-1.5 pt-1 pb-1 text-center leading-none font-black z-10 shadow-xs">
            <span className="text-[11px] font-black block">-{discount}%</span>
            <span className="text-[8px] text-white font-bold block uppercase mt-0.5 bg-red-600 px-0.5 py-0.2 rounded-2xs">
              GIẢM
            </span>
          </div>
        )}

        {/* Action icons (Wishlist & Compare) on hover */}
        <div className="absolute top-2 right-12 flex flex-col gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleLike}
            className={`w-7 h-7 flex items-center justify-center rounded-full shadow-md backdrop-blur-md transition cursor-pointer ${
              isLiked
                ? "bg-rose-500 text-white"
                : "bg-white/90 text-slate-700 hover:bg-white hover:text-rose-500"
            }`}
            title={isLiked ? "Bỏ yêu thích" : "Yêu thích"}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-white" : ""}`} />
          </button>

          <button
            onClick={handleCompare}
            className={`w-7 h-7 flex items-center justify-center rounded-full shadow-md backdrop-blur-md transition cursor-pointer ${
              inCompare
                ? "bg-[#192841] text-white"
                : "bg-white/90 text-slate-700 hover:bg-[#192841] hover:text-white"
            }`}
            title={inCompare ? "Bỏ so sánh" : "Thêm vào so sánh"}
          >
            <ArrowLeftRight className="w-3 h-3" />
          </button>
        </div>

        {/* Quick View Button on Hover */}
        {onQuickView && (
          <button
            onClick={() => onQuickView(product)}
            className={`absolute bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-white/95 text-slate-800 hover:bg-[#192841] hover:text-white font-bold text-[11px] rounded-xs shadow-md flex items-center gap-1 transition-all duration-200 z-10 ${
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
            }`}
          >
            <Eye className="w-3 h-3" /> Xem nhanh
          </button>
        )}
      </div>

      {/* Shopee Card Content */}
      <div className="p-2.5 flex flex-col flex-1 justify-between bg-white">
        <div>
          {/* Title */}
          <Link href={`/products/${product.slug}`} className="block group-hover:text-[#192841] transition mb-2">
            <h3 className="text-xs font-medium text-slate-800 line-clamp-2 leading-snug min-h-[2.5rem]">
              {product.name}
            </h3>
          </Link>

          {/* Shopee Promotion Chips (Freeship Xtra / Rẻ Vô Địch) */}
          <div className="flex items-center gap-1.5 flex-wrap min-h-[1.25rem]">
            <span className="text-[9px] font-semibold px-1.5 py-0.5 text-red-600 border border-red-500 rounded-2xs leading-none bg-red-50/50">
              Rẻ Vô Địch
            </span>
            {product.isFlashSale && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 text-white bg-red-600 rounded-2xs flex items-center gap-0.5 leading-none">
                <Zap className="w-2.5 h-2.5 fill-current" /> Flash Sale
              </span>
            )}
            <span className="text-[9px] font-semibold px-1.5 py-0.5 text-[#192841] border border-[#192841]/40 rounded-2xs leading-none bg-slate-50">
              Freeship 0Đ
            </span>
          </div>
        </div>

        {/* Price & Sold count (Shopee Style) */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-1">
            <div className="flex items-baseline text-[#192841]">
              <span className="text-[11px] font-bold mr-0.5">₫</span>
              <span className="text-sm sm:text-base font-bold">
                {activePrice.toLocaleString("vi-VN")}
              </span>
            </div>

            <div className="text-[10px] text-slate-400">
              Đã bán {product.soldCount > 1000 ? (product.soldCount / 1000).toFixed(1) + "k" : product.soldCount}
            </div>
          </div>

          <div className="flex items-center justify-between gap-1 pt-0.5">
            {/* Rating */}
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="text-[10px] font-medium text-slate-600">
                {product.ratingAverage.toFixed(1)}
              </span>
            </div>

            {/* Quick Add To Cart Button */}
            <button
              onClick={handleQuickAdd}
              className="px-2 py-1 bg-[#192841] text-white hover:bg-[#132034] text-[10px] font-semibold rounded-xs flex items-center gap-1 shadow-2xs transition cursor-pointer"
              title="Thêm vào giỏ"
            >
              <ShoppingCart className="w-3 h-3" />
              <span>+ Giỏ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
