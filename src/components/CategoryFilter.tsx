'use client';

import React, { useState } from 'react';
import { Filter, ChevronDown, X } from 'lucide-react';

/**
 * @fileoverview Category filter component for content filtering
 * @version 1.0.0
 * @created 2025-09-26
 */

interface Category {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  color?: string;
  icon?: string;
  articleCount?: number;
  videoCount?: number;
  totalCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategories?: string[];
  onCategoryChange?: (categories: string[]) => void;
  showCounts?: boolean;
  className?: string;
  currentCategory?: string;
  showAll?: boolean;
  baseUrl?: string;
}

function CategoryFilter({
  categories,
  selectedCategories = [],
  onCategoryChange,
  showCounts = true,
  className = '',
  currentCategory,
  showAll = true,
  baseUrl = '/repositories'
}: CategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localSelected, setLocalSelected] = useState<string[]>(selectedCategories);

  const handleCategoryToggle = (categorySlug: string) => {
    let newSelected: string[];
    
    if (localSelected.includes(categorySlug)) {
      newSelected = localSelected.filter(slug => slug !== categorySlug);
    } else {
      newSelected = [...localSelected, categorySlug];
    }
    
    setLocalSelected(newSelected);
    onCategoryChange?.(newSelected);
  };

  const handleClearAll = () => {
    setLocalSelected([]);
    onCategoryChange?.([]);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Get category by slug
  const getCategoryBySlug = (slug: string) => {
    return categories.find(cat => cat.slug === slug);
  };

  // Get selected category names for display
  const getSelectedCategoryNames = () => {
    return localSelected
      .map(slug => getCategoryBySlug(slug)?.name)
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div className={`relative ${className}`}>
      {/* Filter Button */}
      <button
        onClick={toggleDropdown}
        className="inline-flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4" />
          <span>
            {localSelected.length === 0 
              ? 'All Categories' 
              : localSelected.length === 1
                ? getSelectedCategoryNames()
                : `${localSelected.length} categories`
            }
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Selected Categories Pills */}
      {localSelected.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {localSelected.map(slug => {
            const category = getCategoryBySlug(slug);
            if (!category) return null;
            
            return (
              <span
                key={slug}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              >
                {category.name}
                <button
                  onClick={() => handleCategoryToggle(slug)}
                  className="ml-2 inline-flex items-center p-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                  aria-label={`Remove ${category.name} filter`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
          <button
            onClick={handleClearAll}
            className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          <div className="py-2">
            {/* All Categories Option */}
            <label className="flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={localSelected.length === 0}
                onChange={handleClearAll}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-900 dark:text-white font-medium">
                All Categories
              </span>
              {showCounts && (
                <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                  {categories.reduce((total, cat) => total + (cat.totalCount || 0), 0)} items
                </span>
              )}
            </label>

            <div className="border-t border-gray-100 dark:border-gray-700 my-2" />

            {/* Category Options */}
            {categories.map(category => (
              <label
                key={category._id}
                className="flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={localSelected.includes(category.slug || category.name)}
                  onChange={() => handleCategoryToggle(category.slug || category.name)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                
                <div className="ml-3 flex items-center space-x-2 flex-1">
                  {/* Category Color Indicator */}
                  {category.color && (
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                  )}
                  
                  <div className="flex-1">
                    <span className="text-sm text-gray-900 dark:text-white font-medium">
                      {category.name}
                    </span>
                    {category.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {category.description}
                      </div>
                    )}
                  </div>

                  {/* Content Counts */}
                  {showCounts && (category.totalCount || category.articleCount || category.videoCount) && (
                    <div className="flex flex-col text-right text-xs text-gray-500 dark:text-gray-400">
                      <span>{category.totalCount || (category.articleCount || 0) + (category.videoCount || 0)} total</span>
                      {(category.articleCount || category.videoCount) && (
                        <span>{category.articleCount || 0}📄 {category.videoCount || 0}🎥</span>
                      )}
                    </div>
                  )}
                </div>
              </label>
            ))}

            {/* Empty State */}
            {categories.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                No categories available
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

export default CategoryFilter;

/**
 * Usage Examples:
 * ```tsx
 * // Basic usage
 * <CategoryFilter categories={categories} />
 * 
 * // With controlled state
 * const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
 * 
 * <CategoryFilter 
 *   categories={categories}
 *   selectedCategories={selectedCategories}
 *   onCategoryChange={setSelectedCategories}
 * />
 * 
 * // Without counts
 * <CategoryFilter 
 *   categories={categories}
 *   showCounts={false}
 * />
 * ```
 */

/* 
 * File: /src/components/CategoryFilter.tsx
 * Created: 2025-09-26
 * Modified: 2025-09-26
 */

/* @created 2025-01-26T16:30:00.000Z */