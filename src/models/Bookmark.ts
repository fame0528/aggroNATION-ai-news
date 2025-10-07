/**
 * OVERVIEW: Bookmark model for persistent article and video bookmarks
 * Associates bookmarks with articles or videos (no user for MVP)
 */
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBookmark extends Document {
  contentId: Types.ObjectId;
  contentType: 'article' | 'video';
  title: string;
  imageUrl?: string;
  category?: string;
  bookmarkedAt: Date;
}

const BookmarkSchema = new Schema<IBookmark>({
  contentId: { type: Schema.Types.ObjectId, required: true, index: true },
  contentType: { type: String, enum: ['article', 'video'], required: true },
  title: { type: String, required: true },
  imageUrl: { type: String },
  category: { type: String },
  bookmarkedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Bookmark || mongoose.model<IBookmark>('Bookmark', BookmarkSchema);

/* @created 2025-01-26T16:30:00.000Z */