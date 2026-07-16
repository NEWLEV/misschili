'use server';

import { prisma } from '@/lib/prisma';
import { popupSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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
  const parsed = parsePopupForm(formData);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const popup = await prisma.popup.create({
    data: { ...parsed.data, imageUrl: parsed.data.imageUrl || null, ctaUrl: parsed.data.ctaUrl || null },
  });

  revalidatePath('/admin/popups');
  redirect(`/admin/popups/${popup.id}`);
}

export async function updatePopup(popupId: string, formData: FormData) {
  const parsed = parsePopupForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  await prisma.popup.update({
    where: { id: popupId },
    data: { ...parsed.data, imageUrl: parsed.data.imageUrl || null, ctaUrl: parsed.data.ctaUrl || null },
  });

  revalidatePath(`/admin/popups/${popupId}`);
  revalidatePath('/admin/popups');
  return { success: true };
}
