'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { useCart } from './CartProvider';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function CartDrawer() {
  const { items, itemCount, subtotal, updateQuantity, removeItem, clearCart, isOpen, closeCart } = useCart();
  const drawerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Focus trap + Escape-to-close + focus restore — the drawer previously had
  // none of this despite role="dialog", so keyboard/screen-reader users could
  // tab straight through to page content behind it and Escape did nothing.
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeCart();
        return;
      }
      if (e.key !== 'Tab' || !drawerRef.current) return;

      const focusable = Array.from(drawerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      previouslyFocused.current?.focus();
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-(--z-overlay) bg-(--color-overlay) animate-fade-in"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        ref={drawerRef}
        className="fixed top-0 right-0 z-(--z-modal) h-full w-full max-w-md bg-(--color-surface) border-l border-(--color-border) shadow-(--shadow-xl) flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-(--space-5) border-b border-(--color-border)">
          <h2 className="text-(--text-lg) font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
            Your Cart ({itemCount})
          </h2>
          <button
            ref={closeButtonRef}
            onClick={closeCart}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-(--color-surface-hover) text-(--color-text-muted) hover:text-(--color-text) transition-colors"
            aria-label="Close cart"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-(--space-5)">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-(--space-4)">
              <div className="w-16 h-16 rounded-full bg-(--color-surface-hover) flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              </div>
              <div>
                <p className="text-(--color-text) font-medium mb-(--space-1)">Your cart is empty</p>
                <p className="text-(--text-sm) text-(--color-text-muted)">Time to add some heat!</p>
              </div>
              <Link href="/products" onClick={closeCart}>
                <Button variant="primary">Continue Shopping</Button>
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-(--space-4)">
              {items.map((item) => {
                const effectivePrice = item.salePrice ?? item.price;
                return (
                  <li
                    key={item.id}
                    className="flex gap-(--space-4) p-(--space-3) rounded-lg bg-(--color-bg) border border-(--color-border)"
                  >
                    <div className="w-20 h-20 rounded-md overflow-hidden shrink-0 bg-(--color-surface-hover)">
                      <Image
                        src={item.imageUrl || '/images/logos/MissChili_Logos_MissChili.png'}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.slug}`}
                        className="text-(--text-sm) font-medium text-(--color-text) hover:text-(--color-primary) transition-colors line-clamp-1"
                        onClick={closeCart}
                      >
                        {item.name}
                      </Link>
                      <p className="text-(--text-sm) text-(--color-text-secondary) tabular-nums mt-(--space-1)">
                        {formatPrice(effectivePrice)}
                      </p>
                      <div className="flex items-center justify-between mt-(--space-2)">
                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-(--color-border) rounded-md overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-(--color-surface-hover) text-(--color-text-secondary) transition-colors"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={item.maxQuantity}
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                            className="w-10 h-8 text-center text-(--text-sm) bg-transparent border-x border-(--color-border) tabular-nums"
                            aria-label="Quantity"
                          />
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-(--color-surface-hover) text-(--color-text-secondary) transition-colors"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-(--text-xs) text-(--color-text-muted) hover:text-(--color-danger) transition-colors"
                          aria-label={`Remove ${item.name}`}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-(--space-5) border-t border-(--color-border)">
            <div className="flex justify-between items-center mb-(--space-4)">
              <span className="text-(--color-text-secondary)">Subtotal</span>
              <span className="text-(--text-lg) font-semibold tabular-nums">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-(--text-xs) text-(--color-text-muted) mb-(--space-4)">
              Shipping & taxes calculated at checkout
            </p>
            <div className="flex flex-col gap-(--space-2)">
              <Link href="/checkout" onClick={closeCart}>
                <Button variant="primary" className="w-full" size="lg">
                  Checkout — {formatPrice(subtotal)}
                </Button>
              </Link>
              <Link href="/cart" onClick={closeCart}>
                <Button variant="outline" className="w-full">
                  View Cart
                </Button>
              </Link>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Remove all items from cart?')) {
                  clearCart();
                }
              }}
              className="w-full mt-(--space-3) text-(--text-xs) text-(--color-text-muted) hover:text-(--color-danger) transition-colors text-center"
            >
              Clear Cart
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
