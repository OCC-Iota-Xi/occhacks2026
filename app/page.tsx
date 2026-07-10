import Navbar from "@/components/Navbar";
import Hero from "@/components/sections/Hero";
import AboutSection from "@/components/sections/AboutSection";
import Tracks from "@/components/sections/Tracks";
import Schedule from "@/components/sections/Schedule";
import Sponsors from "@/components/sections/Sponsors";
import FAQ from "@/components/sections/FAQ";
import Closer from "@/components/sections/Closer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <AboutSection />
      <Tracks />
      <Schedule />
      <Sponsors />
      <FAQ />
      <Closer />
    </main>
  );
}
