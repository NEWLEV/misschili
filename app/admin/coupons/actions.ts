'use server';

import { prisma } from '@/lib/prisma';
import { couponSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

function parseCouponForm(formData: FormData) {
  return couponSchema.safeParse({
    code: formData.get('code'),
    type: formData.get('type'),
    value: formData.get('value'),
    minOrderAmount: formData.get('minOrderAmount') || null,
    maxUses: formData.get('maxUses') || null,
    maxUsesPerUser: formData.get('maxUsesPerUser') || 1,
    isActive: formData.get('isActive') === 'on',
    startsAt: formData.get('startsAt') || null,
    expiresAt: formData.get('expiresAt') || null,
  });
}

export async function createCoupon(formData: FormData) {
  const parsed = parseCouponForm(formData);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const coupon = await prisma.coupon.create({ data: parsed.data });

  revalidatePath('/admin/coupons');
  redirect(`/admin/coupons/${coupon.id}`);
}

export async function updateCoupon(couponId: string, formData: FormData) {
  const parsed = parseCouponForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  await prisma.coupon.update({ where: { id: couponId }, data: parsed.data });

  revalidatePath(`/admin/coupons/${couponId}`);
  revalidatePath('/admin/coupons');
  return { success: true };
}
