/**
 * OVERVIEW: Type definitions for persistent bookmarks (articles/videos)
 */
export type BookmarkContentType = 'article' | 'video';

export interface Bookmark {
  _id: string;
  contentId: string;
  contentType: BookmarkContentType;
  title: string;
  imageUrl?: string;
  category?: string;
  bookmarkedAt: string;
}

/* @created 2025-01-26T16:30:00.000Z */