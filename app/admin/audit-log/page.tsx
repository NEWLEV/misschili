import { prisma } from '@/lib/prisma';
import { formatDateTime } from '@/lib/utils';
import { requireAdminRole, ROLE_GROUPS } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

// "product.image_added" -> "Product · Image added" — the raw string stays
// visible underneath for anyone who wants the exact, greppable value.
function humanizeAction(action: string): string {
  return action
    .split('.')
    .map((segment) =>
      segment
        .split('_')
        .join(' ')
        .replace(/^./, (c) => c.toUpperCase())
    )
    .join(' · ');
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

// Renders a per-field before/after comparison when both sides are plain
// objects (the common case for every writeAuditLog call in this codebase),
// falling back to raw JSON for anything else rather than guessing.
function DiffView({ before, after }: { before: unknown; after: unknown }) {
  if (isPlainObject(before) && isPlainObject(after)) {
    const keys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]));
    const changed = keys.filter((key) => JSON.stringify(before[key]) !== JSON.stringify(after[key]));
    if (changed.length === 0) return <span className="text-(--color-text-muted)">No field changes</span>;
    return (
      <div className="space-y-1">
        {changed.map((key) => (
          <div key={key}>
            <span className="text-(--color-text-muted)">{key}:</span>{' '}
            <span className="text-(--color-text-muted) line-through">{formatValue(before[key])}</span>{' '}
            <span>→ {formatValue(after[key])}</span>
          </div>
        ))}
      </div>
    );
  }

  if (isPlainObject(after) && before == null) {
    return (
      <div className="space-y-1">
        {Object.entries(after).map(([key, value]) => (
          <div key={key}>
            <span className="text-(--color-text-muted)">{key}:</span> {formatValue(value)}
          </div>
        ))}
      </div>
    );
  }

  if (isPlainObject(before) && after == null) {
    return (
      <div className="space-y-1 text-(--color-text-muted) line-through">
        {Object.entries(before).map(([key, value]) => (
          <div key={key}>{key}: {formatValue(value)}</div>
        ))}
      </div>
    );
  }

  return (
    <>
      {before != null && <div className="text-(--color-text-muted) break-all">− {formatValue(before)}</div>}
      {after != null && <div className="break-all">+ {formatValue(after)}</div>}
    </>
  );
}

export default async function AuditLogPage() {
  // Unlike most admin pages, this one needs stricter gating than "any admin
  // role" — the trail covers prices, refunds, and customer-order changes.
  await requireAdminRole(ROLE_GROUPS.AUDIT_READ);

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
                  <td className="p-(--space-4) text-(--text-sm)">
                    <div>{humanizeAction(entry.action)}</div>
                    <div className="text-[10px] text-(--color-text-muted) font-mono">{entry.action}</div>
                  </td>
                  <td className="p-(--space-4) text-(--text-sm)">
                    <div>{entry.targetType}</div>
                    <div className="text-(--text-xs) text-(--color-text-muted) font-mono break-all">{entry.targetId}</div>
                  </td>
                  <td className="p-(--space-4) text-(--text-xs) font-mono max-w-md">
                    <DiffView before={entry.before} after={entry.after} />
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
