"use client";

import dynamic from "next/dynamic";
import StarField from "@/components/ui/StarField";
import AboutSection from "@/components/sections/AboutSection";
import PrizesSection from "@/components/sections/PrizesSection";
import SponsorsSection from "@/components/sections/SponsorsSection";

// Only the 3D-heavy sections need ssr: false
const HeroSection = dynamic(
  () => import("@/components/sections/HeroSection"),
  { ssr: false }
);
const VoyageSection = dynamic(
  () => import("@/components/sections/VoyageSection"),
  { ssr: false }
);

export default function Home() {
  return (
    <>
      {/* Global star field background */}
      <StarField />

      {/* Page content */}
      <div className="content-layer">
        <HeroSection />
        <VoyageSection />
        <AboutSection />
        <PrizesSection />
        <SponsorsSection />
      </div>
    </>
  );
}
