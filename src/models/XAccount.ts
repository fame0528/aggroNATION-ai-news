/**
 * @fileoverview XAccount Model - Manages Twitter/X accounts for content synchronization
 * @version 1.0.0
 * @author aggroNATION Development Team
 * @created 2025-10-06
 */

import mongoose, { Document, Schema } from 'mongoose';

// ===============================================
// OVERVIEW: X Account Management System
// ===============================================
// This model provides comprehensive management of Twitter/X accounts
// for automated content synchronization with full admin control.
//
// Features:
// - Account categorization and metadata
// - Enable/disable functionality
// - Follower count tracking
// - Verification status monitoring
// - Rate limit aware processing
// - Category-based batch operations

/**
 * X Account categories for organizational purposes
 */
export enum XAccountCategory {
  AI_INDIVIDUALS = 'AI_INDIVIDUALS',
  AI_COMPANIES = 'AI_COMPANIES', 
  AI_NEWS = 'AI_NEWS',
  DEV_TOOLS = 'DEV_TOOLS',
  COMMUNITIES = 'COMMUNITIES',
  RESEARCH = 'RESEARCH'
}

/**
 * Interface for X Account document
 */
export interface IXAccount extends Document {
  // Basic account information
  handle: string;
  name: string;
  description: string;
  category: XAccountCategory;
  
  // Status and control
  isEnabled: boolean;
  isVerified: boolean;
  
  // Metadata
  followerCount: number;
  lastSyncAt?: Date;
  syncErrorCount: number;
  lastSyncError?: string;
  
  // Administrative
  priority: number; // 1-10, higher = more important
  rateLimitWeight: number; // For API quota management
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * X Account Schema Definition
 */
const XAccountSchema = new Schema<IXAccount>(
  {
    // Basic account information
    handle: {
      type: String,
      required: [true, 'Twitter handle is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-zA-Z0-9_]+$/, 'Invalid Twitter handle format'],
      index: true
    },
    
    name: {
      type: String,
      required: [true, 'Display name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    
    category: {
      type: String,
      enum: Object.values(XAccountCategory),
      required: [true, 'Category is required'],
      index: true
    },
    
    // Status and control
    isEnabled: {
      type: Boolean,
      default: true,
      index: true
    },
    
    isVerified: {
      type: Boolean,
      default: false
    },
    
    // Metadata
    followerCount: {
      type: Number,
      default: 0,
      min: [0, 'Follower count cannot be negative']
    },
    
    lastSyncAt: {
      type: Date,
      index: true
    },
    
    syncErrorCount: {
      type: Number,
      default: 0,
      min: [0, 'Error count cannot be negative']
    },
    
    lastSyncError: {
      type: String,
      maxlength: [1000, 'Error message too long']
    },
    
    // Administrative
    priority: {
      type: Number,
      default: 5,
      min: [1, 'Priority must be between 1-10'],
      max: [10, 'Priority must be between 1-10']
    },
    
    rateLimitWeight: {
      type: Number,
      default: 1,
      min: [0.1, 'Rate limit weight must be positive'],
      max: [10, 'Rate limit weight too high']
    }
  },
  {
    timestamps: true,
    collection: 'xaccounts'
  }
);

// ===============================================
// INDEXES
// ===============================================

// Compound indexes for efficient queries
XAccountSchema.index({ category: 1, isEnabled: 1 });
XAccountSchema.index({ priority: -1, isEnabled: 1 });
XAccountSchema.index({ lastSyncAt: 1, isEnabled: 1 });

// ===============================================
// INSTANCE METHODS
// ===============================================

/**
 * Mark sync as successful
 */
XAccountSchema.methods.markSyncSuccess = function() {
  this.lastSyncAt = new Date();
  this.syncErrorCount = 0;
  this.lastSyncError = undefined;
  return this.save();
};

/**
 * Mark sync as failed
 */
XAccountSchema.methods.markSyncError = function(error: string) {
  this.syncErrorCount += 1;
  this.lastSyncError = error;
  
  // Auto-disable after 5 consecutive failures
  if (this.syncErrorCount >= 5) {
    this.isEnabled = false;
  }
  
  return this.save();
};

/**
 * Check if account needs sync (hasn't been synced in last hour)
 */
XAccountSchema.methods.needsSync = function(): boolean {
  if (!this.isEnabled) return false;
  if (!this.lastSyncAt) return true;
  
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  return this.lastSyncAt < oneHourAgo;
};

// ===============================================
// STATIC METHODS
// ===============================================

/**
 * Get enabled accounts by category
 */
XAccountSchema.statics.getEnabledByCategory = function(category: XAccountCategory) {
  return this.find({ 
    category, 
    isEnabled: true 
  }).sort({ priority: -1, followerCount: -1 });
};

/**
 * Get accounts that need syncing
 */
XAccountSchema.statics.getAccountsNeedingSync = function(limit = 10) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  return this.find({
    isEnabled: true,
    $or: [
      { lastSyncAt: { $exists: false } },
      { lastSyncAt: { $lt: oneHourAgo } }
    ]
  })
  .sort({ priority: -1, lastSyncAt: 1 })
  .limit(limit);
};

/**
 * Bulk enable/disable by category
 */
XAccountSchema.statics.bulkUpdateCategory = function(
  category: XAccountCategory, 
  isEnabled: boolean
) {
  return this.updateMany({ category }, { isEnabled });
};

// ===============================================
// VALIDATION & MIDDLEWARE
// ===============================================

/**
 * Pre-save middleware for handle formatting
 */
XAccountSchema.pre('save', function(next) {
  // Remove @ symbol if present
  if (this.handle.startsWith('@')) {
    this.handle = this.handle.substring(1);
  }
  
  next();
});

// ===============================================
// MODEL EXPORT
// ===============================================

let XAccount: mongoose.Model<IXAccount>;

try {
  // Try to retrieve existing model
  XAccount = mongoose.models.XAccount as mongoose.Model<IXAccount>;
} catch (error) {
  // Model doesn't exist, create it
  XAccount = mongoose.model<IXAccount>('XAccount', XAccountSchema);
}

// Fallback if model doesn't exist
if (!XAccount) {
  XAccount = mongoose.model<IXAccount>('XAccount', XAccountSchema);
}

export default XAccount;

/**
 * Type guard for XAccount documents
 */
export const isXAccount = (obj: any): obj is IXAccount => {
  return obj && typeof obj.handle === 'string' && typeof obj.category === 'string';
};

/**
 * Factory for creating new X accounts
 */
export const createXAccount = (data: Partial<IXAccount>): Partial<IXAccount> => {
  return {
    isEnabled: true,
    syncErrorCount: 0,
    priority: 5,
    rateLimitWeight: 1,
    ...data
  };
};

// ===============================================
// FOOTER
// ===============================================
// File: src/models/XAccount.ts
// Generated: 2025-10-06T11:18:00.000Z
// Purpose: Comprehensive X/Twitter account management for aggroNATION

/* @created 2025-01-26T16:30:00.000Z */