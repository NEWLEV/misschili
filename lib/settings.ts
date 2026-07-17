import { prisma } from '@/lib/prisma';

export interface StoreSettings {
  taxRate: number;
  freeShippingThreshold: number;
  flatShippingRate: number;
  currency: string;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  taxRate: 0.07,
  freeShippingThreshold: 50,
  flatShippingRate: 7.99,
  currency: 'USD',
};

const KEYS = ['tax_rate', 'free_shipping_threshold', 'flat_shipping_rate', 'currency'] as const;

// Single source of truth for pricing settings — read by both the checkout API
// (authoritative) and the public settings endpoint (client-side display), so
// the two can never drift the way the old hardcoded checkout values could.
export async function getStoreSettings(): Promise<StoreSettings> {
  const rows = await prisma.siteSetting.findMany({ where: { key: { in: [...KEYS] } } });
  const get = (key: string) => rows.find((r) => r.key === key)?.value;

  const taxRate = Number(get('tax_rate'));
  const freeShippingThreshold = Number(get('free_shipping_threshold'));
  const flatShippingRate = Number(get('flat_shipping_rate'));

  return {
    taxRate: Number.isFinite(taxRate) && taxRate >= 0 ? taxRate : DEFAULT_STORE_SETTINGS.taxRate,
    freeShippingThreshold: Number.isFinite(freeShippingThreshold) && freeShippingThreshold >= 0
      ? freeShippingThreshold
      : DEFAULT_STORE_SETTINGS.freeShippingThreshold,
    flatShippingRate: Number.isFinite(flatShippingRate) && flatShippingRate >= 0
      ? flatShippingRate
      : DEFAULT_STORE_SETTINGS.flatShippingRate,
    currency: get('currency') || DEFAULT_STORE_SETTINGS.currency,
  };
}
