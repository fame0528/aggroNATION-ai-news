/**
 * @fileoverview AI Model Database Schema and Types
 * @description Mongoose schema for AI models with hybrid ranking system,
 * user interactions, and comprehensive HuggingFace integration for aggroNATION
 * @version 1.0.0
 * @created 2025-10-05
 */

// OVERVIEW:
// This module defines the AI model data structure with support for:
// - Hybrid ranking (85% HuggingFace metrics + 15% user votes)
// - User interactions (votes, bookmarks, comments)
// - Comprehensive model metadata and categorization
// - Performance tracking and analytics

import mongoose, { Schema, Document, Model } from 'mongoose';

// TypeScript interfaces for type safety
export interface IAIModel extends Document {
  // Basic model information
  huggingFaceId: string;
  name: string;
  author: string;
  description: string;
  
  // Categorization and tagging
  categories: string[];
  tags: string[];
  pipelineTag?: string;
  libraryName?: string;
  
  // HuggingFace metrics (85% of ranking)
  downloads: number;
  likes: number;
  trending: boolean;
  huggingFaceScore: number;
  
  // User engagement metrics (15% of ranking)
  userVotes: number;
  userRating: number;
  userScore: number;
  
  // Combined ranking score
  finalScore: number;
  
  // Technical specifications
  modelSize: number; // in bytes
  license?: string;
  language?: string[];
  datasets?: string[];
  metrics?: Record<string, number>;
  
  // Status and metadata
  isPrivate: boolean;
  isActive: boolean;
  
  // Timestamps
  createdAt: Date;
  lastModified: Date;
  lastSynced: Date;
  
  // Calculated fields (virtuals)
  formattedSize: string;
  popularityRank: number;
  trendingRank: number;
}

// User interaction subdocument interfaces
export interface IModelVote extends Document {
  modelId: mongoose.Types.ObjectId;
  userId: string;
  rating: number; // 1-5 stars
  votedAt: Date;
}

export interface IModelBookmark extends Document {
  modelId: mongoose.Types.ObjectId;
  userId: string;
  bookmarkedAt: Date;
}

export interface IModelComment extends Document {
  modelId: mongoose.Types.ObjectId;
  userId: string;
  username: string;
  content: string;
  rating?: number;
  likes: number;
  replies: Array<{
    userId: string;
    username: string;
    content: string;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// Main AI Model Schema
const AIModelSchema = new Schema<IAIModel>(
  {
    // Basic Information
    huggingFaceId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    author: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
      maxlength: 2000,
    },
    
    // Categorization
    categories: [{
      type: String,
      trim: true,
      index: true,
    }],
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    pipelineTag: {
      type: String,
      trim: true,
      index: true,
    },
    libraryName: {
      type: String,
      trim: true,
    },
    
    // HuggingFace Metrics (85% weight)
    downloads: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    trending: {
      type: Boolean,
      default: false,
      index: true,
    },
    huggingFaceScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
      index: true,
    },
    
    // User Metrics (15% weight)
    userVotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    userRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    userScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    
    // Final Combined Score
    finalScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
      index: true,
    },
    
    // Technical Details
    modelSize: {
      type: Number,
      default: 0,
      min: 0,
    },
    license: {
      type: String,
      trim: true,
    },
    language: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    datasets: [{
      type: String,
      trim: true,
    }],
    metrics: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    
    // Status
    isPrivate: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    
    // Timestamps
    lastModified: {
      type: Date,
      default: Date.now,
    },
    lastSynced: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    collection: 'aimodels',
  }
);

// User Votes Schema (separate collection for scalability)
const ModelVoteSchema = new Schema<IModelVote>(
  {
    modelId: {
      type: Schema.Types.ObjectId,
      ref: 'AIModel',
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    votedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'modelvotes',
  }
);

// User Bookmarks Schema
const ModelBookmarkSchema = new Schema<IModelBookmark>(
  {
    modelId: {
      type: Schema.Types.ObjectId,
      ref: 'AIModel',
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    bookmarkedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'modelbookmarks',
  }
);

// Model Comments Schema
const ModelCommentSchema = new Schema<IModelComment>(
  {
    modelId: {
      type: Schema.Types.ObjectId,
      ref: 'AIModel',
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000,
      trim: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    replies: [{
      userId: { type: String, required: true },
      username: { type: String, required: true },
      content: { type: String, required: true, maxlength: 500 },
      createdAt: { type: Date, default: Date.now },
    }],
  },
  {
    timestamps: true,
    collection: 'modelcomments',
  }
);

// Indexes for optimal query performance
AIModelSchema.index({ finalScore: -1, createdAt: -1 });
AIModelSchema.index({ huggingFaceScore: -1, userScore: -1 });
AIModelSchema.index({ categories: 1, finalScore: -1 });
AIModelSchema.index({ pipelineTag: 1, finalScore: -1 });
AIModelSchema.index({ trending: -1, downloads: -1 });
AIModelSchema.index({ author: 1, finalScore: -1 });
AIModelSchema.index({ tags: 1, finalScore: -1 });
AIModelSchema.index({ lastSynced: 1 }); // For sync operations

// Compound indexes for user interactions
ModelVoteSchema.index({ modelId: 1, userId: 1 }, { unique: true });
ModelBookmarkSchema.index({ modelId: 1, userId: 1 }, { unique: true });
ModelCommentSchema.index({ modelId: 1, createdAt: -1 });

// Virtual fields for computed properties
AIModelSchema.virtual('formattedSize').get(function(this: IAIModel) {
  const bytes = this.modelSize;
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
});

AIModelSchema.virtual('popularityRank').get(function(this: IAIModel) {
  // This would be calculated during aggregation queries
  return 0;
});

AIModelSchema.virtual('trendingRank').get(function(this: IAIModel) {
  // This would be calculated during aggregation queries
  return 0;
});

// Pre-save middleware to calculate scores
AIModelSchema.pre('save', function(this: IAIModel, next) {
  // Calculate user score (0-100 based on rating and vote count)
  if (this.userVotes > 0) {
    const ratingScore = (this.userRating / 5) * 80; // 80% for rating
    const popularityBonus = Math.min((this.userVotes / 100) * 20, 20); // 20% for vote count
    this.userScore = ratingScore + popularityBonus;
  } else {
    this.userScore = 0;
  }
  
  // Calculate final hybrid score (85% HF + 15% user)
  this.finalScore = (this.huggingFaceScore * 0.85) + (this.userScore * 0.15);
  
  next();
});

// Static methods for common queries
AIModelSchema.statics.findByCategory = function(
  this: Model<IAIModel>, 
  category: string, 
  limit: number = 20
) {
  return this.find({ 
    categories: category, 
    isActive: true 
  })
  .sort({ finalScore: -1 })
  .limit(limit);
};

AIModelSchema.statics.findTrending = function(
  this: Model<IAIModel>, 
  limit: number = 20
) {
  return this.find({ 
    trending: true, 
    isActive: true 
  })
  .sort({ finalScore: -1 })
  .limit(limit);
};

AIModelSchema.statics.findPopular = function(
  this: Model<IAIModel>, 
  limit: number = 20
) {
  return this.find({ isActive: true })
    .sort({ downloads: -1, finalScore: -1 })
    .limit(limit);
};

AIModelSchema.statics.findByAuthor = function(
  this: Model<IAIModel>, 
  author: string, 
  limit: number = 20
) {
  return this.find({ 
    author: author, 
    isActive: true 
  })
  .sort({ finalScore: -1 })
  .limit(limit);
};

AIModelSchema.statics.searchModels = function(
  this: Model<IAIModel>, 
  query: string, 
  filters: any = {}, 
  limit: number = 20
) {
  const searchRegex = new RegExp(query, 'i');
  
  return this.find({
    $and: [
      {
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { tags: { $in: [searchRegex] } },
          { author: searchRegex },
        ],
      },
      { isActive: true },
      filters,
    ],
  })
  .sort({ finalScore: -1 })
  .limit(limit);
};

// Instance methods for model operations
AIModelSchema.methods.updateUserRating = async function(
  this: IAIModel,
  newVoteCount: number,
  newAvgRating: number
) {
  this.userVotes = newVoteCount;
  this.userRating = newAvgRating;
  await this.save();
};

AIModelSchema.methods.syncFromHuggingFace = async function(
  this: IAIModel,
  hfData: any
) {
  this.downloads = hfData.downloads || 0;
  this.likes = hfData.likes || 0;
  this.trending = hfData.trending || false;
  this.huggingFaceScore = hfData.huggingFaceScore || 0;
  this.lastSynced = new Date();
  
  await this.save();
};

// Ensure virtuals are included in JSON output
AIModelSchema.set('toJSON', { virtuals: true });
AIModelSchema.set('toObject', { virtuals: true });

// Create and export models
export const AIModel = mongoose.models.AIModel || mongoose.model<IAIModel>('AIModel', AIModelSchema);
export const ModelVote = mongoose.models.ModelVote || mongoose.model<IModelVote>('ModelVote', ModelVoteSchema);
export const ModelBookmark = mongoose.models.ModelBookmark || mongoose.model<IModelBookmark>('ModelBookmark', ModelBookmarkSchema);
export const ModelComment = mongoose.models.ModelComment || mongoose.model<IModelComment>('ModelComment', ModelCommentSchema);

/**
 * @fileoverview AI Model Database Schema with Hybrid Ranking System
 * @description Complete data models for AI model management with user interactions
 * @lastModified 2025-10-05
 * @author aggroNATION Development Team
 */

/* @created 2025-01-26T16:30:00.000Z */