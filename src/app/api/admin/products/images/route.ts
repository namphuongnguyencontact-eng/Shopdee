import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: { message: "Không có quyền Admin." } }, { status: 403 });
    }

    const contentType = req.headers.get("content-type") || "";

    // Case 1: JSON payload with external URL
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const { url, alt, isPrimary, sortOrder } = body;

      if (!url || typeof url !== "string") {
        return NextResponse.json({ success: false, error: { message: "URL ảnh không hợp lệ." } }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        data: {
          url: url.trim(),
          alt: alt || "Ảnh sản phẩm SHOPDEE",
          isPrimary: Boolean(isPrimary),
          sortOrder: Number(sortOrder) || 0,
        },
      });
    }

    // Case 2: Multipart Form Data with actual file upload(s)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      // Handle multiple files under "files" or "file"
      const rawFiles = [...formData.getAll("files"), ...formData.getAll("file")].filter(
        (item): item is File => item instanceof File && item.size > 0
      );

      const alt = (formData.get("alt") as string) || "Ảnh sản phẩm SHOPDEE";
      const isPrimary = formData.get("isPrimary") === "true";
      const startSortOrder = Number(formData.get("sortOrder")) || 0;

      if (rawFiles.length === 0) {
        return NextResponse.json({ success: false, error: { message: "Không có tệp ảnh nào được gửi." } }, { status: 400 });
      }

      // Check MIME type & size
      const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB per file

      const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
      await fs.mkdir(uploadDir, { recursive: true });

      const uploadedResults = [];

      for (let i = 0; i < rawFiles.length; i++) {
        const file = rawFiles[i];

        if (!allowedMimes.includes(file.type)) {
          return NextResponse.json(
            { success: false, error: { message: `Định dạng tệp "${file.name}" không hợp lệ. Chỉ chấp nhận JPEG, PNG, WebP, GIF, AVIF.` } },
            { status: 400 }
          );
        }

        if (file.size > MAX_SIZE) {
          return NextResponse.json(
            { success: false, error: { message: `Tệp "${file.name}" quá lớn. Tối đa 10MB/ảnh.` } },
            { status: 400 }
          );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const ext = path.extname(file.name) || `.${file.type.split("/")[1] || "jpg"}`;
        const uniqueName = `prod_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 8)}${ext}`;
        const filePath = path.join(uploadDir, uniqueName);

        await fs.writeFile(filePath, buffer);

        const publicUrl = `/uploads/products/${uniqueName}`;

        uploadedResults.push({
          url: publicUrl,
          alt: file.name ? file.name.replace(/\.[^/.]+$/, "") : alt,
          isPrimary: i === 0 ? isPrimary : false,
          sortOrder: startSortOrder + i,
        });
      }

      return NextResponse.json({
        success: true,
        data: uploadedResults,
      });
    }

    return NextResponse.json({ success: false, error: { message: "Content-Type không được hỗ trợ." } }, { status: 400 });
  } catch (err: unknown) {
    console.error("Image upload error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi tải lên ảnh." } }, { status: 500 });
  }
}
