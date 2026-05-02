import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    subscribed?: boolean | null;
    createdAt?: Date | null;
  }

  interface Session {
    user: {
      subscribed: boolean;
      createdAt: Date | null;
    } & DefaultSession["user"];
  }
}
