import type { Metadata } from "next";
import { Bruno_Ace_SC, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Particles from "@/components/motion/Particles";
import SpaceEffects from "@/components/SpaceEffects";

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
        {/* Global space backdrop: one drifting WebGL particle field spanning
            the full document, so the stars scroll past with the page.
            pixelRatio is capped at 1 to keep the page-tall canvas cheap. */}
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <Particles
            particleColors={["#e8eaf2", "#e8eaf2", "#e8eaf2", "#fbbf24", "#22d3ee"]}
            particleCount={4000}
            particleSpread={20}
            speed={0.1}
            particleBaseSize={100}
            moveParticlesOnHover={false}
            alphaParticles
            disableRotation
            pixelRatio={1}
          />
        </div>
        {/* Twinkling sparkles + falling meteors over the particle field */}
        <SpaceEffects />
        {children}
      </body>
    </html>
  );
}
