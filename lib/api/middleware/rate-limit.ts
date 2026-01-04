/**
 * Simple In-Memory Rate Limiting
 *
 * Provides basic rate limiting for API routes without external dependencies.
 * Note: This resets on server restart/deploy. For distributed rate limiting,
 * upgrade to Redis-based solution.
 *
 * Usage:
 *   import { rateLimit, withRateLimit } from '@/lib/api/middleware/rate-limit';
 *
 *   // As middleware
 *   export const POST = withRateLimit(
 *     handler,
 *     { limit: 10, windowMs: 60000 } // 10 requests per minute
 *   );
 *
 *   // Manual check
 *   const result = rateLimit(ip, { limit: 5, windowMs: 60000 });
 *   if (!result.allowed) {
 *     return new Response('Too many requests', { status: 429 });
 *   }
 */

import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// Types
// ============================================================================

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the window
   * @default 100
   */
  limit?: number;

  /**
   * Time window in milliseconds
   * @default 60000 (1 minute)
   */
  windowMs?: number;

  /**
   * Function to extract identifier from request
   * @default extracts IP address
   */
  keyGenerator?: (request: NextRequest) => string;

  /**
   * Skip rate limiting for certain requests
   */
  skip?: (request: NextRequest) => boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  limit: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// ============================================================================
// In-Memory Store
// ============================================================================

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let cleanupTimer: NodeJS.Timeout | null = null;

function startCleanup() {
  if (cleanupTimer) return;

  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.resetTime < now) {
        store.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);

  // Don't prevent process from exiting
  cleanupTimer.unref?.();
}

// ============================================================================
// Core Rate Limit Function
// ============================================================================

/**
 * Check rate limit for a given key
 */
export function rateLimit(
  key: string,
  config: RateLimitConfig = {}
): RateLimitResult {
  const limit = config.limit ?? 100;
  const windowMs = config.windowMs ?? 60000;
  const now = Date.now();

  // Start cleanup on first use
  if (!cleanupTimer) {
    startCleanup();
  }

  // Get or create entry
  let entry = store.get(key);

  if (!entry || entry.resetTime < now) {
    // Create new window
    entry = {
      count: 0,
      resetTime: now + windowMs,
    };
    store.set(key, entry);
  }

  // Check if allowed
  const allowed = entry.count < limit;

  if (allowed) {
    entry.count++;
  }

  return {
    allowed,
    remaining: Math.max(0, limit - entry.count),
    resetTime: entry.resetTime,
    limit,
  };
}

// ============================================================================
// Middleware Wrapper
// ============================================================================

type ApiHandler = (
  request: NextRequest,
  context?: unknown
) => Promise<NextResponse>;

/**
 * Default key generator - extracts IP from request
 */
function defaultKeyGenerator(request: NextRequest): string {
  // Check various headers for real IP (behind proxy/load balancer)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const firstIp = forwarded.split(',')[0];
    return firstIp ? firstIp.trim() : 'unknown';
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to a generic key if no IP available
  return 'unknown';
}

/**
 * Add rate limit headers to response
 */
function addRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult
): NextResponse {
  response.headers.set('X-RateLimit-Limit', String(result.limit));
  response.headers.set('X-RateLimit-Remaining', String(result.remaining));
  response.headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetTime / 1000)));

  return response;
}

/**
 * Wrap an API handler with rate limiting
 */
export function withRateLimit(
  handler: ApiHandler,
  config: RateLimitConfig = {}
): ApiHandler {
  const keyGenerator = config.keyGenerator ?? defaultKeyGenerator;
  const skip = config.skip;

  return async (request: NextRequest, context?: unknown): Promise<NextResponse> => {
    // Skip rate limiting if configured
    if (skip && skip(request)) {
      return handler(request, context);
    }

    const key = keyGenerator(request);
    const result = rateLimit(key, config);

    if (!result.allowed) {
      const response = NextResponse.json(
        {
          success: false,
          error: {
            message: 'Too many requests. Please try again later.',
            code: 'RATE_LIMITED',
            statusCode: 429,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 429 }
      );

      response.headers.set('Retry-After', String(Math.ceil((result.resetTime - Date.now()) / 1000)));
      return addRateLimitHeaders(response, result);
    }

    const response = await handler(request, context);
    return addRateLimitHeaders(response, result);
  };
}

// ============================================================================
// Preset Configurations
// ============================================================================

export const RateLimitPresets = {
  /** Standard API: 100 requests per minute */
  standard: { limit: 100, windowMs: 60000 },

  /** Strict: 10 requests per minute (for auth endpoints) */
  strict: { limit: 10, windowMs: 60000 },

  /** Lenient: 1000 requests per minute */
  lenient: { limit: 1000, windowMs: 60000 },

  /** Burst: 30 requests per 10 seconds */
  burst: { limit: 30, windowMs: 10000 },
} as const;

// ============================================================================
// Testing Utilities
// ============================================================================

/**
 * Clear all rate limit entries (useful for testing)
 */
export function clearRateLimitStore(): void {
  store.clear();
}

/**
 * Get current store size (useful for testing)
 */
export function getRateLimitStoreSize(): number {
  return store.size;
}
