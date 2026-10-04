import { connectDB } from "@/lib/db";
import SharedOrder, { ISharedOrder } from "@/models/SharedOrder";
import Order from "@/models/Order";
import User from "@/models/User";
import { trackChallengeProgress, awardXP, checkAndUnlockBadge } from "@/lib/gamification";
import { analyticsService } from "@/services/analytics";

export interface CreateShareRequest {
  userId: string;
  orderId: string;
  quote?: string;
  template?: "modern" | "pastel" | "cyber" | "minimal";
  background?: string;
  showPrice?: boolean;
}

export class ShareService {
  async createSharedOrder(req: CreateShareRequest): Promise<ISharedOrder> {
    await connectDB();

    const [order, user] = await Promise.all([
      Order.findById(req.orderId),
      User.findById(req.userId),
    ]);

    if (!order) throw new Error("Order not found");
    if (!user) throw new Error("User not found");

    const shareId = "shopdee-" + Math.random().toString(36).substring(2, 9);

    const products = order.items.map((it) => ({
      name: it.name,
      image: it.image,
      price: it.price,
    }));

    const shared = await SharedOrder.create({
      shareId,
      userId: user._id,
      userName: user.name,
      userAvatar: user.avatar,
      orderNumber: order.orderNumber,
      orderId: order._id,
      itemCount: order.items.reduce((sum, it) => sum + it.quantity, 0),
      totalAmount: order.total,
      showPrice: req.showPrice !== false,
      quote: req.quote || "Tự thưởng cho bản thân một chút hôm nay ✨",
      template: req.template || "modern",
      background: req.background || "bg-gradient-to-tr from-blue-600 to-indigo-800",
      products,
    });

    // Gamification reward for sharing: +75 XP
    await awardXP(user._id.toString(), 75, "Khoe đơn hàng với bạn bè");
    await trackChallengeProgress(user._id.toString(), "SHARE_ORDER", 1);
    await checkAndUnlockBadge(user._id.toString(), "FIRST_SHARE");

    // Analytics
    await analyticsService.logEvent({
      userId: user._id.toString(),
      eventType: "share_order",
      metadata: { shareId, orderNumber: order.orderNumber },
    });

    return shared;
  }

  async getSharedOrder(shareId: string): Promise<ISharedOrder | null> {
    await connectDB();
    const doc = await SharedOrder.findOne({ shareId });
    if (doc) {
      doc.viewsCount = (doc.viewsCount || 0) + 1;
      await doc.save();
    }
    return doc;
  }
}

export const shareService = new ShareService();
