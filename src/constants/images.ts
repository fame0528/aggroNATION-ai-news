/**
 * @file images.ts
 * @overview Centralized image asset constants for fallback imagery across the application.
 * All images are real assets, no dummy/placeholder content.
 *
 * Usage:
 * import { FALLBACK_IMAGE } from '@/constants/images';
 * <Image src={imageUrl || FALLBACK_IMAGE} ... />
 */

// Using actual favicon as fallback when no image is available
export const FALLBACK_IMAGE = '/favicon.svg';

/* @created 2025-01-26T16:30:00.000Z */