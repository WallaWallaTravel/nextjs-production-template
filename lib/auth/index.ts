/**
 * Authentication System
 *
 * Provides server-side and client-side authentication utilities
 * using Supabase Auth.
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';

import { logger } from '@/lib/logger';

// ============================================================================
// Server-Side Auth (for Server Components and API Routes)
// ============================================================================

/**
 * Create a Supabase client for server-side use
 * Automatically handles cookie management
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore - called from Server Component
          }
        },
      },
    }
  );
}

/**
 * Get the current session (cached per request)
 */
export const getSession = cache(async () => {
  const supabase = await createServerSupabaseClient();
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    logger.error('Failed to get session', { error: error.message });
    return null;
  }

  return session;
});

/**
 * Get the current user (cached per request)
 */
export const getUser = cache(async () => {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    logger.error('Failed to get user', { error: error.message });
    return null;
  }

  return user;
});

/**
 * Require authentication - redirects to login if not authenticated
 */
export async function requireAuth(redirectTo: string = '/login') {
  const user = await getUser();

  if (!user) {
    redirect(redirectTo);
  }

  return user;
}

/**
 * Require guest (not authenticated) - redirects to dashboard if authenticated
 */
export async function requireGuest(redirectTo: string = '/dashboard') {
  const user = await getUser();

  if (user) {
    redirect(redirectTo);
  }
}

// ============================================================================
// Auth Actions (Server Actions)
// ============================================================================

export interface AuthResult {
  success: boolean;
  error?: string;
  redirectTo?: string;
}

/**
 * Sign in with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResult> {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    logger.warn('Sign in failed', { email, error: error.message });
    return { success: false, error: error.message };
  }

  logger.info('User signed in', { email });
  return { success: true, redirectTo: '/dashboard' };
}

/**
 * Sign up with email and password
 */
export async function signUp(
  email: string,
  password: string,
  metadata?: Record<string, unknown>
): Promise<AuthResult> {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    logger.warn('Sign up failed', { email, error: error.message });
    return { success: false, error: error.message };
  }

  logger.info('User signed up', { email });
  return {
    success: true,
    redirectTo: '/auth/verify-email',
  };
}

/**
 * Sign out
 */
export async function signOut(): Promise<AuthResult> {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    logger.error('Sign out failed', { error: error.message });
    return { success: false, error: error.message };
  }

  return { success: true, redirectTo: '/login' };
}

/**
 * Request password reset
 */
export async function resetPassword(email: string): Promise<AuthResult> {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  });

  if (error) {
    logger.warn('Password reset request failed', { email, error: error.message });
    return { success: false, error: error.message };
  }

  logger.info('Password reset requested', { email });
  return { success: true };
}

/**
 * Update password (for authenticated users)
 */
export async function updatePassword(newPassword: string): Promise<AuthResult> {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    logger.error('Password update failed', { error: error.message });
    return { success: false, error: error.message };
  }

  logger.info('Password updated');
  return { success: true };
}
