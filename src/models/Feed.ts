/**
 * @fileoverview RSS Feed model for managing feed sources
 * @version 1.0.0
 * @created 2025-09-26
 */

import mongoose, { Document, Schema } from 'mongoose';

/**
 * OVERVIEW:
 * This model defines the structure for RSS feed sources that will be
 * aggregated by the system. It supports both article feeds and YouTube
 * channel feeds with proper categorization and status tracking.
 */

export interface IFeed extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  url: string;
  feedType: 'article' | 'youtube';
  category: string;
  description?: string;
  isActive: boolean;
  lastFetched?: Date;
  lastError?: string;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const FeedSchema = new Schema<IFeed>({
  title: {
    type: String,
    required: [true, 'Feed title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  url: {
    type: String,
    required: [true, 'Feed URL is required'],
    unique: true,
    validate: {
      validator: function(url: string) {
        // Basic URL validation
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      },
      message: 'Please provide a valid URL'
    }
  },
  feedType: {
    type: String,
    required: [true, 'Feed type is required'],
    enum: {
      values: ['article', 'youtube'],
      message: 'Feed type must be either article or youtube'
    }
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  lastFetched: {
    type: Date,
    default: null
  },
  lastError: {
    type: String,
    default: null
  },
  itemCount: {
    type: Number,
    default: 0,
    min: [0, 'Item count cannot be negative']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
FeedSchema.index({ feedType: 1, isActive: 1 });
FeedSchema.index({ category: 1, isActive: 1 });
FeedSchema.index({ lastFetched: 1 });

// Virtual for feed health status
FeedSchema.virtual('isHealthy').get(function() {
  if (!this.lastFetched) return null;
  const hoursSinceLastFetch = (Date.now() - this.lastFetched.getTime()) / (1000 * 60 * 60);
  return hoursSinceLastFetch < 24 && !this.lastError;
});

// Static method to get active feeds by type
FeedSchema.statics.getActiveFeeds = function(feedType?: string) {
  const filter: any = { isActive: true };
  if (feedType) filter.feedType = feedType;
  return this.find(filter).sort({ title: 1 });
};

// Instance method to mark feed as fetched
FeedSchema.methods.markAsFetched = function(itemCount: number, error?: string) {
  this.lastFetched = new Date();
  this.itemCount = itemCount;
  this.lastError = error || null;
  return this.save();
};

export default mongoose.models.Feed || mongoose.model<IFeed>('Feed', FeedSchema);

/* 
 * File: /src/models/Feed.ts
 * Created: 2025-09-26
 * Modified: 2025-09-26
 */