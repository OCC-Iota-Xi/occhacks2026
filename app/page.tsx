import Navbar from "@/components/Navbar";
import Hero from "@/components/sections/Hero";
import MarqueeStrip from "@/components/sections/MarqueeStrip";
import About from "@/components/sections/About";
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
      <MarqueeStrip />
      <About />
      <Tracks />
      <Schedule />
      <Sponsors />
      <FAQ />
      <Closer />
    </main>
  );
}
