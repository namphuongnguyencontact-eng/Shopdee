import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: true, data: { user: null } });
    }

    await connectDB();
    const user = await User.findById(session.userId).select("-passwordHash");
    if (!user || !user.isActive) {
      return NextResponse.json({ success: true, data: { user: null } });
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          phone: user.phone || "",
          address: user.address || "",
          city: user.city || "",
          defaultShippingAddress: user.defaultShippingAddress?.address ? user.defaultShippingAddress : null,
          gender: user.gender || "",
          birthDate: user.birthDate || "",
          level: user.level,
          xp: user.xp,
          walletBalance: user.walletBalance,
          favoriteCategories: user.favoriteCategories,
        },
      },
    });
  } catch (err: unknown) {
    console.error("Auth me error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Không thể xác thực người dùng." } },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: { message: "Bạn chưa đăng nhập." } },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await req.json();
    const { name, avatar, phone, address, gender, birthDate, favoriteCategories } = body;

    const user = await User.findById(session.userId);
    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, error: { message: "Tài khoản không tồn tại." } },
        { status: 404 }
      );
    }

    if (typeof name === "string" && name.trim()) {
      user.name = name.trim();
    }
    if (typeof avatar === "string" && avatar.trim()) {
      user.avatar = avatar.trim();
    }
    if (typeof phone === "string") {
      user.phone = phone.trim();
    }
    if (typeof address === "string") {
      user.address = address.trim();
    }
    if (typeof gender === "string") {
      user.gender = gender.trim();
    }
    if (typeof birthDate === "string") {
      user.birthDate = birthDate.trim();
    }
    if (Array.isArray(favoriteCategories)) {
      user.favoriteCategories = favoriteCategories;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          phone: user.phone || "",
          address: user.address || "",
          city: user.city || "",
          defaultShippingAddress: user.defaultShippingAddress?.address ? user.defaultShippingAddress : null,
          gender: user.gender || "",
          birthDate: user.birthDate || "",
          level: user.level,
          xp: user.xp,
          walletBalance: user.walletBalance,
          favoriteCategories: user.favoriteCategories,
        },
      },
    });
  } catch (err: unknown) {
    console.error("Update profile error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Lỗi cập nhật thông tin hồ sơ." } },
      { status: 500 }
    );
  }
}
