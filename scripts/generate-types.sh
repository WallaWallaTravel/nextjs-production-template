#!/bin/bash

# Generate TypeScript types from Supabase schema
# Usage: ./scripts/generate-types.sh

set -e

# Check if project ID is set
if [ -z "$SUPABASE_PROJECT_ID" ]; then
  echo "Error: SUPABASE_PROJECT_ID environment variable is not set"
  echo "Usage: SUPABASE_PROJECT_ID=your-project-id ./scripts/generate-types.sh"
  exit 1
fi

# Check if supabase CLI is installed
if ! command -v npx &> /dev/null; then
  echo "Error: npx is not installed"
  exit 1
fi

echo "Generating TypeScript types from Supabase..."

# Generate types
npx supabase gen types typescript \
  --project-id "$SUPABASE_PROJECT_ID" \
  > types/database.ts

echo "Types generated successfully at types/database.ts"
