/**
 * @fileoverview Comment model for article and video discussions
 * @version 1.0.0
 * @created 2025-09-26
 */

import mongoose, { Document, Schema } from 'mongoose';

/**
 * OVERVIEW:
 * This model handles user comments on articles and videos. It supports
 * nested replies, moderation features, and engagement tracking. Comments
 * can be marked as hidden or reported for moderation review.
 */

export interface IComment extends Document {
  _id: mongoose.Types.ObjectId;
  articleId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  username: string;
  content: string;
  parentId?: mongoose.Types.ObjectId;
  isReply: boolean;
  likes: number;
  dislikes: number;
  isHidden: boolean;
  isReported: boolean;
  reportCount: number;
  moderationStatus: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>({
  articleId: {
    type: Schema.Types.ObjectId,
    ref: 'Article',
    required: [true, 'Article ID is required'],
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    minlength: [1, 'Comment cannot be empty'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    index: 'text'
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
    index: true
  },
  isReply: {
    type: Boolean,
    default: false,
    index: true
  },
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
  isHidden: {
    type: Boolean,
    default: false,
    index: true
  },
  isReported: {
    type: Boolean,
    default: false,
    index: true
  },
  reportCount: {
    type: Number,
    default: 0,
    min: [0, 'Report count cannot be negative']
  },
  moderationStatus: {
    type: String,
    enum: {
      values: ['pending', 'approved', 'rejected'],
      message: 'Moderation status must be pending, approved, or rejected'
    },
    default: 'approved',
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for performance
CommentSchema.index({ articleId: 1, parentId: 1, createdAt: -1 });
CommentSchema.index({ userId: 1, createdAt: -1 });
CommentSchema.index({ moderationStatus: 1, isReported: 1 });
CommentSchema.index({ isHidden: 1, moderationStatus: 1 });

// Virtual for engagement score
CommentSchema.virtual('engagementScore').get(function() {
  return this.likes - this.dislikes;
});

// Virtual for reply count (would need aggregation to be accurate)
CommentSchema.virtual('replyCount').get(function() {
  // This would be populated via aggregation in practice
  return 0;
});

// Static method to get comments for an article
CommentSchema.statics.getArticleComments = function(
  articleId: mongoose.Types.ObjectId,
  options: {
    includeHidden?: boolean;
    sortBy?: 'newest' | 'oldest' | 'popular';
    limit?: number;
    skip?: number;
  } = {}
) {
  const filter: any = {
    articleId,
    isReply: false,
    moderationStatus: 'approved'
  };
  
  if (!options.includeHidden) {
    filter.isHidden = false;
  }
  
  let sortCriteria: any;
  switch(options.sortBy) {
    case 'oldest':
      sortCriteria = { createdAt: 1 };
      break;
    case 'popular':
      sortCriteria = { likes: -1, createdAt: -1 };
      break;
    default:
      sortCriteria = { createdAt: -1 };
  }
  
  return this.find(filter)
    .sort(sortCriteria)
    .limit(options.limit || 20)
    .skip(options.skip || 0)
    .populate('userId', 'username');
};

// Static method to get replies for a comment
CommentSchema.statics.getCommentReplies = function(
  parentId: mongoose.Types.ObjectId,
  options: { includeHidden?: boolean } = {}
) {
  const filter: any = {
    parentId,
    isReply: true,
    moderationStatus: 'approved'
  };
  
  if (!options.includeHidden) {
    filter.isHidden = false;
  }
  
  return this.find(filter)
    .sort({ createdAt: 1 })
    .populate('userId', 'username');
};

// Instance method to add engagement
CommentSchema.methods.addEngagement = function(type: 'like' | 'dislike') {
  if (type === 'like') {
    this.likes += 1;
  } else {
    this.dislikes += 1;
  }
  return this.save();
};

// Instance method to report comment
CommentSchema.methods.reportComment = function() {
  this.reportCount += 1;
  this.isReported = true;
  
  // Auto-hide if too many reports
  if (this.reportCount >= 5) {
    this.isHidden = true;
    this.moderationStatus = 'pending';
  }
  
  return this.save();
};

export default mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);

/* 
 * File: /src/models/Comment.ts
 * Created: 2025-09-26
 * Modified: 2025-09-26
 */