import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import type { UserRole } from '@prisma/client';

// bcrypt cost-12 hash of an unguessable dummy password, used to equalize
// authorize() timing between "unknown email" and "wrong password"
const DUMMY_PASSWORD_HASH = '$2b$12$5lu6mN.fvh5wsrEvXZ.PeuZ4NMaPdj0Yax0fUiZajXu5DMETzAz6q';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      role: UserRole;
      image: string | null;
    };
  }

  interface User {
    role: UserRole;
  }
}

declare module 'next-auth' {
  interface JWT {
    id?: string;
    role?: UserRole;
    pwChangedAt?: number | null;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/account/login',
    error: '/account/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        // Compare against a dummy hash when the user doesn't exist so response
        // timing doesn't reveal whether an email is registered
        const isValid = await bcrypt.compare(
          password,
          user?.passwordHash ?? DUMMY_PASSWORD_HASH
        );
        if (!user || !isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id as string },
          select: { passwordChangedAt: true },
        });
        token.pwChangedAt = dbUser?.passwordChangedAt?.getTime() ?? null;
        return token;
      }

      // On every other request, check whether the password has changed
      // since this token was issued — if so, treat it as logged out rather
      // than trusting a JWT that predates a password reset.
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { passwordChangedAt: true },
        });
        const dbChangedAt = dbUser?.passwordChangedAt?.getTime() ?? null;
        if (dbChangedAt !== null && dbChangedAt !== token.pwChangedAt) {
          delete token.id;
          delete token.role;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  events: {
    async signIn({ user }) {
      // Could log sign-in events here
      if (process.env.NODE_ENV === 'development') {
        console.error(`[Auth] User signed in: ${user.email}`);
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
