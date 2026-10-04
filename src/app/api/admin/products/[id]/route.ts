import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { getSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: { message: "Không có quyền Admin." } }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const product = await Product.findById(id).lean();
    if (!product) {
      return NextResponse.json({ success: false, error: { message: "Sản phẩm không tồn tại." } }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (err: unknown) {
    console.error("Admin product detail GET error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi tải chi tiết sản phẩm." } }, { status: 500 });
  }
}
