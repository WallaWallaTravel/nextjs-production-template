/**
 * Health API Route Tests
 */

import { GET } from '@/app/api/health/route';
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('@/lib/redis', () => ({
  redis: {
    getStatus: jest.fn(() => ({ available: true, mode: 'memory' })),
  },
}));

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
    const request = new NextRequest('http://localhost:3000/api/health');
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

  it('includes health checks for database and redis', async () => {
    const response = await GET();
    const data = await response.json();

    const checkNames = data.checks.map((c: { name: string }) => c.name);
    expect(checkNames).toContain('database');
    expect(checkNames).toContain('redis');
  });
});
