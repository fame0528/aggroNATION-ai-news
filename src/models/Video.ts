/**
 * OVERVIEW: Video model for YouTube and other video content
 */
import mongoose, { Schema, Document } from 'mongoose';

export interface IVideo extends Document {
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  category?: string;
  publishedAt?: Date;
  views: number;
  likes: number;
  dislikes: number;
  bookmarks: number;
  comments: number;
  createdAt: Date;
  updatedAt: Date;
}

const VideoSchema = new Schema<IVideo>({
  title: { type: String, required: true },
  description: { type: String },
  url: { type: String, required: true, unique: true },
  thumbnailUrl: { type: String },
  category: { type: String },
  publishedAt: { type: Date },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  bookmarks: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Video || mongoose.model<IVideo>('Video', VideoSchema);

/* @created 2025-01-26T16:30:00.000Z */