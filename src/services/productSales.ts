import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";

export class ProductSalesService {
  /**
   * Idempotently records product sales count when an order is completed.
   */
  async recordOrderSales(orderId: string): Promise<boolean> {
    await connectDB();
    const order = await Order.findById(orderId);
    if (!order) return false;

    // Only record if order is in a successful state AND not already recorded
    const isSuccessful =
      order.orderStatus !== "CANCELLED" &&
      (order.orderStatus === "COMPLETED" ||
        order.orderStatus === "SHIPPING" ||
        order.paymentStatus === "COMPLETED");
    if (!isSuccessful || order.salesRecorded) {
      return false;
    }

    // Increment each product's soldCount by exact item quantity
    for (const item of order.items) {
      if (item.productId && item.quantity > 0) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { soldCount: item.quantity },
        });
      }
    }

    order.salesRecorded = true;
    order.salesRecordedAt = new Date();
    await order.save();

    return true;
  }

  /**
   * Idempotently reverses product sales count if an order is cancelled/reverted.
   */
  async reverseOrderSales(orderId: string): Promise<boolean> {
    await connectDB();
    const order = await Order.findById(orderId);
    if (!order) return false;

    // Only reverse if sales were previously recorded
    if (!order.salesRecorded) {
      return false;
    }

    for (const item of order.items) {
      if (item.productId && item.quantity > 0) {
        // Prevent negative soldCount
        const prod = await Product.findById(item.productId);
        if (prod) {
          const newSoldCount = Math.max(0, (prod.soldCount || 0) - item.quantity);
          prod.soldCount = newSoldCount;
          await prod.save();
        }
      }
    }

    order.salesRecorded = false;
    await order.save();

    return true;
  }

  /**
   * Recalculates soldCount for all products based on Order database as single source of truth.
   */
  async recalculateAllProductSales(): Promise<{
    updatedProductsCount: number;
    totalUnitsSold: number;
    totalOrdersProcessed: number;
  }> {
    await connectDB();

    // 1. Fetch all valid non-cancelled orders
    const validOrders = await Order.find({
      orderStatus: { $ne: "CANCELLED" },
      paymentStatus: { $ne: "FAILED" },
    }).lean();

    // 2. Aggregate quantity per product
    const salesMap: Record<string, number> = {};
    let totalUnits = 0;

    for (const order of validOrders) {
      for (const item of order.items) {
        if (item.productId) {
          const pid = item.productId.toString();
          salesMap[pid] = (salesMap[pid] || 0) + (item.quantity || 1);
          totalUnits += item.quantity || 1;
        }
      }
    }

    // 3. Update all products
    const allProducts = await Product.find({}).select("_id soldCount").lean();
    let updatedCount = 0;

    for (const prod of allProducts) {
      const pid = prod._id.toString();
      const actualSales = salesMap[pid] || 0;

      await Product.findByIdAndUpdate(prod._id, { $set: { soldCount: actualSales } });
      updatedCount++;
    }

    // 4. Mark salesRecorded = true on all valid orders
    await Order.updateMany(
      { orderStatus: { $ne: "CANCELLED" }, paymentStatus: { $ne: "FAILED" }, salesRecorded: { $ne: true } },
      { $set: { salesRecorded: true, salesRecordedAt: new Date() } }
    );

    return {
      updatedProductsCount: updatedCount,
      totalUnitsSold: totalUnits,
      totalOrdersProcessed: validOrders.length,
    };
  }
}

export const productSalesService = new ProductSalesService();
