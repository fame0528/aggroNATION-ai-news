/**
 * @fileoverview Time Utilities with dayjs
 * @description Centralized time handling utilities for real-time content freshness
 * @version 1.0.0
 * @created 2025-10-06
 * 
 * OVERVIEW:
 * This module provides comprehensive time utilities using dayjs for:
 * - Relative time displays ("20 minutes ago", "2 hours ago")
 * - Precise timestamp formatting
 * - Real-time content freshness indicators
 * - Automated time-based sorting
 * - Timezone-aware date handling
 */

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import updateLocale from 'dayjs/plugin/updateLocale';
import duration from 'dayjs/plugin/duration';

// Configure dayjs plugins
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(updateLocale);
dayjs.extend(duration);

// Custom relative time configuration for better UX
dayjs.updateLocale('en', {
  relativeTime: {
    future: 'in %s',
    past: '%s ago',
    s: 'just now',
    m: '1 minute',
    mm: '%d minutes',
    h: '1 hour',
    hh: '%d hours',
    d: '1 day',
    dd: '%d days',
    M: '1 month',
    MM: '%d months',
    y: '1 year',
    yy: '%d years'
  }
});

/**
 * Get relative time from now (e.g., "20 minutes ago", "2 hours ago")
 * @param date - The date to compare against now
 * @returns Formatted relative time string
 */
export const getRelativeTime = (date: string | Date): string => {
  if (!date) return 'Unknown time';
  
  try {
    const targetDate = dayjs(date);
    const now = dayjs();
    
    // If date is invalid, return fallback
    if (!targetDate.isValid()) return 'Invalid date';
    
    // If date is in the future, handle gracefully
    if (targetDate.isAfter(now)) return 'just now';
    
    return targetDate.fromNow();
  } catch (error) {
    console.warn('Error formatting relative time:', error);
    return 'Unknown time';
  }
};

/**
 * Get precise formatted timestamp
 * @param date - The date to format
 * @param format - Optional format string (default: "MMMM D, YYYY [at] h:mm A")
 * @returns Formatted timestamp string
 */
export const getFormattedTime = (date: string | Date, format?: string): string => {
  if (!date) return 'No date available';
  
  try {
    const targetDate = dayjs(date);
    
    if (!targetDate.isValid()) return 'Invalid date';
    
    const defaultFormat = "MMMM D, YYYY [at] h:mm A";
    return targetDate.format(format || defaultFormat);
  } catch (error) {
    console.warn('Error formatting timestamp:', error);
    return 'Date formatting error';
  }
};

/**
 * Check if content is fresh (less than specified hours old)
 * @param date - The date to check
 * @param maxHours - Maximum hours to consider fresh (default: 24)
 * @returns Boolean indicating if content is fresh
 */
export const isContentFresh = (date: string | Date, maxHours: number = 24): boolean => {
  if (!date) return false;
  
  try {
    const targetDate = dayjs(date);
    const now = dayjs();
    
    if (!targetDate.isValid()) return false;
    
    const hoursDiff = now.diff(targetDate, 'hour');
    return hoursDiff <= maxHours;
  } catch (error) {
    console.warn('Error checking content freshness:', error);
    return false;
  }
};

/**
 * Get content freshness indicator class for styling
 * @param date - The date to check
 * @returns CSS class name for freshness indicator
 */
export const getFreshnessClass = (date: string | Date): string => {
  if (!date) return 'text-gray-500';
  
  try {
    const targetDate = dayjs(date);
    const now = dayjs();
    
    if (!targetDate.isValid()) return 'text-gray-500';
    
    const hoursDiff = now.diff(targetDate, 'hour');
    
    if (hoursDiff <= 1) return 'text-green-600 font-medium'; // Very fresh (1 hour)
    if (hoursDiff <= 6) return 'text-green-500'; // Fresh (6 hours)
    if (hoursDiff <= 24) return 'text-yellow-600'; // Recent (1 day)
    if (hoursDiff <= 168) return 'text-orange-500'; // This week (7 days)
    
    return 'text-gray-500'; // Older content
  } catch (error) {
    console.warn('Error determining freshness class:', error);
    return 'text-gray-500';
  }
};

/**
 * Sort content by date (newest first) with proper date parsing
 * @param content - Array of content items with date field
 * @param dateField - Field name containing the date (default: 'publishedAt')
 * @returns Sorted array with newest content first
 */
export const sortByNewest = <T extends Record<string, any>>(
  content: T[], 
  dateField: string = 'publishedAt'
): T[] => {
  try {
    return [...content].sort((a, b) => {
      const dateA = dayjs(a[dateField]);
      const dateB = dayjs(b[dateField]);
      
      // Handle invalid dates by putting them at the end
      if (!dateA.isValid() && !dateB.isValid()) return 0;
      if (!dateA.isValid()) return 1;
      if (!dateB.isValid()) return -1;
      
      // Sort newest first
      return dateB.diff(dateA);
    });
  } catch (error) {
    console.warn('Error sorting content by date:', error);
    return content; // Return original array if sorting fails
  }
};

/**
 * Get timezone-aware date for server operations
 * @param date - The date to convert
 * @param tz - Target timezone (default: system timezone)
 * @returns dayjs object in specified timezone
 */
export const getTimezoneDate = (date?: string | Date, tz?: string): dayjs.Dayjs => {
  try {
    const targetDate = date ? dayjs(date) : dayjs();
    return tz ? targetDate.tz(tz) : targetDate;
  } catch (error) {
    console.warn('Error handling timezone conversion:', error);
    return dayjs(); // Return current time as fallback
  }
};

/**
 * Check if a date is today
 * @param date - The date to check
 * @returns Boolean indicating if date is today
 */
export const isToday = (date: string | Date): boolean => {
  if (!date) return false;
  
  try {
    const targetDate = dayjs(date);
    const today = dayjs();
    
    return targetDate.isSame(today, 'day');
  } catch (error) {
    console.warn('Error checking if date is today:', error);
    return false;
  }
};

/**
 * Get human-readable duration between two dates
 * @param startDate - Start date
 * @param endDate - End date (default: now)
 * @returns Human-readable duration string
 */
export const getDuration = (startDate: string | Date, endDate?: string | Date): string => {
  try {
    const start = dayjs(startDate);
    const end = endDate ? dayjs(endDate) : dayjs();
    
    if (!start.isValid() || !end.isValid()) return 'Invalid duration';
    
    const duration = end.diff(start);
    const durationObj = dayjs.duration(duration);
    
    if (durationObj.asSeconds() < 60) return 'less than a minute';
    if (durationObj.asMinutes() < 60) return `${Math.floor(durationObj.asMinutes())} minutes`;
    if (durationObj.asHours() < 24) return `${Math.floor(durationObj.asHours())} hours`;
    
    return `${Math.floor(durationObj.asDays())} days`;
  } catch (error) {
    console.warn('Error calculating duration:', error);
    return 'Duration unavailable';
  }
};

// Export dayjs instance for direct use when needed
export { dayjs };

/**
 * @fileFooter
 * @description Time utilities providing comprehensive date/time handling for automated content management
 * @lastModified 2025-10-06
 */

/* @created 2025-01-26T16:30:00.000Z */