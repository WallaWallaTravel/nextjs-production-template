# Production-Ready Next.js Template

A professional-grade Next.js 15 template with built-in reliability infrastructure, designed for production deployments.

## Features

- **Next.js 15** with App Router and React 19
- **TypeScript** with strict mode configuration
- **Supabase** integration for database and auth
- **Distributed Rate Limiting** with Redis (Upstash) + in-memory fallback
- **Circuit Breaker Pattern** for graceful degradation
- **Correlation ID Tracking** for distributed tracing
- **Structured Logging** with environment-aware levels
- **Standardized API Responses** with error handling
- **Zod Validation** for request validation
- **Claude Code Integration** with project-specific commands

## Quick Start

```bash
# Clone this template
git clone <repo-url> my-project
cd my-project

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Configure your Supabase credentials in .env.local

# Run development server
npm run dev
```

## Project Structure

```
├── .claude/                 # Claude Code configuration
│   ├── CLAUDE.md           # Project context
│   ├── commands/           # Slash commands
│   └── settings.local.json # Permissions
├── app/                     # Next.js App Router
│   ├── api/                # API routes
│   └── (pages)/            # Page routes
├── lib/
│   ├── services/           # Business logic (BaseService)
│   ├── api/middleware/     # Error handling, validation, rate limiting
│   ├── config/             # Environment and app config
│   ├── logger.ts           # Structured logging
│   ├── redis.ts            # Redis with fallback
│   └── supabase.ts         # Supabase client
├── components/              # React components
└── types/                   # TypeScript types
```

## Reliability Infrastructure

### Rate Limiting

Pre-configured rate limiters for different use cases:

```typescript
import { withRateLimit, rateLimiters } from '@/lib/api/middleware/rate-limit';

// Auth endpoints: 5 requests per 15 minutes
export const POST = withRateLimit(rateLimiters.auth)(handler);

// General API: 100 requests per minute
export const GET = withRateLimit(rateLimiters.api)(handler);

// Payment endpoints: 10 requests per minute
export const POST = withRateLimit(rateLimiters.payment)(handler);
```

### Error Handling

Consistent error responses with custom error classes:

```typescript
import { withErrorHandling, NotFoundError } from '@/lib/api/middleware/error-handler';

export const GET = withErrorHandling(async (request) => {
  const item = await findItem(id);
  if (!item) {
    throw new NotFoundError('Item', id);
  }
  return APIResponse.success(item);
});
```

### Request Validation

Zod-powered request validation:

```typescript
import { validateBody } from '@/lib/api/middleware/validation';

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

export const POST = withErrorHandling(async (request) => {
  const data = await validateBody(request, CreateUserSchema);
  // data is typed as { email: string; name: string }
});
```

### Correlation IDs

Automatic request tracing:

```typescript
import { withRequestContext } from '@/lib/api/middleware/request-context';

export const GET = withRequestContext(handler);
// Response includes x-request-id header
// All logs include requestId
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | TypeScript type checking |
| `npm run test` | Run Jest tests |
| `npm run test:coverage` | Run tests with coverage |

## Environment Variables

See `.env.example` for all available configuration options.

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**Optional:**
- `UPSTASH_REDIS_REST_URL` - For distributed rate limiting
- `UPSTASH_REDIS_REST_TOKEN`
- `RESEND_API_KEY` - For email
- `STRIPE_SECRET_KEY` - For payments

## Claude Code Commands

This template includes Claude Code integration:

| Command | Description |
|---------|-------------|
| `/status` | Check project health |
| `/quality-check` | Run all quality checks |
| `/security-check` | Security audit |
| `/test-status` | Test coverage report |

## License

MIT
