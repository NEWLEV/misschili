import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/utils';
import { forgotPasswordSchema } from '@/lib/validations';
import { createResetToken } from '@/lib/reset-token';
import { sendPasswordResetEmail } from '@/lib/email';

const GENERIC_RESPONSE = apiSuccess(null);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(apiError(parsed.error.issues[0].message), { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const rawToken = await createResetToken(email);
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/account/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;
      // Don't await — keeps response timing similar whether or not the
      // account exists, avoiding an email-enumeration timing signal.
      sendPasswordResetEmail(email, resetUrl).catch(() => {});
    }

    return NextResponse.json(GENERIC_RESPONSE);
  } catch {
    return NextResponse.json(GENERIC_RESPONSE);
  }
}
