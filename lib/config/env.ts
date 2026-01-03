/**
 * Environment Variable Validation
 *
 * Validates required environment variables at startup.
 * Fails fast if critical variables are missing.
 *
 * Usage:
 * Import this file early in your app (e.g., in layout.tsx or _app.tsx)
 * to ensure environment is properly configured before running.
 */

interface EnvConfig {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;

  // Optional - Redis for distributed rate limiting
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;

  // Optional - Application
  NODE_ENV: 'development' | 'production' | 'test';
  NEXT_PUBLIC_APP_URL?: string;

  // Optional - External Services
  RESEND_API_KEY?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
}

function validateEnv(): EnvConfig {
  const errors: string[] = [];

  // Required variables
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  // Server-side required (only check on server)
  const serverRequiredVars =
    typeof window === 'undefined' ? ['SUPABASE_SERVICE_ROLE_KEY'] : [];

  // Check all required variables
  for (const varName of [...requiredVars, ...serverRequiredVars]) {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  }

  // Fail fast if any required variables are missing
  if (errors.length > 0) {
    const errorMessage = [
      '❌ Environment validation failed:',
      ...errors.map((e) => `  - ${e}`),
      '',
      'Please check your .env.local file.',
    ].join('\n');

    // In development, log and throw
    if (process.env.NODE_ENV === 'development') {
      console.error(errorMessage);
    }

    throw new Error(errorMessage);
  }

  return {
    // Required
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

    // Optional Redis
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,

    // Application
    NODE_ENV: (process.env.NODE_ENV as EnvConfig['NODE_ENV']) || 'development',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,

    // External Services
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  };
}

// Validate and export environment configuration
export const env = validateEnv();

// Type-safe environment access
export function getEnv<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
  return env[key];
}

// Check if optional service is configured
export function isServiceConfigured(service: 'redis' | 'email' | 'stripe'): boolean {
  switch (service) {
    case 'redis':
      return !!(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);
    case 'email':
      return !!env.RESEND_API_KEY;
    case 'stripe':
      return !!(env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET);
    default:
      return false;
  }
}

// Environment checks
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
