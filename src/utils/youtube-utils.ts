/**
 * @fileoverview YouTube utilities for video ID extraction and embed URL generation
 * @version 1.0.0
 * @created 2025-09-26
 */

/**
 * OVERVIEW:
 * This module provides utilities for handling YouTube URLs and generating
 * embed links. It supports multiple YouTube URL formats including watch URLs,
 * short URLs (youtu.be), and existing embed URLs.
 */

/**
 * Extracts YouTube video ID from various URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=ABCDEFGHIJK
 * - https://youtu.be/ABCDEFGHIJK
 * - https://www.youtube.com/embed/ABCDEFGHIJK
 * - https://www.youtube.com/v/ABCDEFGHIJK
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    const urlObj = new URL(url);
    
    // Handle different YouTube URL patterns
    const patterns = [
      // Standard watch URL: youtube.com/watch?v=VIDEO_ID
      {
        test: () => urlObj.hostname.includes('youtube.com') && urlObj.pathname === '/watch',
        extract: () => urlObj.searchParams.get('v')
      },
      // Short URL: youtu.be/VIDEO_ID
      {
        test: () => urlObj.hostname === 'youtu.be',
        extract: () => urlObj.pathname.slice(1) // Remove leading slash
      },
      // Embed URL: youtube.com/embed/VIDEO_ID
      {
        test: () => urlObj.hostname.includes('youtube.com') && urlObj.pathname.startsWith('/embed/'),
        extract: () => urlObj.pathname.split('/embed/')[1]?.split('?')[0] // Remove query params
      },
      // Old format: youtube.com/v/VIDEO_ID
      {
        test: () => urlObj.hostname.includes('youtube.com') && urlObj.pathname.startsWith('/v/'),
        extract: () => urlObj.pathname.split('/v/')[1]?.split('?')[0]
      }
    ];

    for (const pattern of patterns) {
      if (pattern.test()) {
        const videoId = pattern.extract();
        if (videoId && isValidYouTubeVideoId(videoId)) {
          return videoId;
        }
      }
    }

    return null;
  } catch (error) {
    console.warn('Error parsing YouTube URL:', url, error);
    return null;
  }
}

/**
 * Validates YouTube video ID format
 * YouTube video IDs are typically 11 characters long and contain
 * alphanumeric characters, hyphens, and underscores
 */
export function isValidYouTubeVideoId(videoId: string): boolean {
  if (!videoId || typeof videoId !== 'string') {
    return false;
  }

  // YouTube video IDs are 11 characters long
  if (videoId.length !== 11) {
    return false;
  }

  // Contains only valid characters (letters, numbers, hyphens, underscores)
  const validPattern = /^[a-zA-Z0-9_-]+$/;
  return validPattern.test(videoId);
}

/**
 * Generates YouTube embed URL from video ID
 */
export function generateEmbedUrl(videoId: string, options: {
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean;
  start?: number;
  end?: number;
} = {}): string {
  if (!isValidYouTubeVideoId(videoId)) {
    throw new Error('Invalid YouTube video ID');
  }

  const baseUrl = 'https://www.youtube.com/embed/';
  const params = new URLSearchParams();

  // Add optional parameters
  if (options.autoplay) {
    params.set('autoplay', '1');
  }
  
  if (options.muted) {
    params.set('mute', '1');
  }
  
  if (options.controls === false) {
    params.set('controls', '0');
  }
  
  if (options.start && options.start > 0) {
    params.set('start', options.start.toString());
  }
  
  if (options.end && options.end > 0) {
    params.set('end', options.end.toString());
  }

  const queryString = params.toString();
  return `${baseUrl}${videoId}${queryString ? `?${queryString}` : ''}`;
}

/**
 * Generates YouTube thumbnail URL from video ID
 */
export function generateThumbnailUrl(
  videoId: string, 
  quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres' = 'high'
): string {
  if (!isValidYouTubeVideoId(videoId)) {
    throw new Error('Invalid YouTube video ID');
  }

  const qualityMap = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    standard: 'sddefault',
    maxres: 'maxresdefault'
  };

  const qualityParam = qualityMap[quality];
  return `https://img.youtube.com/vi/${videoId}/${qualityParam}.jpg`;
}

/**
 * Transforms any YouTube URL to embed format
 */
export function transformToEmbedUrl(url: string, embedOptions?: {
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean;
  start?: number;
  end?: number;
}): string | null {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    return null;
  }

  return generateEmbedUrl(videoId, embedOptions);
}

/**
 * Extracts channel ID from YouTube channel RSS feed URL
 */
export function extractChannelIdFromFeedUrl(feedUrl: string): string | null {
  try {
    const url = new URL(feedUrl);
    if (url.hostname === 'www.youtube.com' && url.pathname === '/feeds/videos.xml') {
      return url.searchParams.get('channel_id');
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Generates YouTube channel RSS feed URL from channel ID
 */
export function generateChannelFeedUrl(channelId: string): string {
  return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
}

/**
 * Validates if a URL is a YouTube URL
 */
export function isYouTubeUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('youtube.com') || urlObj.hostname === 'youtu.be';
  } catch {
    return false;
  }
}

/**
 * Extracts playlist ID from YouTube playlist URL
 */
export function extractPlaylistId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('youtube.com')) {
      return urlObj.searchParams.get('list');
    }
    return null;
  } catch {
    return null;
  }
}

/* @created 2025-01-26T16:30:00.000Z */