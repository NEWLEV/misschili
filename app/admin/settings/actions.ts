'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Upserts one SiteSetting row per form field, keyed by field name.
export async function updateSiteSettings(revalidateAdminPath: string, formData: FormData) {
  const entries = Array.from(formData.entries()) as [string, string][];

  await Promise.all(
    entries.map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value, type: 'STRING' },
      })
    )
  );

  revalidatePath(revalidateAdminPath);
  revalidatePath('/');
  return { success: true };
}
