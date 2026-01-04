# Deployment Guide

This guide covers deploying to Vercel with Supabase backend.

## Prerequisites

- [Vercel account](https://vercel.com)
- [Supabase account](https://supabase.com)
- [GitHub account](https://github.com) (for CI/CD)

## Quick Start

### 1. Fork/Clone Repository

```bash
# Clone the repository
git clone [your-repo-url]
cd [project-name]

# Install dependencies
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project Settings > API** to get:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

3. Run migrations:
```bash
# Using Supabase CLI
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

### 3. Set Up Sentry (Optional)

1. Create a project at [sentry.io](https://sentry.io)
2. Go to **Project Settings > Client Keys (DSN)**
3. Copy your DSN

### 4. Deploy to Vercel

**Option A: Vercel Dashboard**
1. Import your GitHub repository at [vercel.com/new](https://vercel.com/new)
2. Add environment variables (see below)
3. Deploy

**Option B: Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## Environment Variables

### Required (Production)

| Variable | Where to Find | Example |
|----------|---------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard > Settings > API | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard > Settings > API | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard > Settings > API | `eyJhbGc...` |
| `NEXT_PUBLIC_APP_URL` | Your Vercel URL | `https://myapp.vercel.app` |

### Optional

| Variable | Purpose | Where to Find |
|----------|---------|---------------|
| `NEXT_PUBLIC_SENTRY_DSN` | Error tracking | Sentry > Settings > Client Keys |
| `RESEND_API_KEY` | Transactional email | [resend.com](https://resend.com) |
| `STRIPE_SECRET_KEY` | Payments | [stripe.com/dashboard](https://stripe.com/dashboard) |

## CI/CD Pipeline

This project includes GitHub Actions workflows:

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | Every PR | Type-check, lint, test |
| `preview.yml` | Every PR | Deploy preview environment |
| `production.yml` | Push to main | Deploy to production |

### Setting Up GitHub Actions

1. Add these secrets to your GitHub repository:
   - `VERCEL_TOKEN` - From [vercel.com/account/tokens](https://vercel.com/account/tokens)
   - `VERCEL_ORG_ID` - From `.vercel/project.json` after linking
   - `VERCEL_PROJECT_ID` - From `.vercel/project.json` after linking

2. Link your Vercel project:
```bash
vercel link
cat .vercel/project.json  # Get ORG_ID and PROJECT_ID
```

## Database Migrations

### Running Migrations

```bash
# Using npm script
npm run db:migrate

# Using Supabase CLI directly
supabase db push
```

### Creating New Migrations

```bash
# Create a new migration file
supabase migration new your_migration_name

# Edit the file in supabase/migrations/
# Then push to database
supabase db push
```

## Rollback Procedures

### Application Rollback

```bash
# Via Vercel Dashboard
# Go to Deployments > Find previous working deployment > Promote to Production

# Via CLI
vercel rollback
```

### Database Rollback

```bash
# Revert to a specific migration
supabase db reset --to 00001_initial_schema

# Or manually run down migration
# (Create corresponding down.sql files)
```

## Health Checks

Monitor your deployment health:

```bash
# Check health endpoint
curl https://your-app.vercel.app/api/health

# Expected response (healthy):
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "checks": [
    { "name": "database", "status": "pass" }
  ]
}
```

## Troubleshooting Deployments

| Issue | Solution |
|-------|----------|
| Build fails with missing env vars | Check all required env vars are set in Vercel |
| Database connection fails | Verify Supabase URL and keys are correct |
| 500 errors in production | Check Sentry for error details |
| Slow initial page loads | Enable Edge caching, check bundle size |

## Performance Checklist

- [ ] Edge Functions enabled (default on Vercel)
- [ ] Images optimized with `next/image`
- [ ] Bundle analyzer shows no large dependencies
- [ ] Database queries have proper indexes
- [ ] Caching headers configured for static assets

## Security Checklist

- [ ] Environment variables marked as secret
- [ ] CORS configured for production domain
- [ ] Rate limiting enabled on sensitive endpoints
- [ ] Supabase RLS policies reviewed
- [ ] No secrets in client-side code

## Related Documents

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues
- [DATABASE.md](./DATABASE.md) - Schema documentation
