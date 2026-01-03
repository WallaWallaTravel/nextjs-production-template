/**
 * Centralized Configuration Management
 * Single entry point for all application configuration
 */

// Environment configuration (validated at startup)
export {
  env,
  getEnv,
  isServiceConfigured,
  isDevelopment,
  isProduction,
  isTest,
} from './env';

/**
 * Application Configuration
 * Customize these values for your project
 */
export const APP_CONFIG = {
  // Application Info
  name: 'My App', // TODO: Update with your app name
  version: '1.0.0',

  // API Configuration
  api: {
    version: 'v1',
    baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
    timeout: 30000, // 30 seconds
  },

  // Pagination
  pagination: {
    defaultLimit: 50,
    maxLimit: 100,
  },

  // Date/Time
  timezone: 'America/Los_Angeles', // TODO: Update for your timezone

  // Cache Durations (seconds)
  cache: {
    short: 60, // 1 minute
    medium: 300, // 5 minutes
    long: 1800, // 30 minutes
    veryLong: 3600, // 1 hour
    day: 86400, // 24 hours
  },

  // Rate Limiting
  rateLimit: {
    public: 100, // requests per minute
    authenticated: 1000, // requests per minute
  },

  // File Upload
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    acceptedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    acceptedDocumentTypes: ['application/pdf'],
  },

  // Feature Flags (for gradual rollout)
  features: {
    // Add your feature flags here
    // exampleFeature: false,
  },
} as const;

/**
 * Helper Functions
 */

/**
 * Get configuration value with type safety
 */
export function getConfig<T extends keyof typeof APP_CONFIG>(
  key: T
): (typeof APP_CONFIG)[T] {
  return APP_CONFIG[key];
}

/**
 * Check if feature is enabled
 */
export function isFeatureEnabled(
  feature: keyof typeof APP_CONFIG.features
): boolean {
  return APP_CONFIG.features[feature];
}

/**
 * Get full API URL
 */
export function getApiUrl(endpoint: string): string {
  const base = APP_CONFIG.api.baseUrl;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${cleanEndpoint}`;
}
