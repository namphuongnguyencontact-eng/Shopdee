import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: true, data: { notifications: [], unreadCount: 0 } });
    }

    await connectDB();
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ userId: session.userId }).sort({ createdAt: -1 }).limit(30).lean(),
      Notification.countDocuments({ userId: session.userId, isRead: false }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (err: unknown) {
    console.error("Notifications GET error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi tải thông báo." } }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: { message: "Chưa đăng nhập." } }, { status: 401 });
    }

    await connectDB();
    const { notificationId, markAllAsRead } = await req.json();

    if (markAllAsRead) {
      await Notification.updateMany({ userId: session.userId, isRead: false }, { $set: { isRead: true } });
    } else if (notificationId) {
      await Notification.updateOne({ _id: notificationId, userId: session.userId }, { $set: { isRead: true } });
    }

    return NextResponse.json({ success: true, data: { message: "Đã cập nhật thông báo." } });
  } catch (err: unknown) {
    console.error("Notifications PUT error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi cập nhật." } }, { status: 500 });
  }
}
