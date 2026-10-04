import React from "react";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import ProductListingClient from "../products/ProductListingClient";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    search?: string;
    page?: string;
    sort?: string;
  }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  await connectDB();
  const sp = await searchParams;
  const query = (sp.q || sp.search || "").trim();

  const page = Math.max(1, parseInt(sp.page || "1", 10));
  const limit = 18;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { status: "active" };

  if (query) {
    const clean = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { name: { $regex: clean, $options: "i" } },
      { brand: { $regex: clean, $options: "i" } },
      { categoryName: { $regex: clean, $options: "i" } },
      { tags: { $in: [new RegExp(clean, "i")] } },
    ];
  }

  const [products, total, categories] = await Promise.all([
    Product.find(filter).sort({ trendScore: -1 }).skip(skip).limit(limit).lean(),
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
