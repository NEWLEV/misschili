import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const adminRoles = [
    'SUPER_ADMIN', 'STORE_MANAGER', 'INVENTORY_MANAGER', 
    'FULFILLMENT', 'SUPPORT', 'MARKETING', 'EDITOR', 
    'ACCOUNTANT', 'DEVELOPER', 'AUDITOR'
  ];

  if (!session || !session.user || !adminRoles.includes(session.user.role as string)) {
    redirect('/api/auth/signin?callbackUrl=/admin/dashboard');
  }

  return (
    <>
      <style>{`header, footer { display: none !important; } main { padding: 0 !important; }`}</style>
      <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-bg)' }}>
        <AdminSidebar />
        <div className="flex-1 overflow-y-auto">
          <div className="p-[var(--space-6)]">{children}</div>
        </div>
      </div>
    </>
  );
}
