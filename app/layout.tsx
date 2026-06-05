import type { Metadata } from "next";
import { Space_Grotesk, Bebas_Neue, JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";
import { NetworkBanner } from "@/components/NetworkBanner";
import "./globals.css";

export const metadata: Metadata = {
  title: "ThrowIt — Decentralized File Transfer",
  description:
    "Upload files with E2E encryption. Share via link. Download without sign-up. Powered by Walrus + Sui.",
};

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas-neue",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${spaceGrotesk.variable} ${bebasNeue.variable} ${jetbrainsMono.variable} antialiased`}>
      <body className="flex min-h-screen flex-col bg-background text-foreground font-body">
        <Providers>{children}</Providers>
        <NetworkBanner />
      </body>
    </html>
  );
}
