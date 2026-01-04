#!/bin/bash
# Database Reset Script
# DANGER: Completely resets the database!

set -e

echo "⚠️  DATABASE RESET"
echo "   This will DELETE ALL DATA and recreate the schema."
echo ""

# Confirmation
read -p "Are you sure? Type 'yes' to confirm: " confirm
if [ "$confirm" != "yes" ]; then
  echo "Cancelled."
  exit 0
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "❌ Supabase CLI not found. Install with: npm install -g supabase"
  exit 1
fi

echo "🗑️  Resetting database..."

if [ "$1" = "--local" ]; then
  # Reset local database
  supabase db reset
else
  echo "⚠️  Remote database reset requires manual intervention."
  echo "   1. Go to Supabase Dashboard > Database > Tables"
  echo "   2. Manually delete tables or use SQL Editor"
  echo "   3. Re-run migrations with: npm run db:migrate"
  exit 1
fi

echo "✅ Database reset complete!"
