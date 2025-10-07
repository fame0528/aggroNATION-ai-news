/**
 * @fileoverview RSS feed parser and content aggregation utilities
 * @version 1.0.0
 * @created 2025-09-26
 */

import Parser from 'rss-parser';
import { connectToDatabase } from '@/lib/mongodb';
import Feed from '@/models/Feed';
import Article from '@/models/Article';
import { extractYouTubeVideoId, generateEmbedUrl } from '@/utils/youtube-utils';

/**
 * OVERVIEW:
 * This module handles RSS feed parsing, content extraction, and database storage.
 * It supports both article feeds and YouTube channel feeds with proper content
 * transformation and deduplication to prevent storing duplicate items.
 */

interface ParsedFeedItem {
  title: string;
  description?: string;
  content?: string;
  link: string;
  pubDate?: string;
  author?: string;
  guid?: string;
  contentSnippet?: string;
  enclosure?: {
    url: string;
    type: string;
  };
}

interface ParsedFeed {
  title: string;
  description?: string;
  link?: string;
  items: ParsedFeedItem[];
}

/**
 * Custom RSS parser with YouTube-specific handling
 */
class CustomRSSParser extends Parser {
  constructor() {
    super({
      customFields: {
        feed: [
          'language',
          'copyright',
          'managingEditor',
          'webMaster',
          'pubDate',
          'lastBuildDate',
          'category',
          'generator',
          'docs',
          'ttl'
        ],
        item: [
          ['media:group', 'mediaGroup'],
          ['media:thumbnail', 'mediaThumbnail'],
          ['media:content', 'mediaContent'],
          ['yt:videoId', 'videoId'],
          ['yt:channelId', 'channelId'],
          'author',
          'category'
        ]
      }
    });
  }
}

const rssParser = new CustomRSSParser();

/**
 * Extracts and cleans content from RSS item
 */
function extractContent(item: any): string {
  // Priority order for content extraction
  const contentSources = [
    item.content,
    item['content:encoded'],
    item.contentSnippet,
    item.description,
    item.summary
  ];

  for (const source of contentSources) {
    if (source && typeof source === 'string') {
      return source.replace(/<[^>]*>/g, '').trim();
    }
  }

  return '';
}

/**
 * Extracts image URL from RSS item
 */
function extractImageUrl(item: any): string | undefined {
  // Check various image sources
  if (item.enclosure?.type?.includes('image')) {
    return item.enclosure.url;
  }

  if (item.mediaThumbnail?.url) {
    return item.mediaThumbnail.url;
  }

  if (item.image?.url) {
    return item.image.url;
  }

  // For YouTube, generate thumbnail URL from video ID
  if (item.videoId) {
    return `https://img.youtube.com/vi/${item.videoId}/maxresdefault.jpg`;
  }

  // Extract from content using regex
  const content = item.content || item.description || '';
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/i);
  if (imgMatch) {
    return imgMatch[1];
  }

  return undefined;
}

/**
 * Determines content type based on feed and item data
 */
function determineContentType(feed: any, item: any): 'article' | 'video' {
  // Check if it's a YouTube feed
  if (feed.feedUrl?.includes('youtube.com') || item.videoId || item.channelId) {
    return 'video';
  }

  // Check if the link contains video indicators
  const link = item.link || '';
  if (link.includes('youtube.com') || link.includes('youtu.be')) {
    return 'video';
  }

  return 'article';
}

/**
 * Parses a single RSS feed and returns structured data
 */
export async function parseFeed(feedUrl: string): Promise<ParsedFeed | null> {
  try {
    console.log(`📡 Fetching RSS feed: ${feedUrl}`);
    
    const feed = await rssParser.parseURL(feedUrl);
    
    return {
      title: feed.title || 'Unknown Feed',
      description: feed.description,
      link: feed.link,
      items: feed.items.map(item => ({
        title: item.title || 'Untitled',
        description: item.description,
        content: extractContent(item),
        link: item.link || '',
        pubDate: item.pubDate || item.isoDate,
        author: item.author || item.creator,
        guid: item.guid || item.link,
        contentSnippet: item.contentSnippet
      }))
    };
  } catch (error) {
    console.error(`❌ Error parsing feed ${feedUrl}:`, error);
    return null;
  }
}

/**
 * Processes RSS feed items and stores them in the database
 */
export async function processFeedItems(
  feedDoc: any,
  parsedFeed: ParsedFeed
): Promise<{ saved: number; skipped: number; errors: number }> {
  await connectToDatabase();
  
  let saved = 0;
  let skipped = 0;
  let errors = 0;

  for (const item of parsedFeed.items) {
    try {
      // Check if article already exists
      const existingArticle = await Article.findOne({
        $or: [
          { url: item.link },
          { originalUrl: item.link },
          { title: item.title, feedId: feedDoc._id }
        ]
      });

      if (existingArticle) {
        skipped++;
        continue;
      }

      // Create new article
      const article = new Article({
        title: item.title,
        description: item.description,
        content: item.content,
        url: item.link,
        originalUrl: item.link,
        contentType: determineContentType(feedDoc, item),
        feedId: feedDoc._id,
        feedTitle: feedDoc.title,
        category: feedDoc.category,
        author: item.author,
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        imageUrl: extractImageUrl(item),
        isActive: true
      });

      await article.save();
      saved++;

    } catch (error) {
      console.error(`Error processing item: ${item.title}`, error);
      errors++;
    }
  }

  return { saved, skipped, errors };
}

/**
 * Fetches and processes all active RSS feeds
 */
export async function processAllFeeds(): Promise<{
  totalProcessed: number;
  totalSaved: number;
  totalSkipped: number;
  totalErrors: number;
  feedResults: any[];
}> {
  await connectToDatabase();
  
  const feeds = await Feed.find({ isActive: true });
  console.log(`📊 Processing ${feeds.length} active feeds...`);
  
  let totalSaved = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  const feedResults = [];
  
  for (const feed of feeds) {
    try {
      console.log(`🔄 Processing feed: ${feed.title}`);
      
      const parsedFeed = await parseFeed(feed.url);
      if (!parsedFeed) {
        feedResults.push({
          feedId: feed._id,
          feedTitle: feed.title,
          status: 'failed',
          error: 'Failed to parse feed'
        });
        continue;
      }
      
      const result = await processFeedItems(feed, parsedFeed);
      
      totalSaved += result.saved;
      totalSkipped += result.skipped;
      totalErrors += result.errors;
      
      feedResults.push({
        feedId: feed._id,
        feedTitle: feed.title,
        status: 'success',
        ...result
      });
      
      // Update feed last fetch time
      await Feed.findByIdAndUpdate(feed._id, {
        lastFetchedAt: new Date(),
        lastFetchStatus: 'success'
      });
      
    } catch (error) {
      console.error(`Error processing feed ${feed.title}:`, error);
      feedResults.push({
        feedId: feed._id,
        feedTitle: feed.title,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Update feed with error status
      await Feed.findByIdAndUpdate(feed._id, {
        lastFetchedAt: new Date(),
        lastFetchStatus: 'error'
      });
    }
  }
  
  console.log(`✅ Feed processing complete:`);
  console.log(`   - Total feeds processed: ${feeds.length}`);
  console.log(`   - Articles saved: ${totalSaved}`);
  console.log(`   - Articles skipped: ${totalSkipped}`);
  console.log(`   - Errors: ${totalErrors}`);
  
  return {
    totalProcessed: feeds.length,
    totalSaved,
    totalSkipped,
    totalErrors,
    feedResults
  };
}

/* @created 2025-01-26T16:30:00.000Z */