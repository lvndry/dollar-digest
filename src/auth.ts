import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Resend from "next-auth/providers/resend";
import { db } from "@/lib/db";
import { users, accounts, sessions, verificationTokens } from "@/lib/schema";
import { eq } from "drizzle-orm";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: "noreply@onedollardigest.com",
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/login/verify",
  },
  callbacks: {
    session({ session, user }) {
      session.user.subscribed = user.subscribed ?? false;
      session.user.createdAt = user.createdAt ?? null;
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return;

      await db.update(users).set({ createdAt: new Date() }).where(eq(users.id, user.id));
    },
  },
});
