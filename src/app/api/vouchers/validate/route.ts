import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Voucher from "@/models/Voucher";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { code, subtotal } = await req.json();

    if (!code) {
      return NextResponse.json(
        { success: false, error: { message: "Vui lòng nhập mã giảm giá." } },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();
    const voucher = await Voucher.findOne({ code: cleanCode, isActive: true });

    if (!voucher) {
      return NextResponse.json(
        { success: false, error: { message: "Mã giảm giá không tồn tại hoặc đã hết hạn." } },
        { status: 404 }
      );
    }

    const now = new Date();
    if (voucher.endDate < now) {
      return NextResponse.json(
        { success: false, error: { message: "Mã giảm giá đã hết hạn sử dụng." } },
        { status: 400 }
      );
    }

    if (voucher.usedCount >= voucher.usageLimit) {
      return NextResponse.json(
        { success: false, error: { message: "Mã giảm giá đã hết lượt sử dụng." } },
        { status: 400 }
      );
    }

    const sub = Number(subtotal) || 0;
    if (sub < voucher.minOrderValue) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `Mã này chỉ áp dụng cho đơn hàng từ ${voucher.minOrderValue.toLocaleString("vi-VN")}₫ trở lên.`,
          },
        },
        { status: 400 }
      );
    }

    let discountAmount = 0;
    if (voucher.discountType === "PERCENT") {
      discountAmount = Math.round((sub * voucher.discountValue) / 100);
      if (voucher.maxDiscount && discountAmount > voucher.maxDiscount) {
        discountAmount = voucher.maxDiscount;
      }
    } else {
      discountAmount = Math.min(sub, voucher.discountValue);
    }

    return NextResponse.json({
      success: true,
      data: {
        code: voucher.code,
        title: voucher.title,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        discountAmount,
        minOrderValue: voucher.minOrderValue,
      },
    });
  } catch (err: unknown) {
    console.error("Voucher validate error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Lỗi kiểm tra voucher." } },
      { status: 500 }
    );
  }
}
