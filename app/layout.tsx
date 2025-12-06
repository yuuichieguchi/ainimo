import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ainimo - Raise Your Virtual AI Pet",
  description:
    "A Tamagotchi-style virtual pet where you raise an AI from dumb to smart",
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
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8445672656091773"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
