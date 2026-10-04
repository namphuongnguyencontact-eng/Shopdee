import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { getSessionFromRequest } from "@/lib/auth";
import { autoAdvanceDeliveredOrders } from "@/lib/orderService";
import { productSalesService } from "@/services/productSales";

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: { message: "Không có quyền Admin." } }, { status: 403 });
    }

    await connectDB();
    // Auto-advance orders past 24h
    await autoAdvanceDeliveredOrders();

    // Lấy danh sách tài khoản admin để loại trừ đơn hàng của admin khỏi Admin Dashboard
    const adminUsers = await User.find({ role: "admin" }).select("_id").lean();
    const adminUserIds = adminUsers.map((u) => u._id);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {
      userId: { $nin: adminUserIds },
    };
    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [
        { orderNumber: regex },
        { "shippingAddress.fullName": regex },
        { "shippingAddress.phone": regex },
      ];
    }
    if (status) {
      query.orderStatus = status;
    }

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: unknown) {
    console.error("Admin orders GET error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi tải danh sách đơn hàng." } }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: { message: "Không có quyền Admin." } }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const { orderId, orderStatus, note } = body;

    if (!orderId || !orderStatus) {
      return NextResponse.json({ success: false, error: { message: "Thiếu orderId hoặc orderStatus." } }, { status: 400 });
    }

    const validStatuses = ["PLACED", "CONFIRMED", "PREPARING", "SHIPPING", "READY_FOR_SIMULATED_DELIVERY", "COMPLETED", "CANCELLED"];
    if (!validStatuses.includes(orderStatus)) {
      return NextResponse.json({ success: false, error: { message: "Trạng thái đơn hàng không hợp lệ." } }, { status: 400 });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, error: { message: "Không tìm thấy đơn hàng." } }, { status: 404 });
    }

    const statusDescriptions: Record<string, { title: string; desc: string }> = {
      CONFIRMED: {
        title: "Đơn hàng đã được xác nhận",
        desc: "Hệ thống SHOPDEE đã duyệt đơn hàng của bạn.",
      },
      PREPARING: {
        title: "Đang đóng gói trong kho",
        desc: "Kiện hàng đang được đóng gói cẩn thận tại kho.",
      },
      SHIPPING: {
        title: "Đơn hàng đang trên đường vận chuyển",
        desc: "Đơn vị vận chuyển SHOPDEE Express đang phát hàng đến người nhận.",
      },
      READY_FOR_SIMULATED_DELIVERY: {
        title: "Sẵn sàng giao hàng",
        desc: "Đơn vị vận chuyển đang nhận hàng để chuyển phát đến bạn.",
      },
      COMPLETED: {
        title: "Đã hoàn thành giao hàng",
        desc: "Đơn hàng đã được giao thành công đến tay người nhận!",
      },
      CANCELLED: {
        title: "Đơn hàng đã hủy",
        desc: note || "Đơn hàng đã được hủy bởi quản trị viên.",
      },
    };

    const statusInfo = statusDescriptions[orderStatus] || {
      title: `Cập nhật trạng thái: ${orderStatus}`,
      desc: note || "Đơn hàng có cập nhật mới.",
    };

    order.orderStatus = orderStatus;
    order.timeline.push({
      status: orderStatus,
      title: statusInfo.title,
      description: statusInfo.desc,
      timestamp: new Date(),
    });

    await order.save();

    // Idempotent sales counting transition
    if (orderStatus === "COMPLETED") {
      await productSalesService.recordOrderSales(order._id.toString());
    } else if (orderStatus === "CANCELLED") {
      await productSalesService.reverseOrderSales(order._id.toString());
    }

    // Send notification to user
    await Notification.create({
      userId: order.userId,
      title: `Đơn #${order.orderNumber}: ${statusInfo.title}`,
      message: statusInfo.desc,
      type: "ORDER",
      link: `/orders/${order.orderNumber}`,
      isRead: false,
    });

    return NextResponse.json({ success: true, data: order });
  } catch (err: unknown) {
    console.error("Admin orders PUT error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi cập nhật đơn hàng." } }, { status: 500 });
  }
}
