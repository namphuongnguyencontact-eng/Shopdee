import mongoose, { Document, Model, Schema } from "mongoose";

export interface ITrafficSession extends Document {
  _id: mongoose.Types.ObjectId;
  sessionId: string;
  visitorId: string;
  userId?: mongoose.Types.ObjectId;
  firstSeenAt: Date;
  lastSeenAt: Date;
  lastShoppingActivityAt?: Date;
  landingPage: string;
  currentPage: string;
  referrer?: string;
  referrerDomain?: string;
  source: string;
  category: "Organic Search" | "Social" | "Referral" | "Direct" | "Campaign";
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
  device: "desktop" | "mobile" | "tablet";
  browser?: string;
  os?: string;
  country?: string;
  city?: string;
  ip?: string;
  pageViewCount: number;
  isNewVisitor: boolean;
  hasPurchased: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TrafficSessionSchema = new Schema<ITrafficSession>(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    visitorId: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    firstSeenAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now, index: true },
    lastShoppingActivityAt: { type: Date, index: true },
    landingPage: { type: String, default: "/" },
    currentPage: { type: String, default: "/" },
    referrer: { type: String },
    referrerDomain: { type: String },
    source: { type: String, default: "Direct", index: true },
    category: {
      type: String,
      enum: ["Organic Search", "Social", "Referral", "Direct", "Campaign"],
      default: "Direct",
      index: true,
    },
    medium: { type: String },
    campaign: { type: String },
    term: { type: String },
    content: { type: String },
    device: { type: String, enum: ["desktop", "mobile", "tablet"], default: "desktop" },
    browser: { type: String },
    os: { type: String },
    country: { type: String, default: "Vietnam" },
    city: { type: String, default: "Hồ Chí Minh" },
    ip: { type: String },
    pageViewCount: { type: Number, default: 1 },
    isNewVisitor: { type: Boolean, default: true },
    hasPurchased: { type: Boolean, default: false },
  },
  { timestamps: true }
);

TrafficSessionSchema.index({ createdAt: -1 });
TrafficSessionSchema.index({ source: 1, createdAt: -1 });
TrafficSessionSchema.index({ visitorId: 1, createdAt: -1 });
TrafficSessionSchema.index({ lastShoppingActivityAt: -1 });

export const TrafficSession: Model<ITrafficSession> =
  mongoose.models.TrafficSession || mongoose.model<ITrafficSession>("TrafficSession", TrafficSessionSchema);

export default TrafficSession;
