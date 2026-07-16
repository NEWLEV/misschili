'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCart } from '@/components/storefront/CartProvider';
import { formatPrice } from '@/lib/utils';

export default function CheckoutPage() {
  const { items, subtotal } = useCart();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '', firstName: '', lastName: '', phone: '',
    address1: '', address2: '', city: '', state: '', zipCode: '', country: 'US',
    shippingMethod: 'standard',
  });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const shippingCost = subtotal >= 50 ? 0 : 7.99;
  const tax = subtotal * 0.07;
  const discount = appliedCoupon?.discountAmount ?? 0;
  const total = Math.max(subtotal + shippingCost + tax - discount, 0);

  const updateField = (field: string, value: string) => setFormData((prev) => ({ ...prev, [field]: value }));

  const handleApplyCoupon = async () => {
    setCouponError('');
    setIsApplyingCoupon(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, subtotal }),
      });
      const data = await res.json();
      if (data.success) {
        setAppliedCoupon({ code: data.data.code, discountAmount: data.data.discountAmount });
      } else {
        setAppliedCoupon(null);
        setCouponError(data.error || 'Invalid coupon code');
      }
    } catch {
      setCouponError('Failed to apply coupon. Please try again.');
    }
    setIsApplyingCoupon(false);
  };

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
          formData: {
            contact: { email: formData.email, firstName: formData.firstName, lastName: formData.lastName, phone: formData.phone },
            shippingAddress: { address1: formData.address1, address2: formData.address2, city: formData.city, state: formData.state, zipCode: formData.zipCode, country: formData.country },
            shippingMethod: formData.shippingMethod, sameAsBilling: true,
            couponCode: appliedCoupon?.code,
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.data.url) { window.location.href = data.data.url; }
    } catch { /* handled by Stripe redirect */ }
    setIsLoading(false);
  };

  if (items.length === 0) {
    return (
      <div className="section-container section-padding text-center">
        <h1 className="text-[var(--text-3xl)] font-bold mb-[var(--space-4)]">Your cart is empty</h1>
        <p className="text-[var(--color-text-secondary)] mb-6">Add some sauces before checking out.</p>
        <a href="/products"><Button variant="primary">Shop Now</Button></a>
      </div>
    );
  }

  return (
    <div className="section-container section-padding">
      <h1 className="text-[var(--text-4xl)] font-bold mb-[var(--space-8)]" style={{ fontFamily: 'var(--font-display)' }}>Checkout</h1>

      {/* Step Indicator */}
      <div className="flex items-center gap-[var(--space-4)] mb-[var(--space-10)]">
        {[{ n: 1, label: 'Contact' }, { n: 2, label: 'Shipping' }, { n: 3, label: 'Payment' }].map((s) => (
          <div key={s.n} className="flex items-center gap-[var(--space-2)]">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-sm)] font-bold ${step >= s.n ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface)] text-[var(--color-text-muted)]'}`}>{s.n}</div>
            <span className={`text-[var(--text-sm)] font-medium ${step >= s.n ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'}`}>{s.label}</span>
            {s.n < 3 && <div className="w-12 h-0.5 bg-[var(--color-border)]" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--space-8)]">
        <div className="lg:col-span-2">
          {step === 1 && (
            <div className="card p-[var(--space-6)] space-y-[var(--space-4)]">
              <h2 className="text-[var(--text-xl)] font-semibold">Contact Information</h2>
              <Input label="Email" type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} required autoComplete="email" />
              <div className="grid grid-cols-2 gap-[var(--space-4)]">
                <Input label="First Name" value={formData.firstName} onChange={(e) => updateField('firstName', e.target.value)} required autoComplete="given-name" />
                <Input label="Last Name" value={formData.lastName} onChange={(e) => updateField('lastName', e.target.value)} required autoComplete="family-name" />
              </div>
              <Input label="Phone (optional)" type="tel" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} autoComplete="tel" />
              <Button variant="primary" size="lg" className="w-full mt-[var(--space-4)]" onClick={() => setStep(2)} disabled={!formData.email || !formData.firstName || !formData.lastName}>Continue to Shipping</Button>
            </div>
          )}
          {step === 2 && (
            <div className="card p-[var(--space-6)] space-y-[var(--space-4)]">
              <h2 className="text-[var(--text-xl)] font-semibold">Shipping Address</h2>
              <Input label="Address" value={formData.address1} onChange={(e) => updateField('address1', e.target.value)} required autoComplete="address-line1" />
              <Input label="Apt, Suite (optional)" value={formData.address2} onChange={(e) => updateField('address2', e.target.value)} autoComplete="address-line2" />
              <div className="grid grid-cols-3 gap-[var(--space-4)]">
                <Input label="City" value={formData.city} onChange={(e) => updateField('city', e.target.value)} required autoComplete="address-level2" />
                <Input label="State" value={formData.state} onChange={(e) => updateField('state', e.target.value)} required autoComplete="address-level1" />
                <Input label="ZIP Code" value={formData.zipCode} onChange={(e) => updateField('zipCode', e.target.value)} required autoComplete="postal-code" />
              </div>
              <div className="flex gap-[var(--space-3)]">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button variant="primary" size="lg" className="flex-1" onClick={() => setStep(3)} disabled={!formData.address1 || !formData.city || !formData.state || !formData.zipCode}>Continue to Payment</Button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="card p-[var(--space-6)] space-y-[var(--space-4)]">
              <h2 className="text-[var(--text-xl)] font-semibold">Payment</h2>
              <p className="text-[var(--color-text-secondary)]">You will be redirected to Stripe&apos;s secure checkout to complete your payment.</p>
              <div className="flex items-center gap-[var(--space-3)] p-[var(--space-4)] rounded-[var(--radius-md)] bg-[var(--color-bg)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                <span className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">256-bit SSL encryption · Your payment info is never stored on our servers.</span>
              </div>
              <div className="flex gap-[var(--space-3)]">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button variant="primary" size="lg" className="flex-1" isLoading={isLoading} onClick={handleCheckout}>Pay {formatPrice(total)}</Button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="card p-[var(--space-6)] h-fit sticky top-[calc(var(--header-height)+var(--space-4))]">
          <h3 className="text-[var(--text-lg)] font-semibold mb-[var(--space-4)]">Order Summary</h3>
          <div className="space-y-[var(--space-3)] mb-[var(--space-4)]">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-[var(--text-sm)]">
                <span>{item.name} × {item.quantity}</span>
                <span className="tabular-nums">{formatPrice((item.salePrice ?? item.price) * item.quantity)}</span>
              </div>
            ))}
          </div>
          {/* Coupon Code */}
          <div className="pt-[var(--space-3)] border-t border-[var(--color-border)] mb-[var(--space-3)]">
            {appliedCoupon ? (
              <div className="flex items-center justify-between text-[var(--text-sm)]">
                <span className="text-[var(--color-success)]">Coupon <span className="font-mono font-semibold">{appliedCoupon.code}</span> applied</span>
                <button type="button" onClick={() => { setAppliedCoupon(null); setCouponCode(''); }} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">Remove</button>
              </div>
            ) : (
              <div className="flex gap-[var(--space-2)]">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Coupon code"
                  className="flex-1 h-10 px-3 rounded-[var(--radius-md)] bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--text-sm)] uppercase"
                />
                <Button type="button" variant="outline" size="sm" isLoading={isApplyingCoupon} disabled={!couponCode} onClick={handleApplyCoupon}>Apply</Button>
              </div>
            )}
            {couponError && <p className="text-[var(--text-xs)] text-[var(--color-danger)] mt-[var(--space-2)]">{couponError}</p>}
          </div>

          <div className="space-y-[var(--space-2)] text-[var(--text-sm)] pt-[var(--space-3)] border-t border-[var(--color-border)]">
            <div className="flex justify-between"><span className="text-[var(--color-text-secondary)]">Subtotal</span><span className="tabular-nums">{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-[var(--color-text-secondary)]">Shipping</span><span className="tabular-nums">{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span></div>
            <div className="flex justify-between"><span className="text-[var(--color-text-secondary)]">Tax</span><span className="tabular-nums">{formatPrice(tax)}</span></div>
            {discount > 0 && (
              <div className="flex justify-between text-[var(--color-success)]"><span>Discount</span><span className="tabular-nums">−{formatPrice(discount)}</span></div>
            )}
            <div className="flex justify-between pt-[var(--space-2)] border-t border-[var(--color-border)]"><span className="font-semibold">Total</span><span className="text-[var(--text-lg)] font-bold tabular-nums">{formatPrice(total)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
