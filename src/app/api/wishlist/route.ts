import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Wishlist from "@/models/Wishlist";
import Product from "@/models/Product";
import { getSessionFromRequest } from "@/lib/auth";
import { analyticsService } from "@/services/analytics";

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: true, data: { products: [] } });
    }

    await connectDB();
    const wishlist = await Wishlist.findOne({ userId: session.userId }).populate("productIds").lean();
    return NextResponse.json({
      success: true,
      data: {
        products: wishlist ? wishlist.productIds : [],
      },
    });
  } catch (err: unknown) {
    console.error("Wishlist GET error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Không thể tải danh sách yêu thích." } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: { message: "Vui lòng đăng nhập để lưu sản phẩm yêu thích." } },
        { status: 401 }
      );
    }

    await connectDB();
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, error: { message: "Thiếu ID sản phẩm." } },
        { status: 400 }
      );
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: { message: "Sản phẩm không tồn tại." } },
        { status: 404 }
      );
    }

    let wishlist = await Wishlist.findOne({ userId: session.userId });
    if (!wishlist) {
      wishlist = new Wishlist({ userId: session.userId, productIds: [] });
    }

    const exists = wishlist.productIds.some((id) => id.toString() === productId);
    let isAdded = false;

    if (exists) {
      wishlist.productIds = wishlist.productIds.filter((id) => id.toString() !== productId);
    } else {
      wishlist.productIds.push(product._id);
      isAdded = true;

      await analyticsService.logEvent({
        userId: session.userId,
        eventType: "product_like",
        productId: product._id.toString(),
      });
    }

    await wishlist.save();

    return NextResponse.json({
      success: true,
      data: {
        isAdded,
        productIds: wishlist.productIds,
        message: isAdded ? "Đã thêm vào danh sách yêu thích" : "Đã bỏ khỏi danh sách yêu thích",
      },
    });
  } catch (err: unknown) {
    console.error("Wishlist POST error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Lỗi cập nhật yêu thích." } },
      { status: 500 }
    );
  }
}
