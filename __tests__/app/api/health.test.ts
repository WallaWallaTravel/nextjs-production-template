/**
 * Health API Route Tests
 */

import { GET } from '@/app/api/health/route';

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('GET /api/health', () => {
  it('returns healthy status when all services are up', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBeDefined();
    expect(data.timestamp).toBeDefined();
    expect(data.checks).toBeInstanceOf(Array);
  });

  it('includes version in response', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.version).toBeDefined();
  });

  it('includes health check for database', async () => {
    const response = await GET();
    const data = await response.json();

    const checkNames = data.checks.map((c: { name: string }) => c.name);
    expect(checkNames).toContain('database');
  });

  it('returns valid ISO timestamp', async () => {
    const response = await GET();
    const data = await response.json();

    const timestamp = new Date(data.timestamp);
    expect(timestamp).toBeInstanceOf(Date);
    expect(isNaN(timestamp.getTime())).toBe(false);
  });
});
