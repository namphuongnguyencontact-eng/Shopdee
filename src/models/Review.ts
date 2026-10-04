import mongoose, { Document, Model, Schema } from "mongoose";

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  userAvatar: string;
  orderId?: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  images: string[];
  variantName?: string;
  status: "approved" | "pending" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    userAvatar: { type: String, default: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150" },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    images: { type: [String], default: [] },
    variantName: { type: String },
    status: { type: String, enum: ["approved", "pending", "rejected"], default: "approved" },
  },
  { timestamps: true }
);

ReviewSchema.index({ productId: 1, createdAt: -1 });

export const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);
export default Review;
