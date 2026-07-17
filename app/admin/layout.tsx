import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ADMIN_ROLES } from '@/lib/admin-auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session || !session.user || !ADMIN_ROLES.includes(session.user.role)) {
    redirect('/api/auth/signin?callbackUrl=/admin/dashboard');
  }

  return (
    <>
      <style>{`header, footer { display: none !important; } main { padding: 0 !important; }`}</style>
      <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-bg)' }}>
        <AdminSidebar />
        <div className="flex-1 overflow-y-auto">
          <div className="p-(--space-6)">{children}</div>
        </div>
      </div>
    </>
  );
}
