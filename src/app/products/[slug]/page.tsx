import React from "react";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Review from "@/models/Review";
import { recommendationService } from "@/services/recommendation";
import ProductDetailClient from "./ProductDetailClient";

import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  await connectDB();
  const { slug } = await params;
  const product = await Product.findOne({ slug, status: "active" }).lean();
  if (!product) {
    return {
      title: "Sản phẩm không tìm thấy - Shopdee",
    };
  }

  const title = (product as any).seoTitle || `${(product as any).name} | Shopdee`;
  const description =
    (product as any).seoDescription ||
    (product as any).shortDescription ||
    (product as any).description?.slice(0, 160) ||
    "Mua sắm trực tuyến thời thượng tại Shopdee";
  const primaryImage = (product as any).images?.[0] || "/placeholder.png";

  return {
    title,
    description,
    keywords: (product as any).seoKeywords || [(product as any).brand, (product as any).categoryName],
    openGraph: {
      title,
      description,
      images: [{ url: primaryImage }],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  await connectDB();
  const { slug } = await params;

  const product = await Product.findOne({ slug, status: "active" }).lean();
  if (!product) notFound();

  const [reviews, related] = await Promise.all([
    Review.find({ productId: product._id, status: "approved" }).sort({ createdAt: -1 }).limit(20).lean(),
    recommendationService.getRelatedProducts(product._id.toString(), product.categorySlug, 4),
  ]);

  const serializedProduct = JSON.parse(JSON.stringify(product));
  const serializedReviews = JSON.parse(JSON.stringify(reviews));
  const serializedRelated = JSON.parse(JSON.stringify(related));

  return (
    <ProductDetailClient
      product={serializedProduct}
      initialReviews={serializedReviews}
      relatedProducts={serializedRelated}
    />
  );
}
