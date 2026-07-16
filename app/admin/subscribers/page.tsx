import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/Button';
import { deleteSubscriber } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminSubscribersPage() {
  const subscribers = await prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div>
      <div className="flex justify-between items-center mb-[var(--space-6)]">
        <h1 className="text-[var(--text-3xl)] font-bold" style={{ fontFamily: 'var(--font-display)' }}>Subscribers</h1>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-surface-hover)] border-b border-[var(--color-border)]">
                <th className="p-[var(--space-4)] text-[var(--text-sm)] font-semibold text-[var(--color-text-secondary)]">Email</th>
                <th className="p-[var(--space-4)] text-[var(--text-sm)] font-semibold text-[var(--color-text-secondary)]">Confirmed</th>
                <th className="p-[var(--space-4)] text-[var(--text-sm)] font-semibold text-[var(--color-text-secondary)]">Source</th>
                <th className="p-[var(--space-4)] text-[var(--text-sm)] font-semibold text-[var(--color-text-secondary)]">Subscribed</th>
                <th className="p-[var(--space-4)] text-[var(--text-sm)] font-semibold text-[var(--color-text-secondary)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id} className="hover:bg-[var(--color-surface-hover)] transition-colors">
                  <td className="p-[var(--space-4)] text-[var(--text-sm)]">{subscriber.email}</td>
                  <td className="p-[var(--space-4)]">
                    <span className={`badge ${subscriber.isConfirmed ? 'badge-success' : 'badge-warning'}`}>
                      {subscriber.isConfirmed ? 'Confirmed' : 'Pending'}
                    </span>
                  </td>
                  <td className="p-[var(--space-4)] text-[var(--text-sm)] text-[var(--color-text-muted)]">{subscriber.source || '—'}</td>
                  <td className="p-[var(--space-4)] text-[var(--text-sm)] text-[var(--color-text-muted)]">
                    {new Date(subscriber.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-[var(--space-4)] text-right">
                    <form action={async () => {
                      'use server';
                      await deleteSubscriber(subscriber.id);
                    }}>
                      <Button type="submit" variant="ghost" size="sm">Remove</Button>
                    </form>
                  </td>
                </tr>
              ))}
              {subscribers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-[var(--space-8)] text-center text-[var(--color-text-muted)]">
                    No subscribers found.
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
