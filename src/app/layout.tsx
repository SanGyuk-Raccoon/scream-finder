import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScrimFinder",
  description: "Scrim team creation, invite links, membership onboarding, and Riot account verification preparation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
