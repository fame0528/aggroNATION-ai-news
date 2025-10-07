/**
 * @fileoverview HuggingFace Hub API Integration Utilities
 * @description Provides comprehensive integration with HuggingFace Hub API for fetching
 * model metadata, statistics, and managing 30-minute sync operations for aggroNATION
 * @version 1.0.0
 * @created 2025-10-05
 */

// OVERVIEW:
// This utility module handles all interactions with the HuggingFace Hub API,
// including model discovery, metadata fetching, and periodic synchronization.
// Features rate limiting, caching, and comprehensive error handling.

import logger from '../lib/logger';

// Types for HuggingFace API responses
interface HuggingFaceModel {
  id: string;
  modelId: string;
  author: string;
  downloads: number;
  likes: number;
  trending: boolean;
  private: boolean;
  tags: string[];
  pipeline_tag?: string;
  library_name?: string;
  createdAt: string;
  lastModified: string;
  siblings?: Array<{
    filename: string;
    size?: number;
  }>;
  card_data?: {
    license?: string;
    language?: string[];
    datasets?: string[];
    metrics?: Record<string, number>;
  };
}

interface HuggingFaceModelDetails {
  id: string;
  author: string;
  sha: string;
  downloads: number;
  likes: number;
  library_name?: string;
  tags: string[];
  pipeline_tag?: string;
  mask_token?: string;
  widget_data?: any[];
  model_index?: any;
  config?: Record<string, any>;
  transformers_info?: Record<string, any>;
  cardData?: {
    license?: string;
    tags?: string[];
    datasets?: string[];
    language?: string[];
    base_model?: string;
    model_name?: string;
    inference?: boolean;
  };
  spaces?: string[];
  createdAt: string;
  lastModified: string;
}

interface ModelSearchParams {
  search?: string;
  author?: string;
  filter?: string;
  sort?: 'downloads' | 'likes' | 'lastModified' | 'createdAt';
  direction?: -1 | 1; // HuggingFace API expects -1 (desc) or 1 (asc)
  limit?: number;
  full?: boolean;
  config?: boolean;
}

// Rate limiting configuration
const RATE_LIMIT = {
  requests: 100,
  window: 60 * 1000, // 1 minute
  current: 0,
  resetTime: Date.now() + 60 * 1000,
};

// Cache for API responses (30 minute TTL)
const cache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Check and enforce rate limiting
 */
function checkRateLimit(): boolean {
  const now = Date.now();
  
  if (now > RATE_LIMIT.resetTime) {
    RATE_LIMIT.current = 0;
    RATE_LIMIT.resetTime = now + RATE_LIMIT.window;
  }
  
  if (RATE_LIMIT.current >= RATE_LIMIT.requests) {
    logger.warn('HuggingFace API rate limit exceeded');
    return false;
  }
  
  RATE_LIMIT.current++;
  return true;
}

/**
 * Get cached data or return null if expired
 */
function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.data as T;
  }
  if (cached) {
    cache.delete(key);
  }
  return null;
}

/**
 * Cache data with TTL
 */
function setCachedData(key: string, data: any): void {
  cache.set(key, {
    data,
    expires: Date.now() + CACHE_TTL,
  });
}

/**
 * Make authenticated request to HuggingFace API
 */
async function makeHuggingFaceRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  if (!checkRateLimit()) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new Error('HUGGINGFACE_API_KEY is not configured');
  }

  const url = `https://huggingface.co/api${endpoint}`;
  const cacheKey = `${endpoint}:${JSON.stringify(options)}`;
  
  // Check cache first
  const cached = getCachedData(cacheKey);
  if (cached) {
    logger.debug(`Cache hit for HuggingFace request: ${endpoint}`);
    return cached;
  }

  try {
    logger.debug(`Making HuggingFace API request: ${endpoint}`);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`HuggingFace API error: ${response.status} - ${errorText}`);
      throw new Error(`HuggingFace API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Cache successful responses
    setCachedData(cacheKey, data);
    
    return data;
  } catch (error) {
    logger.error('HuggingFace API request failed:', error);
    throw error;
  }
}

/**
 * Search for models on HuggingFace Hub
 */
export async function searchModels(params: ModelSearchParams = {}): Promise<HuggingFaceModel[]> {
  const {
    search = '',
    author = '',
    filter = '',
    sort = 'downloads',
    direction = -1, // -1 for desc, 1 for asc
    limit = 20,
    full = true,
    config = false,
  } = params;

  const queryParams = new URLSearchParams();
  
  if (search) queryParams.append('search', search);
  if (author) queryParams.append('author', author);
  if (filter) queryParams.append('filter', filter);
  if (sort) queryParams.append('sort', sort);
  if (direction) queryParams.append('direction', direction.toString());
  if (limit) queryParams.append('limit', limit.toString());
  if (full) queryParams.append('full', 'true');
  if (config) queryParams.append('config', 'true');

  const endpoint = `/models?${queryParams.toString()}`;
  
  try {
    const models = await makeHuggingFaceRequest(endpoint);
    
    logger.info(`Retrieved ${models.length} models from HuggingFace Hub`);
    return models;
  } catch (error) {
    logger.error('Failed to search HuggingFace models:', error);
    throw error;
  }
}

/**
 * Get detailed information about a specific model
 */
export async function getModelDetails(modelId: string): Promise<HuggingFaceModelDetails> {
  const endpoint = `/models/${encodeURIComponent(modelId)}`;
  
  try {
    const model = await makeHuggingFaceRequest(endpoint);
    
    logger.debug(`Retrieved details for model: ${modelId}`);
    return model;
  } catch (error) {
    logger.error(`Failed to get model details for ${modelId}:`, error);
    throw error;
  }
}

/**
 * Get trending models from HuggingFace Hub
 */
export async function getTrendingModels(limit: number = 50): Promise<HuggingFaceModel[]> {
  return searchModels({
    sort: 'likes',
    direction: -1,
    limit,
    full: true,
  });
}

/**
 * Get popular models by downloads
 */
export async function getPopularModels(limit: number = 50): Promise<HuggingFaceModel[]> {
  return searchModels({
    sort: 'downloads',
    direction: -1,
    limit,
    full: true,
  });
}

/**
 * Get models by specific pipeline tag (task type)
 */
export async function getModelsByTask(
  pipelineTag: string,
  limit: number = 20
): Promise<HuggingFaceModel[]> {
  return searchModels({
    filter: `pipeline_tag:${pipelineTag}`,
    sort: 'downloads',
    direction: -1,
    limit,
    full: true,
  });
}

/**
 * Get models by author
 */
export async function getModelsByAuthor(
  author: string,
  limit: number = 20
): Promise<HuggingFaceModel[]> {
  return searchModels({
    author,
    sort: 'downloads',
    direction: -1,
    limit,
    full: true,
  });
}

/**
 * Transform HuggingFace model data to our internal format
 */
export function transformHuggingFaceModel(hfModel: HuggingFaceModel): any {
  // Calculate HuggingFace score (normalized 0-100)
  const maxDownloads = 10000000; // 10M as reference point
  const downloadScore = Math.min((hfModel.downloads / maxDownloads) * 70, 70);
  const likeScore = Math.min((hfModel.likes / 1000) * 20, 20);
  const trendingBonus = hfModel.trending ? 10 : 0;
  
  const huggingFaceScore = downloadScore + likeScore + trendingBonus;

  // Extract model categories and tags
  const categories = extractCategories(hfModel.tags, hfModel.pipeline_tag);
  const modelSize = calculateModelSize(hfModel.siblings);

  return {
    huggingFaceId: hfModel.id,
    name: hfModel.id.split('/').pop() || hfModel.id,
    author: hfModel.author,
    description: '', // Will be filled from model card if available
    categories,
    tags: hfModel.tags || [],
    pipelineTag: hfModel.pipeline_tag,
    libraryName: hfModel.library_name,
    downloads: hfModel.downloads,
    likes: hfModel.likes,
    trending: hfModel.trending,
    huggingFaceScore,
    modelSize,
    license: hfModel.card_data?.license,
    language: hfModel.card_data?.language,
    datasets: hfModel.card_data?.datasets,
    metrics: hfModel.card_data?.metrics,
    isPrivate: hfModel.private,
    createdAt: new Date(hfModel.createdAt),
    lastModified: new Date(hfModel.lastModified),
    lastSynced: new Date(),
  };
}

/**
 * Extract meaningful categories from tags and pipeline tag
 */
function extractCategories(tags: string[] = [], pipelineTag?: string): string[] {
  const categories = new Set<string>();
  
  // Add pipeline tag as primary category
  if (pipelineTag) {
    categories.add(formatCategory(pipelineTag));
  }
  
  // Map common tags to categories
  const categoryMap: Record<string, string> = {
    'text-generation': 'Text Generation',
    'text2text-generation': 'Text Generation',
    'conversational': 'Conversational AI',
    'question-answering': 'Question Answering',
    'summarization': 'Text Summarization',
    'translation': 'Translation',
    'text-classification': 'Text Classification',
    'token-classification': 'Token Classification',
    'fill-mask': 'Fill Mask',
    'image-classification': 'Image Classification',
    'object-detection': 'Object Detection',
    'image-segmentation': 'Image Segmentation',
    'text-to-image': 'Image Generation',
    'image-to-text': 'Image Captioning',
    'automatic-speech-recognition': 'Speech Recognition',
    'text-to-speech': 'Text to Speech',
    'audio-classification': 'Audio Classification',
    'code': 'Code Generation',
    'code-generation': 'Code Generation',
    'reinforcement-learning': 'Reinforcement Learning',
    'tabular': 'Tabular Data',
    'time-series': 'Time Series',
  };
  
  // Process tags
  tags.forEach(tag => {
    const normalized = tag.toLowerCase();
    if (categoryMap[normalized]) {
      categories.add(categoryMap[normalized]);
    } else if (normalized.includes('llm') || normalized.includes('language-model')) {
      categories.add('Large Language Model');
    } else if (normalized.includes('diffusion') || normalized.includes('stable-diffusion')) {
      categories.add('Image Generation');
    } else if (normalized.includes('embedding')) {
      categories.add('Embeddings');
    }
  });
  
  return Array.from(categories);
}

/**
 * Format category name for display
 */
function formatCategory(category: string): string {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Calculate approximate model size from siblings data
 */
function calculateModelSize(siblings?: Array<{ filename: string; size?: number }>): number {
  if (!siblings || siblings.length === 0) return 0;
  
  return siblings.reduce((total, file) => {
    return total + (file.size || 0);
  }, 0);
}

/**
 * Get comprehensive model statistics for ranking
 */
export async function getModelStats(modelId: string): Promise<{
  downloads: number;
  likes: number;
  trending: boolean;
  score: number;
}> {
  try {
    const model = await getModelDetails(modelId);
    
    const maxDownloads = 10000000;
    const downloadScore = Math.min((model.downloads / maxDownloads) * 70, 70);
    const likeScore = Math.min((model.likes / 1000) * 20, 20);
    const trendingBonus = model.downloads > 100000 ? 10 : 0; // Trending threshold
    
    return {
      downloads: model.downloads,
      likes: model.likes,
      trending: trendingBonus > 0,
      score: downloadScore + likeScore + trendingBonus,
    };
  } catch (error) {
    logger.error(`Failed to get stats for model ${modelId}:`, error);
    return {
      downloads: 0,
      likes: 0,
      trending: false,
      score: 0,
    };
  }
}

/**
 * Clear the cache (useful for testing or forced refresh)
 */
export function clearCache(): void {
  cache.clear();
  logger.info('HuggingFace API cache cleared');
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; hitRate: number } {
  return {
    size: cache.size,
    hitRate: 0, // Would need to track hits/misses for actual calculation
  };
}

// Export rate limit info for monitoring
export { RATE_LIMIT };

/**
 * @fileoverview HuggingFace Hub API Integration Utilities
 * @description Complete integration with HuggingFace Hub API for model discovery and ranking
 * @lastModified 2025-10-05
 * @author aggroNATION Development Team
 */

/* @created 2025-01-26T16:30:00.000Z */