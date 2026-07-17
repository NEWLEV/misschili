import { auth } from '@/lib/auth';
import type { Session } from 'next-auth';
import type { UserRole } from '@prisma/client';

// Every non-customer role. Server Actions are independently invocable HTTP
// endpoints — the redirect() in app/admin/layout.tsx only gates page renders,
// it does not protect these functions, so every exported action must call
// requireAdminRole() itself before touching the database.
export const ADMIN_ROLES: UserRole[] = [
  'SUPER_ADMIN', 'STORE_MANAGER', 'INVENTORY_MANAGER',
  'FULFILLMENT', 'SUPPORT', 'MARKETING', 'EDITOR',
  'ACCOUNTANT', 'DEVELOPER', 'AUDITOR',
];

// Default per-function role scoping. AUDITOR is intentionally excluded from
// every group below (read-only by name); adjust these groups to match actual
// staff responsibilities.
export const ROLE_GROUPS = {
  FULL: ['SUPER_ADMIN', 'STORE_MANAGER'] as UserRole[],
  CATALOG_WRITE: ['SUPER_ADMIN', 'STORE_MANAGER', 'INVENTORY_MANAGER'] as UserRole[],
  CATALOG_CONTENT: ['SUPER_ADMIN', 'STORE_MANAGER', 'INVENTORY_MANAGER', 'EDITOR'] as UserRole[],
  INVENTORY_WRITE: ['SUPER_ADMIN', 'STORE_MANAGER', 'INVENTORY_MANAGER', 'FULFILLMENT'] as UserRole[],
  PRICING_WRITE: ['SUPER_ADMIN', 'STORE_MANAGER', 'ACCOUNTANT'] as UserRole[],
  ORDER_WRITE: ['SUPER_ADMIN', 'STORE_MANAGER', 'FULFILLMENT', 'ACCOUNTANT', 'SUPPORT'] as UserRole[],
  REFUND_WRITE: ['SUPER_ADMIN', 'STORE_MANAGER', 'ACCOUNTANT'] as UserRole[],
  MARKETING_WRITE: ['SUPER_ADMIN', 'STORE_MANAGER', 'MARKETING'] as UserRole[],
  CONTENT_WRITE: ['SUPER_ADMIN', 'STORE_MANAGER', 'MARKETING', 'EDITOR'] as UserRole[],
  SETTINGS_WRITE: ['SUPER_ADMIN', 'STORE_MANAGER', 'DEVELOPER'] as UserRole[],
} as const;

export class UnauthorizedError extends Error {
  constructor(message = 'You do not have permission to perform this action.') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Call as the first line of every admin Server Action. Throws
 * UnauthorizedError (never silently no-ops) if there is no session or the
 * session's role isn't in `allowedRoles`. Defaults to any admin role.
 */
export async function requireAdminRole(allowedRoles: UserRole[] = ADMIN_ROLES): Promise<Session> {
  const session = await auth();
  if (!session?.user || !allowedRoles.includes(session.user.role)) {
    throw new UnauthorizedError();
  }
  return session;
}
