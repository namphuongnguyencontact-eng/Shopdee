import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { getSessionFromRequest } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "16", 10)));
    const skip = (page - 1) * limit;

    const category = searchParams.get("category");
    const search = searchParams.get("search")?.trim();
    const sort = searchParams.get("sort") || "relevance";
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
    const isFlashSale = searchParams.get("isFlashSale") === "true";
    const isTrending = searchParams.get("isTrending") === "true";
    const isFeatured = searchParams.get("isFeatured") === "true";

    const filter: Record<string, unknown> = { status: "active" };

    if (category && category !== "all") {
      filter.categorySlug = category;
    }

    if (isFlashSale) filter.isFlashSale = true;
    if (isTrending) filter.isTrending = true;
    if (isFeatured) filter.isFeatured = true;

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) (filter.price as Record<string, number>).$gte = minPrice;
      if (maxPrice !== undefined) (filter.price as Record<string, number>).$lte = maxPrice;
    }

    if (search) {
      const cleanSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { name: { $regex: cleanSearch, $options: "i" } },
        { brand: { $regex: cleanSearch, $options: "i" } },
        { categoryName: { $regex: cleanSearch, $options: "i" } },
        { tags: { $in: [new RegExp(cleanSearch, "i")] } },
      ];
    }

    // Sort options
    let sortOption: Record<string, 1 | -1> = { trendScore: -1, createdAt: -1 };
    if (sort === "newest") {
      sortOption = { createdAt: -1 };
    } else if (sort === "best_seller") {
      sortOption = { soldCount: -1 };
    } else if (sort === "price_asc") {
      sortOption = { price: 1 };
    } else if (sort === "price_desc") {
      sortOption = { price: -1 };
    } else if (sort === "rating") {
      sortOption = { ratingAverage: -1 };
    } else if (sort === "flash_sale") {
      sortOption = { isFlashSale: -1, discountPercent: -1 };
    }

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortOption).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
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
    console.error("Products GET error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Không thể tải danh sách sản phẩm." } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, error: { message: "Bạn không có quyền quản trị viên." } },
        { status: 403 }
      );
    }

    await connectDB();
    const body = await req.json();
    const { name, categorySlug, price, originalPrice, description, images, brand, isFlashSale, isTrending, isFeatured, variants, specifications, stock } = body;

    if (!name || !price || !categorySlug) {
      return NextResponse.json(
        { success: false, error: { message: "Vui lòng nhập tên, giá và danh mục." } },
        { status: 400 }
      );
    }

    const category = await Category.findOne({ slug: categorySlug });
    if (!category) {
      return NextResponse.json(
        { success: false, error: { message: "Danh mục không tồn tại." } },
        { status: 400 }
      );
    }

    const slug = slugify(name) + "-" + Math.random().toString(36).substring(2, 6);
    const orig = Number(originalPrice) || Number(price);
    const prc = Number(price);
    const discount = orig > prc ? Math.round(((orig - prc) / orig) * 100) : 0;

    const newProduct = await Product.create({
      name: name.trim(),
      slug,
      description: description || name,
      brand: brand || "SHOPDEE STUDIO",
      categoryId: category._id,
      categorySlug: category.slug,
      categoryName: category.name,
      images: images && images.length ? images : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"],
      price: prc,
      originalPrice: orig,
      discountPercent: discount,
      variants: variants || [{ name: "Tùy chọn", options: ["Mặc định"] }],
      specifications: specifications || [{ label: "Xuất xứ", value: "Việt Nam" }],
      isFlashSale: !!isFlashSale,
      isTrending: !!isTrending,
      isFeatured: !!isFeatured,
      stock: stock ? Number(stock) : 999,
      status: "active",
    });

    // Increment category product count
    await Category.updateOne({ _id: category._id }, { $inc: { productCount: 1 } });

    return NextResponse.json({
      success: true,
      data: newProduct,
    });
  } catch (err: unknown) {
    console.error("Product create error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Lỗi khi tạo sản phẩm mới." } },
      { status: 500 }
    );
  }
}
