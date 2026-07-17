'use server';

import { prisma } from '@/lib/prisma';
import { popupSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdminRole, ROLE_GROUPS } from '@/lib/admin-auth';
import { writeAuditLog } from '@/lib/audit-log';

function parsePopupForm(formData: FormData) {
  return popupSchema.safeParse({
    type: formData.get('type'),
    title: formData.get('title'),
    message: formData.get('message'),
    imageUrl: formData.get('imageUrl') || '',
    ctaText: formData.get('ctaText') || undefined,
    ctaUrl: formData.get('ctaUrl') || '',
    discountCode: formData.get('discountCode') || undefined,
    isActive: formData.get('isActive') === 'on',
    frequency: formData.get('frequency'),
    startDate: formData.get('startDate') || null,
    endDate: formData.get('endDate') || null,
    targetPage: formData.get('targetPage') || undefined,
  });
}

export async function createPopup(formData: FormData) {
  const session = await requireAdminRole(ROLE_GROUPS.CONTENT_WRITE);

  const parsed = parsePopupForm(formData);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const popup = await prisma.$transaction(async (tx) => {
    const created = await tx.popup.create({
      data: { ...parsed.data, imageUrl: parsed.data.imageUrl || null, ctaUrl: parsed.data.ctaUrl || null },
    });
    if (created.isActive) {
      await tx.popup.updateMany({
        where: { id: { not: created.id }, isActive: true },
        data: { isActive: false },
      });
    }
    return created;
  });

  await writeAuditLog({ session, action: 'popup.created', targetType: 'Popup', targetId: popup.id, after: { title: popup.title, type: popup.type, isActive: popup.isActive } });

  revalidatePath('/admin/popups');
  redirect(`/admin/popups/${popup.id}`);
}

export async function updatePopup(popupId: string, formData: FormData) {
  const session = await requireAdminRole(ROLE_GROUPS.CONTENT_WRITE);

  const parsed = parsePopupForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  await prisma.$transaction(async (tx) => {
    await tx.popup.update({
      where: { id: popupId },
      data: { ...parsed.data, imageUrl: parsed.data.imageUrl || null, ctaUrl: parsed.data.ctaUrl || null },
    });
    if (parsed.data.isActive) {
      await tx.popup.updateMany({
        where: { id: { not: popupId }, isActive: true },
        data: { isActive: false },
      });
    }
  });

  await writeAuditLog({ session, action: 'popup.updated', targetType: 'Popup', targetId: popupId, after: { title: parsed.data.title, isActive: parsed.data.isActive } });

  revalidatePath(`/admin/popups/${popupId}`);
  revalidatePath('/admin/popups');
  return { success: true };
}

export async function togglePopupActive(popupId: string, isActive: boolean) {
  const session = await requireAdminRole(ROLE_GROUPS.CONTENT_WRITE);

  await prisma.$transaction(async (tx) => {
    await tx.popup.update({ where: { id: popupId }, data: { isActive } });
    if (isActive) {
      await tx.popup.updateMany({
        where: { id: { not: popupId }, isActive: true },
        data: { isActive: false },
      });
    }
  });

  await writeAuditLog({ session, action: 'popup.toggled', targetType: 'Popup', targetId: popupId, after: { isActive } });

  revalidatePath('/admin/popups');
}
