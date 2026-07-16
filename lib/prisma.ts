import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

// Prisma v7 requires an adapter for direct database connections.
// PrismaMariaDb takes discrete connection fields rather than a URL, so we
// parse DATABASE_URL here to keep it the single source of truth elsewhere.
export function parseDatabaseUrl(connectionString: string) {
  const url = new URL(connectionString);
  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
  };
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // Return a mock during builds without a database — routes handle missing DB gracefully
    console.warn('[Prisma] DATABASE_URL not set. Queries will fail at runtime.');
  }
  const adapter = new PrismaMariaDb(
    connectionString ? parseDatabaseUrl(connectionString) : { host: '', port: 3306, user: '', password: '', database: '' }
  );
  return new PrismaClient({ adapter });
}

// Singleton pattern for Next.js hot-reload
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
