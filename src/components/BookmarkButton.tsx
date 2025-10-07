
'use client';
export default BookmarkButton;
/**
 * OVERVIEW: Bookmark button component for saving and unsaving articles/videos
 * Features: Toggle bookmark state, local storage persistence, visual feedback
 * @version 1.0.0
 * @created 2025-09-26
 */

import React, { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';

interface BookmarkButtonProps {
  articleId: string;
  articleTitle: string;
  className?: string;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'outline' | 'ghost';
}

interface BookmarkedItem {
  id: string;
  title: string;
  bookmarkedAt: Date;
}

/**
 * Bookmark button component with local storage persistence
 * @param articleId - Unique identifier for the article
 * @param articleTitle - Title of the article for display
 * @param className - Additional CSS classes
 * @param showLabel - Whether to show bookmark text label
 * @param size - Size variant of the button
 * @param variant - Visual style variant
 */
export function BookmarkButton({
  articleId,
  articleTitle,
  className = '',
  showLabel = false,
  size = 'medium',
  variant = 'default'
}: BookmarkButtonProps) {
  const safeId = typeof articleId === 'string' ? articleId : (articleId as any)?.toString?.() || '';
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load bookmark state from localStorage on mount
  useEffect(() => {
    const bookmarks = getBookmarksFromStorage();
    setIsBookmarked(bookmarks.some(bookmark => bookmark.id === articleId));
  }, [articleId]);

  /**
   * Get bookmarks from localStorage
   */
  function getBookmarksFromStorage(): BookmarkedItem[] {
    try {
      const stored = localStorage.getItem('aggroNATION_bookmarks');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      return [];
    }
  }

  /**
   * Save bookmarks to localStorage
   */
  function saveBookmarksToStorage(bookmarks: BookmarkedItem[]) {
    try {
      localStorage.setItem('aggroNATION_bookmarks', JSON.stringify(bookmarks));
    } catch (error) {
      console.error('Error saving bookmarks:', error);
    }
  }

  /**
   * Toggle bookmark state
   */
  async function handleToggleBookmark() {
    if (loading) return;

    try {
      setLoading(true);
      const bookmarks = getBookmarksFromStorage();
      
      if (isBookmarked) {
        // Remove bookmark
        const filteredBookmarks = bookmarks.filter(bookmark => bookmark.id !== articleId);
        saveBookmarksToStorage(filteredBookmarks);
        setIsBookmarked(false);

        // Optional: Call API to remove server-side bookmark
        try {
          await fetch(`/api/articles/${encodeURIComponent(safeId)}/bookmark`, {
            method: 'DELETE',
          });
        } catch (apiError) {
          console.warn('Could not remove server-side bookmark:', apiError);
        }
      } else {
        // Add bookmark
        const newBookmark: BookmarkedItem = {
          id: articleId,
          title: articleTitle,
          bookmarkedAt: new Date(),
        };
        const updatedBookmarks = [...bookmarks, newBookmark];
        saveBookmarksToStorage(updatedBookmarks);
        setIsBookmarked(true);

        // Optional: Call API to add server-side bookmark
        try {
          await fetch(`/api/articles/${encodeURIComponent(safeId)}/bookmark`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              articleTitle,
            }),
          });
        } catch (apiError) {
          console.warn('Could not save server-side bookmark:', apiError);
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setLoading(false);
    }
  }

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          button: 'px-2 py-1 text-sm',
          icon: 14,
          gap: 'gap-1',
        };
      case 'large':
        return {
          button: 'px-4 py-3 text-lg',
          icon: 20,
          gap: 'gap-2',
        };
      default: // medium
        return {
          button: 'px-3 py-2',
          icon: 16,
          gap: 'gap-1.5',
        };
    }
  };

  // Get variant classes
  const getVariantClasses = () => {
    const baseClasses = 'transition-all duration-200 rounded-lg font-medium';
    
    switch (variant) {
      case 'outline':
        return isBookmarked
          ? `${baseClasses} border-2 border-yellow-500 text-yellow-600 bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30`
          : `${baseClasses} border-2 border-gray-300 text-gray-600 hover:border-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 dark:border-gray-600 dark:text-gray-300 dark:hover:border-yellow-500 dark:hover:text-yellow-500 dark:hover:bg-yellow-900/20`;
      
      case 'ghost':
        return isBookmarked
          ? `${baseClasses} text-yellow-600 bg-yellow-50 hover:bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30`
          : `${baseClasses} text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 dark:text-gray-400 dark:hover:text-yellow-400 dark:hover:bg-yellow-900/20`;
      
      default: // default
        return isBookmarked
          ? `${baseClasses} bg-yellow-500 text-white hover:bg-yellow-600 shadow-md`
          : `${baseClasses} bg-gray-100 text-gray-600 hover:bg-yellow-500 hover:text-white hover:shadow-md dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-yellow-500 dark:hover:text-white`;
    }
  };

  const sizeClasses = getSizeClasses();
  const variantClasses = getVariantClasses();

  return (
    <button
      onClick={handleToggleBookmark}
      disabled={loading}
      className={`
        ${sizeClasses.button}
        ${sizeClasses.gap}
        ${variantClasses}
        ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        flex items-center justify-center
        ${className}
      `}
      title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
    >
      {loading ? (
        <div className="animate-spin rounded-full border-2 border-gray-300 border-t-current w-4 h-4" />
      ) : isBookmarked ? (
        <BookmarkCheck size={sizeClasses.icon} className="fill-current" />
      ) : (
        <Bookmark size={sizeClasses.icon} />
      )}
      
      {showLabel && (
        <span className="select-none">
          {loading ? 'Saving...' : isBookmarked ? 'Bookmarked' : 'Bookmark'}
        </span>
      )}
    </button>
  );
}

/**
 * Hook to get all bookmarked items
 */
export function useBookmarks(): {
  bookmarks: BookmarkedItem[];
  removeBookmark: (articleId: string) => void;
  clearAllBookmarks: () => void;
} {
  const [bookmarks, setBookmarks] = useState<BookmarkedItem[]>([]);

  useEffect(() => {
    const stored = getBookmarksFromStorage();
    setBookmarks(stored);
  }, []);

  function getBookmarksFromStorage(): BookmarkedItem[] {
    try {
      const stored = localStorage.getItem('aggroNATION_bookmarks');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      return [];
    }
  }

  function removeBookmark(articleId: string) {
    const filtered = bookmarks.filter(bookmark => bookmark.id !== articleId);
    setBookmarks(filtered);
    try {
      localStorage.setItem('aggroNATION_bookmarks', JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  }

  function clearAllBookmarks() {
    setBookmarks([]);
    try {
      localStorage.removeItem('aggroNATION_bookmarks');
    } catch (error) {
      console.error('Error clearing bookmarks:', error);
    }
  }

  return {
    bookmarks,
    removeBookmark,
    clearAllBookmarks
  };
}

/* 
 * File: /src/components/BookmarkButton.tsx
 * Created: 2025-09-26
 * Modified: 2025-09-26
 */

/* @created 2025-01-26T16:30:00.000Z */