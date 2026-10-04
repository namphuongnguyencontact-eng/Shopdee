import { NextRequest, NextResponse } from "next/server";
import { shareService } from "@/services/share";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await params;
    const shared = await shareService.getSharedOrder(shareId);

    if (!shared) {
      return NextResponse.json(
        { success: false, error: { message: "Không tìm thấy card đơn hàng chia sẻ này." } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: shared,
    });
  } catch (err: unknown) {
    console.error("Shared order GET error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Lỗi tải card đơn hàng." } },
      { status: 500 }
    );
  }
}
