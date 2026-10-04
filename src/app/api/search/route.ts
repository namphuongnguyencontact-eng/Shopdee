import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import SearchQuery from "@/models/SearchQuery";

async function getRealPopularSearches(): Promise<string[]> {
  try {
    let queries = await SearchQuery.find()
      .sort({ count: -1, lastSearchedAt: -1 })
      .limit(10)
      .lean();

    // If database has fewer than 6 real queries, seed from actual real active products in DB
    if (queries.length < 6) {
      const activeProducts = await Product.find({ status: "active" })
        .sort({ soldCount: -1, ratingAverage: -1 })
        .limit(15)
        .select("name brand tags soldCount")
        .lean();

      for (const prod of activeProducts) {
        // Use brand or first tag or simplified product name
        const candidates: string[] = [];
        if (prod.tags && prod.tags.length > 0) {
          candidates.push(prod.tags[0]);
        }
        if (prod.brand && prod.brand.length > 2) {
          candidates.push(prod.brand);
        }
        if (prod.name) {
          // Take first 3-4 words of product name for natural search term
          const words = prod.name.split(" ").slice(0, 4).join(" ");
          if (words.length >= 3) candidates.push(words);
        }

        for (const candidate of candidates) {
          const norm = candidate.toLowerCase().trim();
          if (norm.length >= 2) {
            await SearchQuery.findOneAndUpdate(
              { query: norm },
              {
                $setOnInsert: {
                  displayName: candidate.trim(),
                  count: Math.max(1, Math.floor((prod.soldCount || 10) / 5)),
                  lastSearchedAt: new Date(),
                },
              },
              { upsert: true }
            ).catch(() => {});
          }
        }
      }

      // Re-fetch top searches
      queries = await SearchQuery.find()
        .sort({ count: -1, lastSearchedAt: -1 })
        .limit(10)
        .lean();
    }

    return queries.map((q) => q.displayName || q.query);
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
          products: [],
          categories: [],
        },
      });
    }

    const cleanQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(cleanQuery, "i");

    const [products, categories] = await Promise.all([
      Product.find({
        status: "active",
        $or: [{ name: regex }, { brand: regex }, { tags: { $in: [regex] } }],
      })
        .select("name slug price originalPrice images ratingAverage soldCount categoryName")
        .limit(6)
        .lean(),
      Category.find({
        isActive: true,
        $or: [{ name: regex }, { subcategories: { $in: [regex] } }],
      })
        .select("name slug icon")
        .limit(4)
        .lean(),
    ]);

    // Record the search query in background
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
