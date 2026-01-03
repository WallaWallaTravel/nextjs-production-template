import { NextResponse } from 'next/server';

import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    name: string;
    status: 'pass' | 'fail';
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

  // Determine overall status
  const hasFailure = checks.some((c) => c.status === 'fail');
  const overallStatus: HealthStatus['status'] = hasFailure ? 'unhealthy' : 'healthy';

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
