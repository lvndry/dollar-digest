import type { Metadata } from "next";
import { Fraunces, Lora, Space_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "The Dollar Digest",
    template: "%s · The Dollar Digest",
  },
  description:
    "AI-curated daily news digest. Technology and politics, clearly sourced, for $1/month.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? "https://dollardigest.com"),
  openGraph: {
    siteName: "The Dollar Digest",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@dollardigest",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${lora.variable} ${spaceMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
