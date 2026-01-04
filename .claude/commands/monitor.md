# Monitor Command

Check application health, error rates, and performance.

## Health Checks

1. **API Health**
   - Check health endpoint: `curl https://[your-domain]/api/health`
   - Verify database connectivity
   - Check response time

2. **Error Monitoring (Sentry)**
   - Check for recent errors in Sentry
   - Identify any error spikes
   - Note unresolved issues

3. **Performance (Vercel Analytics)**
   - Check Web Vitals scores
   - Review page load times
   - Identify slow pages

## Quick Diagnostics

4. **Recent Deployments**
   - List recent Vercel deployments
   - Check deployment status
   - Note any failed deploys

5. **Database Status**
   - Check Supabase project status
   - Review database size/usage
   - Check for slow queries (if available)

## Report Summary

| Metric | Status | Value |
|--------|--------|-------|
| Health Endpoint | ✅/❌ | [response time]ms |
| Error Rate | ✅/⚠️/❌ | [count] errors/24h |
| Web Vitals | ✅/⚠️/❌ | [LCP/FID/CLS] |
| Last Deploy | ✅/❌ | [timestamp] |

## Action Items

If issues are found:
- List specific errors with Sentry links
- Provide troubleshooting steps
- Suggest fixes based on error patterns

## Resources

- Sentry Dashboard: [link to your Sentry project]
- Vercel Dashboard: [link to your Vercel project]
- Supabase Dashboard: [link to your Supabase project]
