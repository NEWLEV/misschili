import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

// Cheap liveness/readiness check for uptime monitors and load balancers —
// confirms the app process is up and can actually reach the database, not
// just that Next.js is responding.
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'ok', database: 'ok', timestamp: new Date().toISOString() });
  } catch (error) {
    logger.error({ err: error }, '[Health] Database check failed');
    return NextResponse.json(
      { status: 'error', database: 'unreachable', timestamp: new Date().toISOString() },
      { status: 503 }
    );
  }
}
