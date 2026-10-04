import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    const { slug } = await params;
    const category = await Category.findOne({ slug }).lean();

    if (!category) {
      return NextResponse.json(
        { success: false, error: { message: "Không tìm thấy danh mục." } },
        { status: 404 }
      );
    }

    // Also get product count
    const productCount = await Product.countDocuments({ categorySlug: slug, status: "active" });

    return NextResponse.json({
      success: true,
      data: { ...category, productCount },
    });
  } catch (err: unknown) {
    console.error("Category detail GET error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Lỗi tải thông tin danh mục." } },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, error: { message: "Chỉ quản trị viên mới có quyền cập nhật." } },
        { status: 403 }
      );
    }

    await connectDB();
    const { slug } = await params;
    const body = await req.json();

    const updated = await Category.findOneAndUpdate(
      { slug },
      { $set: { ...body, updatedAt: new Date() } },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: { message: "Không tìm thấy danh mục để cập nhật." } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (err: unknown) {
    console.error("Category update error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Lỗi khi cập nhật danh mục." } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, error: { message: "Chỉ quản trị viên mới có quyền xóa." } },
        { status: 403 }
      );
    }

    await connectDB();
    const { slug } = await params;

    const deleted = await Category.findOneAndDelete({ slug });
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: { message: "Không tìm thấy danh mục để xóa." } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: "Đã xóa danh mục thành công." },
    });
  } catch (err: unknown) {
    console.error("Category delete error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Lỗi khi xóa danh mục." } },
      { status: 500 }
    );
  }
}
