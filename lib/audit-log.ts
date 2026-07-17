import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import type { Session } from 'next-auth';

interface WriteAuditLogInput {
  session: Session;
  action: string;
  targetType: string;
  targetId: string;
  before?: unknown;
  after?: unknown;
}

// Best-effort: an audit-log write failure must never block the underlying
// admin action or roll it back — logging failures are swallowed and logged
// separately rather than surfaced to the admin as an action failure.
export async function writeAuditLog({ session, action, targetType, targetId, before, after }: WriteAuditLogInput) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        actorEmail: session.user.email,
        actorRole: session.user.role,
        action,
        targetType,
        targetId,
        before: before === undefined ? undefined : JSON.parse(JSON.stringify(before)),
        after: after === undefined ? undefined : JSON.parse(JSON.stringify(after)),
      },
    });
  } catch (error) {
    logger.error({ err: error, action, targetType, targetId }, '[AuditLog] Failed to write audit log entry');
  }
}
