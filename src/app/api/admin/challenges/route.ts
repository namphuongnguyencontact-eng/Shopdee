import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Challenge from "@/models/Challenge";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: { message: "Không có quyền Admin." } }, { status: 403 });
    }

    await connectDB();
    const challenges = await Challenge.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: challenges });
  } catch (err: unknown) {
    console.error("Admin challenges GET error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi tải nhiệm vụ." } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: { message: "Không có quyền Admin." } }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const { code, title, description, category, type, targetCount, xpReward, walletReward } = body;

    if (!code || !title || !type) {
      return NextResponse.json({ success: false, error: { message: "Vui lòng nhập đủ mã, tiêu đề và loại." } }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = await Challenge.findOne({ code: cleanCode });
    if (existing) {
      return NextResponse.json({ success: false, error: { message: "Mã nhiệm vụ đã tồn tại." } }, { status: 400 });
    }

    const newChallenge = await Challenge.create({
      code: cleanCode,
      title: title.trim(),
      description: description || title,
      category: category || "DAILY",
      type,
      targetCount: Number(targetCount) || 1,
      xpReward: Number(xpReward) || 50,
      walletReward: Number(walletReward) || 100000,
      isActive: true,
    });

    return NextResponse.json({ success: true, data: newChallenge });
  } catch (err: unknown) {
    console.error("Admin challenges POST error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi tạo nhiệm vụ." } }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: { message: "Không có quyền Admin." } }, { status: 403 });
    }

    await connectDB();
    const { id, isActive, title, description, xpReward, walletReward } = await req.json();

    const update: Record<string, unknown> = {};
    if (isActive !== undefined) update.isActive = Boolean(isActive);
    if (title) update.title = title;
    if (description) update.description = description;
    if (xpReward !== undefined) update.xpReward = Number(xpReward);
    if (walletReward !== undefined) update.walletReward = Number(walletReward);

    const updated = await Challenge.findByIdAndUpdate(id, { $set: update }, { new: true });
    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    console.error("Admin challenges PUT error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi cập nhật nhiệm vụ." } }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: { message: "Không có quyền Admin." } }, { status: 403 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    await Challenge.findByIdAndDelete(id);
    return NextResponse.json({ success: true, data: { message: "Đã xóa nhiệm vụ." } });
  } catch (err: unknown) {
    console.error("Admin challenges DELETE error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi xóa nhiệm vụ." } }, { status: 500 });
  }
}
