import type { Metadata } from "next";
import { Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blitzr – Real-Time Chess Platform",
  description: "Play real-time chess with friends, spectate games, and compete seamlessly.",
  keywords: ["chess", "multiplayer", "online chess", "real-time chess", "blitzr"],
  icons: {
    icon: "/assets/l1.png",
    apple: "/assets/l1.png",
  },
  openGraph: {
    title: "Blitzr – Real-Time Chess Platform",
    description: "Play real-time chess with friends, spectate games, and compete seamlessly.",
    images: ["/assets/logo1.png"],
    type: "website",
    siteName: "Blitzr",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
