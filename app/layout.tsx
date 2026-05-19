import type { Metadata } from "next";
import { Bruno_Ace_SC, Space_Grotesk, Oxanium, Space_Mono, Pirata_One } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const brunoAceSC = Bruno_Ace_SC({
  weight: "400",
  variable: "--font-bruno-ace-sc",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const oxanium = Oxanium({
  variable: "--font-oxanium",
  subsets: ["latin"],
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  variable: "--font-space-mono",
  subsets: ["latin"],
  display: "swap",
});

const pirataOne = Pirata_One({
  weight: "400",
  variable: "--font-pirata-one",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "OCC Hacks 2026 — Space Pirate Hackathon",
  description:
    "Gather your crew, board the ship, and build something bold at Orange Coast College's premier space pirate hackathon. 30 hours of building, learning, and competing.",
  keywords: ["hackathon", "OCC", "Orange Coast College", "coding", "space pirate", "2026"],
  openGraph: {
    title: "OCC Hacks 2026 — The Future Is Uncharted",
    description: "Board the ship. Build something bold. 30-hour hackathon at Orange Coast College.",
    type: "website",
  },
};

const fontVariables = [
  brunoAceSC.variable,
  spaceGrotesk.variable,
  oxanium.variable,
  spaceMono.variable,
  pirataOne.variable,
].join(" ");

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontVariables} antialiased`}>
      <body>
        {/* <Navbar /> */}
        {children}
      </body>
    </html>
  );
}
