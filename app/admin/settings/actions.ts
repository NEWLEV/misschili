'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireAdminRole, ROLE_GROUPS } from '@/lib/admin-auth';
import { writeAuditLog } from '@/lib/audit-log';

// Upserts one SiteSetting row per form field, keyed by field name.
export async function updateSiteSettings(revalidateAdminPath: string, formData: FormData) {
  const session = await requireAdminRole(ROLE_GROUPS.SETTINGS_WRITE);

  const entries = Array.from(formData.entries()) as [string, string][];

  const before = await prisma.siteSetting.findMany({ where: { key: { in: entries.map(([key]) => key) } } });
  const beforeMap = Object.fromEntries(before.map((s) => [s.key, s.value]));

  await Promise.all(
    entries.map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value, type: 'STRING' },
      })
    )
  );

  await writeAuditLog({
    session,
    action: 'settings.updated',
    targetType: 'SiteSetting',
    targetId: entries.map(([key]) => key).join(','),
    before: beforeMap,
    after: Object.fromEntries(entries),
  });

  revalidatePath(revalidateAdminPath);
  revalidatePath('/');
  return { success: true };
}
