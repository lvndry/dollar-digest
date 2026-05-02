"use server";

import { redirect } from "next/navigation";
import Stripe from "stripe";
import { auth } from "@/auth";

export async function createCheckoutSession() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const stripePriceId = process.env.STRIPE_PRICE_ID;
  if (!stripeSecretKey || !stripePriceId) {
    throw new Error("Stripe checkout is not configured");
  }

  const stripe = new Stripe(stripeSecretKey);
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.onedollardigest.com";

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: session.user.email,
    line_items: [{ price: stripePriceId, quantity: 1 }],
    success_url: `${base}/?subscribed=1`,
    cancel_url: `${base}/`,
  });

  if (!checkout.url) {
    throw new Error("Stripe did not return a checkout URL");
  }

  redirect(checkout.url);
}
