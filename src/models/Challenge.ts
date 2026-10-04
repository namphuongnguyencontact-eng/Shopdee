import mongoose, { Document, Model, Schema } from "mongoose";

export interface IChallenge extends Document {
  _id: mongoose.Types.ObjectId;
  code: string;
  title: string;
  description: string;
  category: "DAILY" | "SHOPPING" | "SOCIAL";
  type: "VIEW_PRODUCTS" | "ADD_WISHLIST" | "ADD_CART" | "PLACE_ORDER" | "SHARE_ORDER" | "CLAIM_DAILY";
  targetCount: number;
  xpReward: number;
  walletReward: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChallengeSchema = new Schema<IChallenge>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, enum: ["DAILY", "SHOPPING", "SOCIAL"], default: "DAILY" },
    type: {
      type: String,
      enum: ["VIEW_PRODUCTS", "ADD_WISHLIST", "ADD_CART", "PLACE_ORDER", "SHARE_ORDER", "CLAIM_DAILY"],
      required: true,
    },
    targetCount: { type: Number, required: true, default: 1 },
    xpReward: { type: Number, default: 100 },
    walletReward: { type: Number, default: 50000 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Challenge: Model<IChallenge> =
  mongoose.models.Challenge || mongoose.model<IChallenge>("Challenge", ChallengeSchema);

export interface IUserChallenge extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  challengeCode: string;
  progress: number;
  isCompleted: boolean;
  isClaimed: boolean;
  completedAt?: Date;
  claimedAt?: Date;
  updatedAt: Date;
}

const UserChallengeSchema = new Schema<IUserChallenge>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    challengeCode: { type: String, required: true },
    progress: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    isClaimed: { type: Boolean, default: false },
    completedAt: { type: Date },
    claimedAt: { type: Date },
  },
  { timestamps: true }
);

UserChallengeSchema.index({ userId: 1, challengeCode: 1 }, { unique: true });

export const UserChallenge: Model<IUserChallenge> =
  mongoose.models.UserChallenge || mongoose.model<IUserChallenge>("UserChallenge", UserChallengeSchema);

export default Challenge;
