/**
 * Error Handler Middleware Tests
 *
 * Note: next/server is mocked globally in jest.setup.ts
 */

import {
  ApiError,
  BadRequestError,
  NotFoundError,
  ValidationError,
  assert,
  assertDefined,
} from '@/lib/api/middleware/error-handler';

// Mock dependencies
jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/lib/monitoring', () => ({
  captureException: jest.fn(),
}));

describe('Error Handler Middleware', () => {
  describe('Custom Error Classes', () => {
    it('creates ApiError with correct properties', () => {
      const error = new ApiError('Test error', 500, 'TEST_ERROR');

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('TEST_ERROR');
      expect(error.name).toBe('ApiError');
    });

    it('creates BadRequestError with 400 status', () => {
      const error = new BadRequestError('Invalid input');

      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Invalid input');
    });

    it('creates NotFoundError with 404 status', () => {
      const error = new NotFoundError('Resource not found');

      expect(error.statusCode).toBe(404);
    });

    it('creates ValidationError with field errors', () => {
      const errors = { email: ['Invalid email'] };
      const error = new ValidationError('Validation failed', errors);

      expect(error.statusCode).toBe(422);
      expect(error.errors).toEqual(errors);
    });
  });

  describe('Assert helpers', () => {
    it('assert passes when condition is true', () => {
      expect(() => assert(true, 'Should not throw')).not.toThrow();
    });

    it('assert throws ApiError when condition is false', () => {
      expect(() => assert(false, 'Assertion failed')).toThrow(ApiError);
    });

    it('assertDefined passes for defined values', () => {
      expect(() => assertDefined('value', 'Should not throw')).not.toThrow();
      expect(() => assertDefined(0, 'Should not throw')).not.toThrow();
      expect(() => assertDefined('', 'Should not throw')).not.toThrow();
    });

    it('assertDefined throws NotFoundError for null/undefined', () => {
      expect(() => assertDefined(null, 'Not found')).toThrow(NotFoundError);
      expect(() => assertDefined(undefined, 'Not found')).toThrow(NotFoundError);
    });
  });
});
