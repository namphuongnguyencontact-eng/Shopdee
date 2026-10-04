import mongoose, { Document, Model, Schema } from "mongoose";

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: "order" | "promotion" | "reward" | "system" | "achievement";
  link?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["order", "promotion", "reward", "system", "achievement"],
      default: "system",
    },
    link: { type: String },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);
export default Notification;
