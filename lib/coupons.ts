import { prisma } from '@/lib/prisma';

interface CouponValidationResult {
  valid: boolean;
  error?: string;
  couponId?: string;
  code?: string;
  discountAmount?: number;
}

export async function validateCoupon(
  rawCode: string,
  subtotal: number,
  userId?: string | null
): Promise<CouponValidationResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { valid: false, error: 'Please enter a coupon code' };

  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon || !coupon.isActive) {
    return { valid: false, error: 'Invalid coupon code' };
  }

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) {
    return { valid: false, error: 'This coupon is not active yet' };
  }
  if (coupon.expiresAt && coupon.expiresAt < now) {
    return { valid: false, error: 'This coupon has expired' };
  }
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, error: 'This coupon has reached its usage limit' };
  }
  if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
    return {
      valid: false,
      error: `This coupon requires a minimum order of $${Number(coupon.minOrderAmount).toFixed(2)}`,
    };
  }

  if (userId) {
    const usageCount = await prisma.couponUsage.count({ where: { userId, couponId: coupon.id } });
    if (usageCount >= coupon.maxUsesPerUser) {
      return { valid: false, error: 'You have already used this coupon' };
    }
  }

  const discountAmount = coupon.type === 'PERCENTAGE'
    ? Math.round(subtotal * (Number(coupon.value) / 100) * 100) / 100
    : Math.min(Number(coupon.value), subtotal);

  return { valid: true, couponId: coupon.id, code: coupon.code, discountAmount };
}
