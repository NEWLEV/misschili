import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="border-t border-[var(--color-border)]"
      style={{ background: 'var(--color-bg-alt)' }}
    >
      <div className="section-container section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[var(--space-10)]">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-[var(--space-3)] mb-[var(--space-4)]">
              <Image
                src="/images/logos/MissChili_Logos_MissChili.png"
                alt="Miss Chili Hot Sauce"
                width={40}
                height={55}
                className="h-[48px] w-auto"
              />
              <span
                className="text-[var(--text-lg)] font-bold"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Miss Chili
              </span>
            </Link>
            <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)] mb-[var(--space-5)]">
              Born in a backyard ghost pepper garden in Miami. Raised by the sailing club.
              Shake her well, pour her slow.
            </p>
            <div className="flex gap-[var(--space-3)]">
              <a
                href="https://www.instagram.com/misschilimiami"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
                aria-label="Instagram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <path d="M17.5 6.5h.01" />
                </svg>
              </a>
              <a
                href="mailto:misschilihotsauce@gmail.com"
                className="w-10 h-10 flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
                aria-label="Email"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <path d="M22 6l-10 7L2 6" />
                </svg>
              </a>
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h4 className="text-[var(--text-sm)] font-semibold text-[var(--color-text)] uppercase tracking-[var(--tracking-wider)] mb-[var(--space-4)]">
              Shop
            </h4>
            <ul className="flex flex-col gap-[var(--space-3)]">
              {[
                { href: '/products', label: 'All Sauces' },
                { href: '/products?category=fiery-heat', label: 'Fiery Heat' },
                { href: '/products?category=spicy-hot', label: 'Spicy Hot' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[var(--text-sm)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="text-[var(--text-sm)] font-semibold text-[var(--color-text)] uppercase tracking-[var(--tracking-wider)] mb-[var(--space-4)]">
              Company
            </h4>
            <ul className="flex flex-col gap-[var(--space-3)]">
              {[
                { href: '/#about', label: 'Our Story' },
                { href: '/shipping-policy', label: 'Shipping Policy' },
                { href: '/returns', label: 'Returns' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[var(--text-sm)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="text-[var(--text-sm)] font-semibold text-[var(--color-text)] uppercase tracking-[var(--tracking-wider)] mb-[var(--space-4)]">
              Legal
            </h4>
            <ul className="flex flex-col gap-[var(--space-3)]">
              {[
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms', label: 'Terms of Service' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[var(--text-sm)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Trust Badges */}
            <div className="mt-[var(--space-6)] flex flex-wrap gap-[var(--space-2)]">
              <div className="flex items-center gap-[var(--space-1)] text-[var(--text-xs)] text-[var(--color-text-muted)]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                <span>SSL Secure</span>
              </div>
              <div className="flex items-center gap-[var(--space-1)] text-[var(--text-xs)] text-[var(--color-text-muted)]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><path d="M1 10h22" /></svg>
                <span>Visa/MC</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-[var(--space-12)] pt-[var(--space-6)] border-t border-[var(--color-border)] flex flex-col sm:flex-row justify-between items-center gap-[var(--space-4)]">
          <p className="text-[var(--text-xs)] text-[var(--color-text-muted)]">
            © {currentYear} Miss Chili Hot Sauce, LLC. Miami, FL. All rights reserved.
          </p>
          <p className="text-[var(--text-xs)] text-[var(--color-text-muted)]">
            Made in the U.S.A. 🌶️
          </p>
        </div>
      </div>
    </footer>
  );
}
