import { describe, it, expect } from 'vitest';
import {
  productSchema,
  couponSchema,
  checkoutSchema,
  orderStatusSchema,
  registerSchema,
} from './index';

describe('productSchema', () => {
  const valid = {
    name: 'Ghost Pepper Fury',
    slug: 'ghost-pepper-fury',
    description: 'A very hot sauce indeed.',
    sku: 'GPF-001',
    basePrice: 9.99,
    status: 'ACTIVE',
  };

  it('accepts a valid product', () => {
    expect(productSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects a slug with uppercase or spaces', () => {
    expect(productSchema.safeParse({ ...valid, slug: 'Not A Slug' }).success).toBe(false);
  });

  it('rejects a non-positive price', () => {
    expect(productSchema.safeParse({ ...valid, basePrice: 0 }).success).toBe(false);
    expect(productSchema.safeParse({ ...valid, basePrice: -5 }).success).toBe(false);
  });

  it('rejects a description under 10 characters', () => {
    expect(productSchema.safeParse({ ...valid, description: 'short' }).success).toBe(false);
  });
});

describe('couponSchema', () => {
  const base = { code: 'SAVE10', type: 'PERCENTAGE' as const, value: 10 };

  it('accepts a valid percentage coupon', () => {
    expect(couponSchema.safeParse(base).success).toBe(true);
  });

  it('rejects a percentage discount over 100', () => {
    expect(couponSchema.safeParse({ ...base, value: 150 }).success).toBe(false);
  });

  it('allows a fixed-amount discount over 100', () => {
    expect(couponSchema.safeParse({ ...base, type: 'FIXED', value: 150 }).success).toBe(true);
  });

  it('uppercases the code', () => {
    const result = couponSchema.safeParse({ ...base, code: 'save10' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.code).toBe('SAVE10');
  });
});

describe('checkoutSchema', () => {
  const valid = {
    contact: { email: 'buyer@example.com', firstName: 'Ada', lastName: 'Lovelace' },
    shippingAddress: { address1: '1 Main St', city: 'Miami', state: 'FL', zipCode: '33186' },
    shippingMethod: 'standard',
  };

  it('accepts a valid checkout payload', () => {
    expect(checkoutSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects an invalid email', () => {
    expect(
      checkoutSchema.safeParse({ ...valid, contact: { ...valid.contact, email: 'not-an-email' } }).success
    ).toBe(false);
  });

  it('rejects a missing shipping method', () => {
    expect(checkoutSchema.safeParse({ ...valid, shippingMethod: '' }).success).toBe(false);
  });
});

describe('orderStatusSchema', () => {
  it('accepts a known status', () => {
    expect(orderStatusSchema.safeParse({ status: 'SHIPPED' }).success).toBe(true);
  });

  it('rejects an unknown status', () => {
    expect(orderStatusSchema.safeParse({ status: 'ON_THE_MOON' }).success).toBe(false);
  });

  it('accepts an empty tracking URL', () => {
    expect(orderStatusSchema.safeParse({ status: 'SHIPPED', trackingUrl: '' }).success).toBe(true);
  });
});

describe('registerSchema', () => {
  it('rejects mismatched passwords', () => {
    const result = registerSchema.safeParse({
      name: 'Ada',
      email: 'ada@example.com',
      password: 'password123',
      confirmPassword: 'different',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a password under 8 characters', () => {
    const result = registerSchema.safeParse({
      name: 'Ada',
      email: 'ada@example.com',
      password: 'short',
      confirmPassword: 'short',
    });
    expect(result.success).toBe(false);
  });
});
