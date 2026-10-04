import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: { message: "Vui lòng đăng nhập để tải ảnh." } },
        { status: 401 }
      );
    }

    const contentType = req.headers.get("content-type") || "";

    // Case 1: Base64 data URL via JSON
    if (contentType.includes("application/json")) {
      const { imageBase64 } = await req.json();
      if (!imageBase64 || typeof imageBase64 !== "string") {
        return NextResponse.json(
          { success: false, error: { message: "Dữ liệu ảnh không hợp lệ." } },
          { status: 400 }
        );
      }

      await connectDB();
      const updatedUser = await User.findByIdAndUpdate(
        session.userId,
        { $set: { avatar: imageBase64 } },
        { new: true }
      ).select("-passwordHash");

      return NextResponse.json({
        success: true,
        data: { url: imageBase64, user: updatedUser },
      });
    }

    // Case 2: Multipart Form Data with direct file upload
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { success: false, error: { message: "Không tìm thấy tệp ảnh." } },
          { status: 400 }
        );
      }

      const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!allowedMimes.includes(file.type)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: "Định dạng không hợp lệ. Chỉ chấp nhận JPEG, PNG, WebP hoặc GIF.",
            },
          },
          { status: 400 }
        );
      }

      // Check max size: 5MB
      const MAX_SIZE = 5 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { success: false, error: { message: "Kích thước tệp quá lớn. Tối đa 5MB." } },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
      await fs.mkdir(uploadDir, { recursive: true });

      const ext = path.extname(file.name) || `.${file.type.split("/")[1] || "jpg"}`;
      const uniqueName = `avatar_${session.userId}_${Date.now()}${ext}`;
      const filePath = path.join(uploadDir, uniqueName);

      await fs.writeFile(filePath, buffer);

      const publicUrl = `/uploads/avatars/${uniqueName}`;

      await connectDB();
      const updatedUser = await User.findByIdAndUpdate(
        session.userId,
        { $set: { avatar: publicUrl } },
        { new: true }
      ).select("-passwordHash");

      return NextResponse.json({
        success: true,
        data: {
          url: publicUrl,
          user: updatedUser,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: { message: "Content-Type không được hỗ trợ." } },
      { status: 400 }
    );
  } catch (err: unknown) {
    console.error("Avatar upload error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Lỗi tải ảnh đại diện lên máy chủ." } },
      { status: 500 }
    );
  }
}
