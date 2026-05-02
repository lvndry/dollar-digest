"use server";

import { redirect } from "next/navigation";
import Stripe from "stripe";
import { auth } from "@/auth";

export async function createCheckoutSession() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.onedollardigest.com";

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: session.user.email,
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${base}/?subscribed=1`,
    cancel_url: `${base}/`,
  });

  redirect(checkout.url!);
}
