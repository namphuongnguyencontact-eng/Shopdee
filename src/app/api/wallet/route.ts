import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import Notification from "@/models/Notification";
import { getSessionFromRequest } from "@/lib/auth";
import { awardXP, trackChallengeProgress } from "@/lib/gamification";

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: { message: "Chưa đăng nhập." } }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ success: false, error: { message: "Không tìm thấy user." } }, { status: 404 });
    }

    // Recent transactions derived from orders + system rewards
    const orders = await Order.find({ userId: user._id, paymentMethod: "WALLET" })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const transactions = [
      {
        id: "tx-welcome",
        title: "Quà tặng chào mừng thành viên mới SHOPDEE",
        amount: 5000000,
        type: "INCOME",
        currency: "VIRTUAL_VND",
        date: user.createdAt,
      },
      ...orders.map((o) => ({
        id: "tx-" + o.orderNumber,
        title: `Thanh toán đơn hàng #${o.orderNumber}`,
        amount: -o.total,
        type: "EXPENSE",
        currency: "VIRTUAL_VND",
        date: o.createdAt,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      success: true,
      data: {
        balance: user.walletBalance,
        currency: "VIRTUAL_VND",
        isSimulation: true,
        transactions,
      },
    });
  } catch (err: unknown) {
    console.error("Wallet GET error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi tải số dư ví." } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: { message: "Chưa đăng nhập." } }, { status: 401 });
    }

    await connectDB();
    const { action } = await req.json();
    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ success: false, error: { message: "User không tồn tại." } }, { status: 404 });
    }

    if (action === "claim_daily") {
      // Check cooldown: check if daily claim was done in the last 20 hours
      const lastDailyNotif = await Notification.findOne({
        userId: user._id,
        title: { $regex: /Daily Reward/i },
        createdAt: { $gte: new Date(Date.now() - 20 * 3600000) },
      });

      if (lastDailyNotif) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: "Bạn đã nhận Daily Reward hôm nay rồi. Hãy quay lại vào ngày mai nhé!",
            },
          },
          { status: 400 }
        );
      }

      user.walletBalance += 100000;
      await user.save();

      await awardXP(user._id.toString(), 20, "Nhận Daily Reward điểm danh mỗi ngày");
      await trackChallengeProgress(user._id.toString(), "CLAIM_DAILY", 1);

      await Notification.create({
        userId: user._id,
        title: "🎁 Nhận Daily Reward thành công!",
        message: "Bạn vừa nhận thêm +100.000₫ vào ví và +20 XP!",
        type: "reward",
        link: "/rewards",
      });

      return NextResponse.json({
        success: true,
        data: {
          balance: user.walletBalance,
          message: "Đã nhận +100.000₫ vào ví và +20 XP!",
        },
      });
    }

    if (action === "add_funds") {
      // Top-up bonus funds
      user.walletBalance += 1000000;
      await user.save();

      return NextResponse.json({
        success: true,
        data: {
          balance: user.walletBalance,
          message: "Đã nạp thêm 1.000.000₫ vào ví của bạn!",
        },
      });
    }

    return NextResponse.json({ success: false, error: { message: "Hành động không hợp lệ." } }, { status: 400 });
  } catch (err: unknown) {
    console.error("Wallet POST error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi xử lý ví." } }, { status: 500 });
  }
}
