import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      subscribed: boolean;
      createdAt: Date | null;
    } & DefaultSession["user"];
  }
}
