import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISearchQuery extends Document {
  _id: mongoose.Types.ObjectId;
  query: string;
  displayName: string;
  count: number;
  lastSearchedAt: Date;
  resultsCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const SearchQuerySchema = new Schema<ISearchQuery>(
  {
    query: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
    displayName: { type: String, required: true, trim: true },
    count: { type: Number, default: 1, index: true },
    lastSearchedAt: { type: Date, default: Date.now, index: true },
    resultsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

SearchQuerySchema.index({ count: -1, lastSearchedAt: -1 });

export const SearchQuery: Model<ISearchQuery> =
  mongoose.models.SearchQuery || mongoose.model<ISearchQuery>("SearchQuery", SearchQuerySchema);
export default SearchQuery;
