import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import { getSessionFromRequest } from "@/lib/auth";
import { analyticsService } from "@/services/analytics";

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: true, data: { items: [], voucherCode: null } });
    }

    await connectDB();
    const cart = await Cart.findOne({ userId: session.userId }).lean();
    return NextResponse.json({
      success: true,
      data: cart || { items: [], voucherCode: null },
    });
  } catch (err: unknown) {
    console.error("Cart GET error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Không thể tải giỏ hàng." } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: { message: "Vui lòng đăng nhập để lưu giỏ hàng." } },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await req.json();
    const { action, items, productId, quantity = 1, variantName } = body;

    let cart = await Cart.findOne({ userId: session.userId });
    if (!cart) {
      cart = new Cart({ userId: session.userId, items: [] });
    }

    // Merge guest cart action
    if (action === "merge" && Array.isArray(items)) {
      for (const item of items) {
        const prod = await Product.findById(item.productId);
        if (prod && prod.status === "active") {
          const existingIdx = cart.items.findIndex(
            (i) => i.productId.toString() === prod._id.toString() && i.variantName === item.variantName
          );
          if (existingIdx > -1) {
            cart.items[existingIdx].quantity += item.quantity || 1;
          } else {
            cart.items.push({
              productId: prod._id,
              name: prod.name,
              slug: prod.slug,
              image: prod.images[0] || "",
              price: prod.isFlashSale && prod.flashSalePrice ? prod.flashSalePrice : prod.price,
              originalPrice: prod.originalPrice,
              quantity: item.quantity || 1,
              variantName: item.variantName || "Mặc định",
              selected: true,
            });
          }
        }
      }
      await cart.save();
      return NextResponse.json({ success: true, data: cart });
    }

    // Add single item
    if (!productId) {
      return NextResponse.json(
        { success: false, error: { message: "Thiếu thông tin sản phẩm." } },
        { status: 400 }
      );
    }

    const prod = await Product.findById(productId);
    if (!prod || prod.status !== "active") {
      return NextResponse.json(
        { success: false, error: { message: "Sản phẩm không tồn tại hoặc đã ngừng bán." } },
        { status: 404 }
      );
    }

    const itemPrice = prod.isFlashSale && prod.flashSalePrice ? prod.flashSalePrice : prod.price;

    const existingIndex = cart.items.findIndex(
      (item) => item.productId.toString() === prod._id.toString() && item.variantName === variantName
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += Number(quantity);
    } else {
      cart.items.push({
        productId: prod._id,
        name: prod.name,
        slug: prod.slug,
        image: prod.images[0] || "",
        price: itemPrice,
        originalPrice: prod.originalPrice,
        quantity: Math.max(1, Number(quantity)),
        variantName: variantName || "Mặc định",
        selected: true,
      });
    }

    await cart.save();

    // Analytics
    await analyticsService.logEvent({
      userId: session.userId,
      eventType: "add_to_cart",
      productId: prod._id.toString(),
      categoryId: prod.categoryId?.toString(),
    });

    return NextResponse.json({
      success: true,
      data: cart,
    });
  } catch (err: unknown) {
    console.error("Cart POST error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Lỗi thêm sản phẩm vào giỏ hàng." } },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: { message: "Chưa đăng nhập." } }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { productId, variantName, quantity, selected, selectAll } = body;

    const cart = await Cart.findOne({ userId: session.userId });
    if (!cart) {
      return NextResponse.json({ success: false, error: { message: "Không tìm thấy giỏ hàng." } }, { status: 404 });
    }

    if (selectAll !== undefined) {
      cart.items.forEach((it) => {
        it.selected = !!selectAll;
      });
    } else if (productId) {
      const item = cart.items.find(
        (it) => it.productId.toString() === productId && it.variantName === variantName
      );
      if (item) {
        if (quantity !== undefined) item.quantity = Math.max(1, Number(quantity));
        if (selected !== undefined) item.selected = Boolean(selected);
      }
    }

    await cart.save();
    return NextResponse.json({ success: true, data: cart });
  } catch (err: unknown) {
    console.error("Cart PUT error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi cập nhật giỏ hàng." } }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: { message: "Chưa đăng nhập." } }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const variantName = searchParams.get("variantName");
    const clearAll = searchParams.get("clearAll") === "true";

    const cart = await Cart.findOne({ userId: session.userId });
    if (!cart) {
      return NextResponse.json({ success: true, data: { items: [] } });
    }

    if (clearAll) {
      cart.items = [];
    } else if (productId) {
      cart.items = cart.items.filter(
        (it) => !(it.productId.toString() === productId && (!variantName || it.variantName === variantName))
      );
    }

    await cart.save();
    return NextResponse.json({ success: true, data: cart });
  } catch (err: unknown) {
    console.error("Cart DELETE error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi xóa sản phẩm khỏi giỏ." } }, { status: 500 });
  }
}
