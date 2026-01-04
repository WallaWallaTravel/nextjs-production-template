/**
 * Sentry Client-Side Configuration
 *
 * This file configures the initialization of Sentry on the client.
 * The config here will be used whenever a page is visited.
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only enable Sentry in production
  enabled: process.env.NODE_ENV === 'production',

  // Performance Monitoring
  tracesSampleRate: 0.1, // Capture 10% of transactions

  // Session Replay (adjust rate for your traffic volume)
  replaysSessionSampleRate: 0.01, // 1% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

  // You can remove this option if you're not planning to use the Sentry Replay integration
  integrations: [
    Sentry.replayIntegration({
      // Mask all text content by default for privacy
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Filter out noisy errors
  ignoreErrors: [
    // Browser extensions
    /^chrome-extension:\/\//,
    /^moz-extension:\/\//,
    // Network errors
    'Network request failed',
    'Failed to fetch',
    'Load failed',
    // User aborts
    'AbortError',
    'The operation was aborted',
  ],

  // Set environment
  environment: process.env.NODE_ENV,
});
