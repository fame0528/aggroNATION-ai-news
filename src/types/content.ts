/**
 * @file content.ts
 * @overview Shared serialized content interfaces ensuring consistent typing
 * across server -> client boundaries after Mongo serialization.
 */

export interface BaseSerialized {
  _id: string; // always coerced to string
  createdAt?: string;
  updatedAt?: string;
}

export interface ArticleSerialized extends BaseSerialized {
  title: string;
  description?: string;
  content?: string;
  url?: string;
  originalUrl: string;
  contentType: 'article' | 'video';
  feedId?: string;
  feedTitle: string;
  category: string;
  author?: string;
  publishedAt: string;
  imageUrl?: string;
  tags?: string[];
  likes: number;
  dislikes?: number;
  views: number;
  ranking?: number;
  isActive?: boolean;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit?: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CategorySerialized extends BaseSerialized {
  name: string;
  description?: string;
  color?: string;
  isActive?: boolean;
}

/* @created 2025-01-26T16:30:00.000Z */