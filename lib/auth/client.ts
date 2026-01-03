/**
 * Client-Side Auth
 *
 * Provides client-side Supabase client and auth utilities
 * for use in Client Components.
 */

'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { useMemo } from 'react';

// Environment variables with build-time fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Cached client instance
let browserClient: SupabaseClient | null = null;

/**
 * Create a Supabase client for client-side use
 * Uses singleton pattern to avoid creating multiple clients
 */
export function createClientSupabaseClient(): SupabaseClient {
  if (browserClient) return browserClient;

  // Note: If env vars are not set, Supabase operations will fail at runtime
  // which is the intended behavior - fail at usage, not at import
  browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return browserClient;
}

/**
 * Hook to get a memoized Supabase client
 */
export function useSupabase(): SupabaseClient {
  return useMemo(() => createClientSupabaseClient(), []);
}
