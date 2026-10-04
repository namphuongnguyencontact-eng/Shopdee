import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import { getSessionFromRequest } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find({ isActive: true }).sort({ order: 1 }).lean();
    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (err: unknown) {
    console.error("Categories GET error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Không thể tải danh mục." } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, error: { message: "Chỉ quản trị viên mới có quyền tạo danh mục." } },
        { status: 403 }
      );
    }

    await connectDB();
    const body = await req.json();
    const { name, slug: inputSlug, description, icon, image, subcategories } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: { message: "Tên danh mục là bắt buộc." } },
        { status: 400 }
      );
    }

    const slug = inputSlug && typeof inputSlug === "string" && inputSlug.trim()
      ? slugify(inputSlug.trim())
      : slugify(name);

    const existing = await Category.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { success: false, error: { message: `Slug URL "${slug}" đã tồn tại.` } },
        { status: 400 }
      );
    }

    const newCategory = await Category.create({
      name: name.trim(),
      slug,
      description,
      icon: icon || "Tag",
      image,
      subcategories: Array.isArray(subcategories) ? subcategories : [],
      order: 10,
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      data: newCategory,
    });
  } catch (err: unknown) {
    console.error("Category create error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Lỗi khi tạo danh mục." } },
      { status: 500 }
    );
  }
}
