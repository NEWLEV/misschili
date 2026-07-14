import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess } from '@/lib/utils';

export async function GET() {
  try {
    const now = new Date();

    const popups = await prisma.popup.findMany({
      where: {
        isActive: true,
        OR: [
          { startDate: null, endDate: null },
          { startDate: { lte: now }, endDate: null },
          { startDate: null, endDate: { gte: now } },
          { startDate: { lte: now }, endDate: { gte: now } },
        ],
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(apiSuccess(popups));
  } catch {
    return NextResponse.json(apiSuccess([]));
  }
}
