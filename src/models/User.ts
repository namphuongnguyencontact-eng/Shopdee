import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  avatar: string;
  phone?: string;
  address?: string;
  city?: string;
  defaultShippingAddress?: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
  };
  gender?: string;
  birthDate?: string;
  role: "user" | "admin";
  level: number;
  xp: number;
  walletBalance: number;
  favoriteCategories: string[];
  acquisitionSource?: string;
  acquisitionMedium?: string;
  acquisitionCampaign?: string;
  acquisitionReferrer?: string;
  registrationIp?: string;
  registrationDevice?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    avatar: { type: String, default: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    defaultShippingAddress: {
      fullName: { type: String, default: "" },
      phone: { type: String, default: "" },
      address: { type: String, default: "" },
      city: { type: String, default: "" },
    },
    gender: { type: String, default: "" },
    birthDate: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    walletBalance: { type: Number, default: 0 },
    favoriteCategories: { type: [String], default: [] },
    acquisitionSource: { type: String, default: "Direct", index: true },
    acquisitionMedium: { type: String, default: "direct" },
    acquisitionCampaign: { type: String, default: "" },
    acquisitionReferrer: { type: String, default: "" },
    registrationIp: { type: String, default: "" },
    registrationDevice: { type: String, default: "desktop" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

UserSchema.index({ xp: -1 });

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
