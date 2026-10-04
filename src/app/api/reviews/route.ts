import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Review from "@/models/Review";
import Product from "@/models/Product";
import User from "@/models/User";
import { getSessionFromRequest } from "@/lib/auth";
import { analyticsService } from "@/services/analytics";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ success: false, error: { message: "Thiếu productId." } }, { status: 400 });
    }

    await connectDB();
    const reviews = await Review.find({ productId, status: "approved" })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: reviews,
    });
  } catch (err: unknown) {
    console.error("Reviews GET error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi tải đánh giá." } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: { message: "Vui lòng đăng nhập để đánh giá." } }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { productId, rating, comment, variantName, images } = body;

    if (!productId || !rating || !comment) {
      return NextResponse.json({ success: false, error: { message: "Vui lòng nhập số sao và nội dung." } }, { status: 400 });
    }

    const [user, product] = await Promise.all([
      User.findById(session.userId),
      Product.findById(productId),
    ]);

    if (!user || !product) {
      return NextResponse.json({ success: false, error: { message: "Không tìm thấy sản phẩm." } }, { status: 404 });
    }

    const review = await Review.create({
      productId: product._id,
      userId: user._id,
      userName: user.name,
      userAvatar: user.avatar,
      rating: Math.min(5, Math.max(1, Number(rating))),
      comment: comment.trim(),
      variantName,
      images: Array.isArray(images) ? images : [],
      status: "approved",
    });

    // Recalculate product ratingAverage and reviewCount
    const allReviews = await Review.find({ productId: product._id, status: "approved" });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    product.ratingAverage = Number(avg.toFixed(1));
    product.reviewCount = allReviews.length;
    await product.save();

    // Analytics
    await analyticsService.logEvent({
      userId: user._id.toString(),
      eventType: "review_created",
      productId: product._id.toString(),
    });

    return NextResponse.json({
      success: true,
      data: review,
    });
  } catch (err: unknown) {
    console.error("Review create error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi tạo đánh giá." } }, { status: 500 });
  }
}
