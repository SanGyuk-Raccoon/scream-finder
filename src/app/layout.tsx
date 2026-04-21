import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scream Finder",
  description: "Scrim team creation, invite links, and Riot-verified match registration.",
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
