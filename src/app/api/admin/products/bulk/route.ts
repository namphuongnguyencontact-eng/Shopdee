import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { getSessionFromRequest } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, error: { message: "Không có quyền Admin." } },
        { status: 403 }
      );
    }

    await connectDB();
    const body = await req.json();
    const { products } = body;

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { success: false, error: { message: "Danh sách sản phẩm trống." } },
        { status: 400 }
      );
    }

    // Cache category details
    const allCategories = await Category.find({}).lean();
    const categoryMap = new Map(allCategories.map((c) => [c._id.toString(), c]));

    const createdList = [];
    const categoryCountIncrements: Record<string, number> = {};

    for (const item of products) {
      if (!item.name || !item.price || !item.categoryId) {
        continue;
      }

      const cat = categoryMap.get(item.categoryId.toString());
      if (!cat) continue;

      let baseSlug = slugify(item.name);
      let slug = baseSlug;
      let counter = 1;
      while (await Product.findOne({ slug })) {
        slug = `${baseSlug}-${counter++}`;
      }

      const pPrice = Number(item.price);
      const pOrigPrice = Number(item.originalPrice) || pPrice;
      const discountPercent =
        pOrigPrice > pPrice ? Math.round(((pOrigPrice - pPrice) / pOrigPrice) * 100) : 0;

      let finalImages = Array.isArray(item.images) && item.images.length > 0 ? item.images : [];
      if (Array.isArray(item.galleryImages) && item.galleryImages.length > 0) {
        const sorted = [...item.galleryImages].sort(
          (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
        );
        const primary = sorted.find((g) => g.isPrimary) || sorted[0];
        const rest = sorted.filter((g) => g !== primary);
        finalImages = [primary.url, ...rest.map((g) => g.url)];
      }

      if (finalImages.length === 0) {
        finalImages = [
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
        ];
      }

      const doc = await Product.create({
        name: item.name.trim(),
        slug,
        description: item.description || item.name,
        shortDescription: item.shortDescription || "",
        descriptionHtml: item.descriptionHtml || item.description || "",
        brand: item.brand || "SHOPDEE STUDIO",
        categoryId: cat._id,
        categorySlug: cat.slug,
        categoryName: cat.name,
        images: finalImages,
        galleryImages: Array.isArray(item.galleryImages) ? item.galleryImages : [],
        price: pPrice,
        originalPrice: pOrigPrice,
        discountPercent,
        variants:
          Array.isArray(item.variants) && item.variants.length > 0
            ? item.variants
            : [{ name: "Kích thước", options: ["Freesize"] }],
        specifications: Array.isArray(item.specifications) ? item.specifications : [],
        stock: Number(item.stock) || 100,
        tags: Array.isArray(item.tags) ? item.tags : ["shopee", "hot", "trending"],
        isFeatured: Boolean(item.isFeatured),
        isTrending: Boolean(item.isTrending),
        isFlashSale: Boolean(item.isFlashSale),
        flashSalePrice: item.flashSalePrice ? Number(item.flashSalePrice) : undefined,
        status: item.status || "active",
        seoTitle: item.seoTitle || item.name,
        seoDescription: item.seoDescription || item.shortDescription || item.name,
      });

      createdList.push(doc);
      categoryCountIncrements[cat._id.toString()] =
        (categoryCountIncrements[cat._id.toString()] || 0) + 1;
    }

    // Update categories productCount
    for (const [catId, count] of Object.entries(categoryCountIncrements)) {
      await Category.findByIdAndUpdate(catId, { $inc: { productCount: count } });
    }

    return NextResponse.json({
      success: true,
      count: createdList.length,
      data: createdList,
    });
  } catch (err: any) {
    console.error("Admin products bulk POST error:", err);
    return NextResponse.json(
      { success: false, error: { message: err?.message || "Lỗi tạo sản phẩm hàng loạt." } },
      { status: 500 }
    );
  }
}
