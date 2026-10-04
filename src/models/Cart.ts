import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICartItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  image: string;
  price: number;
  originalPrice: number;
  quantity: number;
  variantName?: string;
  selected: boolean;
}

export interface ICart extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  items: ICartItem[];
  voucherCode?: string;
  updatedAt: Date;
}

const CartSchema = new Schema<ICart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        slug: { type: String, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        originalPrice: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        variantName: { type: String },
        selected: { type: Boolean, default: true },
      },
    ],
    voucherCode: { type: String },
  },
  { timestamps: true }
);

export const Cart: Model<ICart> = mongoose.models.Cart || mongoose.model<ICart>("Cart", CartSchema);
export default Cart;
