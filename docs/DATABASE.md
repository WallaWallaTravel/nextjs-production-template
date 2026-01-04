# Database Documentation

This document describes the database schema and access patterns.

## Overview

- **Provider**: Supabase (managed PostgreSQL)
- **Migrations**: Supabase native (`supabase/migrations/`)
- **ORM**: Direct Supabase client (no heavy ORM)

## Connection

```typescript
// Client-side (respects RLS)
import { supabase } from '@/lib/supabase';

// Server-side (bypasses RLS - use carefully)
import { getSupabaseAdmin } from '@/lib/supabase';
```

## Schema

### Users Table

> Managed by Supabase Auth. Extended via `profiles` table.

```sql
-- auth.users (managed by Supabase)
-- Contains: id, email, encrypted_password, created_at, etc.
```

### Profiles Table

Extended user data linked to auth.users.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policy: Users can only access their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

### Example Resource Table

> Replace with your actual tables.

```sql
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_resources_user_id ON resources(user_id);
CREATE INDEX idx_resources_status ON resources(status);
CREATE INDEX idx_resources_created_at ON resources(created_at DESC);

-- RLS: Users can only access their own resources
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own resources"
  ON resources FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own resources"
  ON resources FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resources"
  ON resources FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own resources"
  ON resources FOR DELETE
  USING (auth.uid() = user_id);
```

## Row Level Security (RLS)

All tables have RLS enabled. Common patterns:

### User-owned data
```sql
-- User can only access their own data
CREATE POLICY "Users access own data"
  ON table_name FOR ALL
  USING (auth.uid() = user_id);
```

### Public read, authenticated write
```sql
-- Anyone can read
CREATE POLICY "Public read"
  ON table_name FOR SELECT
  USING (true);

-- Only authenticated users can write
CREATE POLICY "Authenticated write"
  ON table_name FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
```

### Admin access
```sql
-- Admins can access all data (check user metadata)
CREATE POLICY "Admin access"
  ON table_name FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );
```

## Migrations

### Creating a Migration

```bash
# Create new migration
supabase migration new add_feature_table

# Edit the file in supabase/migrations/
# Then apply
supabase db push
```

### Migration File Format

```sql
-- supabase/migrations/20240101000000_add_feature_table.sql

-- Create table
CREATE TABLE features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE features ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "..." ON features ...;

-- Add indexes
CREATE INDEX ... ON features(...);
```

### Rolling Back

```bash
# Reset to specific migration
supabase db reset --to 20240101000000

# Or drop table manually (for development)
DROP TABLE IF EXISTS features CASCADE;
```

## Common Queries

### Fetch with pagination

```typescript
const { data, error, count } = await supabase
  .from('resources')
  .select('*', { count: 'exact' })
  .eq('status', 'active')
  .order('created_at', { ascending: false })
  .range(0, 9); // First 10 items
```

### Insert with return

```typescript
const { data, error } = await supabase
  .from('resources')
  .insert({ name: 'New Resource', user_id: userId })
  .select()
  .single();
```

### Update single row

```typescript
const { data, error } = await supabase
  .from('resources')
  .update({ name: 'Updated Name' })
  .eq('id', resourceId)
  .select()
  .single();
```

### Delete

```typescript
const { error } = await supabase
  .from('resources')
  .delete()
  .eq('id', resourceId);
```

### Join related tables

```typescript
const { data, error } = await supabase
  .from('resources')
  .select(`
    *,
    profiles (
      full_name,
      avatar_url
    )
  `)
  .eq('id', resourceId)
  .single();
```

## Performance Tips

1. **Always use indexes** for columns in WHERE clauses
2. **Select only needed columns** instead of `*`
3. **Use pagination** for list queries
4. **Use `.single()` or `.maybeSingle()`** when expecting one row
5. **Consider views** for complex repeated queries

## Backup & Recovery

Supabase provides:
- **Point-in-time recovery** (Pro plan)
- **Daily backups** (all plans)

Manual backup:
```bash
# Export schema and data
pg_dump -h db.xxxxx.supabase.co -U postgres -d postgres > backup.sql
```

## Monitoring

Check query performance in Supabase Dashboard:
- **Database > Query Performance**
- **Database > Logs**

## Related Documents

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [API.md](./API.md) - API reference
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
