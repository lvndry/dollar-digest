import type { Metadata } from "next";
import { DM_Mono, Instrument_Serif, Source_Serif_4 } from "next/font/google";
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
      <body className="font-body">{children}</body>
    </html>
  );
}
