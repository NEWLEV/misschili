import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Prisma v7 requires an adapter for direct database connections
function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // Return a mock during builds without a database — routes handle missing DB gracefully
    console.warn('[Prisma] DATABASE_URL not set. Queries will fail at runtime.');
  }
  const adapter = new PrismaPg({ connectionString: connectionString || '' });
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
