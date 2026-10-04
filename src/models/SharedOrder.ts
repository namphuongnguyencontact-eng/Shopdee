import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISharedOrderProduct {
  name: string;
  image: string;
  price: number;
}

export interface ISharedOrder extends Document {
  _id: mongoose.Types.ObjectId;
  shareId: string;
  userId: mongoose.Types.ObjectId;
  userName: string;
  userAvatar: string;
  orderNumber: string;
  orderId: mongoose.Types.ObjectId;
  itemCount: number;
  totalAmount: number;
  showPrice: boolean;
  quote: string;
  template: "modern" | "pastel" | "cyber" | "minimal";
  background: string;
  products: ISharedOrderProduct[];
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const SharedOrderSchema = new Schema<ISharedOrder>(
  {
    shareId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    userName: { type: String, required: true },
    userAvatar: { type: String, default: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150" },
    orderNumber: { type: String, required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    itemCount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    showPrice: { type: Boolean, default: true },
    quote: { type: String, default: "Tự thưởng cho bản thân một chút hôm nay ✨" },
    template: { type: String, enum: ["modern", "pastel", "cyber", "minimal"], default: "modern" },
    background: { type: String, default: "bg-gradient-to-tr from-blue-600 to-indigo-800" },
    products: [
      {
        name: { type: String, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    viewsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const SharedOrder: Model<ISharedOrder> =
  mongoose.models.SharedOrder || mongoose.model<ISharedOrder>("SharedOrder", SharedOrderSchema);
export default SharedOrder;
