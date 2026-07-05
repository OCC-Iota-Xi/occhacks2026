import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/motion/Reveal";

const SPONSORS = [
  { name: "OCC Division of Technology", tier: "platinum" },
  { name: "Google Cloud", tier: "platinum" },
  { name: "GitHub", tier: "gold" },
  { name: "Vercel", tier: "gold" },
  { name: "GSAP", tier: "gold" },
  { name: "Retool", tier: "gold" },
  { name: "StandOut Stickers", tier: "silver" },
  { name: "Major League Hacking", tier: "silver" },
  { name: "Wolfram Language", tier: "silver" },
  { name: "OCC CS Club", tier: "silver" },
];

export default function Sponsors() {
  return (
    <section id="sponsors" className="scroll-mt-24 px-6 py-24 md:py-32">
      <SectionHeading plain="with" accent="friends" className="mb-6" />
      <Reveal className="mx-auto max-w-xl text-center" delay={0.05}>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          Our sponsors keep OCC Hacks free for every student who walks in the door.
        </p>
      </Reveal>

      <Reveal className="mx-auto mt-14 max-w-4xl" delay={0.1}>
        <div className="grid grid-cols-2 border-t border-l border-border sm:grid-cols-3 md:grid-cols-5">
          {SPONSORS.map((sponsor) => (
            <div
              key={sponsor.name}
              className="flex min-h-24 items-center justify-center border-r border-b border-border px-4 py-6 text-center"
            >
              <span className="text-sm text-muted-foreground/70 transition-colors duration-300 hover:text-foreground">
                {sponsor.name}
              </span>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal className="mt-10 text-center" delay={0.15}>
        <a
          href="mailto:sponsor@occhacks.com"
          className="text-sm text-muted-foreground transition-colors hover:text-ring"
        >
          want to sponsor? &rarr; sponsor@occhacks.com
        </a>
      </Reveal>
    </section>
  );
}
