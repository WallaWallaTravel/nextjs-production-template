/**
 * Rate Limiting Tests
 *
 * Tests for the core rate limiting function and presets.
 * Middleware wrapper tests require NextRequest which needs additional Jest setup.
 */

import {
  rateLimit,
  clearRateLimitStore,
  getRateLimitStoreSize,
  RateLimitPresets,
} from '@/lib/api/middleware/rate-limit';

describe('Rate Limiting', () => {
  beforeEach(() => {
    clearRateLimitStore();
  });

  describe('rateLimit function', () => {
    it('allows requests within limit', () => {
      const result = rateLimit('test-key', { limit: 5, windowMs: 60000 });

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
      expect(result.limit).toBe(5);
    });

    it('tracks request count', () => {
      const config = { limit: 5, windowMs: 60000 };

      for (let i = 0; i < 3; i++) {
        rateLimit('count-key', config);
      }

      const result = rateLimit('count-key', config);
      expect(result.remaining).toBe(1);
    });

    it('blocks requests exceeding limit', () => {
      const config = { limit: 3, windowMs: 60000 };

      // Use up all requests
      for (let i = 0; i < 3; i++) {
        rateLimit('block-key', config);
      }

      const result = rateLimit('block-key', config);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('uses different keys independently', () => {
      const config = { limit: 2, windowMs: 60000 };

      rateLimit('key-a', config);
      rateLimit('key-a', config);
      const resultA = rateLimit('key-a', config);

      const resultB = rateLimit('key-b', config);

      expect(resultA.allowed).toBe(false);
      expect(resultB.allowed).toBe(true);
    });

    it('provides reset time', () => {
      const result = rateLimit('reset-key', { limit: 5, windowMs: 60000 });

      expect(result.resetTime).toBeGreaterThan(Date.now());
      expect(result.resetTime).toBeLessThanOrEqual(Date.now() + 60000);
    });

    it('uses default config when not provided', () => {
      const result = rateLimit('default-key');

      expect(result.limit).toBe(100); // Default limit
      expect(result.allowed).toBe(true);
    });

    it('remaining never goes below 0', () => {
      const config = { limit: 2, windowMs: 60000 };

      rateLimit('negative-test', config);
      rateLimit('negative-test', config);
      rateLimit('negative-test', config);
      const result = rateLimit('negative-test', config);

      expect(result.remaining).toBe(0);
      expect(result.remaining).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Presets', () => {
    it('standard preset allows 100 requests per minute', () => {
      expect(RateLimitPresets.standard.limit).toBe(100);
      expect(RateLimitPresets.standard.windowMs).toBe(60000);
    });

    it('strict preset allows 10 requests per minute', () => {
      expect(RateLimitPresets.strict.limit).toBe(10);
      expect(RateLimitPresets.strict.windowMs).toBe(60000);
    });

    it('lenient preset allows 1000 requests per minute', () => {
      expect(RateLimitPresets.lenient.limit).toBe(1000);
      expect(RateLimitPresets.lenient.windowMs).toBe(60000);
    });

    it('burst preset allows 30 requests per 10 seconds', () => {
      expect(RateLimitPresets.burst.limit).toBe(30);
      expect(RateLimitPresets.burst.windowMs).toBe(10000);
    });
  });

  describe('Store management', () => {
    it('clears store', () => {
      rateLimit('test-1', { limit: 5 });
      rateLimit('test-2', { limit: 5 });

      expect(getRateLimitStoreSize()).toBe(2);

      clearRateLimitStore();

      expect(getRateLimitStoreSize()).toBe(0);
    });

    it('tracks store size correctly', () => {
      expect(getRateLimitStoreSize()).toBe(0);

      rateLimit('key-1', { limit: 5 });
      expect(getRateLimitStoreSize()).toBe(1);

      rateLimit('key-2', { limit: 5 });
      expect(getRateLimitStoreSize()).toBe(2);

      // Same key doesn't increase store size
      rateLimit('key-1', { limit: 5 });
      expect(getRateLimitStoreSize()).toBe(2);
    });
  });
});
