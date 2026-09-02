import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";

const MENTORS: { name: string; roles: string[]; palette: number }[] = [
  {
    name: "Yash Gupta",
    roles: ["Senior Software Engineer @ PIMCO"],
    palette: 0,
  },
  {
    name: "Dailin Hu",
    roles: ["Senior Applied AI Scientist @ Blizzard"],
    palette: 1,
  },
  {
    name: "Nada Lahjouji",
    roles: ["Applied AI Scientist @ Blizzard"],
    palette: 2,
  },
  {
    name: "Ashwin Colaco",
    roles: ["PhD Researcher @ UC Irvine"],
    palette: 3,
  },
  {
    name: "Wesley Wu",
    roles: ["Senior Software Engineer @ Amazon"],
    palette: 1,
  },
  {
    name: "Owen Wolf",
    roles: ["Lead SRE @ PlayStation"],
    palette: 0,
  },
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
 * The mentors as a grid of flat-art "planet" avatars — initials on a
 * gradient disc with an orbit ring — matching the tracks' planet motif.
 */
export default function Mentors() {
  return (
    <section id="mentors" className="scroll-mt-24 px-6 py-16 md:py-24">
      <SectionHeading plain="Mentors" accent="" className="mb-6" />

      <Reveal className="mx-auto mt-14 max-w-4xl" delay={0.1}>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-12">
          {MENTORS.map((mentor) => (
            <div
              key={mentor.name}
              className="group flex w-[calc(50%-1rem)] flex-col items-center gap-4 text-center sm:w-[calc(33.333%-1.334rem)]"
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
                {mentor.roles.map((role) => (
                  <p
                    key={role}
                    className="mt-1 text-sm text-muted-foreground/80 transition-colors duration-300 group-hover:text-foreground sm:text-base"
                  >
                    {role}
                  </p>
                ))}
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
