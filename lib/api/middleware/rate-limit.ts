/**
 * Distributed Rate Limiting Middleware
 *
 * Uses Upstash Redis for distributed rate limiting across
 * all Vercel serverless instances. Falls back to in-memory limiting
 * when Redis is unavailable.
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimit as redisRateLimit, isRedisAvailable } from '@/lib/redis';
import { logger } from '@/lib/logger';

interface RateLimiterConfig {
  maxAttempts: number;
  windowMs: number;
  message?: string;
  identifier?: string;
}

class InMemoryRateLimiter {
  private requests: Map<string, { count: number; resetAt: number }> = new Map();
  private config: Required<RateLimiterConfig>;

  constructor(config: RateLimiterConfig) {
    this.config = {
      maxAttempts: config.maxAttempts,
      windowMs: config.windowMs,
      message: config.message || 'Too many requests. Please try again later.',
      identifier: config.identifier || 'default',
    };

    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanup(), 60000);
    }
  }

  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const record = this.requests.get(identifier);

    if (!record || record.resetAt < now) {
      this.requests.set(identifier, {
        count: 1,
        resetAt: now + this.config.windowMs,
      });
      return {
        allowed: true,
        remaining: this.config.maxAttempts - 1,
        resetTime: now + this.config.windowMs,
      };
    }

    if (record.count >= this.config.maxAttempts) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetAt,
      };
    }

    record.count++;
    return {
      allowed: true,
      remaining: this.config.maxAttempts - record.count,
      resetTime: record.resetAt,
    };
  }

  getMessage(): string {
    return this.config.message;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      if (record.resetAt < now) {
        this.requests.delete(key);
      }
    }
  }

  reset(identifier: string): void {
    this.requests.delete(identifier);
  }
}

class RateLimiter {
  private inMemoryFallback: InMemoryRateLimiter;
  private config: Required<RateLimiterConfig>;

  constructor(config: RateLimiterConfig) {
    this.config = {
      maxAttempts: config.maxAttempts,
      windowMs: config.windowMs,
      message: config.message || 'Too many requests. Please try again later.',
      identifier: config.identifier || 'default',
    };
    this.inMemoryFallback = new InMemoryRateLimiter(config);
  }

  async check(identifier: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    if (isRedisAvailable()) {
      try {
        const key = `rate:${this.config.identifier}:${identifier}`;
        const windowSeconds = Math.ceil(this.config.windowMs / 1000);
        const result = await redisRateLimit.check(key, this.config.maxAttempts, windowSeconds);

        return {
          allowed: result.allowed,
          remaining: result.remaining,
          resetTime: result.resetAt,
        };
      } catch (error) {
        logger.error('Redis rate limit failed, using in-memory fallback', { error });
      }
    }

    return this.inMemoryFallback.check(identifier);
  }

  checkSync(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    return this.inMemoryFallback.check(identifier);
  }

  getMessage(): string {
    return this.config.message;
  }

  async reset(identifier: string): Promise<void> {
    const key = `rate:${this.config.identifier}:${identifier}`;
    if (isRedisAvailable()) {
      try {
        await redisRateLimit.reset(key);
      } catch (error) {
        logger.error('Redis rate reset failed', { error });
      }
    }
    this.inMemoryFallback.reset(identifier);
  }
}

// Pre-configured limiters
export const rateLimiters = {
  auth: new RateLimiter({
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000,
    message: 'Too many login attempts. Please wait 15 minutes before trying again.',
    identifier: 'auth',
  }),

  api: new RateLimiter({
    maxAttempts: 100,
    windowMs: 60 * 1000,
    message: 'Rate limit exceeded. Please slow down your requests.',
    identifier: 'api',
  }),

  payment: new RateLimiter({
    maxAttempts: 10,
    windowMs: 60 * 1000,
    message: 'Too many payment attempts. Please wait before trying again.',
    identifier: 'payment',
  }),

  passwordReset: new RateLimiter({
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000,
    message: 'Too many password reset requests. Please try again in an hour.',
    identifier: 'password-reset',
  }),

  public: new RateLimiter({
    maxAttempts: 200,
    windowMs: 60 * 1000,
    message: 'Too many requests. Please try again shortly.',
    identifier: 'public',
  }),
};

function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}

export function withRateLimit(limiter: RateLimiter) {
  return <T extends unknown[]>(
    handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
  ) => {
    return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
      const identifier = getClientIdentifier(request);
      const result = await limiter.check(identifier);

      if (!result.allowed) {
        const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);

        logger.warn('Rate limit exceeded', { identifier, retryAfter });

        return NextResponse.json(
          {
            error: limiter.getMessage(),
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter,
          },
          {
            status: 429,
            headers: {
              'Retry-After': retryAfter.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': result.resetTime.toString(),
            },
          }
        );
      }

      const response = await handler(request, ...args);
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
      response.headers.set('X-RateLimit-Reset', result.resetTime.toString());

      return response;
    };
  };
}

export async function checkRateLimit(
  request: NextRequest,
  limiter: RateLimiter
): Promise<NextResponse | null> {
  const identifier = getClientIdentifier(request);
  const result = await limiter.check(identifier);

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);

    return NextResponse.json(
      {
        error: limiter.getMessage(),
        code: 'RATE_LIMIT_EXCEEDED',
      },
      {
        status: 429,
        headers: { 'Retry-After': retryAfter.toString() },
      }
    );
  }

  return null;
}

export function getRateLimitStatus(): { mode: 'redis' | 'memory'; available: boolean } {
  return {
    mode: isRedisAvailable() ? 'redis' : 'memory',
    available: true,
  };
}

export { RateLimiter };
