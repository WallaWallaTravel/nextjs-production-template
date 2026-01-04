/**
 * Validation Middleware Tests
 *
 * Tests for common validators only - middleware wrapper tests
 * require NextRequest which needs additional Jest setup.
 */

import { commonValidators, ValidationError } from '@/lib/api/middleware/validation';

describe('Common Validators', () => {
  describe('email', () => {
    it('accepts valid emails', () => {
      expect(commonValidators.email.parse('test@example.com')).toBe('test@example.com');
      expect(commonValidators.email.parse('user.name@domain.co.uk')).toBe('user.name@domain.co.uk');
    });

    it('rejects invalid emails', () => {
      expect(() => commonValidators.email.parse('invalid')).toThrow();
      expect(() => commonValidators.email.parse('no-at-sign')).toThrow();
      expect(() => commonValidators.email.parse('@nodomain.com')).toThrow();
    });
  });

  describe('amount', () => {
    it('accepts valid amounts', () => {
      expect(commonValidators.amount.parse(99.99)).toBe(99.99);
      expect(commonValidators.amount.parse(1)).toBe(1);
      expect(commonValidators.amount.parse(0.01)).toBe(0.01);
    });

    it('rejects negative amounts', () => {
      expect(() => commonValidators.amount.parse(-10)).toThrow();
      expect(() => commonValidators.amount.parse(-0.01)).toThrow();
    });

    it('rejects zero', () => {
      expect(() => commonValidators.amount.parse(0)).toThrow();
    });

    it('rejects amounts with more than 2 decimals', () => {
      expect(() => commonValidators.amount.parse(10.999)).toThrow();
      expect(() => commonValidators.amount.parse(1.001)).toThrow();
    });

    it('rejects amounts exceeding maximum', () => {
      expect(() => commonValidators.amount.parse(1000001)).toThrow();
    });
  });

  describe('uuid', () => {
    it('accepts valid UUIDs', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      expect(commonValidators.uuid.parse(uuid)).toBe(uuid);
    });

    it('accepts various UUID formats', () => {
      expect(commonValidators.uuid.parse('550e8400-e29b-41d4-a716-446655440000')).toBeDefined();
      expect(commonValidators.uuid.parse('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBeDefined();
    });

    it('rejects invalid UUIDs', () => {
      expect(() => commonValidators.uuid.parse('not-a-uuid')).toThrow();
      expect(() => commonValidators.uuid.parse('123')).toThrow();
      expect(() => commonValidators.uuid.parse('')).toThrow();
    });
  });

  describe('nonEmpty', () => {
    it('accepts non-empty strings', () => {
      expect(commonValidators.nonEmpty.parse('hello')).toBe('hello');
      expect(commonValidators.nonEmpty.parse(' ')).toBe(' ');
    });

    it('rejects empty strings', () => {
      expect(() => commonValidators.nonEmpty.parse('')).toThrow();
    });
  });

  describe('positiveInt', () => {
    it('accepts positive integers', () => {
      expect(commonValidators.positiveInt.parse(1)).toBe(1);
      expect(commonValidators.positiveInt.parse(100)).toBe(100);
    });

    it('rejects zero and negative integers', () => {
      expect(() => commonValidators.positiveInt.parse(0)).toThrow();
      expect(() => commonValidators.positiveInt.parse(-1)).toThrow();
    });

    it('rejects non-integers', () => {
      expect(() => commonValidators.positiveInt.parse(1.5)).toThrow();
    });
  });

  describe('isoDate', () => {
    it('accepts valid ISO date strings', () => {
      const date = '2024-01-15T10:30:00.000Z';
      expect(commonValidators.isoDate.parse(date)).toBe(date);
    });

    it('rejects invalid date strings', () => {
      expect(() => commonValidators.isoDate.parse('not-a-date')).toThrow();
      expect(() => commonValidators.isoDate.parse('2024-01-15')).toThrow(); // Missing time
    });
  });

  describe('phone', () => {
    it('accepts valid phone numbers', () => {
      expect(commonValidators.phone.parse('+1-555-123-4567')).toBeDefined();
      expect(commonValidators.phone.parse('(555) 123-4567')).toBeDefined();
    });

    it('accepts undefined (optional)', () => {
      expect(commonValidators.phone.parse(undefined)).toBeUndefined();
    });
  });
});

describe('ValidationError', () => {
  it('creates error with field errors', () => {
    const errors = {
      email: ['Invalid email format'],
      name: ['Name is required', 'Name is too short'],
    };
    const error = new ValidationError('Validation failed', errors);

    expect(error.message).toBe('Validation failed');
    expect(error.statusCode).toBe(422);
    expect(error.errors).toEqual(errors);
  });

  it('can be created without field errors', () => {
    const error = new ValidationError('General validation error');

    expect(error.message).toBe('General validation error');
    expect(error.errors).toBeUndefined();
  });
});
