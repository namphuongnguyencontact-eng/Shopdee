import mongoose, { Document, Model, Schema } from "mongoose";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
  variantName?: string;
}

export interface IShippingAddress {
  fullName: string;
  phone: string;
  city: string;
  district: string;
  address: string;
  isSimulated: boolean;
}

export interface IOrderTimeline {
  status: string;
  title: string;
  description: string;
  timestamp: Date;
}

export interface IAnalyticsAttribution {
  visitorId?: string;
  sessionId?: string;
  firstTouchSource?: string;
  firstTouchMedium?: string;
  firstTouchCampaign?: string;
  lastTouchSource?: string;
  lastTouchMedium?: string;
  lastTouchCampaign?: string;
  landingPage?: string;
}

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  orderNumber: string;
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  voucherCode?: string;
  paymentMethod: "WALLET" | "SIMULATED_CARD" | "SIMULATED_COD" | "COD" | "CARD";
  paymentStatus: "COMPLETED" | "PENDING" | "FAILED";
  orderStatus: "PLACED" | "CONFIRMED" | "PREPARING" | "SHIPPING" | "READY_FOR_SIMULATED_DELIVERY" | "COMPLETED" | "CANCELLED";
  isSimulation: boolean;
  salesRecorded: boolean;
  salesRecordedAt?: Date;
  analyticsAttribution?: IAnalyticsAttribution;
  timeline: IOrderTimeline[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        slug: { type: String, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        variantName: { type: String },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      city: { type: String, default: "TP. Hồ Chí Minh" },
      district: { type: String, default: "Quận 1" },
      address: { type: String, default: "123 Đường Mua Sắm SHOPDEE" },
      isSimulated: { type: Boolean, default: true },
    },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    voucherCode: { type: String },
    paymentMethod: {
      type: String,
      enum: ["WALLET", "SIMULATED_CARD", "SIMULATED_COD", "COD", "CARD"],
      default: "SIMULATED_COD",
    },
    paymentStatus: {
      type: String,
      enum: ["COMPLETED", "PENDING", "FAILED"],
      default: "COMPLETED",
    },
    orderStatus: {
      type: String,
      enum: ["PLACED", "CONFIRMED", "PREPARING", "SHIPPING", "READY_FOR_SIMULATED_DELIVERY", "COMPLETED", "CANCELLED"],
      default: "SHIPPING",
    },
    isSimulation: { type: Boolean, default: true },
    salesRecorded: { type: Boolean, default: false, index: true },
    salesRecordedAt: { type: Date },
    analyticsAttribution: {
      visitorId: { type: String, index: true },
      sessionId: { type: String, index: true },
      firstTouchSource: { type: String },
      firstTouchMedium: { type: String },
      firstTouchCampaign: { type: String },
      lastTouchSource: { type: String },
      lastTouchMedium: { type: String },
      lastTouchCampaign: { type: String },
      landingPage: { type: String },
    },
    timeline: [
      {
        status: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ "analyticsAttribution.lastTouchSource": 1 });

export const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
export default Order;
