/**
 * @fileoverview User model for authentication and user management
 * @version 1.0.0
 * @created 2025-09-26
 */

import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * OVERVIEW:
 * This model handles user authentication, preferences, and engagement tracking.
 * It supports both regular users and admin users with role-based access control.
 * User preferences are stored for personalized content filtering and notifications.
 */

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  username: string;
  password: string;
  role: 'user' | 'admin';
  isActive: boolean;
  preferences: {
    categories: string[];
    contentTypes: string[];
    emailNotifications: boolean;
    darkMode: boolean;
    notificationFrequency: 'daily' | 'weekly' | 'never';
  };
  engagement: {
    articlesLiked: mongoose.Types.ObjectId[];
    articlesDisliked: mongoose.Types.ObjectId[];
    articlesViewed: mongoose.Types.ObjectId[];
    commentsCount: number;
  };
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Please provide a valid email address'
    },
    index: true
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    validate: {
      validator: function(username: string) {
        return /^[a-zA-Z0-9_-]+$/.test(username);
      },
      message: 'Username can only contain letters, numbers, underscores, and hyphens'
    },
    index: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'admin'],
      message: 'Role must be either user or admin'
    },
    default: 'user',
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  preferences: {
    categories: [{
      type: String,
      trim: true
    }],
    contentTypes: [{
      type: String,
      enum: ['article', 'video'],
      default: ['article', 'video']
    }],
    emailNotifications: {
      type: Boolean,
      default: true
    },
    darkMode: {
      type: Boolean,
      default: false
    },
    notificationFrequency: {
      type: String,
      enum: {
        values: ['daily', 'weekly', 'never'],
        message: 'Notification frequency must be daily, weekly, or never'
      },
      default: 'weekly'
    }
  },
  engagement: {
    articlesLiked: [{
      type: Schema.Types.ObjectId,
      ref: 'Article'
    }],
    articlesDisliked: [{
      type: Schema.Types.ObjectId,
      ref: 'Article'
    }],
    articlesViewed: [{
      type: Schema.Types.ObjectId,
      ref: 'Article'
    }],
    commentsCount: {
      type: Number,
      default: 0,
      min: [0, 'Comments count cannot be negative']
    }
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete (ret as any).password;
      return ret;
    }
  },
  toObject: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete (ret as any).password;
      return ret;
    }
  }
});

// Indexes for performance
UserSchema.index({ email: 1, isActive: 1 });
UserSchema.index({ username: 1, isActive: 1 });
UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ lastLogin: -1 });

// Virtual for engagement level
UserSchema.virtual('engagementLevel').get(function() {
  const totalEngagements = 
    this.engagement.articlesLiked.length + 
    this.engagement.articlesDisliked.length + 
    this.engagement.commentsCount;
  
  if (totalEngagements >= 100) return 'high';
  if (totalEngagements >= 20) return 'medium';
  return 'low';
});

// Virtual for total articles interacted with
UserSchema.virtual('totalInteractions').get(function() {
  return this.engagement.articlesLiked.length + 
         this.engagement.articlesDisliked.length + 
         this.engagement.articlesViewed.length;
});

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
  // Only hash password if it's been modified or is new
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Instance method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Static method to find active users
UserSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true }).sort({ createdAt: -1 });
};

// Static method to find users by engagement level
UserSchema.statics.findByEngagementLevel = function() {
  // This would require aggregation pipeline for complex virtual field filtering
  return this.find({ isActive: true });
};

// Instance method to update last login
UserSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Instance method to add article engagement
UserSchema.methods.addArticleEngagement = function(
  articleId: mongoose.Types.ObjectId, 
  type: 'like' | 'dislike' | 'view'
) {
  switch(type) {
    case 'like':
      if (!this.engagement.articlesLiked.includes(articleId)) {
        this.engagement.articlesLiked.push(articleId);
        // Remove from dislikes if exists
        this.engagement.articlesDisliked = this.engagement.articlesDisliked.filter(
          (id: any) => !id.equals(articleId)
        );
      }
      break;
    case 'dislike':
      if (!this.engagement.articlesDisliked.includes(articleId)) {
        this.engagement.articlesDisliked.push(articleId);
        // Remove from likes if exists
        this.engagement.articlesLiked = this.engagement.articlesLiked.filter(
          (id: any) => !id.equals(articleId)
        );
      }
      break;
    case 'view':
      if (!this.engagement.articlesViewed.includes(articleId)) {
        this.engagement.articlesViewed.push(articleId);
      }
      break;
  }
  return this.save();
};

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

/* 
 * File: /src/models/User.ts
 * Created: 2025-09-26
 * Modified: 2025-09-26
 */