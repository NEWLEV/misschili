import { NextResponse } from 'next/server';
import { apiSuccess } from '@/lib/utils';
import { getStoreSettings } from '@/lib/settings';

// Public, read-only store settings needed to render an accurate order total
// before checkout. Authoritative pricing is always recomputed server-side in
// /api/checkout — this endpoint only keeps the pre-checkout display in sync
// with it so the number shown never differs from what Stripe charges.
export async function GET() {
  const settings = await getStoreSettings();
  return NextResponse.json(apiSuccess(settings));
}
