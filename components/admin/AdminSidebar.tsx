'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import { useTheme } from '@/components/storefront/ThemeProvider';

const SIDEBAR_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/admin/products', label: 'Products', icon: '🌶️' },
  { href: '/admin/orders', label: 'Orders', icon: '📦' },
  { href: '/admin/customers', label: 'Customers', icon: '👥' },
  { href: '/admin/coupons', label: 'Coupons', icon: '🎟️' },
  { href: '/admin/popups', label: 'Popups', icon: '💬' },
  { href: '/admin/content', label: 'Content', icon: '📝' },
  { href: '/admin/subscribers', label: 'Subscribers', icon: '📧' },
  { href: '/admin/audit-log', label: 'Audit Log', icon: '🧾' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 bg-(--color-surface) border-r border-(--color-border) flex flex-col">
      {/* Logo */}
      <div className="p-(--space-5) border-b border-(--color-border)">
        <Link href="/admin/dashboard" className="flex items-center gap-(--space-3)">
          <Image src="/images/logos/MissChili_Logos_MissChili.png" alt="Miss Chili" width={32} height={44} className="h-[36px] w-auto" />
          <div>
            <span className="text-(--text-sm) font-bold" style={{ fontFamily: 'var(--font-display)' }}>Miss Chili</span>
            <p className="text-[10px] text-(--color-text-muted)">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-(--space-3) overflow-y-auto">
        <ul className="space-y-(--space-1)">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-(--space-3) px-(--space-3) py-(--space-2) rounded-md text-(--text-sm) font-medium transition-colors ${isActive ? 'bg-[oklch(from_var(--color-primary)_l_c_h_/_0.12)] text-(--color-primary)' : 'text-(--color-text-secondary) hover:bg-(--color-surface-hover) hover:text-(--color-text)'}`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-(--space-3) border-t border-(--color-border) space-y-(--space-2)">
        <button onClick={toggleTheme} className="w-full flex items-center gap-(--space-3) px-(--space-3) py-(--space-2) rounded-md text-(--text-sm) text-(--color-text-secondary) hover:bg-(--color-surface-hover) transition-colors">
          <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <Link href="/" className="w-full flex items-center gap-(--space-3) px-(--space-3) py-(--space-2) rounded-md text-(--text-sm) text-(--color-text-secondary) hover:bg-(--color-surface-hover) transition-colors">
          <span>🌐</span><span>View Store</span>
        </Link>
        <button onClick={() => signOut({ callbackUrl: '/admin/login' })} className="w-full flex items-center gap-(--space-3) px-(--space-3) py-(--space-2) rounded-md text-(--text-sm) text-(--color-danger) hover:bg-(--color-surface-hover) transition-colors">
          <span>🚪</span><span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
