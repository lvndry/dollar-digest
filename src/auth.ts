import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Resend from "next-auth/providers/resend";
import { Resend as ResendClient } from "resend";
import { db } from "@/lib/db";
import { users, accounts, sessions, verificationTokens } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { signInEmailHtml, signInEmailText } from "@/lib/email/sign-in-template";
import {
  trialWelcomeEmailHtml,
  trialWelcomeEmailText,
} from "@/lib/email/trial-welcome-template";

let resendClient: ResendClient | null = null;
function getResendClient(): ResendClient {
  if (!resendClient) resendClient = new ResendClient(process.env.AUTH_RESEND_KEY);
  return resendClient;
}

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
      async sendVerificationRequest({ identifier: to, url }) {
        const host = new URL(url).host;
        await getResendClient().emails.send({
          from: "The One Dollar Digest <noreply@onedollardigest.com>",
          to,
          subject: "Sign in to The One Dollar Digest",
          html: signInEmailHtml({ url, host }),
          text: signInEmailText({ url, host }),
        });
      },
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

      if (user.email) {
        await getResendClient().emails.send({
          from: "The One Dollar Digest <noreply@onedollardigest.com>",
          to: user.email,
          subject: "Your 3-day free trial has started",
          html: trialWelcomeEmailHtml({ email: user.email }),
          text: trialWelcomeEmailText({ email: user.email }),
        });
      }
    },
  },
});
