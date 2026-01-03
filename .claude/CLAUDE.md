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

## Key Commands

| Command | Purpose |
|---------|---------|
| `/status` | Check project health and build status |
| `/quality-check` | Run linting, type-check, and tests |
| `/security-check` | Security audit |
| `/test-status` | Test coverage report |

## Directory Structure

```
project/
├── .claude/              # Claude Code configuration
├── app/                  # Next.js App Router pages
│   ├── api/             # API routes
│   └── (routes)/        # Page routes
├── lib/                  # Shared libraries
│   ├── api/middleware/  # Error handling, validation
│   ├── config/          # Environment and app configuration
│   └── types/           # TypeScript types
├── components/           # React components
│   ├── ui/              # Generic UI components
│   └── [feature]/       # Feature-specific components
├── hooks/                # Custom React hooks
├── types/                # Global TypeScript types
└── public/               # Static assets
```

## Critical Files

| File | Purpose |
|------|---------|
| `lib/api/middleware/error-handler.ts` | Centralized error handling |
| `lib/api/middleware/validation.ts` | Zod request validation |
| `lib/api/middleware/request-context.ts` | Correlation ID tracking |
| `lib/api/response.ts` | Standardized API responses |
| `lib/logger.ts` | Structured logging |
| `lib/supabase.ts` | Supabase client configuration |

## Code Patterns

### API Route Pattern
```typescript
import { withErrorHandling } from '@/lib/api/middleware/error-handler';
import { validateBody } from '@/lib/api/middleware/validation';
import { withRequestContext } from '@/lib/api/middleware/request-context';
import { APIResponse } from '@/lib/api/response';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export const POST = withRequestContext(
  withErrorHandling(async (request) => {
    const data = await validateBody(request, schema);
    // Handler code
    return APIResponse.success({ id: 1, ...data });
  })
);
```

### Supabase Data Access
```typescript
import { supabase } from '@/lib/supabase';

// Fetch data
const { data: users, error } = await supabase
  .from('users')
  .select('*')
  .eq('is_active', true);

// Insert data
const { data: newUser, error } = await supabase
  .from('users')
  .insert({ name: 'John', email: 'john@example.com' })
  .select()
  .single();
```

## Environment Variables

Required in `.env.local`:
```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

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
```

## Session Workflow

### Starting a Session
1. `/status` - Check overall project health
2. Review recent changes with `git log -5 --oneline`
3. Check for any failing tests

### During Development
- Use TodoWrite for multi-step tasks (>3 steps)
- Commit frequently with meaningful messages
- Run tests before major changes
- Follow existing patterns in the codebase

### Before Ending
- Run `npm run build` to verify everything compiles
- Commit any work in progress to a feature branch

## Quality Standards

### Before Marking Complete
- [ ] TypeScript compiles without errors (`npm run type-check`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Tests pass (`npm run test`)
- [ ] App builds successfully (`npm run build`)
- [ ] No console errors in browser

### Commit Message Format
```
type: brief description

- Detail 1
- Detail 2

[Generated with Claude Code]
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

---

**Last Updated:** [Date]
