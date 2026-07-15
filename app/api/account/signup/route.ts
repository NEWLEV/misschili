import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/utils';
import { registerSchema } from '@/lib/validations';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(apiError(parsed.error.issues[0].message), { status: 400 });
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json(apiError('An account with this email already exists'), { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        passwordChangedAt: new Date(),
      },
    });

    sendWelcomeEmail(normalizedEmail, name).catch(() => {});

    return NextResponse.json(apiSuccess(null));
  } catch {
    return NextResponse.json(apiError('Something went wrong. Please try again.'), { status: 500 });
  }
}
