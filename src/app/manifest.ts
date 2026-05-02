import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The One Dollar Digest",
    short_name: "Dollar Digest",
    description: "AI-curated news that respects your time and wallet",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f5f0",
    theme_color: "#1a1816",
    icons: [
      { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
