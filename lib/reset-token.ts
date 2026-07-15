import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

const TOKEN_TTL_MS = 60 * 60 * 1000;

function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

export async function createResetToken(email: string): Promise<string> {
  const identifier = email.toLowerCase();
  await prisma.verificationToken.deleteMany({ where: { identifier } });

  const rawToken = crypto.randomBytes(32).toString('hex');
  await prisma.verificationToken.create({
    data: {
      identifier,
      token: hashToken(rawToken),
      expires: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  return rawToken;
}

export async function consumeResetToken(email: string, rawToken: string): Promise<boolean> {
  const identifier = email.toLowerCase();
  const record = await prisma.verificationToken.findUnique({
    where: { token: hashToken(rawToken) },
  });

  if (!record || record.identifier !== identifier || record.expires < new Date()) {
    return false;
  }

  await prisma.verificationToken.deleteMany({ where: { identifier } });
  return true;
}
