"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, ArrowRight, Trash2, ShoppingCart } from "lucide-react";
import ProductCard, { ProductItem } from "@/components/shop/ProductCard";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";
import { formatVND } from "@/lib/utils";

export default function WishlistPage() {
  const { productIds, toggleWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWishlistProducts();
  }, [productIds]);

  const fetchWishlistProducts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/wishlist");
      const json = await res.json();
      if (json.success && json.data.products) {
        setProducts(json.data.products);
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAllToCart = () => {
    products.forEach((p) => {
      addItem({
        productId: p._id,
        name: p.name,
        slug: p.slug,
        image: p.images[0] || "",
        price: p.isFlashSale && p.flashSalePrice ? p.flashSalePrice : p.price,
        originalPrice: p.originalPrice,
        quantity: 1,
      });
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500" /> Danh Sách Yêu Thích
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {products.length} món đồ bạn đang để mắt tới
          </p>
        </div>

        {products.length > 0 && (
          <button
            onClick={handleAddAllToCart}
            className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-2 self-start sm:self-auto"
          >
            <ShoppingCart className="w-4 h-4" /> Thêm tất cả vào giỏ hàng
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square bg-white rounded-3xl border border-slate-100 animate-pulse" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center mx-auto">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Danh sách yêu thích đang trống</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Thả tim vào bất kỳ sản phẩm nào bạn thích để lưu lại và dễ dàng mua sắm khi cần!
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-600 text-white font-bold text-xs shadow transition"
          >
            Khám phá sản phẩm <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
