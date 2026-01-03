/**
 * Request Validation Middleware
 *
 * Provides helpers for validating requests with Zod schemas
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ValidationError } from './error-handler';

// ============================================================================
// Validate Request Body
// ============================================================================

export async function validateBody<T>(
  request: NextRequest,
  schema: z.ZodType<T>
): Promise<T> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      throw new ValidationError(
        'Request validation failed',
        formatZodErrors(error as z.ZodError)
      );
    }
    throw error;
  }
}

// ============================================================================
// Validate Query Parameters
// ============================================================================

export function validateQuery<T>(
  request: NextRequest,
  schema: z.ZodType<T>
): T {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    return schema.parse(query);
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      throw new ValidationError(
        'Query parameter validation failed',
        formatZodErrors(error as z.ZodError)
      );
    }
    throw error;
  }
}

// ============================================================================
// Validate URL Parameters
// ============================================================================

export async function validateParams<T>(
  params: Promise<unknown> | unknown,
  schema: z.ZodType<T>
): Promise<T> {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    return schema.parse(resolvedParams);
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      throw new ValidationError(
        'URL parameter validation failed',
        formatZodErrors(error as z.ZodError)
      );
    }
    throw error;
  }
}

// ============================================================================
// Format Zod Errors
// ============================================================================

function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join('.') || 'root';
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(issue.message);
  }

  return formatted;
}

// ============================================================================
// Export for convenience
// ============================================================================

export { ValidationError } from './error-handler';

// =============================================================================
// Common Validation Schemas
// =============================================================================

export const commonValidators = {
  // Email validation
  email: z.string().email('Invalid email address').max(255),

  // Phone number (flexible format)
  phone: z.string()
    .regex(/^[+]?[(]?[0-9]{1,3}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/, 'Invalid phone number')
    .optional(),

  // Currency amount (positive, max 2 decimals)
  amount: z.number()
    .positive('Amount must be greater than 0')
    .max(1000000, 'Amount exceeds maximum allowed')
    .refine(val => Number.isFinite(val) && Math.round(val * 100) / 100 === val, {
      message: 'Amount must have at most 2 decimal places',
    }),

  // UUID validation
  uuid: z.string().uuid('Invalid ID format'),

  // Date string (ISO format)
  isoDate: z.string().datetime({ message: 'Invalid date format' }),

  // Positive integer
  positiveInt: z.number().int().positive(),

  // Non-empty string
  nonEmpty: z.string().min(1, 'This field is required'),
};
