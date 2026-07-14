'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/components/storefront/CartProvider';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const shippingEstimate = subtotal >= 50 ? 0 : 7.99;
  const taxEstimate = subtotal * 0.07;
  const total = subtotal + shippingEstimate + taxEstimate;

  return (
    <div className="section-container section-padding">
      <h1 className="text-[var(--text-4xl)] font-bold mb-[var(--space-8)]" style={{ fontFamily: 'var(--font-display)' }}>Your Cart</h1>
      {items.length === 0 ? (
        <div className="text-center py-[var(--space-16)]">
          <div className="w-20 h-20 mx-auto mb-[var(--space-5)] rounded-full bg-[var(--color-surface)] flex items-center justify-center"><span className="text-4xl">🌶️</span></div>
          <h2 className="text-[var(--text-xl)] font-semibold mb-[var(--space-2)]">Your cart is empty</h2>
          <p className="text-[var(--color-text-secondary)] mb-[var(--space-6)]">Looks like you haven&apos;t added any heat yet.</p>
          <Link href="/products"><Button variant="primary" size="lg">Continue Shopping</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--space-8)]">
          <div className="lg:col-span-2 space-y-[var(--space-4)]">
            {items.map((item) => (
              <div key={item.id} className="card p-[var(--space-5)] flex gap-[var(--space-5)]">
                <div className="w-24 h-24 rounded-[var(--radius-md)] bg-[var(--color-bg-alt)] flex items-center justify-center shrink-0">
                  <Image src={item.imageUrl || '/images/logos/MissChili_Logos_MissChili.png'} alt={item.name} width={60} height={82} className="h-[70px] w-auto object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.slug}`} className="text-[var(--text-base)] font-semibold hover:text-[var(--color-primary)] transition-colors">{item.name}</Link>
                  <p className="text-[var(--text-sm)] text-[var(--color-text-muted)] mt-1">{formatPrice(item.salePrice ?? item.price)} each</p>
                  <div className="flex items-center justify-between mt-[var(--space-3)]">
                    <div className="flex items-center border border-[var(--color-border)] rounded-[var(--radius-md)]">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-9 h-9 flex items-center justify-center hover:bg-[var(--color-surface-hover)]">−</button>
                      <span className="w-10 h-9 flex items-center justify-center text-[var(--text-sm)] tabular-nums border-x border-[var(--color-border)]">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-9 h-9 flex items-center justify-center hover:bg-[var(--color-surface-hover)]">+</button>
                    </div>
                    <div className="flex items-center gap-[var(--space-4)]">
                      <span className="font-semibold tabular-nums">{formatPrice((item.salePrice ?? item.price) * item.quantity)}</span>
                      <button onClick={() => removeItem(item.id)} className="text-[var(--text-sm)] text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors">Remove</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={() => { if (window.confirm('Clear all items?')) clearCart(); }}
              className="text-[var(--text-sm)] text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors">Clear Cart</button>
          </div>

          <div className="lg:col-span-1">
            <div className="card p-[var(--space-6)] sticky top-[calc(var(--header-height)+var(--space-4))]">
              <h2 className="text-[var(--text-lg)] font-semibold mb-[var(--space-5)]">Order Summary</h2>
              <div className="space-y-[var(--space-3)] text-[var(--text-sm)]">
                <div className="flex justify-between"><span className="text-[var(--color-text-secondary)]">Subtotal</span><span className="tabular-nums">{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-[var(--color-text-secondary)]">Shipping</span><span className="tabular-nums">{shippingEstimate === 0 ? <span className="text-[var(--color-success)]">Free</span> : formatPrice(shippingEstimate)}</span></div>
                <div className="flex justify-between"><span className="text-[var(--color-text-secondary)]">Tax (est.)</span><span className="tabular-nums">{formatPrice(taxEstimate)}</span></div>
                <div className="pt-[var(--space-3)] border-t border-[var(--color-border)] flex justify-between">
                  <span className="font-semibold">Total</span><span className="text-[var(--text-xl)] font-bold tabular-nums">{formatPrice(total)}</span>
                </div>
              </div>
              {subtotal < 50 && <p className="text-[var(--text-xs)] text-[var(--color-text-muted)] mt-[var(--space-3)]">Add {formatPrice(50 - subtotal)} more for free shipping!</p>}
              <Link href="/checkout"><Button variant="primary" size="lg" className="w-full mt-[var(--space-5)]">Proceed to Checkout</Button></Link>
              <Link href="/products"><Button variant="ghost" className="w-full mt-[var(--space-2)]">Continue Shopping</Button></Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
