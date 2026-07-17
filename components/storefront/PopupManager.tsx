'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/components/storefront/CartProvider';

interface Popup {
  id: string;
  type: 'NEWSLETTER' | 'EXIT_INTENT' | 'PROMOTION' | 'COOKIE_CONSENT' | 'CART_ABANDONMENT';
  title: string;
  message: string;
  imageUrl: string | null;
  ctaText: string | null;
  ctaUrl: string | null;
  discountCode: string | null;
  frequency: 'ONCE' | 'SESSION' | 'DAILY' | 'EVERY_VISIT';
  targetPage: string | null;
  sortOrder: number;
}

const STORAGE_PREFIX = 'popup-shown-';

function isEligible(popup: Popup, pathname: string): boolean {
  if (popup.targetPage && popup.targetPage !== 'all') {
    const matchesPage =
      (popup.targetPage === 'home' && pathname === '/') ||
      (popup.targetPage === 'product' && pathname.startsWith('/products/')) ||
      (popup.targetPage === 'cart' && pathname.startsWith('/cart'));
    if (!matchesPage) return false;
  }

  if (popup.frequency === 'EVERY_VISIT') return true;
  if (popup.frequency === 'ONCE') return !localStorage.getItem(`${STORAGE_PREFIX}${popup.id}`);
  if (popup.frequency === 'SESSION') return !sessionStorage.getItem(`${STORAGE_PREFIX}${popup.id}`);
  if (popup.frequency === 'DAILY') {
    const last = localStorage.getItem(`${STORAGE_PREFIX}${popup.id}`);
    if (!last) return true;
    return Date.now() - Number(last) > 24 * 60 * 60 * 1000;
  }
  return false;
}

function markShown(popup: Popup) {
  if (popup.frequency === 'ONCE') localStorage.setItem(`${STORAGE_PREFIX}${popup.id}`, '1');
  if (popup.frequency === 'SESSION') sessionStorage.setItem(`${STORAGE_PREFIX}${popup.id}`, '1');
  if (popup.frequency === 'DAILY') localStorage.setItem(`${STORAGE_PREFIX}${popup.id}`, String(Date.now()));
}

export function PopupManager() {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');
  const { itemCount } = useCart();
  const [popups, setPopups] = useState<Popup[]>([]);
  const [activePopup, setActivePopup] = useState<Popup | null>(null);
  // Popups already surfaced during this page load, regardless of frequency.
  // Without this, closing an EVERY_VISIT popup re-triggers the same
  // eligibility check on the next effect run and shows it again immediately.
  const shownThisLoadRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (isAdminRoute) return;
    fetch('/api/popups/active')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setPopups(data.data as Popup[]);
      })
      .catch(() => {});
  }, [isAdminRoute]);

  const showNext = useCallback(
    (candidates: Popup[]) => {
      const eligible = candidates
        .filter((p) => !shownThisLoadRef.current.has(p.id) && isEligible(p, pathname))
        .sort((a, b) => a.sortOrder - b.sortOrder);
      if (eligible.length > 0) {
        shownThisLoadRef.current.add(eligible[0].id);
        setActivePopup(eligible[0]);
      }
    },
    [pathname]
  );

  useEffect(() => {
    if (popups.length === 0 || activePopup) return;

    const immediate = popups.filter(
      (p) => p.type === 'COOKIE_CONSENT' && !shownThisLoadRef.current.has(p.id) && isEligible(p, pathname)
    );
    if (immediate.length > 0) {
      showNext(immediate);
      return;
    }

    const delayed = popups.filter((p) => p.type === 'NEWSLETTER' || p.type === 'PROMOTION');
    const exitIntent = popups.filter(
      (p) => p.type === 'EXIT_INTENT' || (p.type === 'CART_ABANDONMENT' && itemCount > 0)
    );

    const timer = delayed.length > 0 ? setTimeout(() => showNext(delayed), 4000) : undefined;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && exitIntent.length > 0) showNext(exitIntent);
    };
    if (exitIntent.length > 0) document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (timer) clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [popups, activePopup, itemCount, showNext]);

  if (isAdminRoute || !activePopup) return null;

  const close = () => {
    markShown(activePopup);
    setActivePopup(null);
  };

  return (
    <Modal isOpen={!!activePopup} onClose={close} title={activePopup.title}>
      <div className="space-y-(--space-4)">
        <p className="text-(--text-sm) text-(--color-text-secondary)">{activePopup.message}</p>
        {activePopup.discountCode && (
          <p className="text-(--text-lg) font-bold text-(--color-primary)">
            Code: {activePopup.discountCode}
          </p>
        )}
        {activePopup.ctaText && (
          <a href={activePopup.ctaUrl || '#'} onClick={close}>
            <Button variant="primary" className="w-full">{activePopup.ctaText}</Button>
          </a>
        )}
        {!activePopup.ctaText && (
          <Button variant="primary" className="w-full" onClick={close}>Got it</Button>
        )}
      </div>
    </Modal>
  );
}
