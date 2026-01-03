/**
 * Client-Side Auth
 *
 * Provides client-side Supabase client and auth utilities
 * for use in Client Components.
 */

'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useMemo } from 'react';

/**
 * Create a Supabase client for client-side use
 */
export function createClientSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Hook to get a memoized Supabase client
 */
export function useSupabase() {
  return useMemo(() => createClientSupabaseClient(), []);
}
