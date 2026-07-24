'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireAdminRole, ROLE_GROUPS } from '@/lib/admin-auth';
import { writeAuditLog } from '@/lib/audit-log';
import { storeSettingsSchema } from '@/lib/validations';

// Upserts one SiteSetting row per field in storeSettingsSchema, keyed by
// field name. Validated against an explicit allowlist (rather than blindly
// upserting whatever field names arrive in the FormData) so a malformed
// request can't write arbitrary SiteSetting rows.
export async function updateSiteSettings(revalidateAdminPath: string, formData: FormData): Promise<void> {
  const session = await requireAdminRole(ROLE_GROUPS.SETTINGS_WRITE);

  const parsed = storeSettingsSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const entries = Object.entries(parsed.data) as [string, string | number][];

  const before = await prisma.siteSetting.findMany({ where: { key: { in: entries.map(([key]) => key) } } });
  const beforeMap = Object.fromEntries(before.map((s) => [s.key, s.value]));

  await Promise.all(
    entries.map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value), type: 'STRING' },
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
}
