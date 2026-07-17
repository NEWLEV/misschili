import { prisma } from '@/lib/prisma';
import { deleteSubscriber } from './actions';
import { ConfirmSubmitButton } from '@/components/admin/ConfirmSubmitButton';

export const dynamic = 'force-dynamic';

export default async function AdminSubscribersPage() {
  const subscribers = await prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div>
      <div className="flex justify-between items-center mb-(--space-6)">
        <h1 className="text-(--text-3xl) font-bold" style={{ fontFamily: 'var(--font-display)' }}>Subscribers</h1>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-(--color-surface-hover) border-b border-(--color-border)">
                <th className="p-(--space-4) text-(--text-sm) font-semibold text-(--color-text-secondary)">Email</th>
                <th className="p-(--space-4) text-(--text-sm) font-semibold text-(--color-text-secondary)">Confirmed</th>
                <th className="p-(--space-4) text-(--text-sm) font-semibold text-(--color-text-secondary)">Source</th>
                <th className="p-(--space-4) text-(--text-sm) font-semibold text-(--color-text-secondary)">Subscribed</th>
                <th className="p-(--space-4) text-(--text-sm) font-semibold text-(--color-text-secondary) text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--color-border)">
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id} className="hover:bg-(--color-surface-hover) transition-colors">
                  <td className="p-(--space-4) text-(--text-sm)">{subscriber.email}</td>
                  <td className="p-(--space-4)">
                    <span className={`badge ${subscriber.isConfirmed ? 'badge-success' : 'badge-warning'}`}>
                      {subscriber.isConfirmed ? 'Confirmed' : 'Pending'}
                    </span>
                  </td>
                  <td className="p-(--space-4) text-(--text-sm) text-(--color-text-muted)">{subscriber.source || '—'}</td>
                  <td className="p-(--space-4) text-(--text-sm) text-(--color-text-muted)">
                    {new Date(subscriber.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-(--space-4) text-right">
                    <ConfirmSubmitButton
                      action={async () => await deleteSubscriber(subscriber.id)}
                      confirmMessage={`Remove ${subscriber.email} from the subscriber list? This cannot be undone.`}
                      variant="ghost"
                    >
                      Remove
                    </ConfirmSubmitButton>
                  </td>
                </tr>
              ))}
              {subscribers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-(--space-8) text-center text-(--color-text-muted)">
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
