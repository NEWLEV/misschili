import { prisma } from '@/lib/prisma';
import { formatDateTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AuditLogPage() {
  const entries = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return (
    <div>
      <div className="mb-(--space-6)">
        <h1 className="text-(--text-3xl) font-bold" style={{ fontFamily: 'var(--font-display)' }}>Audit Log</h1>
        <p className="text-(--color-text-secondary) text-(--text-sm) mt-1">
          Every price, order, refund, coupon, and settings change made in this dashboard. Most recent 200 entries.
        </p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-(--color-surface-hover) border-b border-(--color-border)">
                <th className="p-(--space-4) text-(--text-sm) font-semibold text-(--color-text-secondary)">When</th>
                <th className="p-(--space-4) text-(--text-sm) font-semibold text-(--color-text-secondary)">Actor</th>
                <th className="p-(--space-4) text-(--text-sm) font-semibold text-(--color-text-secondary)">Action</th>
                <th className="p-(--space-4) text-(--text-sm) font-semibold text-(--color-text-secondary)">Target</th>
                <th className="p-(--space-4) text-(--text-sm) font-semibold text-(--color-text-secondary)">Before → After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--color-border)">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-(--color-surface-hover) transition-colors align-top">
                  <td className="p-(--space-4) text-(--text-sm) whitespace-nowrap">{formatDateTime(entry.createdAt)}</td>
                  <td className="p-(--space-4) text-(--text-sm)">
                    <div>{entry.actorEmail || 'Unknown'}</div>
                    <div className="text-(--text-xs) text-(--color-text-muted)">{entry.actorRole}</div>
                  </td>
                  <td className="p-(--space-4) text-(--text-sm) font-mono">{entry.action}</td>
                  <td className="p-(--space-4) text-(--text-sm)">
                    <div>{entry.targetType}</div>
                    <div className="text-(--text-xs) text-(--color-text-muted) font-mono break-all">{entry.targetId}</div>
                  </td>
                  <td className="p-(--space-4) text-(--text-xs) font-mono max-w-md">
                    {entry.before ? <div className="text-(--color-text-muted) break-all">− {JSON.stringify(entry.before)}</div> : null}
                    {entry.after ? <div className="break-all">+ {JSON.stringify(entry.after)}</div> : null}
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-(--space-8) text-center text-(--color-text-muted)">
                    No admin activity recorded yet.
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
