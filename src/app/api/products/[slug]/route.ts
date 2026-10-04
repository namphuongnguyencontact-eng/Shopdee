import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { getSessionFromRequest } from "@/lib/auth";
import { analyticsService } from "@/services/analytics";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    const { slug } = await params;

    let query: Record<string, unknown> = { slug };
    if (mongoose.Types.ObjectId.isValid(slug)) {
      query = { $or: [{ slug }, { _id: slug }] };
    }

    const product = await Product.findOne(query).lean();
    if (!product) {
      return NextResponse.json(
        { success: false, error: { message: "Không tìm thấy sản phẩm." } },
        { status: 404 }
      );
    }

    // Log product view asynchronously
    try {
      const session = getSessionFromRequest(req);
      analyticsService.logEvent({
        userId: session?.userId,
        eventType: "product_view",
        productId: product._id?.toString(),
        categoryId: product.categoryId?.toString(),
      }).catch(() => {});
    } catch {}

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (err: any) {
    console.error("Product detail GET error:", err);
    return NextResponse.json(
      { success: false, error: { message: err?.message || "Lỗi tải thông tin sản phẩm.", stack: err?.stack } },
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

    let query: Record<string, unknown> = { slug };
    if (mongoose.Types.ObjectId.isValid(slug)) {
      query = { $or: [{ slug }, { _id: slug }] };
    }

    const updated = await Product.findOneAndUpdate(
      query,
      { $set: { ...body, updatedAt: new Date() } },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: { message: "Không tìm thấy sản phẩm để cập nhật." } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (err: unknown) {
    console.error("Product update error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Lỗi khi cập nhật sản phẩm." } },
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

    let query: Record<string, unknown> = { slug };
    if (mongoose.Types.ObjectId.isValid(slug)) {
      query = { $or: [{ slug }, { _id: slug }] };
    }

    const deleted = await Product.findOneAndDelete(query);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: { message: "Không tìm thấy sản phẩm." } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: "Đã xóa sản phẩm thành công." },
    });
  } catch (err: unknown) {
    console.error("Product delete error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Lỗi khi xóa sản phẩm." } },
      { status: 500 }
    );
  }
}
