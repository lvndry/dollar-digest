import { db } from "../src/lib/db";
import { users } from "../src/lib/schema";
import { eq } from "drizzle-orm";

const email = process.argv[2];
if (!email) {
  console.error("Usage: bun scripts/make-premium.ts <email>");
  process.exit(1);
}

const existing = await db.select().from(users).where(eq(users.email, email));

if (existing.length === 0) {
  await db.insert(users).values({
    id: crypto.randomUUID(),
    email,
    subscribed: true,
  });
  console.log(`Created user ${email} with subscribed=true`);
} else {
  await db.update(users).set({ subscribed: true }).where(eq(users.email, email));
  console.log(`Updated ${email} → subscribed=true`);
}
