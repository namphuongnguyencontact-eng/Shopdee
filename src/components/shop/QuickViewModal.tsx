"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, Star, ShoppingCart, Check, Heart } from "lucide-react";
import { ProductItem } from "./ProductCard";
import { formatVND } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useAuthStore } from "@/store/useAuthStore";
import { showToast } from "@/store/useToastStore";

interface QuickViewModalProps {
  product: ProductItem | null;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { addItem } = useCartStore();
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const { user } = useAuthStore();

  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!product) return null;

  const isLiked = isInWishlist(product._id);
  const activePrice = product.isFlashSale && product.flashSalePrice ? product.flashSalePrice : product.price;
  const firstVariant = product.variants?.[0];
  const currentVariant = selectedVariant || firstVariant?.options?.[0] || "Mặc định";

  const handleAddToCart = () => {
    if (!user) {
      showToast({
        type: "info",
        title: "Yêu cầu đăng nhập",
        message: "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.",
      });
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
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
      variantName: currentVariant,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in" />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white shadow-2xl overflow-y-auto max-h-[92vh] rounded-2xl z-10 animate-in zoom-in-95 duration-200 border border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer shadow-sm"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery Side */}
          <div className="p-4 sm:p-6 bg-slate-50 flex flex-col items-center justify-center">
            <div className="relative aspect-square w-full max-w-[280px] sm:max-w-none overflow-hidden bg-white shadow-sm border border-slate-200 rounded-lg">
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-12 h-12 overflow-hidden border-2 transition cursor-pointer ${
                      activeImageIndex === idx ? "border-[#192841] scale-105" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Side */}
          <div className="p-6 flex flex-col justify-between">
            <div>
              {product.categoryName && (
                <span className="text-[11px] font-bold text-[#192841] uppercase tracking-wider block mb-1">
                  {product.categoryName}
                </span>
              )}
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {product.name}
              </h2>

              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="font-bold text-slate-800">{product.ratingAverage.toFixed(1)}</span>
                </div>
                <span>•</span>
                <span>Đã bán {product.soldCount} món</span>
              </div>

              {/* Price */}
              <div className="mt-4 p-3 bg-slate-50 border border-slate-200 flex items-baseline gap-2">
                <span className="text-xl font-black text-[#192841]">
                  {formatVND(activePrice)}
                </span>
                {product.originalPrice > activePrice && (
                  <span className="text-xs text-slate-400 line-through">
                    {formatVND(product.originalPrice)}
                  </span>
                )}
                {product.isFlashSale && (
                  <span className="ml-auto px-2 py-0.5 bg-red-600 text-white font-extrabold text-[10px]">
                    FLASH DEAL
                  </span>
                )}
              </div>

              {/* Variants */}
              {firstVariant && (
                <div className="mt-4">
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    {firstVariant.name}: <span className="font-normal text-[#192841]">{currentVariant}</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {firstVariant.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setSelectedVariant(opt)}
                        className={`px-3 py-1 text-xs font-semibold border transition cursor-pointer ${
                          currentVariant === opt
                            ? "bg-[#192841] text-white border-[#192841] shadow-xs"
                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700">Số lượng:</span>
                <div className="flex items-center border border-slate-200 overflow-hidden h-8 bg-slate-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-2.5 text-slate-500 hover:bg-slate-200 transition"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-bold text-slate-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-2.5 text-slate-500 hover:bg-slate-200 transition"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={handleAddToCart}
                className="flex-1 h-11 bg-[#192841] hover:bg-[#132034] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" /> Thêm vào giỏ hàng
              </button>
              <button
                onClick={() => toggleWishlist(product._id)}
                className={`w-11 h-11 border flex items-center justify-center transition cursor-pointer ${
                  isLiked
                    ? "bg-rose-50 border-rose-200 text-rose-500"
                    : "border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200"
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-rose-500" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
