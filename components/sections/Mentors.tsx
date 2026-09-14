import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/motion/Reveal";
import PersonCard, { type Person } from "@/components/sections/PersonCard";
import { Button } from "@/components/ui/button";

/*
 * Everyone is defined once. Every group on the page shows first names only.
 *
 * Keynote panel conditions from the panelists' side: first names and titles
 * only, and never framed as an AI panel anywhere public.
 */

const ZHEN: Person = {
  name: "Zhen",
  roles: ["Director of Applied Science @ Blizzard"],
  palette: 1,
  photo: "/guest_speakers/zhen_zhai.jpg",
};
const MIKE: Person = {
  name: "Mike",
  roles: ["Former Development Director @ Amazon Game Studios"],
  palette: 0,
  photo: "/guest_speakers/michael_boccieri.jpeg",
};

const YASH: Person = {
  name: "Yash Gupta",
  roles: ["Senior Software Engineer @ PIMCO"],
  palette: 0,
  photo: "/guest_speakers/yash_gupta.jpeg",
};
const DAILIN: Person = {
  name: "Dailin Hu",
  roles: ["Senior Applied Scientist @ Blizzard"],
  palette: 1,
  photo: "/guest_speakers/dailin_hu.jpeg",
};
const NADA: Person = {
  name: "Nada Lahjouji",
  roles: ["Applied Scientist @ Blizzard"],
  palette: 2,
  photo: "/guest_speakers/nada_lahjouji.jpeg",
};
const ASHWIN: Person = {
  name: "Ashwin Colaco",
  roles: ["PhD Researcher @ UC Irvine"],
  palette: 3,
};
const WESLEY: Person = {
  name: "Wesley Wu",
  roles: ["Senior Software Engineer @ Amazon"],
  palette: 1,
  photo: "/guest_speakers/wesley_wu.jpeg",
};
const OWEN: Person = {
  name: "Owen Wolf",
  roles: ["Lead SRE @ PlayStation"],
  palette: 0,
  photo: "/guest_speakers/owen_wolf.jpeg",
};
const KEVIN: Person = {
  name: "Kevin Doan",
  roles: ["Start-up Founder"],
  palette: 2,
  photo: "/guest_speakers/kevin_doan.jpeg",
};

const firstNameOnly = (person: Person): Person => ({ ...person, name: person.name.split(" ")[0] });

const KEYNOTE_PANEL = [ZHEN, MIKE, DAILIN, NADA].map(firstNameOnly);
const FIRESIDE_CHAT = [OWEN, WESLEY, YASH].map(firstNameOnly);

/** Mentors with a photo lead; initials-only cards sink to the end, keeping list order within each group. */
const MENTORS = [YASH, DAILIN, NADA, ASHWIN, WESLEY, OWEN, KEVIN]
  .sort((a, b) => Number(!a.photo) - Number(!b.photo))
  .map(firstNameOnly);

/** Sub-group title inside the section: white display face, one size below the section heading. */
function GroupTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-display text-2xl tracking-tight text-foreground sm:text-3xl">{children}</h3>
  );
}

/**
 * Everyone joining us from industry. The keynote panel and fireside chat sit
 * side by side on wide screens, with the full mentors grid below; every group
 * stacks on smaller screens. Planet avatars throughout.
 */
export default function Mentors() {
  return (
    <section id="mentors" className="scroll-mt-24 px-6 py-16 md:py-24">
      <SectionHeading plain="Guest Speakers & Mentors" accent="" className="mb-6" />

      <div className="mx-auto mt-14 grid max-w-[90rem] gap-16 xl:grid-cols-[4fr_3fr] xl:items-start xl:gap-12">
        <Reveal className="text-center" delay={0.05}>
          <GroupTitle>Keynote Panel</GroupTitle>
          <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-12">
            {KEYNOTE_PANEL.map((person) => (
              <PersonCard
                key={person.name}
                person={person}
                className="w-[calc(50%-1rem)] sm:w-[calc(25%-1.5rem)]"
              />
            ))}
          </div>
        </Reveal>

        <Reveal className="text-center xl:border-l xl:border-white/10 xl:pl-12" delay={0.1}>
          <GroupTitle>Fireside Chat</GroupTitle>
          <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-12">
            {FIRESIDE_CHAT.map((person) => (
              <PersonCard
                key={person.name}
                person={person}
                className="w-[calc(50%-1rem)] sm:w-[calc(33.333%-1.334rem)]"
              />
            ))}
          </div>
        </Reveal>
      </div>

      <Reveal className="mx-auto mt-20 max-w-5xl text-center" delay={0.1}>
        <GroupTitle>Mentors</GroupTitle>
        <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-12">
          {MENTORS.map((mentor) => (
            <PersonCard
              key={mentor.name}
              person={mentor}
              className="w-[calc(50%-1rem)] sm:w-[calc(33.333%-1.334rem)] md:w-[calc(25%-1.5rem)]"
            />
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
