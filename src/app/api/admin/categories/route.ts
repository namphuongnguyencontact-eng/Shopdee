import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
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
    const categories = await Category.find().sort({ order: 1, name: 1 }).lean();
    return NextResponse.json({ success: true, data: categories });
  } catch (err: unknown) {
    console.error("Admin categories GET error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi tải danh mục." } }, { status: 500 });
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
    const { name, slug: inputSlug, description, icon, image, order, subcategories } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: { message: "Tên danh mục là bắt buộc." } }, { status: 400 });
    }

    let slug = inputSlug && typeof inputSlug === "string" && inputSlug.trim()
      ? slugify(inputSlug.trim())
      : slugify(name);

    if (!slug) {
      slug = `cat-${Date.now()}`;
    }

    // Check if slug is already taken
    const existing = await Category.findOne({ slug });
    if (existing) {
      if (inputSlug && inputSlug.trim()) {
        return NextResponse.json(
          { success: false, error: { message: `Slug URL "${slug}" đã tồn tại. Vui lòng nhập slug khác.` } },
          { status: 400 }
        );
      }
      // If auto-generated, append suffix
      let counter = 1;
      while (await Category.findOne({ slug: `${slug}-${counter}` })) {
        counter++;
      }
      slug = `${slug}-${counter}`;
    }

    const parsedSubcategories = Array.isArray(subcategories)
      ? subcategories.map((s: string) => String(s).trim()).filter(Boolean)
      : typeof subcategories === "string"
      ? subcategories.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [];

    const newCategory = await Category.create({
      name: name.trim(),
      slug,
      description: description || "",
      icon: icon || "Tag",
      image: image ? String(image).trim() : "",
      order: Number(order) || 0,
      subcategories: parsedSubcategories,
      isActive: true,
      productCount: 0,
    });

    return NextResponse.json({ success: true, data: newCategory });
  } catch (err: unknown) {
    console.error("Admin categories POST error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi tạo danh mục." } }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: { message: "Không có quyền Admin." } }, { status: 403 });
    }

    await connectDB();
    const { id, ...updates } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, error: { message: "Thiếu category ID." } }, { status: 400 });
    }

    if (updates.slug) {
      const formattedSlug = slugify(String(updates.slug).trim());
      if (!formattedSlug) {
        return NextResponse.json({ success: false, error: { message: "Slug URL không hợp lệ." } }, { status: 400 });
      }
      const existing = await Category.findOne({ slug: formattedSlug, _id: { $ne: id } });
      if (existing) {
        return NextResponse.json(
          { success: false, error: { message: `Slug URL "${formattedSlug}" đã tồn tại trên danh mục khác.` } },
          { status: 400 }
        );
      }
      updates.slug = formattedSlug;
    }

    if (updates.subcategories !== undefined) {
      updates.subcategories = Array.isArray(updates.subcategories)
        ? updates.subcategories.map((s: string) => String(s).trim()).filter(Boolean)
        : typeof updates.subcategories === "string"
        ? updates.subcategories.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [];
    }

    const updated = await Category.findByIdAndUpdate(id, { $set: updates }, { new: true });
    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    console.error("Admin categories PUT error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi cập nhật danh mục." } }, { status: 500 });
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

    await Category.findByIdAndDelete(id);
    return NextResponse.json({ success: true, data: { message: "Đã xóa danh mục." } });
  } catch (err: unknown) {
    console.error("Admin categories DELETE error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi xóa danh mục." } }, { status: 500 });
  }
}
