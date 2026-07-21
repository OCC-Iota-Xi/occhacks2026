"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { submitRegistration, type RegistrationState } from "@/app/register/actions";
import RevealLines from "@/components/motion/RevealLines";
import Reveal from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

export interface RegistrationDefaults {
  full_name: string;
  school: string;
  track: string;
  team: string;
  experience: string;
  shirt: string;
  diet: string;
  notes: string;
}

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

const initialState: RegistrationState = { ok: false, message: "" };

export default function RegisterForm({
  defaults,
  isUpdate,
}: {
  defaults?: Partial<RegistrationDefaults>;
  isUpdate?: boolean;
}) {
  const [state, formAction, pending] = useActionState(submitRegistration, initialState);
  const [track, setTrack] = useState(defaults?.track ?? "");
  const [team, setTeam] = useState(defaults?.team ?? "");
  const [experience, setExperience] = useState(defaults?.experience ?? "");
  const [shirt, setShirt] = useState(defaults?.shirt ?? "");

  useEffect(() => {
    if (state.ok) window.scrollTo({ top: 0 });
  }, [state.ok]);

  if (state.ok) {
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
            You&apos;re registered. We&apos;ll email you closer to the event
            with everything you need — see you oct 11–12.
          </p>
          <Link href="/" className="mt-8 inline-block text-sm transition-colors hover:text-ring">
            &larr; back to the site
          </Link>
        </Reveal>
      </div>
    );
  }

  return (
    <form action={formAction} className="border-b border-border">
      <FieldRow number="01" label="full name" htmlFor="name">
        <Input
          id="name"
          name="name"
          placeholder="ada lovelace"
          autoComplete="name"
          defaultValue={defaults?.full_name}
          required
        />
      </FieldRow>

      <FieldRow number="02" label="school" htmlFor="school">
        <Input
          id="school"
          name="school"
          placeholder="orange coast college"
          defaultValue={defaults?.school}
          required
        />
      </FieldRow>

      <FieldRow number="03" label="which track are you eyeing?" hint="no pressure — you can switch any time before submissions.">
        <RadioGroup name="track" value={track} onValueChange={setTrack} required>
          <RadioGroupItem value="entertainment">entertainment</RadioGroupItem>
          <RadioGroupItem value="education-learning">education & learning</RadioGroupItem>
          <RadioGroupItem value="productivity-society">productivity & society</RadioGroupItem>
          <RadioGroupItem value="undecided">undecided</RadioGroupItem>
        </RadioGroup>
      </FieldRow>

      <FieldRow number="04" label="do you have a team?" hint="teams are 1–4 people. we run team formation at kickoff.">
        <RadioGroup name="team" value={team} onValueChange={setTeam} required>
          <RadioGroupItem value="yes">i have a team</RadioGroupItem>
          <RadioGroupItem value="no">match me with one</RadioGroupItem>
        </RadioGroup>
      </FieldRow>

      <FieldRow number="05" label="hackathon experience">
        <RadioGroup name="experience" value={experience} onValueChange={setExperience} required>
          <RadioGroupItem value="first">this is my first</RadioGroupItem>
          <RadioGroupItem value="some">been to a few</RadioGroupItem>
          <RadioGroupItem value="lots">seasoned</RadioGroupItem>
        </RadioGroup>
      </FieldRow>

      <FieldRow number="06" label="t-shirt size">
        <RadioGroup name="shirt" value={shirt} onValueChange={setShirt} required>
          <RadioGroupItem value="s">s</RadioGroupItem>
          <RadioGroupItem value="m">m</RadioGroupItem>
          <RadioGroupItem value="l">l</RadioGroupItem>
          <RadioGroupItem value="xl">xl</RadioGroupItem>
        </RadioGroup>
      </FieldRow>

      <FieldRow number="07" label="dietary restrictions" htmlFor="diet">
        <Input id="diet" name="diet" placeholder="none / vegetarian / allergies…" defaultValue={defaults?.diet} />
      </FieldRow>

      <FieldRow
        number="08"
        label="anything else we should know?"
        htmlFor="notes"
        hint="accessibility needs, questions, or just say hi."
      >
        <Textarea id="notes" name="notes" placeholder="…" defaultValue={defaults?.notes} />
      </FieldRow>

      <div className="border-t border-border py-8">
        <label className="mx-auto flex max-w-md cursor-pointer items-start justify-center gap-3 text-left">
          <Checkbox name="eligibility" defaultChecked={isUpdate} required className="mt-0.5" />
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
            disabled={pending}
            className="h-auto rounded-full bg-foreground px-8 py-3 text-sm text-background hover:bg-foreground/85 disabled:opacity-60"
          >
            {pending ? "saving…" : isUpdate ? "update registration" : "submit registration"}
          </Button>
        </motion.div>
        {state.message && (
          <p className="mt-4 text-sm text-ring" role="alert">
            {state.message}
          </p>
        )}
        <p className="mt-4 text-xs text-muted-foreground/70">
          free to attend · every meal covered · oct 11–12, 2026
        </p>
      </div>
    </form>
  );
}
