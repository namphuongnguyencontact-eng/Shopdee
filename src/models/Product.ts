import mongoose, { Document, Model, Schema } from "mongoose";

export interface IVariant {
  name: string; // e.g. "Màu sắc", "Kích cỡ"
  options: string[]; // e.g. ["Đen", "Trắng", "Xanh"] or ["S", "M", "L"]
}

export interface ISpecification {
  label: string;
  value: string;
}

export interface IGalleryImage {
  url: string;
  publicId?: string;
  alt?: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  descriptionHtml?: string;
  brand: string;
  categoryId: mongoose.Types.ObjectId;
  categorySlug: string;
  categoryName: string;
  images: string[];
  galleryImages?: IGalleryImage[];
  price: number;
  originalPrice: number;
  discountPercent: number;
  variants: IVariant[];
  ratingAverage: number;
  reviewCount: number;
  soldCount: number;
  stock: number;
  tags: string[];
  specifications: ISpecification[];
  isFeatured: boolean;
  isTrending: boolean;
  isFlashSale: boolean;
  flashSalePrice?: number;
  status: "active" | "draft" | "archived";
  viewCount: number;
  likeCount: number;
  cartAddCount: number;
  shareCount: number;
  trendScore: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const GalleryImageSchema = new Schema<IGalleryImage>(
  {
    url: { type: String, required: true },
    publicId: { type: String },
    alt: { type: String },
    sortOrder: { type: Number, default: 0 },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    descriptionHtml: { type: String },
    brand: { type: String, default: "SHOPDEE STUDIO" },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    categorySlug: { type: String, required: true },
    categoryName: { type: String, required: true },
    images: { type: [String], required: true, default: [] },
    galleryImages: { type: [GalleryImageSchema], default: [] },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, default: 0 },
    variants: [
      {
        name: { type: String, required: true },
        options: { type: [String], required: true },
      },
    ],
    ratingAverage: { type: Number, default: 5.0, min: 1, max: 5 },
    reviewCount: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
    stock: { type: Number, default: 999 },
    tags: { type: [String], default: [] },
    specifications: [
      {
        label: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isFlashSale: { type: Boolean, default: false },
    flashSalePrice: { type: Number },
    status: { type: String, enum: ["active", "draft", "archived"], default: "active" },
    viewCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
    cartAddCount: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 },
    trendScore: { type: Number, default: 0 },
    seoTitle: { type: String },
    seoDescription: { type: String },
    seoKeywords: { type: [String], default: [] },
  },
  { timestamps: true }
);

ProductSchema.index({ categorySlug: 1 });
ProductSchema.index({ isTrending: 1, trendScore: -1 });
ProductSchema.index({ isFlashSale: 1 });
ProductSchema.index({ isFeatured: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ soldCount: -1 });
ProductSchema.index({ name: "text", description: "text", tags: "text", brand: "text" });

export const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
export default Product;
