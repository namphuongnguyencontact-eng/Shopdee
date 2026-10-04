import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBadge extends Document {
  _id: mongoose.Types.ObjectId;
  key: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  xpReward: number;
  order: number;
}

const BadgeSchema = new Schema<IBadge>(
  {
    key: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    category: { type: String, default: "GENERAL" },
    xpReward: { type: Number, default: 100 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Badge: Model<IBadge> =
  mongoose.models.Badge || mongoose.model<IBadge>("Badge", BadgeSchema);

export interface IUserBadge extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  badgeKey: string;
  unlockedAt: Date;
}

const UserBadgeSchema = new Schema<IUserBadge>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    badgeKey: { type: String, required: true },
    unlockedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

UserBadgeSchema.index({ userId: 1, badgeKey: 1 }, { unique: true });

export const UserBadge: Model<IUserBadge> =
  mongoose.models.UserBadge || mongoose.model<IUserBadge>("UserBadge", UserBadgeSchema);

export default Badge;
