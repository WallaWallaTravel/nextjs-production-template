import { NextResponse } from 'next/server';

import { logger } from '@/lib/logger';
import { redis } from '@/lib/redis';
import { supabase } from '@/lib/supabase';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    name: string;
    status: 'pass' | 'fail' | 'warn';
    message?: string;
    responseTime?: number;
  }[];
}

export async function GET() {
  const startTime = Date.now();
  const checks: HealthStatus['checks'] = [];

  // Check Supabase connection
  try {
    const supabaseStart = Date.now();
    const { error } = await supabase.from('_health_check').select('*').limit(1);

    // Table doesn't exist is fine - we just want to verify connection
    if (error && !error.message.includes('does not exist')) {
      throw error;
    }

    checks.push({
      name: 'database',
      status: 'pass',
      message: 'Supabase connection successful',
      responseTime: Date.now() - supabaseStart,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    checks.push({
      name: 'database',
      status: 'fail',
      message: `Supabase connection failed: ${message}`,
    });
    logger.error('Health check: Supabase connection failed', { error: message });
  }

  // Check Redis connection
  try {
    const redisStatus = redis.getStatus();
    checks.push({
      name: 'redis',
      status: redisStatus.available ? 'pass' : 'warn',
      message: redisStatus.available
        ? `Redis connected (${redisStatus.mode})`
        : 'Using in-memory fallback',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    checks.push({
      name: 'redis',
      status: 'warn',
      message: `Redis check failed, using fallback: ${message}`,
    });
  }

  // Determine overall status
  const hasFailure = checks.some((c) => c.status === 'fail');
  const hasWarning = checks.some((c) => c.status === 'warn');

  const overallStatus: HealthStatus['status'] = hasFailure
    ? 'unhealthy'
    : hasWarning
      ? 'degraded'
      : 'healthy';

  const response: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    checks,
  };

  const httpStatus = overallStatus === 'unhealthy' ? 503 : 200;

  logger.info('Health check completed', {
    status: overallStatus,
    duration: Date.now() - startTime,
  });

  return NextResponse.json(response, { status: httpStatus });
}
