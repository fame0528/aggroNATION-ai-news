/**
 * @fileoverview GitHub Repository Database Schema and Types
 * @description Mongoose schema for GitHub repositories with trending tracking,
 * user interactions, and comprehensive repository metadata for aggroNATION
 * @version 1.0.0
 * @created 2025-10-06
 */

// OVERVIEW:
// This module defines the GitHub repository data structure with support for:
// - Trending AI repository tracking and discovery
// - Repository metadata and statistics (stars, forks, issues)
// - User interactions (votes, bookmarks, comments)
// - Comprehensive categorization and tagging
// - Performance tracking and analytics

import mongoose, { Schema, Document, Model } from 'mongoose';

// TypeScript interfaces for type safety
export interface IGitHubRepository extends Document {
  // Basic repository information
  githubId: number;
  name: string;
  fullName: string;
  owner: string;
  description: string;
  
  // Repository metadata
  htmlUrl: string;
  cloneUrl: string;
  sshUrl: string;
  homepage?: string;
  language: string;
  topics: string[];
  
  // GitHub statistics
  stargazersCount: number;
  forksCount: number;
  watchersCount: number;
  openIssuesCount: number;
  size: number; // Repository size in KB
  
  // Trending and popularity metrics
  trending: boolean;
  trendingScore: number;
  dailyStars: number;
  weeklyStars: number;
  monthlyStars: number;
  
  // User engagement metrics
  userVotes: number;
  userRating: number;
  userScore: number;
  
  // Combined ranking score
  finalScore: number;
  
  // Repository categorization
  categories: string[];
  aiCategories: string[]; // AI-specific categories
  isAIRepository: boolean;
  
  // Repository status
  isPrivate: boolean;
  isFork: boolean;
  isArchived: boolean;
  isDisabled: boolean;
  
  // License and legal
  license?: string;
  licenseName?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  pushedAt: Date;
  lastSyncAt?: Date;
  
  // Engagement tracking
  viewCount: number;
  clickCount: number;
  bookmarkCount: number;
  
  // Content status
  isActive: boolean;
  isFeatured: boolean;
  moderationStatus: 'pending' | 'approved' | 'rejected';
  
  // Methods
  calculateTrendingScore(): number;
  calculateFinalScore(): number;
  incrementViewCount(): Promise<IGitHubRepository>;
  incrementClickCount(): Promise<IGitHubRepository>;
}

// Repository categorization schema
const RepositoryCategorySchema = new Schema({
  name: { type: String, required: true },
  weight: { type: Number, default: 1 }
}, { _id: false });

// AI-specific categories enum
export enum AIRepositoryCategory {
  MachineLearning = 'machine-learning',
  DeepLearning = 'deep-learning',
  NaturalLanguageProcessing = 'nlp',
  ComputerVision = 'computer-vision',
  ReinforcementLearning = 'reinforcement-learning',
  DataScience = 'data-science',
  MLOps = 'mlops',
  AutoML = 'automl',
  Robotics = 'robotics',
  AIFrameworks = 'ai-frameworks',
  AITools = 'ai-tools',
  Research = 'research',
  Datasets = 'datasets',
  Models = 'models',
  APIs = 'apis',
  WebApps = 'web-apps',
  MobileApps = 'mobile-apps',
  DesktopApps = 'desktop-apps',
  Libraries = 'libraries',
  Tutorials = 'tutorials'
}

// Main GitHub Repository schema
const GitHubRepositorySchema = new Schema<IGitHubRepository>({
  // Basic repository information
  githubId: { 
    type: Number, 
    required: true, 
    unique: true,
    index: true 
  },
  name: { 
    type: String, 
    required: true,
    trim: true,
    index: true 
  },
  fullName: { 
    type: String, 
    required: true,
    unique: true,
    trim: true,
    index: true 
  },
  owner: { 
    type: String, 
    required: true,
    trim: true,
    index: true 
  },
  description: { 
    type: String, 
    default: '',
    trim: true 
  },
  
  // Repository metadata
  htmlUrl: { 
    type: String, 
    required: true,
    unique: true 
  },
  cloneUrl: { type: String, required: true },
  sshUrl: { type: String, required: true },
  homepage: { type: String, default: null },
  language: { 
    type: String, 
    default: '',
    index: true 
  },
  topics: [{ 
    type: String, 
    trim: true,
    lowercase: true 
  }],
  
  // GitHub statistics
  stargazersCount: { 
    type: Number, 
    default: 0,
    min: 0,
    index: true 
  },
  forksCount: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  watchersCount: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  openIssuesCount: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  size: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  
  // Trending and popularity metrics
  trending: { 
    type: Boolean, 
    default: false,
    index: true 
  },
  trendingScore: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 100,
    index: true 
  },
  dailyStars: { type: Number, default: 0, min: 0 },
  weeklyStars: { type: Number, default: 0, min: 0 },
  monthlyStars: { type: Number, default: 0, min: 0 },
  
  // User engagement metrics
  userVotes: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  userRating: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 5 
  },
  userScore: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 100 
  },
  
  // Combined ranking score
  finalScore: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 100,
    index: true 
  },
  
  // Repository categorization
  categories: [{ 
    type: String, 
    trim: true,
    lowercase: true,
    enum: Object.values(AIRepositoryCategory)
  }],
  aiCategories: [{ 
    type: String, 
    trim: true,
    lowercase: true,
    enum: Object.values(AIRepositoryCategory)
  }],
  isAIRepository: { 
    type: Boolean, 
    default: true,
    index: true 
  },
  
  // Repository status
  isPrivate: { 
    type: Boolean, 
    default: false,
    index: true 
  },
  isFork: { 
    type: Boolean, 
    default: false,
    index: true 
  },
  isArchived: { 
    type: Boolean, 
    default: false,
    index: true 
  },
  isDisabled: { 
    type: Boolean, 
    default: false,
    index: true 
  },
  
  // License and legal
  license: { type: String, default: null },
  licenseName: { type: String, default: null },
  
  // Timestamps
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now,
    index: true 
  },
  pushedAt: { 
    type: Date, 
    default: Date.now,
    index: true 
  },
  lastSyncAt: { 
    type: Date, 
    default: null,
    index: true 
  },
  
  // Engagement tracking
  viewCount: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  clickCount: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  bookmarkCount: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  
  // Content status
  isActive: { 
    type: Boolean, 
    default: true,
    index: true 
  },
  isFeatured: { 
    type: Boolean, 
    default: false,
    index: true 
  },
  moderationStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved',
    index: true 
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
GitHubRepositorySchema.index({ trending: -1, stargazersCount: -1 });
GitHubRepositorySchema.index({ finalScore: -1, updatedAt: -1 });
GitHubRepositorySchema.index({ categories: 1, finalScore: -1 });
GitHubRepositorySchema.index({ aiCategories: 1, trending: -1 });
GitHubRepositorySchema.index({ language: 1, stargazersCount: -1 });
GitHubRepositorySchema.index({ topics: 1, finalScore: -1 });
GitHubRepositorySchema.index({ owner: 1, stargazersCount: -1 });
GitHubRepositorySchema.index({ isActive: 1, moderationStatus: 1, finalScore: -1 });

// Virtual fields
GitHubRepositorySchema.virtual('shortDescription').get(function() {
  if (!this.description) return '';
  return this.description.length > 150 
    ? this.description.substring(0, 150) + '...' 
    : this.description;
});

GitHubRepositorySchema.virtual('displayName').get(function() {
  return this.name || this.fullName?.split('/').pop() || 'Unknown Repository';
});

GitHubRepositorySchema.virtual('githubUrl').get(function() {
  return this.htmlUrl;
});

// Instance methods
GitHubRepositorySchema.methods.calculateTrendingScore = function(): number {
  const starsWeight = 0.4;
  const forksWeight = 0.2;
  const issuesWeight = 0.15;
  const recentActivityWeight = 0.15;
  const topicsWeight = 0.1;
  
  // Normalize stars (logarithmic scale)
  const normalizedStars = Math.min(Math.log10(this.stargazersCount + 1) * 10, 40);
  
  // Normalize forks
  const normalizedForks = Math.min(Math.log10(this.forksCount + 1) * 5, 20);
  
  // Issues activity (lower is better for open issues)
  const issuesScore = Math.max(15 - (this.openIssuesCount / 10), 0);
  
  // Recent activity (days since last push)
  const daysSinceLastPush = this.pushedAt ? 
    (Date.now() - new Date(this.pushedAt).getTime()) / (1000 * 60 * 60 * 24) : 365;
  const activityScore = Math.max(15 - (daysSinceLastPush / 7), 0);
  
  // Topics relevance
  const aiTopics = ['ai', 'ml', 'machine-learning', 'deep-learning', 'neural-network', 
                    'computer-vision', 'nlp', 'data-science', 'tensorflow', 'pytorch'];
  const topicsScore = this.topics.filter((topic: string) => 
    aiTopics.some((aiTopic: string) => topic.includes(aiTopic))
  ).length * 2;
  
  const score = (normalizedStars * starsWeight) + 
                (normalizedForks * forksWeight) + 
                (issuesScore * issuesWeight) + 
                (activityScore * recentActivityWeight) + 
                (topicsScore * topicsWeight);
  
  return Math.min(Math.round(score), 100);
};

GitHubRepositorySchema.methods.calculateFinalScore = function(): number {
  const githubWeight = 0.85; // 85% from GitHub metrics
  const userWeight = 0.15;   // 15% from user interactions
  
  const githubScore = this.calculateTrendingScore();
  const userScore = this.userScore || 0;
  
  return Math.round((githubScore * githubWeight) + (userScore * userWeight));
};

GitHubRepositorySchema.methods.incrementViewCount = function(): Promise<IGitHubRepository> {
  this.viewCount = (this.viewCount || 0) + 1;
  return this.save();
};

GitHubRepositorySchema.methods.incrementClickCount = function(): Promise<IGitHubRepository> {
  this.clickCount = (this.clickCount || 0) + 1;
  return this.save();
};

// Pre-save middleware
GitHubRepositorySchema.pre('save', function(next) {
  // Auto-calculate scores
  this.trendingScore = this.calculateTrendingScore();
  this.finalScore = this.calculateFinalScore();
  
  // Update timestamps
  this.updatedAt = new Date();
  
  // Auto-detect trending status
  this.trending = this.trendingScore >= 70 || this.dailyStars >= 10;
  
  // Auto-categorize as AI repository
  const aiKeywords = ['ai', 'ml', 'machine-learning', 'deep-learning', 'neural', 
                      'computer-vision', 'nlp', 'data-science', 'tensorflow', 'pytorch'];
  const hasAIKeywords = aiKeywords.some(keyword => 
    this.description?.toLowerCase().includes(keyword) ||
    this.topics.some(topic => topic.includes(keyword)) ||
    this.name.toLowerCase().includes(keyword)
  );
  
  if (hasAIKeywords && this.aiCategories.length === 0) {
    this.isAIRepository = true;
    // Auto-assign basic AI categories based on keywords
    if (this.description?.toLowerCase().includes('vision') || this.topics.includes('computer-vision')) {
      this.aiCategories.push(AIRepositoryCategory.ComputerVision);
    }
    if (this.description?.toLowerCase().includes('nlp') || this.topics.includes('nlp')) {
      this.aiCategories.push(AIRepositoryCategory.NaturalLanguageProcessing);
    }
    if (this.topics.includes('tensorflow') || this.topics.includes('pytorch')) {
      this.aiCategories.push(AIRepositoryCategory.AIFrameworks);
    }
    if (!this.aiCategories.length) {
      this.aiCategories.push(AIRepositoryCategory.MachineLearning);
    }
  }
  
  next();
});

// Static methods
GitHubRepositorySchema.statics.findTrending = function(limit = 20) {
  return this.find({ 
    isActive: true, 
    trending: true,
    moderationStatus: 'approved'
  })
  .sort({ trendingScore: -1, stargazersCount: -1 })
  .limit(limit);
};

GitHubRepositorySchema.statics.findByCategory = function(category: string, limit = 20) {
  return this.find({ 
    isActive: true,
    moderationStatus: 'approved',
    $or: [
      { categories: category },
      { aiCategories: category }
    ]
  })
  .sort({ finalScore: -1, stargazersCount: -1 })
  .limit(limit);
};

GitHubRepositorySchema.statics.findRecent = function(limit = 20) {
  return this.find({ 
    isActive: true,
    moderationStatus: 'approved'
  })
  .sort({ createdAt: -1, stargazersCount: -1 })
  .limit(limit);
};

// Create and export the model
const GitHubRepository: Model<IGitHubRepository> = mongoose.models.GitHubRepository || 
  mongoose.model<IGitHubRepository>('GitHubRepository', GitHubRepositorySchema);

export default GitHubRepository;

/*
 * File: /src/models/GitHubRepository.ts
 * Created: 2025-10-06
 * Modified: 2025-10-06
 * 
 * Dependencies:
 * - mongoose (database ODM)
 * - Node.js built-in modules
 * 
 * Exports:
 * - GitHubRepository: Main model class
 * - IGitHubRepository: TypeScript interface
 * - AIRepositoryCategory: Enum for AI categories
 * 
 * Usage:
 * - Store and manage GitHub repository data
 * - Track trending AI repositories
 * - Handle user interactions and engagement
 * - Provide comprehensive repository analytics
 */

/* @created 2025-01-26T16:30:00.000Z */