import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISiteSetting extends Document {
  key: string;
  value: Record<string, any>;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SiteSettingSchema = new Schema<ISiteSetting>(
  {
    key: { type: String, required: true, unique: true, trim: true, index: true },
    value: { type: Schema.Types.Mixed, required: true, default: {} },
    updatedBy: { type: String, default: "" },
  },
  { timestamps: true }
);

export const SiteSetting: Model<ISiteSetting> =
  mongoose.models.SiteSetting || mongoose.model<ISiteSetting>("SiteSetting", SiteSettingSchema);

export default SiteSetting;
