#!/bin/bash
# Database Seed Script
# Loads seed data for development

set -e

echo "🌱 Seeding database..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "❌ Supabase CLI not found. Install with: npm install -g supabase"
  exit 1
fi

# Check for local development
if [ "$1" = "--local" ]; then
  echo "📦 Seeding local database..."
  psql postgresql://postgres:postgres@localhost:54322/postgres -f supabase/seed.sql
else
  echo "📦 Seeding remote database..."
  echo "   Use: supabase db reset (includes seed data)"
  echo "   Or connect directly with psql and run: \\i supabase/seed.sql"
fi

echo "✅ Seeding complete!"
