/**
 * OVERVIEW: Tweet model for X/Twitter posts integration
 * Features: Store tweets, media, engagement metrics, thread support
 * @version 1.0.0
 * @created 2025-10-05
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface ITweet extends Document {
  _id: mongoose.Types.ObjectId;
  tweetId: string;
  text: string;
  authorId: string;
  authorUsername: string;
  authorName: string;
  authorProfileImage?: string;
  authorVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
  
  // Virtual properties
  totalEngagement: number;
  engagementRate: number;
  platformEngagementScore: number;
  
  // Media attachments
  media: {
    type: 'photo' | 'video' | 'gif';
    url: string;
    thumbnailUrl?: string;
    altText?: string;
    width?: number;
    height?: number;
  }[];
  
  // Engagement metrics
  retweetCount: number;
  likeCount: number;
  replyCount: number;
  quoteCount: number;
  bookmarkCount: number;
  impressionCount: number;
  
  // Thread information
  conversationId?: string;
  inReplyToTweetId?: string;
  inReplyToUserId?: string;
  
  // Content classification
  category: string;
  tags: string[];
  hashtags: string[];
  mentions: string[];
  urls: string[];
  
  // Internal tracking
  likes: number; // Our platform likes
  views: number; // Our platform views
  ranking: number;
  isActive: boolean;
  isThread: boolean;
  threadPosition?: number;
  isPinned: boolean;
  
  // Content analysis
  sentiment?: 'positive' | 'negative' | 'neutral';
  language?: string;
  isRetweet: boolean;
  originalTweetId?: string;
  
  // Moderation
  isHidden: boolean;
  isReported: boolean;
  moderationStatus: 'pending' | 'approved' | 'rejected';
}

const TweetSchema = new Schema<ITweet>({
  tweetId: {
    type: String,
    required: [true, 'Tweet ID is required'],
    unique: true,
    index: true
  },
  text: {
    type: String,
    required: [true, 'Tweet text is required'],
    maxlength: [2000, 'Tweet text cannot exceed 2000 characters'],
    index: 'text'
  },
  authorId: {
    type: String,
    required: [true, 'Author ID is required'],
    index: true
  },
  authorUsername: {
    type: String,
    required: [true, 'Author username is required'],
    trim: true,
    lowercase: true
  },
  authorName: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true
  },
  authorProfileImage: {
    type: String,
    trim: true
  },
  authorVerified: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date,
    required: [true, 'Published date is required'],
    index: -1
  },
  
  // Media
  media: [{
    type: {
      type: String,
      enum: ['photo', 'video', 'gif'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    thumbnailUrl: String,
    altText: String,
    width: Number,
    height: Number
  }],
  
  // Engagement from Twitter
  retweetCount: {
    type: Number,
    default: 0,
    min: 0
  },
  likeCount: {
    type: Number,
    default: 0,
    min: 0
  },
  replyCount: {
    type: Number,
    default: 0,
    min: 0
  },
  quoteCount: {
    type: Number,
    default: 0,
    min: 0
  },
  bookmarkCount: {
    type: Number,
    default: 0,
    min: 0
  },
  impressionCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Thread info
  conversationId: {
    type: String,
    index: true
  },
  inReplyToTweetId: String,
  inReplyToUserId: String,
  
  // Classification
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    index: true,
    default: 'Social'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  hashtags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  mentions: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  urls: [{
    type: String,
    trim: true
  }],
  
  // Internal metrics
  likes: {
    type: Number,
    default: 0,
    min: 0
  },
  views: {
    type: Number,
    default: 0,
    min: 0
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
  },
  isThread: {
    type: Boolean,
    default: false,
    index: true
  },
  threadPosition: {
    type: Number,
    min: 1
  },
  isPinned: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Analysis
  sentiment: {
    type: String,
    enum: ['positive', 'negative', 'neutral']
  },
  language: {
    type: String,
    default: 'en'
  },
  isRetweet: {
    type: Boolean,
    default: false,
    index: true
  },
  originalTweetId: String,
  
  // Moderation
  isHidden: {
    type: Boolean,
    default: false,
    index: true
  },
  isReported: {
    type: Boolean,
    default: false
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

// Compound indexes for efficient queries
TweetSchema.index({ category: 1, isActive: 1, publishedAt: -1 });
TweetSchema.index({ authorUsername: 1, publishedAt: -1 });
TweetSchema.index({ conversationId: 1, threadPosition: 1 });
TweetSchema.index({ ranking: -1, isActive: 1 });
TweetSchema.index({ isPinned: -1, publishedAt: -1 });

// Text search index
TweetSchema.index({
  text: 'text',
  authorName: 'text',
  authorUsername: 'text',
  hashtags: 'text',
  tags: 'text'
});

// Virtual for total engagement
TweetSchema.virtual('totalEngagement').get(function() {
  return this.likeCount + this.retweetCount + this.replyCount + this.quoteCount;
});

// Virtual for engagement rate (if we have impression data)
TweetSchema.virtual('engagementRate').get(function(this: ITweet) {
  if (this.impressionCount === 0) return 0;
  const totalEng = this.likeCount + this.retweetCount + this.replyCount + this.quoteCount;
  return (totalEng / this.impressionCount) * 100;
});

// Virtual for our platform engagement score
TweetSchema.virtual('platformEngagementScore').get(function(this: ITweet) {
  const likesWeight = this.likes * 2;
  const viewsWeight = this.views * 0.1;
  const totalEng = this.likeCount + this.retweetCount + this.replyCount + this.quoteCount;
  const twitterEngagementWeight = totalEng * 0.5;
  return likesWeight + viewsWeight + twitterEngagementWeight;
});

// Pre-save middleware to extract hashtags, mentions, and URLs
TweetSchema.pre('save', function(this: ITweet, next) {
  if (this.isModified('text')) {
    // Extract hashtags
    const hashtagMatches = this.text.match(/#[a-zA-Z0-9_]+/g);
    this.hashtags = hashtagMatches ? hashtagMatches.map(tag => tag.slice(1).toLowerCase()) : [];
    
    // Extract mentions
    const mentionMatches = this.text.match(/@[a-zA-Z0-9_]+/g);
    this.mentions = mentionMatches ? mentionMatches.map(mention => mention.slice(1).toLowerCase()) : [];
    
    // Extract URLs
    const urlMatches = this.text.match(/https?:\/\/[^\s]+/g);
    this.urls = urlMatches ? urlMatches : [];
    
    // Calculate ranking
    const likesWeight = this.likes * 2;
    const viewsWeight = this.views * 0.1;
    const totalEng = this.likeCount + this.retweetCount + this.replyCount + this.quoteCount;
    const twitterEngagementWeight = totalEng * 0.5;
    this.ranking = likesWeight + viewsWeight + twitterEngagementWeight;
  }
  next();
});

// Method to check if tweet is part of a thread
TweetSchema.methods.isPartOfThread = function() {
  return this.isThread || this.inReplyToTweetId !== null;
};

// Method to get display text (truncated if needed)
TweetSchema.methods.getDisplayText = function(maxLength: number = 280) {
  if (this.text.length <= maxLength) return this.text;
  return this.text.substring(0, maxLength - 3) + '...';
};

// Static method to find tweets by hashtag
TweetSchema.statics.findByHashtag = function(hashtag: string, limit = 20) {
  return this.find({
    hashtags: hashtag.toLowerCase(),
    isActive: true,
    isHidden: false
  })
  .sort({ publishedAt: -1 })
  .limit(limit)
  .lean();
};

// Static method to find thread tweets
TweetSchema.statics.findThreadTweets = function(conversationId: string) {
  return this.find({
    conversationId,
    isActive: true,
    isHidden: false
  })
  .sort({ threadPosition: 1, publishedAt: 1 })
  .lean();
};

export default mongoose.models.Tweet || mongoose.model<ITweet>('Tweet', TweetSchema);

/**
 * Usage Examples:
 * 
 * Create a tweet:
 * const tweet = new Tweet({
 *   tweetId: '1234567890',
 *   text: 'Hello world! #programming #javascript',
 *   authorId: 'user123',
 *   authorUsername: 'johndoe',
 *   authorName: 'John Doe',
 *   publishedAt: new Date(),
 *   category: 'Technology'
 * });
 * 
 * Find tweets by hashtag:
 * const tweets = await Tweet.findByHashtag('programming');
 * 
 * Find thread tweets:
 * const threadTweets = await Tweet.findThreadTweets('conversation123');
 */

/* @created 2025-01-26T16:30:00.000Z */