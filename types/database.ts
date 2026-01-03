/**
 * Database Types
 *
 * Generate these types from your Supabase schema using:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts
 *
 * Then import and use with your Supabase client:
 * import { Database } from '@/types/database';
 * const supabase = createClient<Database>(url, key);
 */

// ============================================================================
// Example Schema Types
// ============================================================================

// This is an example structure. Replace with generated types from Supabase CLI.

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      // Add more tables as needed
    };
    Views: {
      // Add views here
    };
    Functions: {
      // Add functions here
    };
    Enums: {
      // Add enums here
    };
  };
}

// ============================================================================
// Convenience Types
// ============================================================================

// Extract table types for easier use
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

// Example usage:
// type Profile = Tables<'profiles'>;
// type NewProfile = InsertTables<'profiles'>;
// type ProfileUpdate = UpdateTables<'profiles'>;
