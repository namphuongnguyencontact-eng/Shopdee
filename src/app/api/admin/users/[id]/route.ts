import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import { getSessionFromRequest } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, error: { message: "Không có quyền Admin." } },
        { status: 403 }
      );
    }

    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: { message: "ID người dùng không hợp lệ." } },
        { status: 400 }
      );
    }

    const user = await User.findById(id).select("-passwordHash").lean();
    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: "Không tìm thấy người dùng." } },
        { status: 404 }
      );
    }

    // Find all orders of this user
    const orders = await Order.find({ userId: id })
      .sort({ createdAt: -1 })
      .lean();

    // Calculate user shopping stats
    const totalOrders = orders.length;
    let totalSpent = 0;
    let completedOrders = 0;
    let shippingOrders = 0;
    let cancelledOrders = 0;

    // Aggregate purchased products
    const productMap = new Map<
      string,
      {
        productId: string;
        name: string;
        slug: string;
        image: string;
        price: number;
        totalQuantity: number;
        totalSpent: number;
        lastPurchasedAt: Date;
        orderNumbers: string[];
      }
    >();

    for (const order of orders) {
      if (order.orderStatus !== "CANCELLED") {
        totalSpent += order.total || 0;
      }
      if (order.orderStatus === "COMPLETED") completedOrders++;
      else if (order.orderStatus === "SHIPPING" || order.orderStatus === "PREPARING") shippingOrders++;
      else if (order.orderStatus === "CANCELLED") cancelledOrders++;

      if (order.items && Array.isArray(order.items)) {
        for (const item of order.items) {
          const key = item.productId ? item.productId.toString() : item.name;
          const existing = productMap.get(key);
          const itemTotal = (item.price || 0) * (item.quantity || 1);

          if (existing) {
            existing.totalQuantity += item.quantity || 1;
            existing.totalSpent += itemTotal;
            if (!existing.orderNumbers.includes(order.orderNumber)) {
              existing.orderNumbers.push(order.orderNumber);
            }
            if (new Date(order.createdAt) > new Date(existing.lastPurchasedAt)) {
              existing.lastPurchasedAt = order.createdAt;
            }
          } else {
            productMap.set(key, {
              productId: key,
              name: item.name,
              slug: item.slug || "",
              image: item.image || "",
              price: item.price || 0,
              totalQuantity: item.quantity || 1,
              totalSpent: itemTotal,
              lastPurchasedAt: order.createdAt,
              orderNumbers: [order.orderNumber],
            });
          }
        }
      }
    }

    const purchasedItems = Array.from(productMap.values()).sort(
      (a, b) => b.totalSpent - a.totalSpent
    );

    return NextResponse.json({
      success: true,
      data: {
        user,
        stats: {
          totalOrders,
          completedOrders,
          shippingOrders,
          cancelledOrders,
          totalSpent,
        },
        purchasedItems,
        orders,
      },
    });
  } catch (err: unknown) {
    console.error("Admin user details GET error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Lỗi tải thông tin chi tiết người dùng." } },
      { status: 500 }
    );
  }
}
