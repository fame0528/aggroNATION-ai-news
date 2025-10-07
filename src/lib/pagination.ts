/**
 * @file pagination.ts
 * @overview Pure helper utilities for consistent pagination metadata construction.
 */

import { PaginationMeta } from '@/types/content';

/**
 * Creates a PaginationMeta object.
 */
export function buildPagination({
  page,
  limit,
  totalCount
}: {
  page: number;
  limit: number;
  totalCount: number;
}): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  return {
    currentPage,
    totalPages,
    totalCount,
    limit,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
  };
}

/* @created 2025-01-26T16:30:00.000Z */