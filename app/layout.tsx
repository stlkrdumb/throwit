import type { Metadata } from "next";
import { Providers } from "./providers";
import { NetworkBanner } from "@/components/NetworkBanner";
import "./globals.css";

export const metadata: Metadata = {
  title: "ThrowIt — Decentralized File Transfer",
  description:
    "Upload files with E2E encryption. Share via link. Download without sign-up. Powered by Walrus + Sui.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="flex min-h-screen flex-col bg-[var(--neo-page-bg)] text-[var(--neo-text-primary)]">
        <Providers>{children}</Providers>
        <NetworkBanner />
      </body>
    </html>
  );
}
