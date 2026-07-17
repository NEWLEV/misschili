'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useCart } from './CartProvider';
import { useTheme } from './ThemeProvider';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { itemCount, openCart } = useCart();
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      className="sticky top-0 z-(--z-sticky) backdrop-blur-xl"
      style={{
        background: 'oklch(from var(--color-bg) l c h / 0.85)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div className="section-container">
        <div className="flex items-center justify-between h-(--header-height)">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-(--space-3) shrink-0">
            <Image
              src="/images/logos/MissChili_Logos_MissChili.png"
              alt="Miss Chili Hot Sauce"
              width={44}
              height={60}
              className="h-[50px] w-auto"
              priority
            />
            <span
              className="hidden sm:block font-(--font-display) text-(--text-xl) font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Miss Chili
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-(--space-8)" aria-label="Main navigation">
            <Link
              href="/products"
              className="text-(--text-sm) font-medium text-(--color-text-secondary) hover:text-(--color-text) transition-colors"
            >
              Shop
            </Link>
            <Link
              href="/products?category=fiery-heat"
              className="text-(--text-sm) font-medium text-(--color-text-secondary) hover:text-(--color-text) transition-colors"
            >
              Fiery Heat
            </Link>
            <Link
              href="/products?category=spicy-hot"
              className="text-(--text-sm) font-medium text-(--color-text-secondary) hover:text-(--color-text) transition-colors"
            >
              Spicy Hot
            </Link>
            <Link
              href="/#about"
              className="text-(--text-sm) font-medium text-(--color-text-secondary) hover:text-(--color-text) transition-colors"
            >
              Our Story
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-(--space-2)">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center rounded-(--radius-md) hover:bg-(--color-surface-hover) text-(--color-text-secondary) hover:text-(--color-text) transition-colors"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              )}
            </button>

            {/* Account */}
            <Link
              href="/account"
              className="w-10 h-10 flex items-center justify-center rounded-(--radius-md) hover:bg-(--color-surface-hover) text-(--color-text-secondary) hover:text-(--color-text) transition-colors"
              aria-label="Account"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative w-10 h-10 flex items-center justify-center rounded-(--radius-md) hover:bg-(--color-surface-hover) text-(--color-text-secondary) hover:text-(--color-text) transition-colors"
              aria-label={`Cart (${itemCount} items)`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-(--color-primary) text-(--color-primary-text) text-[11px] font-bold rounded-full flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-(--radius-md) hover:bg-(--color-surface-hover) text-(--color-text-secondary) hover:text-(--color-text) transition-colors"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav
            className="md:hidden py-(--space-4) border-t border-(--color-border) animate-slide-up"
            aria-label="Mobile navigation"
          >
            <div className="flex flex-col gap-(--space-1)">
              {[
                { href: '/products', label: 'Shop All' },
                { href: '/products?category=fiery-heat', label: 'Fiery Heat' },
                { href: '/products?category=spicy-hot', label: 'Spicy Hot' },
                { href: '/#about', label: 'Our Story' },
                { href: '/account', label: 'My Account' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-(--space-3) px-(--space-4) rounded-(--radius-md) text-(--text-base) font-medium text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-surface-hover) transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
