# Architecture Overview

This document describes the system architecture of [Your App Name].

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | Next.js 15 (App Router) | Full-stack React framework |
| Database | Supabase (PostgreSQL) | Managed database with real-time |
| Auth | Supabase Auth | Authentication and authorization |
| Styling | Tailwind CSS | Utility-first CSS framework |
| Language | TypeScript | Type-safe JavaScript |
| Hosting | Vercel | Edge-first deployment |
| Monitoring | Sentry | Error tracking |
| Analytics | Vercel Analytics | Page views and Web Vitals |

## Directory Structure

```
project/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── health/        # Health check endpoint
│   │   └── v1/            # Versioned API routes
│   ├── (auth)/            # Auth-related pages
│   └── (dashboard)/       # Dashboard pages
├── components/             # React components
│   ├── ui/                # Generic UI (Button, Input, etc.)
│   └── [feature]/         # Feature-specific components
├── lib/                    # Shared utilities
│   ├── api/middleware/    # Error handling, validation
│   ├── auth/              # Auth helpers (client/server)
│   ├── config/            # Environment configuration
│   └── monitoring/        # Sentry utilities
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript type definitions
├── supabase/              # Database migrations
│   ├── migrations/        # SQL migration files
│   └── seed.sql           # Development seed data
└── docs/                   # Documentation
```

## Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   Next.js   │────▶│  Supabase   │
│   (React)   │◀────│  API Routes │◀────│ (PostgreSQL)│
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
   Analytics          Sentry Error         Real-time
   (Vercel)           Tracking             Subscriptions
```

## Key Design Patterns

### 1. API Route Pattern

All API routes use a consistent middleware stack:

```typescript
export const POST = withRequestContext(
  withErrorHandling(async (request) => {
    const data = await validateBody(request, schema);
    // ... handler logic
    return APIResponse.success(result);
  })
);
```

**Middleware stack provides:**
- Request correlation IDs for tracing
- Automatic error handling and logging
- Zod schema validation
- Standardized response format

### 2. Authentication Flow

```
User Login → Supabase Auth → JWT Token → Server Validation
                                              │
                                              ▼
                                    getServerUser() helper
```

- Client-side: `useAuth()` hook provides user state
- Server-side: `getServerUser()` validates session
- Protected routes: Middleware checks session before rendering

### 3. Error Handling

```
Error occurs → withErrorHandling catches → Logs to console/file
                                                │
                                                ▼
                                        Reports to Sentry (500s)
                                                │
                                                ▼
                                        Returns structured response
```

**Error response format:**
```json
{
  "success": false,
  "error": {
    "message": "Human-readable message",
    "code": "ERROR_CODE",
    "statusCode": 400
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "req_123"
}
```

## Security Considerations

1. **Environment Variables**: Sensitive values stored in env vars, validated at startup
2. **Row Level Security**: Supabase RLS policies enforce data access rules
3. **Input Validation**: All inputs validated with Zod schemas
4. **CORS**: Configured to allow only trusted origins
5. **Rate Limiting**: API routes protected against abuse

## Performance Optimizations

1. **Edge Caching**: Static pages cached at edge
2. **Image Optimization**: Next.js Image component
3. **Code Splitting**: Automatic per-route bundles
4. **Database Indexes**: Critical queries indexed
5. **Connection Pooling**: Supabase handles connection management

## Monitoring & Observability

| Tool | Purpose | Dashboard |
|------|---------|-----------|
| Sentry | Error tracking | [sentry.io](https://sentry.io) |
| Vercel Analytics | Page views, Web Vitals | Vercel Dashboard |
| Structured Logs | Request/error logging | Vercel Logs |

## Related Documents

- [DEPLOYMENT.md](./DEPLOYMENT.md) - How to deploy
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues
- [API.md](./API.md) - API reference
- [DATABASE.md](./DATABASE.md) - Schema documentation
