import mongoose, { Document, Model, Schema } from "mongoose";

export interface IVoucher extends Document {
  _id: mongoose.Types.ObjectId;
  code: string;
  title: string;
  description: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number; // e.g. 20 (percent) or 50000 (VND)
  minOrderValue: number;
  maxDiscount?: number;
  startDate: Date;
  endDate: Date;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VoucherSchema = new Schema<IVoucher>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    discountType: { type: String, enum: ["PERCENT", "FIXED"], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderValue: { type: Number, default: 0 },
    maxDiscount: { type: Number },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    usageLimit: { type: Number, default: 1000 },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

VoucherSchema.index({ isActive: 1 });

export const Voucher: Model<IVoucher> = mongoose.models.Voucher || mongoose.model<IVoucher>("Voucher", VoucherSchema);
export default Voucher;
