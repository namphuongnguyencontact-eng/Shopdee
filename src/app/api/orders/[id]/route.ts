import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { getSessionFromRequest } from "@/lib/auth";
import { syncOrderDeliveryStatus } from "@/lib/orderService";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: { message: "Chưa đăng nhập." } }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    let query: Record<string, unknown> = { orderNumber: id };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ orderNumber: id }, { _id: id }] };
    }

    const order = await Order.findOne(query);
    if (!order) {
      return NextResponse.json(
        { success: false, error: { message: "Không tìm thấy đơn hàng." } },
        { status: 404 }
      );
    }

    // Sync 24-hour real-time delivery status
    await syncOrderDeliveryStatus(order);

    // Authorization check: Must be order owner or admin
    if (order.userId.toString() !== session.userId && session.role !== "admin") {
      return NextResponse.json(
        { success: false, error: { message: "Bạn không có quyền xem đơn hàng này." } },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order.toObject ? order.toObject() : order,
    });
  } catch (err: unknown) {
    console.error("Order GET error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Lỗi tải chi tiết đơn hàng." } },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, error: { message: "Chỉ quản trị viên mới có quyền cập nhật trạng thái đơn hàng." } },
        { status: 403 }
      );
    }

    await connectDB();
    const { id } = await params;
    const { status, note } = await req.json();

    let query: Record<string, unknown> = { orderNumber: id };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ orderNumber: id }, { _id: id }] };
    }

    const order = await Order.findOne(query);
    if (!order) {
      return NextResponse.json(
        { success: false, error: { message: "Không tìm thấy đơn hàng." } },
        { status: 404 }
      );
    }

    if (status) {
      order.orderStatus = status;
      order.timeline.push({
        status,
        title: `Cập nhật trạng thái: ${status}`,
        description: note || `Đơn hàng được cập nhật sang trạng thái ${status} bởi Admin.`,
        timestamp: new Date(),
      });
      await order.save();
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (err: unknown) {
    console.error("Order update error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Lỗi cập nhật trạng thái đơn hàng." } },
      { status: 500 }
    );
  }
}
