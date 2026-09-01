import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";

const MENTORS: { name: string; role: string; palette: number }[] = [
  { name: "Ada Lovelace", role: "Software Engineer · Google", palette: 0 },
  { name: "Grace Hopper", role: "Staff Engineer · Amazon", palette: 1 },
  { name: "Alan Turing", role: "ML Researcher · OpenAI", palette: 2 },
  { name: "Katherine Johnson", role: "Data Scientist · NASA JPL", palette: 3 },
  { name: "Dennis Ritchie", role: "Systems Engineer · Nvidia", palette: 1 },
  { name: "Margaret Hamilton", role: "CS Faculty · OCC", palette: 0 },
];

/** Flat-art gradient discs echoing the track planets: earth, saturn, pluto, gold. */
const PALETTES = [
  "radial-gradient(circle at 35% 30%, #4f8fd9, #1e4e8f 70%)",
  "radial-gradient(circle at 35% 30%, #e8c97a, #a9822f 70%)",
  "radial-gradient(circle at 35% 30%, #d9c6ae, #8f7a5e 70%)",
  "radial-gradient(circle at 35% 30%, #fcd34d, #b45309 70%)",
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

/**
 * The mentor crew as a grid of flat-art "planet" avatars — initials on a
 * gradient disc with an orbit ring — matching the tracks' planet motif.
 */
export default function Mentors() {
  return (
    <section id="mentors" className="scroll-mt-24 px-6 py-16 md:py-24">
      <SectionHeading plain="Mentors" accent="" className="mb-6" />

      <Reveal className="mx-auto max-w-xl text-center" delay={0.1}>
        <p className="font-body text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
          industry engineers and OCC faculty, on the floor all weekend to help
          you debug, design, and ship.
        </p>
      </Reveal>

      <Reveal className="mx-auto mt-14 max-w-4xl" delay={0.15}>
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3">
          {MENTORS.map((mentor) => (
            <div
              key={mentor.name}
              className="group flex flex-col items-center gap-4 text-center"
            >
              <div className="relative flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-[-10px] rounded-full border border-white/15 transition-transform duration-500 ease-out group-hover:rotate-45"
                  style={{ transform: "rotate(-12deg) scaleY(0.92)" }}
                />
                <div
                  className="flex h-full w-full items-center justify-center rounded-full transition duration-300 ease-out group-hover:scale-110 group-hover:brightness-110"
                  style={{ background: PALETTES[mentor.palette] }}
                >
                  <span className="font-header text-2xl tracking-wider text-[#0b0d17] sm:text-3xl">
                    {initials(mentor.name)}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="font-header text-base tracking-wider text-[var(--text-primary)] sm:text-lg">
                  {mentor.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground/70 transition-colors duration-300 group-hover:text-foreground">
                  {mentor.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal className="mt-14 text-center" delay={0.2}>
        <Button
          asChild
          className="h-auto rounded-full bg-foreground px-8 py-3 text-sm text-background hover:bg-foreground/85"
        >
          <Link href="/mentor">become a mentor</Link>
        </Button>
      </Reveal>
    </section>
  );
}
