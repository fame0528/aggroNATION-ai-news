/**
 * @fileoverview Article model for aggregated content items
 * @version 1.0.0
 * @created 2025-09-26
 */

import mongoose, { Document, Schema } from 'mongoose';

/**
 * OVERVIEW:
 * This model stores aggregated content from RSS feeds including articles
 * and YouTube videos. It handles content deduplication, engagement tracking,
 * and provides structured data for the frontend display.
 */

export interface IArticle extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  content?: string;
  url: string;
  originalUrl: string;
  contentType: 'article' | 'video';
  feedId: mongoose.Types.ObjectId;
  feedTitle: string;
  category: string;
  author?: string;
  publishedAt: Date;
  imageUrl?: string;
  videoId?: string;
  embedUrl?: string;
  tags: string[];
  likes: number;
  dislikes: number;
  views: number;
  ranking: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema = new Schema<IArticle>({
  title: {
    type: String,
    required: [true, 'Article title is required'],
    trim: true,
    maxlength: [300, 'Title cannot exceed 300 characters'],
    index: 'text'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    index: 'text'
  },
  content: {
    type: String,
    trim: true,
    index: 'text'
  },
  url: {
    type: String,
    required: [true, 'Article URL is required'],
    unique: true
  },
  originalUrl: {
    type: String,
    required: [true, 'Original URL is required']
  },
  contentType: {
    type: String,
    required: [true, 'Content type is required'],
    enum: {
      values: ['article', 'video'],
      message: 'Content type must be either article or video'
    },
    index: true
  },
  feedId: {
    type: Schema.Types.ObjectId,
    ref: 'Feed',
    required: [true, 'Feed ID is required'],
    index: true
  },
  feedTitle: {
    type: String,
    required: [true, 'Feed title is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    index: true
  },
  author: {
    type: String,
    trim: true,
    maxlength: [100, 'Author name cannot exceed 100 characters']
  },
  publishedAt: {
    type: Date,
    required: [true, 'Published date is required'],
    index: -1 // Descending index for latest first
  },
  imageUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(url: string) {
        if (!url) return true;
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      },
      message: 'Please provide a valid image URL'
    }
  },
  videoId: {
    type: String,
    trim: true,
    validate: {
      validator: function(this: IArticle, videoId: string) {
        if (this.contentType === 'video' && !videoId) return false;
        return true;
      },
      message: 'Video ID is required for video content'
    }
  },
  embedUrl: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  likes: {
    type: Number,
    default: 0,
    min: [0, 'Likes cannot be negative']
  },
  dislikes: {
    type: Number,
    default: 0,
    min: [0, 'Dislikes cannot be negative']
  },
  views: {
    type: Number,
    default: 0,
    min: [0, 'Views cannot be negative']
  },
  ranking: {
    type: Number,
    default: 0,
    index: -1
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for performance
ArticleSchema.index({ category: 1, isActive: 1, publishedAt: -1 });
ArticleSchema.index({ contentType: 1, isActive: 1, publishedAt: -1 });
ArticleSchema.index({ feedId: 1, publishedAt: -1 });
ArticleSchema.index({ ranking: -1, isActive: 1 });

// Text index for search functionality
ArticleSchema.index({
  title: 'text',
  description: 'text',
  content: 'text',
  author: 'text',
  tags: 'text'
});

// Virtual for engagement score
ArticleSchema.virtual('engagementScore').get(function() {
  const likesWeight = this.likes * 2;
  const dislikesWeight = this.dislikes * -1;
  const viewsWeight = this.views * 0.1;
  return likesWeight + dislikesWeight + viewsWeight;
});

// Virtual for like ratio
ArticleSchema.virtual('likeRatio').get(function() {
  const total = this.likes + this.dislikes;
  return total > 0 ? (this.likes / total) * 100 : 0;
});

// Static method to search articles
ArticleSchema.statics.searchArticles = function(
  searchTerm: string,
  options: {
    category?: string;
    contentType?: string;
    limit?: number;
    skip?: number;
  } = {}
) {
  const filter: any = {
    isActive: true,
    $text: { $search: searchTerm }
  };
  
  if (options.category) filter.category = options.category;
  if (options.contentType) filter.contentType = options.contentType;
  
  return this.find(filter)
    .sort({ score: { $meta: 'textScore' }, publishedAt: -1 })
    .limit(options.limit || 20)
    .skip(options.skip || 0);
};

// Static method to get trending articles
ArticleSchema.statics.getTrending = function(
  contentType?: string,
  limit: number = 10
) {
  const filter: any = { isActive: true };
  if (contentType) filter.contentType = contentType;
  
  // Calculate trending score based on recent engagement
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  return this.find(filter)
    .where('publishedAt').gte(oneDayAgo)
    .sort({ engagementScore: -1, publishedAt: -1 })
    .limit(limit);
};

// Instance method to increment views
ArticleSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Instance method to add like/dislike
ArticleSchema.methods.addEngagement = function(type: 'like' | 'dislike') {
  if (type === 'like') {
    this.likes += 1;
  } else {
    this.dislikes += 1;
  }
  
  // Update ranking based on engagement
  this.ranking = this.engagementScore;
  return this.save();
};

export default mongoose.models.Article || mongoose.model<IArticle>('Article', ArticleSchema);

/* 
 * File: /src/models/Article.ts
 * Created: 2025-09-26
 * Modified: 2025-09-26
 */