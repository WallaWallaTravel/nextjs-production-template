# Troubleshooting Guide

Common issues and their solutions.

## Quick Diagnostics

```bash
# Check project health
npm run build         # Build errors?
npm run type-check    # TypeScript errors?
npm run lint          # Linting issues?
npm run test          # Test failures?

# Check health endpoint (when running locally)
curl http://localhost:3000/api/health
```

## Common Issues

### Build & Development

#### "Module not found" errors

**Cause**: Missing dependency or incorrect import path.

```bash
# Solution 1: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Solution 2: Check import path
# Ensure using correct alias (@/) or relative path
```

#### TypeScript errors during build

**Cause**: Type mismatch or missing types.

```bash
# Check specific errors
npm run type-check

# Common fixes:
# 1. Add missing type annotations
# 2. Update @types/* packages
# 3. Check tsconfig.json paths
```

#### "Environment variable not found"

**Cause**: Missing `.env.local` file or variable.

```bash
# Solution: Copy example and fill in values
cp .env.example .env.local
# Then edit .env.local with your actual values
```

### Database Issues

#### "Supabase connection failed"

**Causes**:
1. Invalid credentials
2. Network issues
3. Project paused (free tier)

```bash
# Verify credentials
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Check if project is active at supabase.com
# Free tier projects pause after 1 week of inactivity
```

#### "Permission denied" on database operations

**Cause**: Row Level Security (RLS) policies blocking access.

```sql
-- Check RLS policies in Supabase SQL Editor
SELECT * FROM pg_policies WHERE tablename = 'your_table';

-- Temporarily disable RLS for debugging (NOT IN PRODUCTION)
ALTER TABLE your_table DISABLE ROW LEVEL SECURITY;
```

#### Migration fails

```bash
# Reset and re-run migrations
supabase db reset

# If reset fails, check migration syntax:
supabase db lint
```

### Authentication Issues

#### "Invalid login credentials"

**Causes**:
1. Wrong email/password
2. User not confirmed
3. User doesn't exist

```bash
# Check user in Supabase Dashboard > Authentication > Users
# Look for:
# - Email confirmation status
# - Last sign in date
# - User metadata
```

#### Session not persisting

**Cause**: Cookie configuration issue.

```typescript
// Check auth client configuration
// In lib/auth/client.ts, ensure:
const supabase = createBrowserClient(url, key);
// NOT createClient() - that's for server-side
```

#### "JWT expired"

**Cause**: Token refresh not working.

```typescript
// Auth hook should handle refresh automatically
// Check that onAuthStateChange is set up in useAuth hook
```

### API Issues

#### 500 Internal Server Error

**Steps to diagnose**:

1. Check Sentry for error details
2. Check Vercel logs: `vercel logs`
3. Look for error in response:
   ```json
   {
     "error": {
       "message": "...",
       "requestId": "req_xxx"
     }
   }
   ```
4. Search logs by requestId

#### 429 Too Many Requests

**Cause**: Rate limit exceeded.

```bash
# Wait for rate limit to reset (check Retry-After header)
# Or adjust rate limit configuration in lib/api/middleware/rate-limit.ts
```

#### CORS errors in browser

**Cause**: Cross-origin request blocked.

```typescript
// Check next.config.js headers configuration
// Ensure your domain is in allowed origins
```

### Production Issues

#### Slow page loads

**Diagnosis**:
1. Check Vercel Analytics for Web Vitals
2. Run Lighthouse audit
3. Check bundle size: `npm run build` shows bundle analysis

**Common fixes**:
- Lazy load heavy components
- Optimize images with next/image
- Add proper caching headers
- Check for unnecessary re-renders

#### Memory issues / crashes

**Cause**: Memory leak or large payload.

```typescript
// Check for:
// 1. Unclosed database connections
// 2. Large arrays/objects in memory
// 3. Infinite loops
// 4. Missing cleanup in useEffect
```

#### Deployment fails

**Common causes**:
1. Missing environment variables
2. Build errors
3. Invalid next.config.js

```bash
# Test build locally first
npm run build

# Check Vercel build logs for specific error
```

## Debugging Tools

### Local Development

```bash
# Run with debug logging
DEBUG=* npm run dev

# Run specific tests
npm test -- --grep "test name"

# Check TypeScript
npm run type-check -- --listFiles
```

### Production

| Tool | Purpose | Access |
|------|---------|--------|
| Sentry | Error tracking | sentry.io/your-org |
| Vercel Logs | Runtime logs | vercel.com > Project > Logs |
| Vercel Analytics | Performance | vercel.com > Project > Analytics |
| Supabase Logs | Database logs | supabase.com > Project > Logs |

### Useful Commands

```bash
# Check if APIs are responding
curl http://localhost:3000/api/health | jq

# Watch logs in real-time
vercel logs --follow

# Database query debugging
supabase db query "EXPLAIN ANALYZE SELECT * FROM users"
```

## Getting Help

1. **Check this guide** for common issues
2. **Search error message** in project issues/discussions
3. **Check Sentry** for production errors
4. **Review recent changes** in git history
5. **Ask Claude Code** for help with `/fix` command

## Related Documents

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [API.md](./API.md) - API reference
