import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICategory extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  image?: string;
  order: number;
  subcategories: string[];
  isActive: boolean;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String },
    icon: { type: String, default: "Tag" },
    image: { type: String },
    order: { type: Number, default: 0 },
    subcategories: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    productCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CategorySchema.index({ order: 1 });

export const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);
export default Category;
