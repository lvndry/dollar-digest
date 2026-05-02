"use server";

import { Resend } from "resend";

let resend: Resend | null = null;
function getResend(): Resend {
  if (!resend) resend = new Resend(process.env.AUTH_RESEND_KEY);
  return resend;
}

export async function sendContactMessage({
  email,
  message,
}: {
  email: string;
  message: string;
}): Promise<{ ok: boolean }> {
  try {
    await getResend().emails.send({
      from: "The One Dollar Digest <noreply@onedollardigest.com>",
      to: "lvndry@protonmail.com",
      replyTo: email,
      subject: `Contact form — ${email}`,
      text: `From: ${email}\n\n${message}`,
    });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
