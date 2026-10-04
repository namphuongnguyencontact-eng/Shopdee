import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Voucher from "@/models/Voucher";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: { message: "Không có quyền Admin." } }, { status: 403 });
    }

    await connectDB();
    const vouchers = await Voucher.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: vouchers });
  } catch (err: unknown) {
    console.error("Admin vouchers GET error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi tải voucher." } }, { status: 500 });
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
    const { code, title, description, discountType, discountValue, minOrderValue, maxDiscount, endDate, usageLimit } = body;

    if (!code || !title || !discountType || discountValue === undefined) {
      return NextResponse.json({ success: false, error: { message: "Vui lòng nhập đủ thông tin bắt buộc." } }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = await Voucher.findOne({ code: cleanCode });
    if (existing) {
      return NextResponse.json({ success: false, error: { message: "Mã voucher đã tồn tại." } }, { status: 400 });
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
      usedCount: 0,
      isActive: true,
    });

    return NextResponse.json({ success: true, data: newVoucher });
  } catch (err: unknown) {
    console.error("Admin vouchers POST error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi tạo voucher." } }, { status: 500 });
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
      return NextResponse.json({ success: false, error: { message: "Thiếu voucher ID." } }, { status: 400 });
    }

    const updated = await Voucher.findByIdAndUpdate(id, { $set: updates }, { new: true });
    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    console.error("Admin vouchers PUT error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi cập nhật voucher." } }, { status: 500 });
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

    await Voucher.findByIdAndDelete(id);
    return NextResponse.json({ success: true, data: { message: "Đã xóa voucher." } });
  } catch (err: unknown) {
    console.error("Admin vouchers DELETE error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi xóa voucher." } }, { status: 500 });
  }
}
