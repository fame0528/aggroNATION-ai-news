import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Article from '@/models/Article';
import { log } from '@/lib/logger';

// Mark route as dynamic due to request.url usage (query-driven data)
export const dynamic = 'force-dynamic';

/**
 * @fileoverview Articles API route - GET endpoint for fetching articles
 * @version 1.0.0
 * @created 2025-09-26
 */

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const contentType = searchParams.get('type');
    const sort = searchParams.get('sort') || 'newest';

    // Build filter
    const filter: any = { isActive: true };
    if (category) filter.category = category;
    if (contentType) filter.contentType = contentType;

    // Build sort criteria
    let sortCriteria: any;
    switch (sort) {
      case 'oldest':
        sortCriteria = { publishedAt: 1 };
        break;
      case 'popular':
        sortCriteria = { likes: -1, views: -1, publishedAt: -1 };
        break;
      case 'trending':
        sortCriteria = { ranking: -1, publishedAt: -1 };
        break;
      default:
        sortCriteria = { publishedAt: -1 };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch articles
    const [articles, totalCount] = await Promise.all([
      Article.find(filter)
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments(filter)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      articles: articles.map((article: any) => ({
        ...article,
        _id: article._id.toString(),
        feedId: article.feedId.toString(),
        publishedAt: article.publishedAt.toISOString(),
        createdAt: article.createdAt.toISOString(),
        updatedAt: article.updatedAt.toISOString(),
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNext,
        hasPrev
      }
    });

  } catch (error) {
    log.error('Error fetching articles', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

/* @created 2025-01-26T16:30:00.000Z */