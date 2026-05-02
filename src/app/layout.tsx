import type { Metadata } from "next";
import { DM_Mono, Instrument_Serif, Source_Serif_4 } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument",
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  weight: ["300", "400", "600"],
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-dm-mono",
  weight: ["300", "400", "500"],
  display: "swap",
});

function ordinalDate(date: Date): string {
  const day = date.getDate();
  const suffix =
    day >= 11 && day <= 13
      ? "th"
      : day % 10 === 1
        ? "st"
        : day % 10 === 2
          ? "nd"
          : day % 10 === 3
            ? "rd"
            : "th";
  const month = date.toLocaleDateString("en-GB", { month: "long" });
  return `${day}${suffix} ${month} ${date.getFullYear()}`;
}

export function generateMetadata(): Metadata {
  const date = ordinalDate(new Date());
  return {
    title: {
      default: `The One Dollar Digest | ${date}`,
      template: `%s | The One Dollar Digest | ${date}`,
    },
    description:
      "AI-curated daily news digest. Technology and politics, clearly sourced, for $1/month.",
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.onedollardigest.com",
    ),
    keywords: [
      "news digest",
      "AI news",
      "tech news",
      "political news",
      "daily briefing",
      "technology",
      "startups",
      "AI",
      "politics",
    ],
    authors: [{ name: "The One Dollar Digest" }],
    creator: "The One Dollar Digest",
    openGraph: {
      siteName: "The One Dollar Digest",
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      site: "@dollardigest",
      creator: "@dollardigest",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    category: "news",
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${instrumentSerif.variable} ${sourceSerif.variable} ${dmMono.variable}`}
    >
      <head>
        {/* Runs before React hydration to avoid theme flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(t===null&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="font-body">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
