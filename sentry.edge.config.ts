/**
 * Sentry Edge Configuration
 *
 * This file configures the initialization of Sentry for edge features (Middleware, Edge Routs).
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only enable Sentry in production
  enabled: process.env.NODE_ENV === 'production',

  // Performance Monitoring
  tracesSampleRate: 0.1, // Capture 10% of transactions

  // Set environment
  environment: process.env.NODE_ENV,
});
