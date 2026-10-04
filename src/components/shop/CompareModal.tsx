"use client";

import React from "react";
import Link from "next/link";
import {
  X,
  Trash2,
  ShoppingCart,
  Star,
  Zap,
  ArrowRight,
  Sparkles,
  ArrowLeftRight,
  Layers,
} from "lucide-react";
import { useCompareStore } from "@/store/useCompareStore";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { formatVND } from "@/lib/utils";
import { showToast } from "@/store/useToastStore";

export default function CompareModal() {
  const { items, isModalOpen, setModalOpen, removeFromCompare, clearCompare } = useCompareStore();
  const { addItem, setIsDrawerOpen } = useCartStore();

  if (!isModalOpen) return null;

  const handleAddToCart = (product: (typeof items)[0]) => {
    const user = useAuthStore.getState().user;
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
      price: product.isFlashSale && product.flashSalePrice ? product.flashSalePrice : product.price,
      originalPrice: product.originalPrice,
      image: product.images[0] || "",
      variantName: "Tiêu chuẩn",
      quantity: 1,
    });
    setIsDrawerOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-5xl w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
              <ArrowLeftRight className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                So Sánh Sản Phẩm
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-extrabold">
                  {items.length}/3 sản phẩm
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Đối chiếu thông số, khoảng giá và ưu đãi giữa các món đồ để chọn ra sản phẩm ưng ý nhất!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={clearCompare}
                className="text-xs text-slate-500 hover:text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Xóa tất cả</span>
              </button>
            )}
            <button
              onClick={() => setModalOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {items.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-4 border border-blue-100">
                <Layers className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Chưa có sản phẩm để so sánh</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                Nhấn biểu tượng so sánh (⇄) trên bất kỳ thẻ sản phẩm nào để thêm tối đa 3 món đồ vào bảng đối chiếu.
              </p>
              <button
                onClick={() => setModalOpen(false)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-blue-600/20 cursor-pointer"
              >
                Khám phá sản phẩm ngay
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr>
                    <th className="py-4 px-3 w-40 text-slate-400 font-bold uppercase tracking-wider text-[11px] bg-slate-50/50 rounded-l-2xl">
                      Thông số
                    </th>
                    {items.map((prod) => (
                      <th
                        key={prod._id}
                        className="py-4 px-4 w-64 min-w-[200px] align-top bg-white border-l border-slate-100"
                      >
                        <div className="relative group">
                          <button
                            onClick={() => removeFromCompare(prod._id)}
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 shadow-sm flex items-center justify-center transition cursor-pointer"
                            title="Xóa khỏi so sánh"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 mb-3">
                            <img
                              src={prod.images[0] || ""}
                              alt={prod.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition"
                            />
                          </div>
                          <h4 className="font-bold text-slate-900 text-xs line-clamp-2 min-h-[32px] leading-snug">
                            {prod.name}
                          </h4>
                        </div>
                      </th>
                    ))}
                    {items.length < 3 && (
                      <th className="py-4 px-4 w-64 border-l border-dashed border-slate-200 align-middle text-center bg-slate-50/30 rounded-r-2xl">
                        <div className="py-8 text-center">
                          <div className="w-10 h-10 rounded-2xl border-2 border-dashed border-slate-300 text-slate-400 flex items-center justify-center mx-auto mb-2">
                            <ArrowLeftRight className="w-4 h-4" />
                          </div>
                          <p className="text-[11px] font-bold text-slate-400">
                            Thêm sản phẩm khác ({3 - items.length} slot trống)
                          </p>
                        </div>
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {/* Row: Price */}
                  <tr>
                    <td className="py-3 px-3 font-bold text-slate-600 bg-slate-50/30">Giá Bán</td>
                    {items.map((prod) => {
                      const activePrice =
                        prod.isFlashSale && prod.flashSalePrice ? prod.flashSalePrice : prod.price;
                      return (
                        <td key={prod._id} className="py-3 px-4 border-l border-slate-100">
                          <div className="flex items-baseline gap-1.5 flex-wrap">
                            <span className="text-sm sm:text-base font-black text-blue-600">
                              {formatVND(activePrice)}
                            </span>
                            {prod.originalPrice > activePrice && (
                              <span className="text-[11px] text-slate-400 line-through">
                                {formatVND(prod.originalPrice)}
                              </span>
                            )}
                          </div>
                          {prod.originalPrice > activePrice && (
                            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-extrabold">
                              Giảm {Math.round(((prod.originalPrice - activePrice) / prod.originalPrice) * 100)}%
                            </span>
                          )}
                        </td>
                      );
                    })}
                    {items.length < 3 && <td className="border-l border-dashed border-slate-200" />}
                  </tr>

                  {/* Row: Category */}
                  <tr>
                    <td className="py-3 px-3 font-bold text-slate-600 bg-slate-50/30">Danh Mục</td>
                    {items.map((prod) => (
                      <td key={prod._id} className="py-3 px-4 border-l border-slate-100 text-slate-800 font-semibold">
                        {prod.categoryName || "Chưa phân loại"}
                      </td>
                    ))}
                    {items.length < 3 && <td className="border-l border-dashed border-slate-200" />}
                  </tr>

                  {/* Row: Brand */}
                  <tr>
                    <td className="py-3 px-3 font-bold text-slate-600 bg-slate-50/30">Thương Hiệu</td>
                    {items.map((prod) => (
                      <td key={prod._id} className="py-3 px-4 border-l border-slate-100 text-slate-800 font-semibold">
                        {prod.brand || "SHOPDEE Studio"}
                      </td>
                    ))}
                    {items.length < 3 && <td className="border-l border-dashed border-slate-200" />}
                  </tr>

                  {/* Row: Rating & Sold */}
                  <tr>
                    <td className="py-3 px-3 font-bold text-slate-600 bg-slate-50/30">Đánh Giá & Đã Bán</td>
                    {items.map((prod) => (
                      <td key={prod._id} className="py-3 px-4 border-l border-slate-100">
                        <div className="flex items-center gap-1 text-amber-500 font-bold mb-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{prod.ratingAverage.toFixed(1)}</span>
                          <span className="text-slate-400 font-normal">({prod.reviewCount})</span>
                        </div>
                        <span className="text-slate-500 text-[11px]">Đã bán {prod.soldCount} món</span>
                      </td>
                    ))}
                    {items.length < 3 && <td className="border-l border-dashed border-slate-200" />}
                  </tr>

                  {/* Row: Special Tags */}
                  <tr>
                    <td className="py-3 px-3 font-bold text-slate-600 bg-slate-50/30">Điểm Nổi Bật</td>
                    {items.map((prod) => (
                      <td key={prod._id} className="py-3 px-4 border-l border-slate-100 space-y-1">
                        {prod.isFlashSale && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200/50">
                            <Zap className="w-3 h-3 text-amber-500 fill-amber-500" /> Flash Sale
                          </span>
                        )}
                        {prod.isTrending && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200/50 ml-1">
                            <Sparkles className="w-3 h-3 text-rose-500" /> Hot Trend
                          </span>
                        )}
                        {!prod.isFlashSale && !prod.isTrending && (
                          <span className="text-slate-400 text-[11px]">Tiêu chuẩn</span>
                        )}
                      </td>
                    ))}
                    {items.length < 3 && <td className="border-l border-dashed border-slate-200" />}
                  </tr>

                  {/* Row: Stock */}
                  <tr>
                    <td className="py-3 px-3 font-bold text-slate-600 bg-slate-50/30">Tình Trạng Kho</td>
                    {items.map((prod) => (
                      <td key={prod._id} className="py-3 px-4 border-l border-slate-100">
                        <span
                          className={`font-bold ${
                            (prod.stock ?? 0) > 0 ? "text-emerald-600" : "text-slate-400"
                          }`}
                        >
                          {(prod.stock ?? 0) > 0 ? `Còn hàng (${prod.stock} món)` : "Tạm hết hàng"}
                        </span>
                      </td>
                    ))}
                    {items.length < 3 && <td className="border-l border-dashed border-slate-200" />}
                  </tr>

                  {/* Row: Actions */}
                  <tr>
                    <td className="py-4 px-3 font-bold text-slate-600 bg-slate-50/30">Hành Động</td>
                    {items.map((prod) => (
                      <td key={prod._id} className="py-4 px-4 border-l border-slate-100 space-y-2">
                        <button
                          onClick={() => handleAddToCart(prod)}
                          className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Thêm vào giỏ</span>
                        </button>
                        <Link
                          href={`/products/${prod.slug}`}
                          onClick={() => setModalOpen(false)}
                          className="w-full py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center gap-1 transition text-center"
                        >
                          <span>Xem chi tiết</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    ))}
                    {items.length < 3 && <td className="border-l border-dashed border-slate-200" />}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
