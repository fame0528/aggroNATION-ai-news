/**
 * OVERVIEW: Type definitions for video content
 */
export interface Video {
  _id: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  category?: string;
  publishedAt?: string;
  views: number;
  likes: number;
  dislikes: number;
  bookmarks: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
}

/* @created 2025-01-26T16:30:00.000Z */