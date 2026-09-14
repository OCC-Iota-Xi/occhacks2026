import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/motion/Reveal";
import PersonCard, { type Person } from "@/components/sections/PersonCard";
import { Button } from "@/components/ui/button";

/**
 * Keynote panelists. First names and titles only, and no "AI" framing
 * anywhere public — both are conditions from the panelists' side. Frame it
 * as a career / industry panel.
 */
const PANELISTS: Person[] = [
  {
    name: "Zhen",
    roles: ["Director of Applied Science @ Blizzard"],
    palette: 1,
    photo: "/guest_speakers/zhen_zhai.jpg",
  },
  {
    name: "Mike",
    roles: ["Formerly Development Director @ Amazon Game Studios"],
    palette: 0,
    photo: "/guest_speakers/michael_boccieri.jpeg",
  },
];

/** Names and titles as supplied by the mentors themselves. */
const MENTORS: Person[] = [
  {
    name: "Yash Gupta",
    roles: ["Senior Software Engineer @ PIMCO"],
    palette: 0,
  },
  {
    name: "Dailin Hu",
    roles: ["Community Innovations Foundation"],
    palette: 1,
    photo: "/guest_speakers/dailin_hu.jpeg",
  },
  {
    name: "Nada Lahjouji",
    roles: ["Applied Scientist @ Blizzard"],
    palette: 2,
    photo: "/guest_speakers/nada_lahjouji.jpeg",
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
    photo: "/guest_speakers/wesley_wu.jpeg",
  },
  {
    name: "Owen Wolf",
    roles: ["Lead SRE @ PlayStation"],
    palette: 0,
    photo: "/guest_speakers/owen_wolf.jpeg",
  },
  {
    name: "Kevin Doan",
    roles: ["Start-up Founder"],
    palette: 2,
    photo: "/guest_speakers/kevin_doan.jpeg",
  },
];

/** Mentors with a photo lead; initials-only cards sink to the end, keeping list order within each group. */
const MENTORS_PHOTOS_FIRST = [...MENTORS].sort((a, b) => Number(!a.photo) - Number(!b.photo));

/** Sub-group title inside the section: white display face, one size below the section heading. */
function GroupTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-display text-2xl tracking-tight text-foreground sm:text-3xl">{children}</h3>
  );
}

/**
 * One section for everyone joining us from industry: the keynote career
 * panel (stacked) beside a four-across mentors grid on
 * desktop, one column on smaller screens. Planet avatars throughout, matching the tracks' planet motif.
 */
export default function Mentors() {
  return (
    <section id="mentors" className="scroll-mt-24 px-6 py-16 md:py-24">
      <SectionHeading plain="Guest Speakers & Mentors" accent="" className="mb-6" />

      <div className="mx-auto mt-14 grid max-w-[90rem] gap-16 lg:grid-cols-[1fr_2fr] lg:items-start lg:gap-12">
        <Reveal className="text-center" delay={0.05}>
          <GroupTitle>Fireside Chat</GroupTitle>
          <div className="mt-10 flex flex-col items-center gap-12">
            {PANELISTS.map((person) => (
              <PersonCard key={person.name} person={person} className="w-full max-w-xs" />
            ))}
          </div>
        </Reveal>

        <Reveal className="text-center lg:border-l lg:border-white/10 lg:pl-12" delay={0.1}>
          <GroupTitle>Mentors</GroupTitle>
          <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-12">
            {MENTORS_PHOTOS_FIRST.map((mentor) => (
              <PersonCard
                key={mentor.name}
                person={mentor}
                className="w-[calc(50%-1rem)] sm:w-[calc(33.333%-1.334rem)] md:w-[calc(25%-1.5rem)]"
              />
            ))}
          </div>
        </Reveal>
      </div>

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
