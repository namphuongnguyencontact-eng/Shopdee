import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: { message: "Không có quyền Admin." } }, { status: 403 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [{ name: regex }, { email: regex }, { username: regex }];
    }

    const [users, total] = await Promise.all([
      User.find(query).select("-passwordHash").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(query),
    ]);

    const userIds = users.map((u) => u._id);
    const OrderModel = (await import("@/models/Order")).default;
    const orderStats = await OrderModel.aggregate([
      { $match: { userId: { $in: userIds } } },
      {
        $group: {
          _id: "$userId",
          orderCount: { $sum: 1 },
          totalSpent: {
            $sum: {
              $cond: [{ $ne: ["$orderStatus", "CANCELLED"] }, "$total", 0],
            },
          },
        },
      },
    ]);

    const statsMap = new Map(orderStats.map((s) => [s._id.toString(), s]));

    const usersWithStats = users.map((u) => {
      const stat = statsMap.get(u._id.toString());
      return {
        ...u,
        orderCount: stat ? stat.orderCount : 0,
        totalSpent: stat ? stat.totalSpent : 0,
      };
    });

    return NextResponse.json({
      success: true,
      data: usersWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: unknown) {
    console.error("Admin users GET error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi tải danh sách người dùng." } }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: { message: "Không có quyền Admin." } }, { status: 403 });
    }

    await connectDB();
    const { userId, isActive, role } = await req.json();

    if (!userId) {
      return NextResponse.json({ success: false, error: { message: "Thiếu userId." } }, { status: 400 });
    }

    const update: Record<string, unknown> = {};
    if (isActive !== undefined) update.isActive = Boolean(isActive);
    if (role && ["user", "admin"].includes(role)) update.role = role;

    const updated = await User.findByIdAndUpdate(userId, { $set: update }, { new: true }).select("-passwordHash");
    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    console.error("Admin users PUT error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi cập nhật người dùng." } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: { message: "Không có quyền Admin." } }, { status: 403 });
    }

    await connectDB();
    const { userId, action, amount } = await req.json();

    if (action === "reset_xp" && userId) {
      await User.findByIdAndUpdate(userId, { $set: { xp: 0, level: 1 } });
      return NextResponse.json({ success: true, data: { message: "Đã reset XP về 0." } });
    }

    if (action === "adjust_wallet" && userId) {
      await User.findByIdAndUpdate(userId, { $inc: { walletBalance: Number(amount) || 0 } });
      return NextResponse.json({ success: true, data: { message: "Đã điều chỉnh ví thành công." } });
    }

    return NextResponse.json({ success: false, error: { message: "Hành động không hợp lệ." } }, { status: 400 });
  } catch (err: unknown) {
    console.error("Admin users action error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi thực hiện thao tác." } }, { status: 500 });
  }
}
