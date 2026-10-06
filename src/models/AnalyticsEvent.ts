import mongoose, { Document, Model, Schema } from "mongoose";

export type AnalyticsEventType =
  | "page_view"
  | "session_start"
  | "session_end"
  | "product_view"
  | "product_like"
  | "search"
  | "add_to_wishlist"
  | "add_to_cart"
  | "remove_from_cart"
  | "checkout_start"
  | "virtual_payment_start"
  | "order_created"
  | "order_completed"
  | "voucher_used"
  | "voucher_applied"
  | "share_order"
  | "review_created"
  | "challenge_completed"
  | "login"
  | "register"
  | "logout";

export interface IAnalyticsEvent extends Document {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  isAdmin?: boolean;
  sessionId?: string;
  visitorId?: string;
  eventType: AnalyticsEventType;
  path?: string;
  referrer?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  productId?: mongoose.Types.ObjectId;
  categoryId?: mongoose.Types.ObjectId;
  metadata?: Record<string, unknown>;
  device?: string;
  ip?: string;
  createdAt: Date;
}

const AnalyticsEventSchema = new Schema<IAnalyticsEvent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    isAdmin: { type: Boolean, default: false, index: true },
    sessionId: { type: String, index: true },
    visitorId: { type: String, index: true },
    eventType: { type: String, required: true, index: true },
    path: { type: String, index: true },
    referrer: { type: String },
    source: { type: String, index: true },
    medium: { type: String },
    campaign: { type: String },
    productId: { type: Schema.Types.ObjectId, ref: "Product", index: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category" },
    metadata: { type: Schema.Types.Mixed },
    device: { type: String, default: "desktop" },
    ip: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AnalyticsEventSchema.index({ eventType: 1, createdAt: -1 });
AnalyticsEventSchema.index({ source: 1, createdAt: -1 });
AnalyticsEventSchema.index({ visitorId: 1, createdAt: -1 });
AnalyticsEventSchema.index({ sessionId: 1, createdAt: -1 });
AnalyticsEventSchema.index({ productId: 1, eventType: 1, createdAt: -1 });
AnalyticsEventSchema.index({ ip: 1, path: 1, eventType: 1 });

export const AnalyticsEvent: Model<IAnalyticsEvent> =
  mongoose.models.AnalyticsEvent || mongoose.model<IAnalyticsEvent>("AnalyticsEvent", AnalyticsEventSchema);
export default AnalyticsEvent;
