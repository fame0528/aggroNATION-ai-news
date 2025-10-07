"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FALLBACK_IMAGE } from '@/constants/images';
import { getBlurDataURL } from '@/lib/imagePlaceholders';
import { createArticleHref, validateHref } from '@/utils/href-utils';
import { RealTimeTimestamp, FreshnessBadge } from '@/utils/date-formatter';
import { 
  ExternalLink, 
  Heart, 
  MessageCircle, 
  Eye,
  Calendar,
  User,
  Tag
} from 'lucide-react';

/**
 * @fileoverview Article card component for displaying article content
 * @version 1.0.0
 * @created 2025-09-26
 */

interface Article {
  _id: string;
  title: string;
  description?: string;
  content?: string;
  url: string;
  originalUrl: string;
  contentType: 'article' | 'video';
  feedId: string;
  feedTitle: string;
  category: string;
  author?: string;
  publishedAt: string;
  imageUrl?: string;
  tags: string[];
  likes: number;
  dislikes: number;
  views: number;
  ranking: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ArticleCardProps {
  article: Article;
  showFullContent?: boolean;
  className?: string;
}

function ArticleCard({ article, showFullContent = false, className = '' }: ArticleCardProps) {
  // Safely derive an ID string for links (prevents /article/[object Object])
  const articleId = useMemo(() => {
    if (!article) return '';
    const idAny: any = (article as any)._id;
    if (idAny == null) return '';
    // Direct string
    if (typeof idAny === 'string') return idAny;
    // {$oid: string} shape
    if (typeof idAny === 'object' && typeof idAny.$oid === 'string') return idAny.$oid;
    // Mongo ObjectId instances often have toHexString
    if (typeof idAny?.toHexString === 'function') {
      try { return idAny.toHexString(); } catch { /* ignore */ }
    }
    // Fallback to toString but guard against [object Object]
    try {
      const s = idAny?.toString?.();
      if (typeof s === 'string' && s !== '[object Object]') return s;
    } catch { /* ignore */ }
    return '';
  }, [article]);
  const [likes, setLikes] = useState(article.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading || !articleId) return; // require a valid string id
    
    try {
      setIsLoading(true);
      
      // Optimistic update
      const newLikedState = !isLiked;
      const newLikesCount = newLikedState ? likes + 1 : likes - 1;
      
      setIsLiked(newLikedState);
      setLikes(newLikesCount);

      const response = await fetch(`/api/articles/${encodeURIComponent(articleId)}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ liked: newLikedState }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setLikes(data.likes);
        setIsLiked(data.liked);
      } else {
        // Revert optimistic update on error
        setIsLiked(!newLikedState);
        setLikes(newLikedState ? likes - 1 : likes + 1);
        throw new Error(data.error || 'Failed to update like');
      }
    } catch (error) {
      console.error('Error liking article:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = async () => {
    if (!articleId) return;
    try {
      await fetch(`/api/articles/${encodeURIComponent(articleId)}/view`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  // Truncate text for card display
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  // Format published date - now handled by RealTimeTimestamp component

  // Get category color
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'AI': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Technology': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Programming': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Science': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'News': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Development': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  return (
    <article className={`card hover:shadow-xl transition-all duration-300 group ${className}`}>
      {/* Article Image */}
      <div className="relative overflow-hidden rounded-t-lg">
        <Image
          src={article.imageUrl || FALLBACK_IMAGE}
          alt={article.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          width={1200}
          height={630}
          priority={false}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          placeholder="blur"
          blurDataURL={getBlurDataURL()}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className={`badge ${getCategoryColor(article.category)} text-xs font-medium`}>
            {article.category}
          </span>
        </div>
        
        {/* Freshness Badge */}
        <div className="absolute top-3 right-3">
          <FreshnessBadge date={article.publishedAt} />
        </div>
      </div>

      <div className="card-body">
        {/* Article Title */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {(() => {
            const href = createArticleHref(article._id);
            return href ? (
              <Link href={href} onClick={handleView}>
                {article.title}
              </Link>
            ) : (
              <span>{article.title}</span>
            );
          })()}
        </h3>

        {/* Article Description */}
        {article.description && (
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-3">
            {showFullContent ? article.description : truncateText(article.description, 120)}
          </p>
        )}

        {/* Article Meta */}
        <div className="flex flex-wrap items-center text-xs text-gray-500 dark:text-gray-400 mb-3 gap-2">
          {article.author && (
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3" />
              <span>{article.author}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <RealTimeTimestamp date={article.publishedAt} className="text-xs" />
          </div>
          
          <div className="flex items-center space-x-1">
            <Tag className="w-3 h-3" />
            <span>{article.feedTitle}</span>
          </div>
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {article.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
            {article.tags.length > 3 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{article.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Article Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={isLoading}
              className={`flex items-center space-x-1 transition-colors ${
                isLiked
                  ? 'text-red-500 dark:text-red-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm">{likes}</span>
            </button>

            {/* Comment Button */}
            {(() => {
              const href = createArticleHref(article._id);
              return href ? (
                <Link
                  href={`${href}#comments`}
                  className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">Comments</span>
                </Link>
              ) : null;
            })()}

            {/* Views */}
            <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
              <Eye className="w-4 h-4" />
              <span className="text-sm">{article.views}</span>
            </div>
          </div>

          {/* External Link */}
          {(() => {
            const href = validateHref(article.originalUrl);
            return href ? (
              <Link
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-4 h-4" />
                <span className="text-sm">Source</span>
              </Link>
            ) : null;
          })()}
        </div>
      </div>
    </article>
  );
}

export default ArticleCard;

/**
 * Usage Example:
 * ```tsx
 * import ArticleCard from '@/components/ArticleCard';
 * 
 * const articles = [...]; // Array of articles
 * 
 * return (
 *   <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
 *     {articles.map((article) => (
 *       <ArticleCard key={article._id} article={article} />
 *     ))}
 *   </div>
 * );
 * ```
 */

/* 
 * File: /src/components/ArticleCard.tsx
 * Created: 2025-09-26
 * Modified: 2025-09-26
 */