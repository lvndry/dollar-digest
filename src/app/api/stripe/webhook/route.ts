import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

function isActiveSubscription(status: Stripe.Subscription.Status): boolean {
  return status === "active" || status === "trialing";
}

function stripeId(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

export async function POST(req: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeSecretKey || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured" },
      { status: 500 },
    );
  }

  const stripe = new Stripe(stripeSecretKey);
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.customer_details?.email ?? session.customer_email;
      const customerId = stripeId(session.customer);
      const subscriptionId = stripeId(session.subscription);
      const subscription = subscriptionId
        ? await stripe.subscriptions.retrieve(subscriptionId)
        : null;
      const subscriptionStatus = subscription?.status ?? null;

      if (email) {
        await db
          .update(users)
          .set({
            subscribed: subscriptionStatus
              ? isActiveSubscription(subscriptionStatus)
              : false,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            stripeSubscriptionStatus: subscriptionStatus,
          })
          .where(eq(users.email, email));
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = stripeId(subscription.customer);

      if (customerId) {
        await db
          .update(users)
          .set({
            subscribed: isActiveSubscription(subscription.status),
            stripeSubscriptionId: subscription.id,
            stripeSubscriptionStatus: subscription.status,
          })
          .where(eq(users.stripeCustomerId, customerId));
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
