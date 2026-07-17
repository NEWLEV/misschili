import { describe, it, expect, vi, beforeEach } from 'vitest';

const findUnique = vi.fn();
const count = vi.fn();
const orderCount = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    coupon: { findUnique: (...args: unknown[]) => findUnique(...args) },
    couponUsage: { count: (...args: unknown[]) => count(...args) },
    order: { count: (...args: unknown[]) => orderCount(...args) },
  },
}));

const { validateCoupon } = await import('./coupons');

function makeCoupon(overrides: Record<string, unknown> = {}) {
  return {
    id: 'coupon-1',
    code: 'SAVE10',
    type: 'PERCENTAGE',
    value: 10,
    minOrderAmount: null,
    maxUses: null,
    usedCount: 0,
    maxUsesPerUser: 1,
    isActive: true,
    startsAt: null,
    expiresAt: null,
    ...overrides,
  };
}

describe('validateCoupon', () => {
  beforeEach(() => {
    findUnique.mockReset();
    count.mockReset();
    orderCount.mockReset();
  });

  it('rejects an empty code without touching the database', async () => {
    const result = await validateCoupon('', 100);
    expect(result.valid).toBe(false);
    expect(findUnique).not.toHaveBeenCalled();
  });

  it('rejects an unknown code', async () => {
    findUnique.mockResolvedValue(null);
    const result = await validateCoupon('NOPE', 100);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/invalid/i);
  });

  it('rejects an inactive coupon', async () => {
    findUnique.mockResolvedValue(makeCoupon({ isActive: false }));
    const result = await validateCoupon('SAVE10', 100);
    expect(result.valid).toBe(false);
  });

  it('rejects a coupon before its start date', async () => {
    findUnique.mockResolvedValue(makeCoupon({ startsAt: new Date(Date.now() + 86_400_000) }));
    const result = await validateCoupon('SAVE10', 100);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/not active yet/i);
  });

  it('rejects an expired coupon', async () => {
    findUnique.mockResolvedValue(makeCoupon({ expiresAt: new Date(Date.now() - 86_400_000) }));
    const result = await validateCoupon('SAVE10', 100);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/expired/i);
  });

  it('rejects a coupon that has hit its global usage cap', async () => {
    findUnique.mockResolvedValue(makeCoupon({ maxUses: 5, usedCount: 5 }));
    const result = await validateCoupon('SAVE10', 100);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/usage limit/i);
  });

  it('rejects an order below the minimum order amount', async () => {
    findUnique.mockResolvedValue(makeCoupon({ minOrderAmount: 50 }));
    const result = await validateCoupon('SAVE10', 20);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/minimum order/i);
  });

  it('rejects a logged-in user who already used a single-use coupon', async () => {
    findUnique.mockResolvedValue(makeCoupon({ maxUsesPerUser: 1 }));
    count.mockResolvedValue(1);
    const result = await validateCoupon('SAVE10', 100, 'user-1');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/already used/i);
  });

  it('computes a percentage discount correctly', async () => {
    findUnique.mockResolvedValue(makeCoupon({ type: 'PERCENTAGE', value: 20 }));
    const result = await validateCoupon('SAVE10', 100);
    expect(result.valid).toBe(true);
    expect(result.discountAmount).toBe(20);
  });

  it('caps a fixed discount at the subtotal so it can never go negative', async () => {
    findUnique.mockResolvedValue(makeCoupon({ type: 'FIXED', value: 500 }));
    const result = await validateCoupon('SAVE10', 30);
    expect(result.valid).toBe(true);
    expect(result.discountAmount).toBe(30);
  });

  it('skips the per-user check for a guest with no email on file', async () => {
    findUnique.mockResolvedValue(makeCoupon());
    const result = await validateCoupon('SAVE10', 100, null);
    expect(result.valid).toBe(true);
    expect(count).not.toHaveBeenCalled();
    expect(orderCount).not.toHaveBeenCalled();
  });

  it('rejects a guest who already used a single-use coupon under the same email', async () => {
    findUnique.mockResolvedValue(makeCoupon({ maxUsesPerUser: 1 }));
    orderCount.mockResolvedValue(1);
    const result = await validateCoupon('SAVE10', 100, null, 'shopper@example.com');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/already been used/i);
    expect(count).not.toHaveBeenCalled();
  });

  it('allows a guest who has not used the coupon yet under that email', async () => {
    findUnique.mockResolvedValue(makeCoupon({ maxUsesPerUser: 1 }));
    orderCount.mockResolvedValue(0);
    const result = await validateCoupon('SAVE10', 100, null, 'NewShopper@Example.com');
    expect(result.valid).toBe(true);
    expect(orderCount).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ guestEmail: 'newshopper@example.com' }) })
    );
  });
});
