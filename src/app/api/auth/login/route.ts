import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { comparePassword, signToken, AUTH_COOKIE_OPTIONS, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const identifier = body.identifier || body.email || body.username;
    const password = body.password;

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: { message: "Vui lòng nhập email/tên đăng nhập và mật khẩu." } },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    console.log("LOGIN ATTEMPT:", cleanIdentifier);
    const user = await User.findOne({
      $or: [{ email: cleanIdentifier }, { username: cleanIdentifier }],
    });
    console.log("USER FOUND IN DB:", user?.email, "ROLE:", user?.role);

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: "Tài khoản hoặc mật khẩu không chính xác." } },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: { message: "Tài khoản của bạn tạm thời bị khóa. Vui lòng liên hệ Admin." } },
        { status: 403 }
      );
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: { message: "Tài khoản hoặc mật khẩu không chính xác." } },
        { status: 401 }
      );
    }

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
      name: user.name,
    });

    const res = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          level: user.level,
          xp: user.xp,
          walletBalance: user.walletBalance,
        },
        token,
      },
    });

    res.cookies.set(COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);
    return res;
  } catch (err: unknown) {
    console.error("Login error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau." } },
      { status: 500 }
    );
  }
}
