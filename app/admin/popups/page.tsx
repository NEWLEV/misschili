import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { togglePopupActiveById } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminPopupsPage() {
  const popups = await prisma.popup.findMany({ orderBy: { sortOrder: 'asc' } });

  return (
    <div>
      <div className="flex justify-between items-center mb-(--space-6)">
        <h1 className="text-(--text-3xl) font-bold" style={{ fontFamily: 'var(--font-display)' }}>Popups</h1>
        <Link href="/admin/popups/new">
          <Button variant="primary">Add Popup</Button>
        </Link>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-(--color-surface-hover) border-b border-(--color-border)">
                <th className="p-(--space-4) text-(--text-sm) font-semibold text-(--color-text-secondary)">Title</th>
                <th className="p-(--space-4) text-(--text-sm) font-semibold text-(--color-text-secondary)">Type</th>
                <th className="p-(--space-4) text-(--text-sm) font-semibold text-(--color-text-secondary)">Frequency</th>
                <th className="p-(--space-4) text-(--text-sm) font-semibold text-(--color-text-secondary)">Target</th>
                <th className="p-(--space-4) text-(--text-sm) font-semibold text-(--color-text-secondary)">Status</th>
                <th className="p-(--space-4) text-(--text-sm) font-semibold text-(--color-text-secondary) text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--color-border)">
              {popups.map((popup) => (
                <tr key={popup.id} className="hover:bg-(--color-surface-hover) transition-colors">
                  <td className="p-(--space-4) font-semibold text-(--text-sm)">{popup.title}</td>
                  <td className="p-(--space-4) text-(--text-sm)">{popup.type}</td>
                  <td className="p-(--space-4) text-(--text-sm)">{popup.frequency}</td>
                  <td className="p-(--space-4) text-(--text-sm) text-(--color-text-muted)">{popup.targetPage || 'all'}</td>
                  <td className="p-(--space-4)">
                    <span className={`badge ${popup.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {popup.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-(--space-4) text-right">
                    <div className="flex items-center justify-end gap-(--space-2)">
                      <form action={togglePopupActiveById.bind(null, popup.id, popup.isActive)}>
                        <Button type="submit" variant="ghost" size="sm">
                          {popup.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </form>
                      <Link href={`/admin/popups/${popup.id}`}>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {popups.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-(--space-8) text-center text-(--color-text-muted)">
                    No popups found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
