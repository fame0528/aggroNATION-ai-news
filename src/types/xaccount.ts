/**
 * @fileoverview Type definitions for X (Twitter) account management
 * @version 1.0.0
 * @author aggroNATION Development Team
 * @created 2025-01-05
 */

// Local pagination interface for X Account API responses
export interface XAccountPaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ===============================================
// OVERVIEW: Client-Safe X Account Types
// ===============================================
// Type definitions that can be safely imported on both client and server
// These mirror the model definitions but without Mongoose dependencies

/**
 * X Account categories for content aggregation
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
 * Interface for X Account document structure
 */
export interface IXAccount {
  _id?: string;
  handle: string; // Twitter handle without @
  name: string; // Display name
  description: string;
  category: XAccountCategory;
  isEnabled: boolean;
  isVerified: boolean;
  followerCount: number;
  lastSyncAt?: Date;
  syncErrorCount: number;
  lastSyncError?: string;
  priority: number; // 1-10, higher = more important
  rateLimitWeight: number; // For API quota management
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Request/Response types for API endpoints
 */
export interface CreateXAccountRequest {
  handle: string;
  name: string;
  description: string;
  category: XAccountCategory;
  isEnabled?: boolean;
  priority?: number;
  rateLimitWeight?: number;
}

export interface UpdateXAccountRequest {
  name?: string;
  description?: string;
  category?: XAccountCategory;
  isEnabled?: boolean;
  priority?: number;
  rateLimitWeight?: number;
}



export interface XAccountsResponse {
  success: boolean;
  data: {
    accounts: IXAccount[];
    pagination: XAccountPaginationMeta;
  };
}

export interface SyncStats {
  totalTweets: number;
  accountsNeedingSync: number;
  categoryBreakdown: Array<{
    category: XAccountCategory;
    count: number;
    activeCount: number;
  }>;
  recentActivity: Array<{
    username: string;
    lastSyncAt: Date;
    tweetCount: number;
    errors?: string[];
  }>;
}

// Footer: src/types/xaccount.ts | Created: 2025-01-05 | Modified: 2025-01-05

/* @created 2025-01-26T16:30:00.000Z */