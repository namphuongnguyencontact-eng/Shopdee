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

  const [flashSaleProducts, trendingProducts, categories, vouchers] = await Promise.all([
    Product.find({ status: "active", isFlashSale: true }).sort({ soldCount: -1, discountPercent: -1 }).limit(12).lean(),
    Product.find({ status: "active" }).sort({ soldCount: -1, trendScore: -1 }).limit(18).lean(),
    Category.find({ isActive: true }).sort({ order: 1 }).lean(),
    Voucher.find({ isActive: true }).limit(4).lean(),
  ]);

  // Gợi ý ngẫu nhiên sản phẩm từ TẤT CẢ các danh mục (phủ đều đa dạng các ngành hàng)
  const samplePerCategory = Math.max(2, Math.ceil(24 / Math.max(categories.length, 1)));
  const categorySamplePromises = categories.map((cat) =>
    Product.aggregate([
      { $match: { status: "active", categorySlug: cat.slug } },
      { $sample: { size: samplePerCategory } },
    ])
  );
  const sampleResults = await Promise.all(categorySamplePromises);
  let forYouProducts = sampleResults.flat();

  // Bổ sung nếu danh mục nào chưa có đủ sản phẩm
  if (forYouProducts.length < 18) {
    const existingIds = forYouProducts.map((p) => p._id);
    const extraProducts = await Product.aggregate([
      { $match: { status: "active", _id: { $nin: existingIds } } },
      { $sample: { size: Math.max(1, 18 - forYouProducts.length) } },
    ]);
    forYouProducts = forYouProducts.concat(extraProducts);
  }

  // Xáo trộn ngẫu nhiên để các danh mục đan xen bắt mắt
  forYouProducts.sort(() => Math.random() - 0.5);

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
