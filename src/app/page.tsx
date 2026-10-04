import React from "react";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Voucher from "@/models/Voucher";
import HomeClientView from "./HomeClientView";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await connectDB();

  const [flashSaleProducts, trendingProducts, forYouProducts, categories, vouchers] = await Promise.all([
    Product.find({ status: "active", isFlashSale: true }).limit(12).lean(),
    Product.find({ status: "active" }).sort({ soldCount: -1, trendScore: -1 }).limit(18).lean(),
    Product.find({ status: "active" }).sort({ createdAt: -1 }).limit(18).lean(),
    Category.find({ isActive: true }).sort({ order: 1 }).lean(),
    Voucher.find({ isActive: true }).limit(4).lean(),
  ]);

  // JSON serialize Mongoose documents for client component
  const serializedFlash = JSON.parse(JSON.stringify(flashSaleProducts));
  const serializedTrending = JSON.parse(JSON.stringify(trendingProducts));
  const serializedForYou = JSON.parse(JSON.stringify(forYouProducts));
  const serializedCategories = JSON.parse(JSON.stringify(categories));
  const serializedVouchers = JSON.parse(JSON.stringify(vouchers));

  return (
    <HomeClientView
      flashSaleProducts={serializedFlash}
      trendingProducts={serializedTrending}
      forYouProducts={serializedForYou}
      categories={serializedCategories}
      vouchers={serializedVouchers}
    />
  );
}
