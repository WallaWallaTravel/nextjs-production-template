# [Project Name] - Claude Code Context

> **Template Instructions**: Replace bracketed items with your project specifics.
> Delete this instruction block after customization.

## Overview

[Brief description of what this project does and its purpose]

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Styling | Tailwind CSS |
| Language | TypeScript (strict mode) |
| Hosting | Vercel |
| Monitoring | Sentry |
| Analytics | Vercel Analytics |

## Key Commands

| Command | Purpose |
|---------|---------|
| `/status` | Check project health and build status |
| `/quality-check` | Run linting, type-check, and tests |
| `/security-check` | Security audit |
| `/test-status` | Test coverage report |
| `/migrate` | Run database migrations |
| `/deploy` | Deploy with pre-flight checks |
| `/monitor` | Check error rates and health |

## Directory Structure

```
project/
├── .claude/              # Claude Code configuration
│   └── commands/         # Project-specific commands
├── .github/workflows/    # CI/CD pipelines
├── app/                  # Next.js App Router pages
│   ├── api/             # API routes
│   └── (routes)/        # Page routes
├── lib/                  # Shared libraries
│   ├── api/middleware/  # Error handling, validation, rate limiting
│   ├── auth/            # Authentication helpers
│   ├── config/          # Environment configuration
│   └── monitoring/      # Sentry utilities
├── components/           # React components
│   ├── ui/              # Generic UI components
│   └── [feature]/       # Feature-specific components
├── hooks/                # Custom React hooks
├── types/                # Global TypeScript types
├── docs/                 # Project documentation
├── supabase/            # Database migrations
│   └── migrations/      # SQL migration files
├── scripts/             # Utility scripts
└── __tests__/           # Test files
```

## Critical Files

| File | Purpose |
|------|---------|
| `lib/api/middleware/error-handler.ts` | Centralized error handling + Sentry |
| `lib/api/middleware/validation.ts` | Zod request validation |
| `lib/api/middleware/rate-limit.ts` | API rate limiting |
| `lib/api/middleware/request-context.ts` | Correlation ID tracking |
| `lib/api/response.ts` | Standardized API responses |
| `lib/logger.ts` | Structured logging |
| `lib/monitoring/sentry.ts` | Sentry error reporting |
| `lib/supabase.ts` | Supabase client configuration |
| `app/api/health/route.ts` | Health check endpoint |

## Monitoring & Observability

### Error Tracking (Sentry)
- Errors automatically captured in error boundaries
- API errors (500+) reported to Sentry
- Dashboard: [Configure your Sentry project URL]

### Analytics (Vercel)
- Page views tracked automatically
- Web Vitals measured (LCP, FID, CLS)
- Dashboard: Vercel project > Analytics

### Health Monitoring
```bash
# Check health endpoint
curl https://your-app.vercel.app/api/health
```

## Database Migrations

### Running Migrations
```bash
# Apply migrations
npm run db:migrate

# Seed development data
npm run db:seed

# Reset database (DANGER)
npm run db:reset
```

### Creating New Migrations
```bash
# Using Supabase CLI
supabase migration new your_migration_name

# Edit the file in supabase/migrations/
# Then push to database
supabase db push
```

## CI/CD Pipeline

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | PR to main | Type-check, lint, test, build |
| `preview.yml` | PR to main | Deploy preview environment |
| `production.yml` | Push to main | Deploy to production |

### Required GitHub Secrets
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Code Patterns

### API Route with Rate Limiting
```typescript
import { withErrorHandling } from '@/lib/api/middleware/error-handler';
import { validateBody } from '@/lib/api/middleware/validation';
import { withRateLimit, RateLimitPresets } from '@/lib/api/middleware/rate-limit';
import { APIResponse } from '@/lib/api/response';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export const POST = withRateLimit(
  withErrorHandling(async (request) => {
    const data = await validateBody(request, schema);
    return APIResponse.success({ id: 1, ...data });
  }),
  RateLimitPresets.standard
);
```

### Error Reporting
```typescript
import { captureException } from '@/lib/monitoring';

try {
  // risky operation
} catch (error) {
  captureException(error, {
    tags: { feature: 'payments' },
    extra: { userId: user.id }
  });
}
```

### Supabase Data Access
```typescript
import { supabase } from '@/lib/supabase';

const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('is_active', true);
```

## Environment Variables

Required in `.env.local`:
```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Monitoring (Optional but recommended)
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn

# Email - Optional
RESEND_API_KEY=your_resend_key

# Stripe - Optional
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

## Running the Project

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build

# Type check
npm run type-check

# Lint
npm run lint

# Database operations
npm run db:migrate
npm run db:seed
```

## Session Workflow

### Starting a Session
1. `/status` - Check overall project health
2. Review recent changes with `git log -5 --oneline`
3. Check Sentry for any new errors

### During Development
- Use TodoWrite for multi-step tasks (>3 steps)
- Commit frequently with meaningful messages
- Run tests before major changes
- Follow existing patterns in the codebase

### Before Ending
- Run `npm run build` to verify everything compiles
- Run `/monitor` to check for any new errors
- Commit any work in progress to a feature branch

## Quality Standards

### Pre-commit Hooks
Pre-commit hooks automatically run:
- TypeScript type-check
- ESLint

### Before Marking Complete
- [ ] TypeScript compiles without errors (`npm run type-check`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Tests pass (`npm run test`)
- [ ] App builds successfully (`npm run build`)
- [ ] No console errors in browser
- [ ] No new Sentry errors after changes

### Commit Message Format
```
type: brief description

- Detail 1
- Detail 2

[Generated with Claude Code]
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

## Troubleshooting

Common issues and fixes are documented in `docs/TROUBLESHOOTING.md`.

Quick diagnostics:
- Build errors: Check TypeScript errors first
- API errors: Check Sentry for stack traces
- Database issues: Verify Supabase connection in health check
- Auth issues: Check Supabase Auth logs

---

**Last Updated:** [Date]
