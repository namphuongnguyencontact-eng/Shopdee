import { NextRequest, NextResponse } from "next/server";
import { paymentService } from "@/services/payment";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, orderNumber, amount, userId, paymentMethod = "WALLET" } = body;

    const result = await paymentService.processPayment({
      orderId: orderId || "sim-" + Date.now(),
      orderNumber: orderNumber || "VN" + Math.floor(100000 + Math.random() * 900000),
      amount: Number(amount) || 0,
      userId: userId || "guest",
      paymentMethod,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: unknown) {
    console.error("Payment simulation error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Lỗi xử lý thanh toán." } },
      { status: 500 }
    );
  }
}
