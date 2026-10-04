import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import Voucher from "@/models/Voucher";
import Cart from "@/models/Cart";
import Notification from "@/models/Notification";
import TrafficSession from "@/models/TrafficSession";
import { getSessionFromRequest } from "@/lib/auth";
import { autoAdvanceDeliveredOrders } from "@/lib/orderService";
import { analyticsService } from "@/services/analytics";
import { paymentService } from "@/services/payment";
import { productSalesService } from "@/services/productSales";

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: { message: "Chưa đăng nhập." } }, { status: 401 });
    }

    await connectDB();
    await autoAdvanceDeliveredOrders(session.userId);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const query: Record<string, unknown> = { userId: session.userId };
    if (status && status !== "ALL") {
      query.orderStatus = status;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (err: unknown) {
    console.error("Orders GET error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Không thể tải danh sách đơn hàng." } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: { message: "Vui lòng đăng nhập để tiến hành đặt hàng." } },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await req.json();
    const { items, shippingAddress, voucherCode, paymentMethod = "SIMULATED_COD", visitorId, sessionId } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: { message: "Giỏ hàng rỗng. Vui lòng chọn sản phẩm." } },
        { status: 400 }
      );
    }

    // SERVER-SIDE PRICE PROTECTION: Fetch all products fresh from MongoDB
    let subtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || product.status !== "active") {
        return NextResponse.json(
          { success: false, error: { message: `Sản phẩm "${item.name || item.productId}" không còn tồn tại.` } },
          { status: 400 }
        );
      }

      const qty = Math.max(1, Number(item.quantity) || 1);
      const unitPrice = product.isFlashSale && product.flashSalePrice ? product.flashSalePrice : product.price;
      subtotal += unitPrice * qty;

      verifiedItems.push({
        productId: product._id,
        name: product.name,
        slug: product.slug,
        image: product.images[0] || "",
        price: unitPrice,
        quantity: qty,
        variantName: item.variantName || "Mặc định",
      });
    }

    // Server-side Voucher Validation
    let discountAmount = 0;
    let appliedVoucher = null;
    if (voucherCode) {
      const cleanCode = voucherCode.trim().toUpperCase();
      const v = await Voucher.findOne({ code: cleanCode, isActive: true });
      if (v && v.endDate >= new Date() && subtotal >= v.minOrderValue) {
        if (v.discountType === "PERCENT") {
          discountAmount = Math.round((subtotal * v.discountValue) / 100);
          if (v.maxDiscount && discountAmount > v.maxDiscount) {
            discountAmount = v.maxDiscount;
          }
        } else {
          discountAmount = Math.min(subtotal, v.discountValue);
        }
        appliedVoucher = v;
      }
    }

    const shippingFee = 0; // Free simulated shipping
    const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

    // User wallet balance check
    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: "Không tìm thấy thông tin tài khoản." } },
        { status: 404 }
      );
    }

    // Process Payment via Service Abstraction
    const orderNumber = "VN" + Math.floor(100000 + Math.random() * 900000);
    const paymentResult = await paymentService.processPayment({
      orderId: orderNumber,
      orderNumber,
      amount: finalTotal,
      userId: user._id.toString(),
      paymentMethod,
    });

    // Traffic Attribution lookup
    let attribution = undefined;
    if (sessionId || visitorId) {
      const trafficSession = await TrafficSession.findOne(sessionId ? { sessionId } : { visitorId });
      if (trafficSession) {
        attribution = {
          visitorId: trafficSession.visitorId,
          sessionId: trafficSession.sessionId,
          firstTouchSource: trafficSession.source,
          firstTouchMedium: trafficSession.medium,
          firstTouchCampaign: trafficSession.campaign,
          lastTouchSource: trafficSession.source,
          lastTouchMedium: trafficSession.medium,
          lastTouchCampaign: trafficSession.campaign,
          landingPage: trafficSession.landingPage,
        };
        trafficSession.hasPurchased = true;
        await trafficSession.save();
      }
    }

    // Validate shipping address
    if (
      !shippingAddress?.fullName?.trim() ||
      !shippingAddress?.phone?.trim() ||
      !shippingAddress?.address?.trim() ||
      !shippingAddress?.city?.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Vui lòng điền đầy đủ thông tin giao hàng: Họ tên, Số điện thoại, Địa chỉ nhận hàng và Tỉnh/Thành phố.",
          },
        },
        { status: 400 }
      );
    }

    // Create Order in MongoDB with SHIPPING status (delivering)
    const newOrder = await Order.create({
      orderNumber,
      userId: user._id,
      items: verifiedItems,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        phone: shippingAddress.phone.trim(),
        city: shippingAddress.city.trim(),
        district: shippingAddress?.district || "",
        address: shippingAddress.address.trim(),
        isSimulated: true,
      },
      subtotal,
      discount: discountAmount,
      shippingFee,
      total: finalTotal,
      voucherCode: appliedVoucher ? appliedVoucher.code : undefined,
      paymentMethod,
      paymentStatus: paymentResult.success ? "COMPLETED" : "FAILED",
      orderStatus: "SHIPPING",
      isSimulation: true,
      analyticsAttribution: attribution,
      salesRecorded: false,
      timeline: [
        {
          status: "PLACED",
          title: "Đặt hàng thành công",
          description: `Đơn hàng #${orderNumber} đã được hệ thống tiếp nhận.`,
          timestamp: new Date(),
        },
        {
          status: "CONFIRMED",
          title: "Đã xác nhận đơn hàng",
          description: "Hệ thống SHOPDEE đã xác nhận đơn hàng và chuẩn bị kiện hàng.",
          timestamp: new Date(),
        },
        {
          status: "SHIPPING",
          title: "Đơn hàng đang trên đường vận chuyển",
          description: "Đơn vị vận chuyển SHOPDEE Express đã tiếp nhận và đang phát hàng. Dự kiến giao trong 24 giờ.",
          timestamp: new Date(),
        },
      ],
    });

    // Save this address as user's defaultShippingAddress for future purchases
    await User.findByIdAndUpdate(user._id, {
      $set: {
        phone: shippingAddress.phone.trim(),
        address: shippingAddress.address.trim(),
        city: shippingAddress.city.trim(),
        defaultShippingAddress: {
          fullName: shippingAddress.fullName.trim(),
          phone: shippingAddress.phone.trim(),
          address: shippingAddress.address.trim(),
          city: shippingAddress.city.trim(),
        },
      },
    });

    // Record product sales accurately
    await productSalesService.recordOrderSales(newOrder._id.toString());

    // Update voucher usage if applied
    if (appliedVoucher) {
      await Voucher.updateOne({ _id: appliedVoucher._id }, { $inc: { usedCount: 1 } });
    }

    // Clear checked items from Cart
    await Cart.updateOne(
      { userId: user._id },
      { $pull: { items: { productId: { $in: verifiedItems.map((it) => it.productId) } } } }
    );

    // Create In-App Notification (No gamification XP text)
    await Notification.create({
      userId: user._id,
      title: `🛍️ Đặt hàng thành công #${orderNumber}`,
      message: `Đơn hàng ${finalTotal.toLocaleString("vi-VN")}₫ đã được tiếp nhận và đang trên đường vận chuyển tới bạn!`,
      type: "order",
      link: `/orders/${newOrder._id}`,
    });

    // Analytics Event
    await analyticsService.logEvent({
      userId: user._id.toString(),
      sessionId,
      visitorId,
      source: attribution?.lastTouchSource,
      medium: attribution?.lastTouchMedium,
      campaign: attribution?.lastTouchCampaign,
      eventType: "order_completed",
      metadata: { orderNumber, total: finalTotal, itemsCount: verifiedItems.length },
    });

    return NextResponse.json({
      success: true,
      data: {
        order: newOrder,
      },
    });
  } catch (err: unknown) {
    console.error("Order creation error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Lỗi hệ thống khi tạo đơn hàng." } },
      { status: 500 }
    );
  }
}
