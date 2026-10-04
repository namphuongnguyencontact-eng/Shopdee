import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".pdf": "application/pdf",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    if (!pathSegments || pathSegments.length === 0) {
      return new NextResponse("File not found", { status: 404 });
    }

    const uploadsBase = path.resolve(process.cwd(), "public", "uploads");
    const safePath = path.resolve(uploadsBase, ...pathSegments);

    // Security check: ensure target path is within uploads directory
    if (!safePath.startsWith(uploadsBase)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    try {
      const stats = await fs.stat(safePath);
      if (!stats.isFile()) {
        return new NextResponse("File not found", { status: 404 });
      }

      const fileBuffer = await fs.readFile(safePath);
      const ext = path.extname(safePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || "application/octet-stream";

      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Length": stats.size.toString(),
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch {
      return new NextResponse("File not found", { status: 404 });
    }
  } catch (err: unknown) {
    console.error("Uploads route handler error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
