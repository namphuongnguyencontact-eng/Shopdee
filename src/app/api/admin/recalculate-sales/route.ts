import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { productSalesService } from "@/services/productSales";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: { message: "Không có quyền Admin." } }, { status: 403 });
    }

    const result = await productSalesService.recalculateAllProductSales();

    return NextResponse.json({
      success: true,
      data: {
        message: `Đã đồng bộ lại số lượng bán thành công cho ${result.updatedProductsCount} sản phẩm từ ${result.totalOrdersProcessed} đơn hàng!`,
        ...result,
      },
    });
  } catch (err: unknown) {
    console.error("Recalculate sales error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi đồng bộ số lượng bán." } }, { status: 500 });
  }
}
