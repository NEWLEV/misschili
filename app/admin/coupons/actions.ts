'use server';

import { prisma } from '@/lib/prisma';
import { couponSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdminRole, ROLE_GROUPS } from '@/lib/admin-auth';
import { writeAuditLog } from '@/lib/audit-log';

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
  const session = await requireAdminRole(ROLE_GROUPS.MARKETING_WRITE);

  const parsed = parseCouponForm(formData);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const coupon = await prisma.coupon.create({ data: parsed.data });

  await writeAuditLog({
    session,
    action: 'coupon.created',
    targetType: 'Coupon',
    targetId: coupon.id,
    after: { code: coupon.code, type: coupon.type, value: Number(coupon.value), isActive: coupon.isActive },
  });

  revalidatePath('/admin/coupons');
  redirect(`/admin/coupons/${coupon.id}`);
}

export async function updateCoupon(couponId: string, formData: FormData) {
  const session = await requireAdminRole(ROLE_GROUPS.MARKETING_WRITE);

  const parsed = parseCouponForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const before = await prisma.coupon.findUnique({ where: { id: couponId }, select: { code: true, type: true, value: true, isActive: true } });

  const coupon = await prisma.coupon.update({ where: { id: couponId }, data: parsed.data });

  await writeAuditLog({
    session,
    action: 'coupon.updated',
    targetType: 'Coupon',
    targetId: couponId,
    before: before ? { code: before.code, type: before.type, value: Number(before.value), isActive: before.isActive } : null,
    after: { code: coupon.code, type: coupon.type, value: Number(coupon.value), isActive: coupon.isActive },
  });

  revalidatePath(`/admin/coupons/${couponId}`);
  revalidatePath('/admin/coupons');
  return { success: true };
}
