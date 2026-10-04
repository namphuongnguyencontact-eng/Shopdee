import React from "react";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import ProductListingClient from "../../products/ProductListingClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    page?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

export default async function CategoryDetailPage({ params, searchParams }: PageProps) {
  await connectDB();
  const { slug } = await params;
  const sp = await searchParams;

  const category = await Category.findOne({ slug, isActive: true }).lean();
  if (!category) notFound();

  const page = Math.max(1, parseInt(sp.page || "1", 10));
  const limit = 18;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { categorySlug: slug, status: "active" };
  if (sp.minPrice || sp.maxPrice) {
    filter.price = {};
    if (sp.minPrice) (filter.price as Record<string, number>).$gte = Number(sp.minPrice);
    if (sp.maxPrice) (filter.price as Record<string, number>).$lte = Number(sp.maxPrice);
  }

  let sortOption: Record<string, 1 | -1> = { trendScore: -1, createdAt: -1 };
  if (sp.sort === "newest") sortOption = { createdAt: -1 };
  else if (sp.sort === "best_seller") sortOption = { soldCount: -1 };
  else if (sp.sort === "price_asc") sortOption = { price: 1 };
  else if (sp.sort === "price_desc") sortOption = { price: -1 };
  else if (sp.sort === "rating") sortOption = { ratingAverage: -1 };

  const [products, total, allCategories] = await Promise.all([
    Product.find(filter).sort(sortOption).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
    Category.find({ isActive: true }).sort({ order: 1 }).lean(),
  ]);

  const serializedProducts = JSON.parse(JSON.stringify(products));
  const serializedCategories = JSON.parse(JSON.stringify(allCategories));

  return (
    <div>
      {/* Category Hero Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider">
              Bộ Sưu Tập
            </span>
            <h1 className="text-2xl sm:text-4xl font-black">{category.name}</h1>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">{category.description}</p>
          </div>
          {category.image && (
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden shadow-xl border-2 border-white/20 shrink-0">
              <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>

      <ProductListingClient
        products={serializedProducts}
        categories={serializedCategories}
        pagination={{
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        }}
      />
    </div>
  );
}
