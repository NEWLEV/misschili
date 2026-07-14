import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { newsletterSchema } from '@/lib/validations';
import { apiSuccess, apiError } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = newsletterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(apiError(parsed.error.issues[0].message), { status: 400 });
    }

    const { email, source } = parsed.data;

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(apiSuccess({ message: 'Already subscribed' }));
    }

    const subscriber = await prisma.newsletterSubscriber.create({
      data: {
        email: email.toLowerCase(),
        source: source || 'footer',
        isConfirmed: true,
      },
    });

    return NextResponse.json(apiSuccess({ id: subscriber.id }), { status: 201 });
  } catch (error) {
    console.error('[Newsletter] Subscription error:', error);
    return NextResponse.json(apiError('Failed to subscribe. Please try again.'), { status: 500 });
  }
}
