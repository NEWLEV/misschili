import { auth } from '@/lib/auth';
import type { Session } from 'next-auth';
import type { UserRole } from '@prisma/client';
import { ADMIN_ROLES, ROLE_GROUPS, UnauthorizedError } from '@/lib/admin-roles';

export { ADMIN_ROLES, ROLE_GROUPS, UnauthorizedError };

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
