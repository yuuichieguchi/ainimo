import type { Metadata } from "next";
import "./globals.css";
import { TooltipProvider } from "@/contexts/TooltipContext";
import DynamicLangUpdater from "@/components/DynamicLangUpdater";

const siteUrl = "https://ainimo.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Ainimo - Raise Your Virtual AI Pet",
  description:
    "A Tamagotchi-style virtual pet browser game. Raise your AI from dumb to smart with mini-games, achievements, and personality development. Free to play!",
  keywords: [
    "virtual pet",
    "AI pet",
    "tamagotchi",
    "browser game",
    "pet simulation",
    "バーチャルペット",
    "育成ゲーム",
    "ブラウザゲーム",
    "AIペット",
    "たまごっち風",
  ],
  authors: [{ name: "Ainimo Team" }],
  creator: "Ainimo Team",
  verification: {
    google: "qDjNwUaLfOwddmNI75rPqLANJJNBCRsKXySsNayn_ZI",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "ja_JP",
    url: siteUrl,
    siteName: "Ainimo",
    title: "Ainimo - Raise Your Virtual AI Pet",
    description:
      "A Tamagotchi-style virtual pet where you raise an AI from dumb to smart!",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Ainimo - Virtual AI Pet Game",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ainimo - Raise Your Virtual AI Pet",
    description:
      "A Tamagotchi-style virtual pet where you raise an AI from dumb to smart!",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Ainimo",
  description:
    "A Tamagotchi-style virtual pet where you raise an AI from dumb to smart",
  url: siteUrl,
  applicationCategory: "GameApplication",
  operatingSystem: "Web Browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  browserRequirements: "Requires JavaScript",
  softwareVersion: "1.0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8445672656091773"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased">
        <DynamicLangUpdater />
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
