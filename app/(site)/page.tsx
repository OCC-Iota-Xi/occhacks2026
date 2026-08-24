import Navbar from "@/components/Navbar";
import Hero from "@/components/sections/Hero";
import AboutSection from "@/components/sections/AboutSection";
import Mentors from "@/components/sections/Mentors";
import Tracks from "@/components/sections/Tracks";
import Schedule from "@/components/sections/Schedule";
import FAQ from "@/components/sections/FAQ";
import Join from "@/components/sections/Join";
import Closer from "@/components/sections/Closer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <AboutSection />
      <Tracks />
      <Mentors />
      <Schedule />
      <FAQ />
      <Join />
      <Closer />
    </main>
  );
}
