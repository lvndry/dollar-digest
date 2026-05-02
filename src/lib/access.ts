import type { Session } from "next-auth";

const TRIAL_MS = 3 * 24 * 60 * 60 * 1000;

export function canAccessArchive(session: Session | null): boolean {
  if (!session?.user) return false;
  if (session.user.subscribed) return true;
  if (!session.user.createdAt) return false;
  return Date.now() - new Date(session.user.createdAt).getTime() < TRIAL_MS;
}

export function trialDaysRemaining(session: Session | null): number {
  if (!session?.user?.createdAt) return 0;
  const elapsed = Date.now() - new Date(session.user.createdAt).getTime();
  return Math.max(0, Math.ceil((TRIAL_MS - elapsed) / (24 * 60 * 60 * 1000)));
}
