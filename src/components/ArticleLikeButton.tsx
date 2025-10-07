
'use client';
export default ArticleLikeButton;
/**
 * OVERVIEW: Article Like Button component with real-time like functionality
 * Features: Like/unlike articles, optimistic updates, error handling
 * @version 1.0.0
 * @created 2025-09-27
 */

import React, { useState } from 'react';
import { Heart } from 'lucide-react';

interface ArticleLikeButtonProps {
  articleId: string;
  initialLikes: number;
  className?: string;
}

export function ArticleLikeButton({ articleId, initialLikes, className = '' }: ArticleLikeButtonProps) {
  // Coerce potentially non-string inputs to a safe string id
  const safeId = typeof articleId === 'string' ? articleId : (articleId as any)?.toString?.() || '';
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      
      // Optimistic update
      const newLikedState = !isLiked;
      const newLikesCount = newLikedState ? likes + 1 : likes - 1;
      
      setIsLiked(newLikedState);
      setLikes(newLikesCount);

      const response = await fetch(`/api/articles/${encodeURIComponent(safeId)}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          liked: newLikedState
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update with server response
        setLikes(data.likes);
        setIsLiked(data.liked);
      } else {
        // Revert optimistic update on error
        setIsLiked(!newLikedState);
        setLikes(newLikedState ? likes - 1 : likes + 1);
        throw new Error(data.error || 'Failed to update like');
      }
    } catch (error) {
      console.error('Error updating like:', error);
      
      // You could add toast notification here
      // toast.error('Failed to update like');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
        isLiked
          ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
          : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <Heart 
        className={`h-5 w-5 ${isLiked ? 'fill-current' : ''} ${isLoading ? 'animate-pulse' : ''}`} 
      />
      <span>{likes}</span>
      {isLoading && <span className="text-xs">(updating...)</span>}
    </button>
  );
}

/* 
 * File: /src/components/ArticleLikeButton.tsx
 * Created: 2025-09-27
 * Modified: 2025-09-27
 */

/* @created 2025-01-26T16:30:00.000Z */