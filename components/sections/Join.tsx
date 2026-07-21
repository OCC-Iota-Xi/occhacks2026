import CtaButtons from "@/components/CtaButtons";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/motion/Reveal";
import { TrackPlanet } from "./Tracks";

/**
 * Closing CTA below the FAQ: register, volunteer, mentor, or sponsor,
 * flanked by the same flat-art planets as the tracks.
 */
export default function Join() {
  return (
    <section id="join" className="relative scroll-mt-24 overflow-hidden px-6 py-16 md:py-24">
      {/* Flanking planets, tucked behind the copy on wide screens */}
      <div className="pointer-events-none absolute left-[4%] top-1/2 hidden -translate-y-1/2 scale-75 opacity-80 lg:block xl:left-[10%]">
        <TrackPlanet variant="saturn" />
      </div>
      <div className="pointer-events-none absolute right-[4%] top-1/2 hidden -translate-y-1/2 scale-[0.6] opacity-80 lg:block xl:right-[10%]">
        <TrackPlanet variant="pluto" />
      </div>

      <SectionHeading plain="Join Now" accent="" className="mb-6" />

      <Reveal className="mx-auto max-w-xl text-center" delay={0.1}>
        <p className="font-body text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
          hack all weekend, mentor students, help run the event, or fund the
          next wave of builders.
        </p>
      </Reveal>

      <Reveal className="mt-10" delay={0.2}>
        <CtaButtons className="justify-center" />
      </Reveal>
    </section>
  );
}
