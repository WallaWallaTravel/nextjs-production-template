/**
 * Supabase Client Configuration
 *
 * Provides configured Supabase clients for:
 * - Server-side operations (with service role key)
 * - Client-side operations (with anon key)
 *
 * Required Environment Variables:
 * - NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Public anonymous key
 * - SUPABASE_SERVICE_ROLE_KEY: Service role key (server-side only)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables (with build-time fallbacks for Next.js static analysis)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Lazy-initialized clients (throw at usage time, not import time)
let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

/**
 * Get Supabase client (uses anon key, respects RLS)
 * Use this for client-side and authenticated user operations
 */
function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    );
  }

  _supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  });

  return _supabase;
}

/**
 * Get Supabase admin client (bypasses RLS - use carefully!)
 * Use this only for server-side operations that need elevated privileges
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (_supabaseAdmin) return _supabaseAdmin;

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }

  if (!supabaseServiceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }

  _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _supabaseAdmin;
}

// Export a proxy that lazy-initializes the client on first access
// This allows the module to be imported during build without throwing
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabase()[prop as keyof SupabaseClient];
  },
});

// Type-safe database types (generate with `npx supabase gen types typescript`)
// TODO: Run `npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts`
// Then uncomment the line below:
// export type { Database } from '@/types/database';

export default supabase;
