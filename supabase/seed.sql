-- Seed Data for Development
-- Run: supabase db reset (includes seed) OR psql -f seed.sql
--
-- Note: This file is for development/testing only.
-- Do NOT include sensitive data or production credentials.

-- =============================================================================
-- INSTRUCTIONS
-- =============================================================================
-- 1. Create test users through Supabase Auth Dashboard or auth.users insert
-- 2. Their profiles will be created automatically via trigger
-- 3. Add any additional test data below

-- Example: If you need to seed profiles manually (e.g., for testing):
--
-- INSERT INTO profiles (id, full_name, avatar_url) VALUES
--   ('00000000-0000-0000-0000-000000000001', 'Test User 1', null),
--   ('00000000-0000-0000-0000-000000000002', 'Test User 2', null)
-- ON CONFLICT (id) DO UPDATE SET
--   full_name = EXCLUDED.full_name;

-- =============================================================================
-- ADD YOUR SEED DATA BELOW
-- =============================================================================

-- Example table seeding (uncomment and modify as needed):
--
-- INSERT INTO your_table (column1, column2) VALUES
--   ('value1', 'value2'),
--   ('value3', 'value4');

SELECT 'Seed data loaded successfully' AS status;
