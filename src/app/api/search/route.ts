import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import SearchQuery from "@/models/SearchQuery";

export const dynamic = "force-dynamic";

/**
 * Trích xuất danh sách các từ khóa tìm kiếm nhiều nhất dựa trên dữ liệu THẬT trong Database:
 * 1. Các lượt tìm kiếm thực tế được ghi nhận trong SearchQuery
 * 2. Tên các sản phẩm có lượt bán chạy thật (soldCount > 0)
 * 3. Tên các danh mục sản phẩm phổ biến thực tế
 */
async function getRealPopularSearches(): Promise<string[]> {
  try {
    let queries = await SearchQuery.find({ count: { $gt: 0 } })
      .sort({ count: -1, lastSearchedAt: -1 })
      .limit(8)
      .lean();

    const popularList: string[] = queries.map((q) => q.displayName || q.query);

    // Nếu chưa đủ 8 từ khóa thực tế, bổ sung từ các sản phẩm bán chạy nhất thật và danh mục thật trong DB
    if (popularList.length < 8) {
      const [topSoldProducts, topCategories] = await Promise.all([
        Product.find({ status: "active", soldCount: { $gt: 0 } })
          .sort({ soldCount: -1 })
          .limit(8)
          .select("name brand categoryName soldCount")
          .lean(),
        Category.find({ isActive: true })
          .sort({ productCount: -1, order: 1 })
          .limit(6)
          .select("name")
          .lean(),
      ]);

      // Thêm tên rút gọn của các sản phẩm bán chạy thật
      for (const prod of topSoldProducts) {
        if (popularList.length >= 8) break;
        // Lấy 3 - 5 từ đầu của tên sản phẩm thực tế
        const shortName = prod.name
          .replace(/[\[\(].*?[\]\)]/g, "")
          .trim()
          .split(" ")
          .slice(0, 4)
          .join(" ")
          .trim();
        if (shortName.length >= 3 && !popularList.some((item) => item.toLowerCase() === shortName.toLowerCase())) {
          popularList.push(shortName);
        }
      }

      // Thêm tên các danh mục thực tế
      for (const cat of topCategories) {
        if (popularList.length >= 8) break;
        if (!popularList.some((item) => item.toLowerCase() === cat.name.toLowerCase())) {
          popularList.push(cat.name);
        }
      }
    }

    return popularList.slice(0, 8);
  } catch (err) {
    console.error("Failed to load real popular searches:", err);
    return [];
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() || "";

    const popularSearches = await getRealPopularSearches();

    if (!query) {
      return NextResponse.json({
        success: true,
        data: {
          popularSearches,
          keywordSuggestions: [],
          products: [],
          categories: [],
        },
      });
    }

    const cleanQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(cleanQuery, "i");

    // Truy vấn dữ liệu thực tế từ database
    const [matchingQueries, products, categories] = await Promise.all([
      // 1. Tìm các từ khóa tìm kiếm thực tế đã được tìm nhiều
      SearchQuery.find({
        $or: [{ query: regex }, { displayName: regex }],
      })
        .sort({ count: -1 })
        .limit(5)
        .lean(),

      // 2. Tìm các sản phẩm thực tế trong DB khớp tên, nhãn hiệu hoặc tags
      Product.find({
        status: "active",
        $or: [{ name: regex }, { brand: regex }, { tags: { $in: [regex] } }],
      })
        .select("name slug price originalPrice images ratingAverage soldCount categoryName")
        .sort({ soldCount: -1 })
        .limit(6)
        .lean(),

      // 3. Tìm các danh mục thực tế trong DB khớp tên hoặc danh mục con
      Category.find({
        isActive: true,
        $or: [{ name: regex }, { subcategories: { $in: [regex] } }],
      })
        .select("name slug icon")
        .limit(4)
        .lean(),
    ]);

    // Tạo danh sách gợi ý từ khóa thực tế (keyword suggestions)
    const keywordSuggestionsSet = new Set<string>();

    // Ưu tiên từ khóa tìm kiếm thực tế
    for (const q of matchingQueries) {
      if (q.displayName && q.displayName.toLowerCase() !== query.toLowerCase()) {
        keywordSuggestionsSet.add(q.displayName);
      }
    }

    // Trích xuất cụm từ từ tên các sản phẩm thực tế tìm thấy
    for (const p of products) {
      const cleanName = p.name.replace(/[\[\(].*?[\]\)]/g, "").trim();
      const words = cleanName.split(" ");
      const shortTitle = words.slice(0, 4).join(" ");
      if (shortTitle.toLowerCase().includes(query.toLowerCase()) && shortTitle.length >= 3) {
        keywordSuggestionsSet.add(shortTitle);
      }
    }

    // Thêm tên danh mục nếu khớp
    for (const c of categories) {
      if (c.name.toLowerCase().includes(query.toLowerCase())) {
        keywordSuggestionsSet.add(c.name);
      }
    }

    // Tự động ghi nhận lượt tìm kiếm trong background nếu từ khóa hợp lệ
    const norm = query.toLowerCase().trim();
    if (norm.length >= 2) {
      SearchQuery.findOneAndUpdate(
        { query: norm },
        {
          $inc: { count: 1 },
          $set: {
            displayName: query.trim(),
            lastSearchedAt: new Date(),
            resultsCount: products.length,
          },
        },
        { upsert: true }
      ).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      data: {
        popularSearches,
        keywordSuggestions: Array.from(keywordSuggestionsSet).slice(0, 6),
        products,
        categories,
      },
    });
  } catch (err: unknown) {
    console.error("Search API error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Lỗi tìm kiếm." } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const query = (body.query || "").trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ success: false, error: { message: "Query không hợp lệ" } }, { status: 400 });
    }

    const norm = query.toLowerCase().trim();
    await SearchQuery.findOneAndUpdate(
      { query: norm },
      {
        $inc: { count: 1 },
        $set: {
          displayName: query,
          lastSearchedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Search query record error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi ghi nhận tìm kiếm" } }, { status: 500 });
  }
}
