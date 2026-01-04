#!/bin/bash
# Database Migration Script
# Applies pending migrations to the database

set -e

echo "🗄️  Running database migrations..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "❌ Supabase CLI not found. Install with: npm install -g supabase"
  exit 1
fi

# Check if linked to a project
if [ ! -f ".supabase/project-ref" ]; then
  echo "⚠️  Not linked to a Supabase project."
  echo "   Run: supabase link --project-ref YOUR_PROJECT_REF"
  exit 1
fi

# Run migrations
echo "📦 Pushing migrations to database..."
supabase db push

echo "✅ Migrations applied successfully!"
