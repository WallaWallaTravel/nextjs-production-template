# Deploy Command

Deploy the application with pre-flight checks.

## Pre-Flight Checks

1. **Code Quality**
   - Run `npm run type-check` - TypeScript must pass
   - Run `npm run lint` - No linting errors
   - Run `npm run test` - All tests must pass

2. **Build Verification**
   - Run `npm run build` - Production build must succeed
   - Check bundle size is reasonable

3. **Environment Check**
   - Verify required env vars are documented
   - Check `.env.example` is up to date
   - Ensure no secrets in code

4. **Git Status**
   - Check for uncommitted changes
   - Verify on correct branch (main for production)
   - Confirm all changes are pushed

## Deploy Process

5. **Deploy to Vercel**
   - If all checks pass, confirm deploy
   - Production: `vercel --prod`
   - Preview: `vercel`

6. **Post-Deploy Verification**
   - Check health endpoint: `curl https://[your-domain]/api/health`
   - Verify no Sentry errors in last 5 minutes
   - Confirm deployment in Vercel dashboard

## Report Summary

| Check | Status |
|-------|--------|
| TypeScript | ✅/❌ |
| Lint | ✅/❌ |
| Tests | ✅/❌ |
| Build | ✅/❌ |
| Git Clean | ✅/❌ |
| Deploy | ✅/❌ |

**Important**: Do NOT deploy if any pre-flight check fails.
