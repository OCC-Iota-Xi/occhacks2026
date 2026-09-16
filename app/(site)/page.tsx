import Navbar from "@/components/Navbar";
import SpaceBackdrop from "@/components/SpaceBackdrop";
import Hero from "@/components/sections/Hero";
import AboutSection from "@/components/sections/AboutSection";
import Tracks from "@/components/sections/Tracks";
import ScheduleFaq from "@/components/sections/ScheduleFaq";
import Sponsors from "@/components/sections/Sponsors";
import Mentors from "@/components/sections/Mentors";
import Join from "@/components/sections/Join";
import Closer from "@/components/sections/Closer";

export default function Home() {
  return (
    <>
      {/* Opaque and above the footer: the footer is sticky underneath the page
          and has to stay covered until the very bottom, or it would simply be
          appended rather than uncovered. */}
      <main className="relative z-10">
        <SpaceBackdrop />
        <Navbar />
        <Hero />
        <AboutSection />
        <Tracks />
        <Mentors />
        <Sponsors />
        <ScheduleFaq />
        <Join />
      </main>
      <Closer />
    </>
  );
}
