import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { getSessionFromRequest } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: { message: "Không có quyền Admin." } }, { status: 403 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [{ name: regex }, { brand: regex }];
    }
    if (category) {
      query.categorySlug = category;
    }
    if (status) {
      query.status = status;
    }

    const [products, total] = await Promise.all([
      Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Product.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: unknown) {
    console.error("Admin products GET error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi tải danh sách sản phẩm." } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: { message: "Không có quyền Admin." } }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const {
      name,
      description,
      shortDescription,
      descriptionHtml,
      brand,
      categoryId,
      images,
      galleryImages,
      price,
      originalPrice,
      stock,
      variants,
      specifications,
      tags,
      isFeatured,
      isTrending,
      isFlashSale,
      flashSalePrice,
      status,
      seoTitle,
      seoDescription,
      seoKeywords,
    } = body;

    if (!name || !price || !categoryId) {
      return NextResponse.json({ success: false, error: { message: "Tên, danh mục và giá là bắt buộc." } }, { status: 400 });
    }

    const categoryObj = await Category.findById(categoryId);
    if (!categoryObj) {
      return NextResponse.json({ success: false, error: { message: "Danh mục không tồn tại." } }, { status: 400 });
    }

    let slug = slugify(name);
    let counter = 1;
    while (await Product.findOne({ slug })) {
      slug = `${slugify(name)}-${counter++}`;
    }

    const pPrice = Number(price);
    const pOrigPrice = Number(originalPrice) || pPrice;
    const discountPercent = pOrigPrice > pPrice ? Math.round(((pOrigPrice - pPrice) / pOrigPrice) * 100) : 0;

    // Harmonize galleryImages and images array
    let finalImages = Array.isArray(images) && images.length > 0 ? images : [];
    if (Array.isArray(galleryImages) && galleryImages.length > 0) {
      const sorted = [...galleryImages].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      const primary = sorted.find((g) => g.isPrimary) || sorted[0];
      const rest = sorted.filter((g) => g !== primary);
      finalImages = [primary.url, ...rest.map((g) => g.url)];
    }
    if (finalImages.length === 0) {
      finalImages = ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80"];
    }

    const product = await Product.create({
      name: name.trim(),
      slug,
      description: description || name,
      shortDescription: shortDescription || "",
      descriptionHtml: descriptionHtml || description || "",
      brand: brand || "SHOPDEE STUDIO",
      categoryId: categoryObj._id,
      categorySlug: categoryObj.slug,
      categoryName: categoryObj.name,
      images: finalImages,
      galleryImages: Array.isArray(galleryImages) ? galleryImages : [],
      price: pPrice,
      originalPrice: pOrigPrice,
      discountPercent,
      variants: Array.isArray(variants) && variants.length > 0 ? variants : [{ name: "Kích thước", options: ["Freesize"] }],
      specifications: Array.isArray(specifications) ? specifications : [],
      stock: Number(stock) || 50,
      tags: Array.isArray(tags) ? tags : ["hot", "genz"],
      isFeatured: Boolean(isFeatured),
      isTrending: Boolean(isTrending),
      isFlashSale: Boolean(isFlashSale),
      flashSalePrice: flashSalePrice ? Number(flashSalePrice) : undefined,
      status: status || "active",
      seoTitle,
      seoDescription,
      seoKeywords,
    });

    await Category.findByIdAndUpdate(categoryId, { $inc: { productCount: 1 } });

    return NextResponse.json({ success: true, data: product });
  } catch (err: unknown) {
    console.error("Admin products POST error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi tạo sản phẩm." } }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: { message: "Không có quyền Admin." } }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const { id, _id, ...updates } = body;
    const targetId = id || _id;

    if (!targetId) {
      return NextResponse.json({ success: false, error: { message: "Thiếu product id." } }, { status: 400 });
    }

    if (updates.price && updates.originalPrice) {
      const p = Number(updates.price);
      const o = Number(updates.originalPrice);
      updates.discountPercent = o > p ? Math.round(((o - p) / o) * 100) : 0;
    }

    if (Array.isArray(updates.galleryImages) && updates.galleryImages.length > 0) {
      const sorted = [...updates.galleryImages].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      const primary = sorted.find((g) => g.isPrimary) || sorted[0];
      const rest = sorted.filter((g) => g !== primary);
      updates.images = [primary.url, ...rest.map((g) => g.url)];
    }

    const updated = await Product.findByIdAndUpdate(targetId, { $set: updates }, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, error: { message: "Không tìm thấy sản phẩm." } }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    console.error("Admin products PUT error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi cập nhật sản phẩm." } }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: { message: "Không có quyền Admin." } }, { status: 403 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: { message: "Thiếu ID sản phẩm." } }, { status: 400 });
    }

    const deleted = await Product.findByIdAndDelete(id);
    if (deleted) {
      await Category.findByIdAndUpdate(deleted.categoryId, { $inc: { productCount: -1 } });
    }

    return NextResponse.json({ success: true, data: { message: "Đã xóa sản phẩm thành công." } });
  } catch (err: unknown) {
    console.error("Admin products DELETE error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi xóa sản phẩm." } }, { status: 500 });
  }
}
