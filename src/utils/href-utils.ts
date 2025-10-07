/**
 * @fileoverview Utility functions for safely handling href values in Link components
 * @version 1.0.0
 * @created 2025-10-05
 */

/**
 * OVERVIEW:
 * Provides safe href handling utilities to prevent Next.js Link components
 * from receiving undefined or invalid href values, which causes runtime errors.
 */

/**
 * Safely validates and creates an href for article links
 * @param articleId - The article ID (potentially unsafe)
 * @returns Safe href string or null if invalid
 */
export function createArticleHref(articleId: any): string | null {
  if (!articleId) return null;
  
  // Convert to string safely
  let id: string;
  if (typeof articleId === 'string') {
    id = articleId;
  } else if (typeof articleId === 'object' && typeof articleId.$oid === 'string') {
    id = articleId.$oid;
  } else if (typeof articleId?.toString === 'function') {
    try {
      id = articleId.toString();
      if (id === '[object Object]') return null;
    } catch {
      return null;
    }
  } else {
    return null;
  }
  
  // Validate the ID
  if (!id || id.trim() === '' || id === 'undefined' || id === 'null') {
    return null;
  }
  
  try {
    return `/article/${encodeURIComponent(id.trim())}`;
  } catch {
    return null;
  }
}

/**
 * Safely validates and creates an href for video links
 * @param videoId - The video ID (potentially unsafe)
 * @returns Safe href string or null if invalid
 */
export function createVideoHref(videoId: any): string | null {
  if (!videoId) return null;
  
  // Convert to string safely
  let id: string;
  if (typeof videoId === 'string') {
    id = videoId;
  } else if (typeof videoId === 'object' && typeof videoId.$oid === 'string') {
    id = videoId.$oid;
  } else if (typeof videoId?.toString === 'function') {
    try {
      id = videoId.toString();
      if (id === '[object Object]') return null;
    } catch {
      return null;
    }
  } else {
    return null;
  }
  
  // Validate the ID
  if (!id || id.trim() === '' || id === 'undefined' || id === 'null') {
    return null;
  }
  
  try {
    return `/video/${encodeURIComponent(id.trim())}`;
  } catch {
    return null;
  }
}

/**
 * Safely validates and creates an href for video comments
 * @param videoId - The video ID (potentially unsafe)
 * @returns Safe href string or null if invalid
 */
export function createVideoCommentsHref(videoId: any): string | null {
  const baseHref = createVideoHref(videoId);
  return baseHref ? `${baseHref}#comments` : null;
}

/**
 * Generic safe href validator
 * @param href - The href value to validate
 * @returns Safe href string or null if invalid
 */
export function validateHref(href: any): string | null {
  if (!href || typeof href !== 'string') return null;
  
  const trimmed = href.trim();
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null') return null;
  
  try {
    // Basic URL validation - should start with / or be a full URL
    if (trimmed.startsWith('/') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    return null;
  } catch {
    return null;
  }
}

/* @created 2025-01-26T16:30:00.000Z */