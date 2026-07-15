import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/utils';
import { resetPasswordSchema } from '@/lib/validations';
import { consumeResetToken } from '@/lib/reset-token';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, token } = body as { email?: string; token?: string };

    if (!email || !token) {
      return NextResponse.json(apiError('This reset link is invalid or has expired'), { status: 400 });
    }

    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(apiError(parsed.error.issues[0].message), { status: 400 });
    }

    const valid = await consumeResetToken(email, token);
    if (!valid) {
      return NextResponse.json(apiError('This reset link is invalid or has expired'), { status: 400 });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { passwordHash, passwordChangedAt: new Date() },
    });

    return NextResponse.json(apiSuccess(null));
  } catch {
    return NextResponse.json(apiError('This reset link is invalid or has expired'), { status: 400 });
  }
}
