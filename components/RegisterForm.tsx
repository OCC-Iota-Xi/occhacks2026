"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import RevealLines from "@/components/motion/RevealLines";
import Reveal from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

interface FieldRowProps {
  number: string;
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}

/** One ruled form row: number on top, label, control beneath — all centered. */
function FieldRow({ number, label, htmlFor, hint, children }: FieldRowProps) {
  return (
    <div className="border-t border-border py-8 text-center">
      <p className="text-xs tabular-nums text-muted-foreground/70">{number}</p>
      <Label htmlFor={htmlFor} className="mt-1.5">
        {label}
      </Label>
      <div className="mx-auto mt-4 max-w-sm">{children}</div>
      {hint && <p className="mt-3 text-xs text-muted-foreground/70">{hint}</p>}
    </div>
  );
}

export default function RegisterForm() {
  const [submitted, setSubmitted] = useState(false);
  const [track, setTrack] = useState("");
  const [team, setTeam] = useState("");
  const [experience, setExperience] = useState("");
  const [shirt, setShirt] = useState("");

  if (submitted) {
    return (
      <div className="py-24 text-center">
        <RevealLines
          onMount
          className="font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl"
          lines={[
            <span key="1">
              see you{" "}
              <span className="text-ring">out there</span>
            </span>,
          ]}
        />
        <Reveal className="mt-8" delay={0.3}>
          <p className="text-base text-muted-foreground">
            You&apos;re on the crew manifest. We&apos;ll email you closer to the event
            with everything you need — see you aboard, oct 11–12.
          </p>
          <Link href="/" className="mt-8 inline-block text-sm transition-colors hover:text-ring">
            &larr; back to the site
          </Link>
        </Reveal>
      </div>
    );
  }

  return (
    <form
      className="border-b border-border"
      onSubmit={(e) => {
        // Draft form: no backend wired up yet — swap this for a real
        // submission (server action / form service) before launch.
        e.preventDefault();
        setSubmitted(true);
        window.scrollTo({ top: 0 });
      }}
    >
      <FieldRow number="01" label="full name" htmlFor="name">
        <Input id="name" name="name" placeholder="ada lovelace" autoComplete="name" required />
      </FieldRow>

      <FieldRow number="02" label="email" htmlFor="email">
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@school.edu"
          autoComplete="email"
          required
        />
      </FieldRow>

      <FieldRow number="03" label="school" htmlFor="school">
        <Input id="school" name="school" placeholder="orange coast college" required />
      </FieldRow>

      <FieldRow number="04" label="which track are you eyeing?" hint="no pressure — you can switch any time before submissions.">
        <RadioGroup name="track" value={track} onValueChange={setTrack} required>
          <RadioGroupItem value="education">education</RadioGroupItem>
          <RadioGroupItem value="productivity">productivity</RadioGroupItem>
          <RadioGroupItem value="spoof-apps">spoof apps</RadioGroupItem>
          <RadioGroupItem value="undecided">undecided</RadioGroupItem>
        </RadioGroup>
      </FieldRow>

      <FieldRow number="05" label="do you have a team?" hint="teams are 1–4 people. we run team formation at kickoff.">
        <RadioGroup name="team" value={team} onValueChange={setTeam} required>
          <RadioGroupItem value="yes">i have a team</RadioGroupItem>
          <RadioGroupItem value="no">match me with one</RadioGroupItem>
        </RadioGroup>
      </FieldRow>

      <FieldRow number="06" label="hackathon experience">
        <RadioGroup name="experience" value={experience} onValueChange={setExperience} required>
          <RadioGroupItem value="first">this is my first</RadioGroupItem>
          <RadioGroupItem value="some">been to a few</RadioGroupItem>
          <RadioGroupItem value="lots">seasoned</RadioGroupItem>
        </RadioGroup>
      </FieldRow>

      <FieldRow number="07" label="t-shirt size">
        <RadioGroup name="shirt" value={shirt} onValueChange={setShirt} required>
          <RadioGroupItem value="s">s</RadioGroupItem>
          <RadioGroupItem value="m">m</RadioGroupItem>
          <RadioGroupItem value="l">l</RadioGroupItem>
          <RadioGroupItem value="xl">xl</RadioGroupItem>
        </RadioGroup>
      </FieldRow>

      <FieldRow number="08" label="dietary restrictions" htmlFor="diet">
        <Input id="diet" name="diet" placeholder="none / vegetarian / allergies…" />
      </FieldRow>

      <FieldRow
        number="09"
        label="anything else we should know?"
        htmlFor="notes"
        hint="accessibility needs, questions, or just say hi."
      >
        <Textarea id="notes" name="notes" placeholder="…" />
      </FieldRow>

      <div className="border-t border-border py-8">
        <label className="mx-auto flex max-w-md cursor-pointer items-start justify-center gap-3 text-left">
          <Checkbox name="eligibility" required className="mt-0.5" />
          <span className="text-sm text-muted-foreground">
            I&apos;m 18 or older, currently enrolled as a student, and I agree to follow
            the event code of conduct.
          </span>
        </label>
      </div>

      <div className="border-t border-border py-10 text-center">
        <motion.div whileTap={{ scale: 0.97 }} className="inline-block">
          <Button
            type="submit"
            className="h-auto rounded-full bg-foreground px-8 py-3 text-sm text-background hover:bg-foreground/85"
          >
            submit registration
          </Button>
        </motion.div>
        <p className="mt-4 text-xs text-muted-foreground/70">
          free to attend · every meal covered · oct 11–12, 2026
        </p>
      </div>
    </form>
  );
}
