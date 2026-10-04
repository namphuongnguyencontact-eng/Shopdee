import React from "react";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import ProductListingClient from "./ProductListingClient";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    category?: string;
    search?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    isFlashSale?: string;
    isTrending?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  await connectDB();
  const sp = await searchParams;

  const page = Math.max(1, parseInt(sp.page || "1", 10));
  const limit = Math.min(48, Math.max(1, parseInt(sp.limit || "18", 10)));
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { status: "active" };

  if (sp.category && sp.category !== "all") {
    filter.categorySlug = sp.category;
  }
  if (sp.isFlashSale === "true") filter.isFlashSale = true;
  if (sp.isTrending === "true") filter.isTrending = true;

  if (sp.minPrice || sp.maxPrice) {
    filter.price = {};
    if (sp.minPrice) (filter.price as Record<string, number>).$gte = Number(sp.minPrice);
    if (sp.maxPrice) (filter.price as Record<string, number>).$lte = Number(sp.maxPrice);
  }

  if (sp.search) {
    const clean = sp.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { name: { $regex: clean, $options: "i" } },
      { brand: { $regex: clean, $options: "i" } },
      { categoryName: { $regex: clean, $options: "i" } },
      { tags: { $in: [new RegExp(clean, "i")] } },
    ];
  }

  let sortOption: Record<string, 1 | -1> = { trendScore: -1, createdAt: -1 };
  if (sp.sort === "newest") sortOption = { createdAt: -1 };
  else if (sp.sort === "best_seller") sortOption = { soldCount: -1 };
  else if (sp.sort === "price_asc") sortOption = { price: 1 };
  else if (sp.sort === "price_desc") sortOption = { price: -1 };
  else if (sp.sort === "rating") sortOption = { ratingAverage: -1 };
  else if (sp.sort === "flash_sale") sortOption = { isFlashSale: -1, discountPercent: -1 };

  const [products, total, categories] = await Promise.all([
    Product.find(filter).sort(sortOption).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
    Category.find({ isActive: true }).sort({ order: 1 }).lean(),
  ]);

  const serializedProducts = JSON.parse(JSON.stringify(products));
  const serializedCategories = JSON.parse(JSON.stringify(categories));

  return (
    <React.Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" /></div>}>
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
    </React.Suspense>
  );
}
