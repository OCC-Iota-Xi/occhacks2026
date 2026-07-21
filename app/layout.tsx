import type { Metadata } from "next";
import { Bruno_Ace_SC, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const brunoAce = Bruno_Ace_SC({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bruno-ace",
  display: "swap",
});

export const metadata: Metadata = {
  // Update if the production domain differs — absolute URLs for the OG image
  // and icons resolve against this.
  metadataBase: new URL("https://occhacks.com"),
  title: "OCC Hacks 2026 — Orange Coast College's Hackathon",
  description:
    "OCC Hacks is Orange Coast College's official student hackathon, organized by the Iota Xi (ΙΞ) Society. October 11–12, 2026 in the OCC Ballroom. Free to attend, open to all majors and skill levels — food, workshops, mentors, and prizes included.",
  keywords: [
    "hackathon",
    "OCC Hacks",
    "Orange Coast College",
    "OCC",
    "student hackathon",
    "coding",
    "Costa Mesa",
    "Iota Xi",
    "2026",
  ],
  openGraph: {
    title: "OCC Hacks 2026 — Orange Coast College's Hackathon",
    description:
      "A free two-day student hackathon at Orange Coast College. October 11–12, 2026 in the OCC Ballroom — all majors and skill levels welcome.",
    type: "website",
    siteName: "OCC Hacks",
  },
  twitter: {
    card: "summary_large_image",
    title: "OCC Hacks 2026 — Orange Coast College's Hackathon",
    description:
      "A free two-day student hackathon at Orange Coast College. October 11–12, 2026 in the OCC Ballroom — all majors and skill levels welcome.",
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
      className={cn("antialiased", spaceGrotesk.variable, brunoAce.variable)}
    >
      <body className="relative">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
