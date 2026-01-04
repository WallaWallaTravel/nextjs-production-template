# Database Migration Command

Run database migrations and verify schema is up to date.

## Tasks

1. **Check Migration Status**
   - List any pending migrations in `supabase/migrations/`
   - Compare local migrations with applied migrations

2. **Run Migrations**
   - Execute `npm run db:migrate` to apply pending migrations
   - Report success/failure for each migration

3. **Verify Schema**
   - Check that profiles table exists
   - Verify RLS policies are enabled
   - Confirm triggers are installed

4. **Report Summary**

   | Step | Status |
   |------|--------|
   | Migration Files | [count] files |
   | Applied | ✅/❌ |
   | Schema Verified | ✅/❌ |

   If migrations fail, provide:
   - Error message
   - Suggested fix
   - Rollback instructions if needed
