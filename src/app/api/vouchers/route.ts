import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Voucher from "@/models/Voucher";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();
    const now = new Date();
    const vouchers = await Voucher.find({
      isActive: true,
      endDate: { $gte: now },
    })
      .sort({ discountValue: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: vouchers,
    });
  } catch (err: unknown) {
    console.error("Vouchers GET error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Không thể tải danh sách voucher." } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, error: { message: "Chỉ quản trị viên mới có quyền tạo voucher." } },
        { status: 403 }
      );
    }

    await connectDB();
    const body = await req.json();
    const { code, title, description, discountType, discountValue, minOrderValue, maxDiscount, endDate, usageLimit } = body;

    if (!code || !title || !discountType || discountValue === undefined) {
      return NextResponse.json(
        { success: false, error: { message: "Vui lòng điền đủ các thông tin bắt buộc." } },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = await Voucher.findOne({ code: cleanCode });
    if (existing) {
      return NextResponse.json(
        { success: false, error: { message: "Mã voucher này đã tồn tại." } },
        { status: 400 }
      );
    }

    const newVoucher = await Voucher.create({
      code: cleanCode,
      title: title.trim(),
      description: description || title,
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue) || 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      startDate: new Date(),
      endDate: endDate ? new Date(endDate) : new Date(Date.now() + 30 * 86400000),
      usageLimit: Number(usageLimit) || 1000,
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      data: newVoucher,
    });
  } catch (err: unknown) {
    console.error("Voucher create error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Lỗi tạo voucher." } },
      { status: 500 }
    );
  }
}
