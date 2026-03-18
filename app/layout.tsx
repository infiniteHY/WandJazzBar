import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WAND JAZZ BAR",
  description: "WAND JAZZ BAR — Pixel Jazz Cocktail Music Generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
