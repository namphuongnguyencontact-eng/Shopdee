import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { Types } from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: { message: "Không có quyền Admin." } }, { status: 403 });
    }

    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const days = searchParams.get("days") ? Number(searchParams.get("days")) : 0;
    const sort = searchParams.get("sort") || "sold_desc"; // sold_desc | revenue_desc | orders_desc
    const search = searchParams.get("search")?.trim().toLowerCase() || "";

    // Build date filter
    const matchQuery: Record<string, any> = {};
    if (days > 0) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      matchQuery.createdAt = { $gte: startDate };
    }

    // Exclude cancelled orders from sold calculation
    matchQuery.orderStatus = { $ne: "CANCELLED" };

    const orders = await Order.find(matchQuery).sort({ createdAt: -1 }).lean();

    // Map sales by productId
    const productSalesMap = new Map<
      string,
      {
        productId: string;
        name: string;
        slug: string;
        image: string;
        price: number;
        totalSold: number;
        totalRevenue: number;
        orderCount: number;
        buyersSet: Set<string>;
        latestSaleAt: Date;
      }
    >();

    for (const order of orders) {
      const buyerId = (order.userId ? String(order.userId) : "") || order.shippingAddress?.phone || order.orderNumber;
      for (const item of order.items || []) {
        const prodId = String(item.productId);
        if (!productSalesMap.has(prodId)) {
          productSalesMap.set(prodId, {
            productId: prodId,
            name: item.name,
            slug: item.slug || "",
            image: item.image || "",
            price: item.price || 0,
            totalSold: 0,
            totalRevenue: 0,
            orderCount: 0,
            buyersSet: new Set<string>(),
            latestSaleAt: order.createdAt,
          });
        }

        const record = productSalesMap.get(prodId)!;
        record.totalSold += item.quantity || 1;
        record.totalRevenue += (item.price || 0) * (item.quantity || 1);
        record.orderCount += 1;
        if (buyerId) record.buyersSet.add(buyerId);
        if (new Date(order.createdAt) > new Date(record.latestSaleAt)) {
          record.latestSaleAt = order.createdAt;
        }
      }
    }

    // Fetch product details for all sold products
    const productIds = Array.from(productSalesMap.keys()).filter((id) => Types.ObjectId.isValid(id));
    const productsInDb = await Product.find({ _id: { $in: productIds } }).lean();
    const productDbMap = new Map(productsInDb.map((p) => [String(p._id), p]));

    // Also get categories map
    const categories = await Category.find({}).lean();
    const categoryMap = new Map(categories.map((c) => [c.slug, c.name]));

    // If no orders or few orders exist, also include top products with historical soldCount
    if (productSalesMap.size < 15 && (!days || days > 7)) {
      const topProductsBySoldCount = await Product.find({ soldCount: { $gt: 0 } })
        .sort({ soldCount: -1 })
        .limit(20)
        .lean();

      for (const p of topProductsBySoldCount) {
        const pid = String(p._id);
        if (!productSalesMap.has(pid)) {
          productSalesMap.set(pid, {
            productId: pid,
            name: p.name,
            slug: p.slug,
            image: p.images?.[0] || "",
            price: p.price,
            totalSold: p.soldCount,
            totalRevenue: p.price * p.soldCount,
            orderCount: Math.max(1, Math.round(p.soldCount * 0.8)),
            buyersSet: new Set<string>(),
            latestSaleAt: p.updatedAt || p.createdAt,
          });
        }
      }
    }

    let items = Array.from(productSalesMap.values()).map((item) => {
      const dbProd = productDbMap.get(item.productId);
      const categoryName = dbProd?.categorySlug
        ? categoryMap.get(dbProd.categorySlug) || dbProd.categorySlug
        : "Khác";

      return {
        productId: item.productId,
        name: dbProd?.name || item.name,
        slug: dbProd?.slug || item.slug,
        image: dbProd?.images?.[0] || item.image || "/logo.png",
        price: dbProd?.price || item.price,
        originalPrice: dbProd?.originalPrice,
        inStock: dbProd?.stock ?? 100,
        categoryName,
        totalSold: item.totalSold,
        totalRevenue: item.totalRevenue,
        orderCount: item.orderCount,
        uniqueBuyersCount: Math.max(item.buyersSet.size, 1),
        latestSaleAt: item.latestSaleAt,
      };
    });

    // Search filter
    if (search) {
      items = items.filter(
        (i) => i.name.toLowerCase().includes(search) || i.categoryName.toLowerCase().includes(search)
      );
    }

    // Sort items
    if (sort === "revenue_desc") {
      items.sort((a, b) => b.totalRevenue - a.totalRevenue);
    } else if (sort === "orders_desc") {
      items.sort((a, b) => b.orderCount - a.orderCount);
    } else {
      // Default: sold_desc
      items.sort((a, b) => b.totalSold - a.totalSold);
    }

    // Compute Overall KPIs
    const totalSoldUnits = items.reduce((sum, i) => sum + i.totalSold, 0);
    const totalRevenue = items.reduce((sum, i) => sum + i.totalRevenue, 0);
    const distinctProductsCount = items.length;
    const totalOrdersCount = orders.length;
    const topSellingProduct = items[0] || null;
    const topRevenueProduct = [...items].sort((a, b) => b.totalRevenue - a.totalRevenue)[0] || null;

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          totalSoldUnits,
          totalRevenue,
          distinctProductsCount,
          totalOrdersCount,
          topSellingProduct: topSellingProduct
            ? { name: topSellingProduct.name, sold: topSellingProduct.totalSold, revenue: topSellingProduct.totalRevenue }
            : null,
          topRevenueProduct: topRevenueProduct
            ? { name: topRevenueProduct.name, revenue: topRevenueProduct.totalRevenue, sold: topRevenueProduct.totalSold }
            : null,
        },
        products: items,
      },
    });
  } catch (err: unknown) {
    console.error("Admin sales GET error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi lấy dữ liệu sản phẩm đã bán." } }, { status: 500 });
  }
}
