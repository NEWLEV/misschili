import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { validateCoupon } from '@/lib/coupons';
import { apiSuccess, apiError } from '@/lib/utils';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const session = await auth();
    const result = await validateCoupon(
      String(body.code || ''),
      Number(body.subtotal) || 0,
      session?.user?.id,
      body.email ? String(body.email) : null
    );

    if (!result.valid) {
      return NextResponse.json(apiError(result.error || 'Invalid coupon code'), { status: 400 });
    }

    return NextResponse.json(apiSuccess({ couponId: result.couponId, code: result.code, discountAmount: result.discountAmount }));
  } catch (error) {
    logger.error({ err: error }, '[Coupon Validate] Error');
    return NextResponse.json(apiError('Failed to validate coupon'), { status: 500 });
  }
}
