import { connectDB } from "@/lib/db";
import Product, { IProduct } from "@/models/Product";
import User from "@/models/User";
import Wishlist from "@/models/Wishlist";

export interface IRecommendationService {
  getPersonalizedProducts(userId?: string, limit?: number): Promise<IProduct[]>;
  getRelatedProducts(productId: string, categorySlug: string, limit?: number): Promise<IProduct[]>;
}

export class RecommendationService implements IRecommendationService {
  async getPersonalizedProducts(userId?: string, limit: number = 8): Promise<IProduct[]> {
    await connectDB();

    if (userId) {
      const user = await User.findById(userId);
      const wishlist = await Wishlist.findOne({ userId });

      const preferredCategories = user?.favoriteCategories || [];
      const wishlistProductIds = wishlist?.productIds || [];

      if (preferredCategories.length > 0) {
        const personalized = await Product.find({
          status: "active",
          categorySlug: { $in: preferredCategories },
          _id: { $nin: wishlistProductIds },
        })
          .sort({ trendScore: -1, ratingAverage: -1 })
          .limit(limit)
          .lean();

        if (personalized.length >= limit / 2) {
          // If we have enough personalized, pad with trending if needed
          if (personalized.length < limit) {
            const extra = await Product.find({
              status: "active",
              _id: { $nin: [...wishlistProductIds, ...personalized.map((p) => p._id)] },
            })
              .sort({ trendScore: -1 })
              .limit(limit - personalized.length)
              .lean();
            return [...personalized, ...extra] as unknown as IProduct[];
          }
          return personalized as unknown as IProduct[];
        }
      }
    }

    // Fallback: highest trendScore and featured products
    return (await Product.find({ status: "active" })
      .sort({ isTrending: -1, trendScore: -1, ratingAverage: -1 })
      .limit(limit)
      .lean()) as unknown as IProduct[];
  }

  async getRelatedProducts(productId: string, categorySlug: string, limit: number = 4): Promise<IProduct[]> {
    await connectDB();
    const related = await Product.find({
      status: "active",
      categorySlug,
      _id: { $ne: productId },
    })
      .sort({ ratingAverage: -1, soldCount: -1 })
      .limit(limit)
      .lean();

    if (related.length < limit) {
      const extra = await Product.find({
        status: "active",
        _id: { $nin: [productId, ...related.map((p) => p._id)] },
      })
        .sort({ trendScore: -1 })
        .limit(limit - related.length)
        .lean();
      return [...related, ...extra] as unknown as IProduct[];
    }

    return related as unknown as IProduct[];
  }
}

export const recommendationService = new RecommendationService();
