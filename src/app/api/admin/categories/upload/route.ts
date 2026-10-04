import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, error: { message: "Không có quyền Quản trị viên." } },
        { status: 403 }
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
      return NextResponse.json({
        success: true,
        data: { url: imageBase64 },
      });
    }

    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { success: false, error: { message: "Định dạng gửi không hợp lệ." } },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file || !(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { success: false, error: { message: "Không tìm thấy tệp ảnh tải lên." } },
        { status: 400 }
      );
    }

    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
      "image/avif",
    ];

    if (!allowedMimes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `Định dạng tệp "${file.name}" không hợp lệ. Chỉ chấp nhận JPG, PNG, WebP, GIF, SVG, AVIF.`,
          },
        },
        { status: 400 }
      );
    }

    const MAX_SIZE = 15 * 1024 * 1024; // 15MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: { message: `Kích thước tệp quá lớn (${(file.size / 1024 / 1024).toFixed(1)}MB). Giới hạn tối đa là 15MB.` },
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads", "categories");
    await fs.mkdir(uploadDir, { recursive: true });

    const rawExt = path.extname(file.name) || `.${file.type.split("/")[1] || "jpg"}`;
    const cleanExt = rawExt.toLowerCase() === ".jpeg" ? ".jpg" : rawExt.toLowerCase();
    const uniqueName = `cat_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${cleanExt}`;
    const filePath = path.join(uploadDir, uniqueName);

    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/categories/${uniqueName}`;

    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
        filename: uniqueName,
        size: file.size,
      },
    });
  } catch (err: unknown) {
    console.error("Category image upload error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Đã xảy ra lỗi khi lưu tệp ảnh lên máy chủ." } },
      { status: 500 }
    );
  }
}
