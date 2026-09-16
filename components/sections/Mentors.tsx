"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/motion/Reveal";
import PersonCard, { type Person } from "@/components/sections/PersonCard";
import { Button } from "@/components/ui/button";
import { fadeIn, fadeUp, stagger, viewportOnce } from "@/lib/motion";

/*
 * Everyone appears exactly once. What each person is doing — keynote panel,
 * fireside chat, mentoring, or more than one of those — is a tag on their
 * card rather than a separate grid, so nobody is listed twice.
 *
 * Keynote panel conditions from the panelists' side: first names and titles
 * only, and never framed as an AI panel anywhere public. That applies to the
 * rendered name and the image alt text alike.
 */

const PEOPLE: Person[] = [
  {
    id: "zhen",
    name: "Zhen",
    roles: ["Director of Applied Science @ Blizzard"],
    involvement: ["keynote panel"],
    palette: 1,
    photo: "/guest_speakers/zhen_zhai.jpg",
  },
  {
    id: "mike",
    name: "Mike",
    roles: ["Former Development Director @ Amazon Game Studios"],
    involvement: ["keynote panel"],
    palette: 0,
    photo: "/guest_speakers/michael_boccieri.jpeg",
  },
  {
    id: "dailin",
    name: "Dailin Hu",
    roles: ["Senior Applied Scientist @ Blizzard"],
    involvement: ["keynote panel", "mentor"],
    palette: 1,
    photo: "/guest_speakers/dailin_hu.jpeg",
  },
  {
    id: "nada",
    name: "Nada Lahjouji",
    roles: ["Applied Scientist @ Blizzard"],
    involvement: ["keynote panel", "mentor"],
    palette: 2,
    photo: "/guest_speakers/nada_lahjouji.jpeg",
  },
  {
    id: "owen",
    name: "Owen Wolf",
    roles: ["Lead SRE @ PlayStation"],
    involvement: ["fireside chat", "mentor"],
    palette: 0,
    photo: "/guest_speakers/owen_wolf.jpeg",
  },
  {
    id: "wesley",
    name: "Wesley Wu",
    roles: ["Senior Software Engineer @ Amazon"],
    involvement: ["fireside chat", "mentor"],
    palette: 1,
    photo: "/guest_speakers/wesley_wu.jpeg",
  },
  {
    id: "yash",
    name: "Yash Gupta",
    roles: ["Senior Software Engineer @ PIMCO"],
    involvement: ["fireside chat", "mentor"],
    palette: 0,
    photo: "/guest_speakers/yash_gupta.jpeg",
  },
  {
    id: "kevin",
    name: "Kevin Doan",
    roles: ["Start-up Founder"],
    involvement: ["mentor"],
    palette: 2,
    photo: "/guest_speakers/kevin_doan.jpeg",
  },
  {
    id: "ashwin",
    name: "Ashwin Colaco",
    roles: ["PhD Researcher @ UC Irvine"],
    involvement: ["mentor"],
    palette: 3,
  },
];

const firstNameOnly = (person: Person): Person => ({ ...person, name: person.name.split(" ")[0] });

/** Nine orbits at nine slightly different speeds, so they never sync up. */
const orbitSeconds = (i: number) => 28 + (i % 5) * 3;

/**
 * Everyone joining us from industry, as one roster. Each card carries the
 * tags for what that person is doing, so the people who are both speaking
 * and mentoring appear once rather than twice. Planet avatars throughout.
 */
export default function Mentors() {
  const reduceMotion = useReducedMotion();
  const item = reduceMotion ? fadeIn : fadeUp;

  return (
    <section id="mentors" className="scroll-mt-24 px-6 py-16 md:py-24">
      <SectionHeading plain="Guest Speakers & Mentors" accent="" className="mb-6" />

      <motion.div
        className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-x-8 gap-y-14 sm:grid-cols-3"
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        {PEOPLE.map(firstNameOnly).map((person, i) => (
          <motion.div key={person.id} variants={item} className="h-full">
            <PersonCard person={person} orbitSeconds={orbitSeconds(i)} />
          </motion.div>
        ))}
      </motion.div>

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
