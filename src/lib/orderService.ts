import mongoose from "mongoose";
import Order, { IOrder } from "@/models/Order";
import { productSalesService } from "@/services/productSales";

export const DELIVERY_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours real-time

/**
 * Checks if a single order in SHIPPING status has passed 24 real-time hours,
 * and if so, advances it to COMPLETED with delivery timeline entry.
 */
export async function syncOrderDeliveryStatus(order: any): Promise<boolean> {
  if (!order || order.orderStatus !== "SHIPPING") {
    return false;
  }

  const orderCreatedAt = new Date(order.createdAt).getTime();
  const now = Date.now();
  const elapsed = now - orderCreatedAt;

  if (elapsed >= DELIVERY_DURATION_MS) {
    const deliveryTimestamp = new Date(orderCreatedAt + DELIVERY_DURATION_MS);

    await Order.updateOne(
      { _id: order._id, orderStatus: "SHIPPING" },
      {
        $set: {
          orderStatus: "COMPLETED",
          salesRecorded: true,
          salesRecordedAt: deliveryTimestamp,
        },
        $push: {
          timeline: {
            status: "COMPLETED",
            title: "Giao hàng thành công",
            description: "Đơn hàng đã được giao thành công đến bạn. Cảm ơn bạn đã mua sắm tại SHOPDEE!",
            timestamp: deliveryTimestamp,
          },
        },
      }
    );

    // Record sales count if not already recorded
    try {
      await productSalesService.recordOrderSales(order._id.toString());
    } catch (e) {
      console.error("Error recording sales during syncOrderDeliveryStatus:", e);
    }

    order.orderStatus = "COMPLETED";
    return true;
  }

  return false;
}

/**
 * Scans all orders in SHIPPING status older than 24 hours and advances them to COMPLETED.
 * Can filter by userId for user-specific queries.
 */
export async function autoAdvanceDeliveredOrders(userId?: string | mongoose.Types.ObjectId): Promise<number> {
  try {
    const oneDayAgo = new Date(Date.now() - DELIVERY_DURATION_MS);
    const filter: Record<string, unknown> = {
      orderStatus: "SHIPPING",
      createdAt: { $lte: oneDayAgo },
    };

    if (userId) {
      filter.userId = userId;
    }

    const dueOrders = await Order.find(filter);
    let updatedCount = 0;

    for (const order of dueOrders) {
      const deliveryTimestamp = new Date(new Date(order.createdAt).getTime() + DELIVERY_DURATION_MS);
      order.orderStatus = "COMPLETED";
      order.salesRecorded = true;
      order.salesRecordedAt = deliveryTimestamp;
      order.timeline.push({
        status: "COMPLETED",
        title: "Giao hàng thành công",
        description: "Đơn hàng đã được giao thành công đến bạn. Cảm ơn bạn đã mua sắm tại SHOPDEE!",
        timestamp: deliveryTimestamp,
      });

      await order.save();

      try {
        await productSalesService.recordOrderSales(order._id.toString());
      } catch (err) {
        console.error("Error recording sales during autoAdvanceDeliveredOrders:", err);
      }

      updatedCount++;
    }

    return updatedCount;
  } catch (error) {
    console.error("Failed to autoAdvanceDeliveredOrders:", error);
    return 0;
  }
}
