/**
 * Sentry Utilities
 *
 * Helper functions for Sentry error tracking.
 * Use these in your API routes and server actions.
 */

import * as Sentry from '@sentry/nextjs';

/**
 * Capture an exception and send it to Sentry
 */
export function captureException(
  error: unknown,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
    user?: { id: string; email?: string };
  }
): string {
  return Sentry.captureException(error, {
    tags: context?.tags,
    extra: context?.extra,
    user: context?.user,
  });
}

/**
 * Capture a message (non-error) and send it to Sentry
 */
export function captureMessage(
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info',
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  }
): string {
  return Sentry.captureMessage(message, {
    level,
    tags: context?.tags,
    extra: context?.extra,
  });
}

/**
 * Set user context for Sentry
 * Call this after authentication to associate errors with users
 */
export function setUser(user: { id: string; email?: string; username?: string } | null): void {
  Sentry.setUser(user);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(breadcrumb: {
  category?: string;
  message: string;
  level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
  data?: Record<string, unknown>;
}): void {
  Sentry.addBreadcrumb(breadcrumb);
}

/**
 * Create a span for performance monitoring
 */
export async function withSpan<T>(
  name: string,
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  return Sentry.startSpan({ name, op: operation }, fn);
}
