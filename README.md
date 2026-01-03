# Production-Ready Next.js Template

A comprehensive Next.js 15 template with full-stack infrastructure, designed to start building immediately.

## Features

### Core Stack
- **Next.js 15** with App Router and React 19
- **TypeScript** with strict mode
- **Tailwind CSS** for styling
- **Supabase** for database, auth, and file storage

### Authentication
- Supabase Auth with SSR support
- Protected route middleware
- Login/signup pages ready to use
- OAuth callback handling
- `useAuth` hook for client-side auth

### UI Components
- **Button** - Variants (primary, secondary, outline, ghost, danger), sizes, loading state
- **Input/Textarea** - Label, error, and hint support
- **Card** - With header, content, and footer
- **Modal** - Standard and confirmation dialogs
- **Toast** - Notification system with auto-dismiss
- **Spinner** - Loading indicators
- **Skeleton** - Content loading placeholders

### Data Fetching
- **React Query** (TanStack Query v5)
- Typed API client with error handling
- Custom hooks: `useApiQuery`, `useApiMutation`, `usePaginatedQuery`
- Optimistic update support

### Forms
- **React Hook Form** with Zod validation
- Reusable form components: Input, Select, Checkbox, Radio
- Automatic error display

### State Management
- **Zustand** with immer middleware
- Example stores included
- `createEntityStore` factory for CRUD operations

### Reliability Infrastructure
- **Rate Limiting** - Redis (Upstash) with in-memory fallback
- **Circuit Breaker** - Graceful degradation
- **Correlation IDs** - Request tracing
- **Structured Logging** - Environment-aware levels
- **Error Handling** - Standardized API responses

### Additional Features
- **Email** - Resend integration with templates
- **File Storage** - Supabase Storage helpers
- **SEO** - Metadata generators, sitemap, robots.txt
- **Testing** - Jest setup with example tests

## Quick Start

```bash
# Clone this template
git clone https://github.com/WallaWallaTravel/nextjs-production-template.git my-project
cd my-project

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Configure your credentials in .env.local

# Run development server
npm run dev
```

## Project Structure

```
├── .claude/                 # Claude Code configuration
├── app/
│   ├── (auth)/             # Auth pages (login, signup)
│   ├── api/v1/             # API routes
│   ├── auth/callback/      # OAuth callback
│   └── dashboard/          # Protected example page
├── components/
│   ├── ui/                 # UI components
│   ├── forms/              # Form components
│   └── providers/          # React providers
├── hooks/                   # Custom hooks
├── lib/
│   ├── api/                # API client and middleware
│   ├── auth/               # Auth utilities
│   ├── config/             # Configuration
│   ├── email/              # Email templates
│   ├── reliability/        # Circuit breaker
│   ├── seo/                # SEO helpers
│   ├── services/           # Base service class
│   ├── storage/            # File upload helpers
│   └── store/              # Zustand stores
├── types/                   # TypeScript types
└── __tests__/              # Test files
```

## Usage Examples

### Authentication

```tsx
// Client-side auth
import { useAuth } from '@/hooks/useAuth';

function LoginButton() {
  const { signIn, isLoading } = useAuth();

  const handleLogin = async () => {
    await signIn('user@example.com', 'password');
  };

  return <Button onClick={handleLogin} loading={isLoading}>Login</Button>;
}

// Server-side protected route
import { requireAuth } from '@/lib/auth';

export default async function DashboardPage() {
  const user = await requireAuth(); // Redirects if not authenticated
  return <h1>Welcome, {user.email}</h1>;
}
```

### UI Components

```tsx
import { Button, Card, Input, Modal, Toast, useToast } from '@/components/ui';

function MyComponent() {
  const { toast } = useToast();

  return (
    <Card>
      <CardHeader>
        <h2>Form</h2>
      </CardHeader>
      <CardContent>
        <Input label="Email" type="email" />
        <Button onClick={() => toast({ type: 'success', message: 'Saved!' })}>
          Submit
        </Button>
      </CardContent>
    </Card>
  );
}
```

### Data Fetching

```tsx
import { useApiQuery, useApiMutation } from '@/hooks/useApiQuery';

function UsersList() {
  const { data: users, isLoading } = useApiQuery<User[]>('users', '/api/v1/users');
  const createUser = useApiMutation<User>('/api/v1/users', 'POST', {
    invalidateKeys: ['users'],
  });

  if (isLoading) return <Skeleton />;

  return (
    <>
      {users?.map(user => <UserCard key={user.id} user={user} />)}
      <Button onClick={() => createUser.mutate({ name: 'New User' })}>
        Add User
      </Button>
    </>
  );
}
```

### Forms

```tsx
import { Form, FormInput, FormSelect } from '@/components/forms';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['admin', 'user']),
});

function CreateUserForm() {
  const handleSubmit = async (data: z.infer<typeof schema>) => {
    await api.post('/api/v1/users', data);
  };

  return (
    <Form schema={schema} onSubmit={handleSubmit}>
      <FormInput name="name" label="Name" />
      <FormSelect name="role" label="Role" options={[
        { value: 'admin', label: 'Admin' },
        { value: 'user', label: 'User' },
      ]} />
      <Button type="submit">Create</Button>
    </Form>
  );
}
```

### API Routes

```typescript
import { withErrorHandling } from '@/lib/api/middleware/error-handler';
import { validateBody } from '@/lib/api/middleware/validation';
import { withRateLimit, rateLimiters } from '@/lib/api/middleware/rate-limit';
import { withRequestContext } from '@/lib/api/middleware/request-context';
import { APIResponse } from '@/lib/api/response';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export const POST = withRequestContext(
  withRateLimit(rateLimiters.api)(
    withErrorHandling(async (request) => {
      const data = await validateBody(request, schema);
      // Your logic here
      return APIResponse.success({ id: 1, ...data });
    })
  )
);
```

### Email

```typescript
import { sendEmail, emailTemplates } from '@/lib/email';

// Send welcome email
await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome!',
  html: emailTemplates.welcome('John'),
});
```

### File Upload

```typescript
import { uploadFile, getPublicUrl } from '@/lib/storage';

// Upload a file
const result = await uploadFile('avatars', file, {
  contentType: file.type,
});

if (result.success) {
  const url = getPublicUrl('avatars', result.path);
}
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | TypeScript checking |
| `npm run test` | Run tests |
| `npm run test:coverage` | Tests with coverage |
| `npm run generate-types` | Generate Supabase types |

## Environment Variables

See `.env.example` for all options.

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**Optional:**
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` - Distributed rate limiting
- `RESEND_API_KEY` / `RESEND_FROM_EMAIL` - Email
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` - Payments

## Claude Code Commands

| Command | Description |
|---------|-------------|
| `/status` | Check project health |
| `/quality-check` | Run all quality checks |
| `/security-check` | Security audit |
| `/test-status` | Test coverage report |

## License

MIT
