import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["300", "400"],
  variable: "--font-newsreader",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OCC Hacks 2026 — a 24-hour studio on the golden coast",
  description:
    "OCC Hacks is Orange Coast College's official hackathon. Oct 11–12, 2026 · 150+ students, every meal covered, free to attend.",
  keywords: ["hackathon", "OCC", "Orange Coast College", "coding", "2026"],
  openGraph: {
    title: "OCC Hacks 2026",
    description:
      "A 24-hour studio on the golden coast. Oct 11–12, 2026 at Orange Coast College. Free to attend.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("antialiased", inter.variable, newsreader.variable)}>
      <body>{children}</body>
    </html>
  );
}
