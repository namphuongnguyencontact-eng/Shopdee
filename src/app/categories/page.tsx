import React from "react";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import { Tag, ArrowRight, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  await connectDB();
  const categories = await Category.find({ isActive: true }).sort({ order: 1 }).lean();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" /> BỘ SƯU TẬP GEN Z
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Danh Mục Khám Phá
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Lựa chọn danh mục yêu thích để thỏa sức mua sắm không giới hạn!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat._id.toString()}
            className="group bg-white rounded-3xl border border-slate-100 p-6 shadow-subtle hover:shadow-hover hover:border-blue-100 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 overflow-hidden flex items-center justify-center border border-slate-100">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  ) : (
                    <Tag className="w-7 h-7 text-blue-600" />
                  )}
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
                  {cat.productCount || 12} sản phẩm
                </span>
              </div>

              <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition">
                {cat.name}
              </h2>
              <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                {cat.description}
              </p>

              {/* Subcategories list */}
              {cat.subcategories && cat.subcategories.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-50 flex flex-wrap gap-1.5">
                  {cat.subcategories.map((sub: string) => (
                    <Link
                      key={sub}
                      href={`/products?search=${encodeURIComponent(sub)}`}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-600 font-medium transition"
                    >
                      {sub}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link
                href={`/category/${cat.slug}`}
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-600 group-hover:translate-x-1 transition-transform"
              >
                Khám phá bộ sưu tập <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
