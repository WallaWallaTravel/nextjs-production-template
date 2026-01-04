import '@testing-library/jest-dom';

// Mock environment variables for tests
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
// NODE_ENV is automatically set to 'test' by Jest

// Mock Next.js server modules globally
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    url: string;
    method: string;
    nextUrl: { pathname: string };
    headers: Map<string, string>;

    constructor(url: string, init?: { method?: string }) {
      this.url = url;
      this.method = init?.method || 'GET';
      this.nextUrl = { pathname: new URL(url).pathname };
      this.headers = new Map();
    }
  },
  NextResponse: {
    json: (data: unknown, init?: { status?: number; headers?: Record<string, string> }) => {
      const headers = new Map(Object.entries(init?.headers || {}));
      return {
        json: async () => data,
        status: init?.status || 200,
        headers: {
          get: (key: string) => headers.get(key),
          set: (key: string, value: string) => headers.set(key, value),
          has: (key: string) => headers.has(key),
          delete: (key: string) => headers.delete(key),
        },
      };
    },
    redirect: (url: string) => ({
      url,
      status: 307,
    }),
  },
}));

// Mock fetch globally
global.fetch = jest.fn();

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});
