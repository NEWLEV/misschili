'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireAdminRole, ROLE_GROUPS } from '@/lib/admin-auth';
import { writeAuditLog } from '@/lib/audit-log';

export async function deleteSubscriber(subscriberId: string) {
  const session = await requireAdminRole(ROLE_GROUPS.MARKETING_WRITE);

  const before = await prisma.newsletterSubscriber.findUnique({ where: { id: subscriberId }, select: { email: true } });

  await prisma.newsletterSubscriber.delete({ where: { id: subscriberId } });

  await writeAuditLog({
    session,
    action: 'subscriber.deleted',
    targetType: 'NewsletterSubscriber',
    targetId: subscriberId,
    before,
  });

  revalidatePath('/admin/subscribers');
  return { success: true };
}
