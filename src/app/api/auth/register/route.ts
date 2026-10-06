import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { hashPassword, signToken, AUTH_COOKIE_OPTIONS, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, username, email, password, gender, birthDate } = body;

    if (!name || !username || !email || !password) {
      return NextResponse.json(
        { success: false, error: { message: "Vui lòng điền đầy đủ các thông tin bắt buộc." } },
        { status: 400 }
      );
    }

    if (!gender || !gender.trim()) {
      return NextResponse.json(
        { success: false, error: { message: "Vui lòng chọn giới tính (thông tin bắt buộc)." } },
        { status: 400 }
      );
    }

    if (!birthDate || !birthDate.trim()) {
      return NextResponse.json(
        { success: false, error: { message: "Vui lòng chọn ngày sinh (thông tin bắt buộc)." } },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: { message: "Mật khẩu cần tối thiểu 6 ký tự." } },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { username: cleanUsername }],
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: { message: "Email hoặc tên đăng nhập đã được sử dụng." } },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const {
      acquisitionSource,
      acquisitionMedium,
      acquisitionCampaign,
      acquisitionReferrer,
    } = body;

    const userAgent = req.headers.get("user-agent") || "";
    const refererHeader = req.headers.get("referer") || "";
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip")?.trim() ||
      (req as unknown as { ip?: string }).ip ||
      "";

    const { classifyTraffic, parseUserAgent } = await import("@/lib/trafficClassifier");

    let finalSource = acquisitionSource?.trim() || "";
    let finalMedium = acquisitionMedium?.trim() || "";
    let finalCampaign = acquisitionCampaign?.trim() || "";
    let finalReferrer = acquisitionReferrer?.trim() || "";

    if (!finalSource || finalSource.toLowerCase() === "direct") {
      const classified = classifyTraffic(finalReferrer || refererHeader, undefined, userAgent);
      if (classified.source && classified.source.toLowerCase() !== "direct") {
        finalSource = classified.source;
        if (!finalMedium) finalMedium = classified.medium;
        if (!finalCampaign) finalCampaign = classified.campaign || "";
      }
    }
    if (!finalSource) finalSource = "Direct";

    const clientDevice = parseUserAgent(userAgent).device;

    const newUser = await User.create({
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      passwordHash,
      gender: gender.trim(),
      birthDate: birthDate.trim(),
      avatar: gender.trim() === "Nam"
        ? "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200"
        : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
      role: "user",
      level: 1,
      xp: 0,
      walletBalance: 0,
      favoriteCategories: [],
      acquisitionSource: finalSource,
      acquisitionMedium: finalMedium || "direct",
      acquisitionCampaign: finalCampaign,
      acquisitionReferrer: finalReferrer || refererHeader,
      registrationIp: clientIp,
      registrationDevice: clientDevice,
      isActive: true,
    });

    // Welcome notification
    await Notification.create({
      userId: newUser._id,
      title: "🎉 Chào mừng bạn đến với SHOPDEE!",
      message: "Chúc bạn có những trải nghiệm mua sắm tuyệt vời cùng dịch vụ giao hàng hỏa tốc 24h!",
      type: "system",
      link: "/products",
    });

    const token = signToken({
      userId: newUser._id.toString(),
      email: newUser.email,
      username: newUser.username,
      role: newUser.role,
      name: newUser.name,
    });

    const res = NextResponse.json({
      success: true,
      data: {
        user: {
          id: newUser._id,
          name: newUser.name,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          avatar: newUser.avatar,
          gender: newUser.gender,
          birthDate: newUser.birthDate,
          level: newUser.level,
          xp: newUser.xp,
          walletBalance: newUser.walletBalance,
        },
      },
    });

    res.cookies.set(COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);
    return res;
  } catch (err: unknown) {
    console.error("Register error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Có lỗi xảy ra khi tạo tài khoản. Vui lòng thử lại sau." } },
      { status: 500 }
    );
  }
}
