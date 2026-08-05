"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { submitVolunteer, type RegistrationState } from "@/app/register/actions";
import RevealLines from "@/components/motion/RevealLines";
import Reveal from "@/components/motion/Reveal";
import FieldRow from "@/components/FieldRow";
import CheckboxList from "@/components/CheckboxList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { AVAILABILITY_BLOCKS, OCC_CLASSES, SHIRT_SIZES } from "@/lib/form-options";

export interface VolunteerDefaults {
  full_name: string;
  occ_id: string;
  dob: string;
  email: string;
  phone: string;
  iota_xi: string;
  role: string;
  shirt: string;
  needs: string;
  expertise: string;
}

const initialState: RegistrationState = { ok: false, message: "" };

export default function VolunteerForm({
  defaults,
  isUpdate,
}: {
  defaults?: Partial<VolunteerDefaults>;
  isUpdate?: boolean;
}) {
  const [state, formAction, pending] = useActionState(submitVolunteer, initialState);
  const [role, setRole] = useState(defaults?.role ?? "");
  const [iotaXi, setIotaXi] = useState(defaults?.iota_xi ?? "");
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
              thank you <span className="text-ring">for helping</span>
            </span>,
          ]}
        />
        <Reveal className="mt-8" delay={0.3}>
          <p className="text-base text-muted-foreground">
            You&apos;re signed up. We&apos;ll email you with shift details and
            everything else closer to the event.
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

      <FieldRow
        number="02"
        label="OCC student ID"
        htmlFor="occ_id"
        hint="if applicable — leave blank if you're not an OCC student."
      >
        <Input id="occ_id" name="occ_id" placeholder="C01234567" defaultValue={defaults?.occ_id} />
      </FieldRow>

      <FieldRow number="03" label="date of birth" htmlFor="dob">
        <Input id="dob" name="dob" type="date" defaultValue={defaults?.dob} required />
      </FieldRow>

      <FieldRow number="04" label="email address" htmlFor="email">
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          defaultValue={defaults?.email}
          required
        />
      </FieldRow>

      <FieldRow number="05" label="phone number" htmlFor="phone">
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="(714) 555-0123"
          autoComplete="tel"
          defaultValue={defaults?.phone}
          required
        />
      </FieldRow>

      <FieldRow number="06" label="are you a member of Iota Xi?">
        <RadioGroup name="iota_xi" value={iotaXi} onValueChange={setIotaXi} required>
          <RadioGroupItem value="yes">yes</RadioGroupItem>
          <RadioGroupItem value="no">no</RadioGroupItem>
        </RadioGroup>
      </FieldRow>

      <FieldRow number="07" label="how do you want to help?">
        <RadioGroup name="role" value={role} onValueChange={setRole} required>
          <RadioGroupItem value="volunteer">volunteer</RadioGroupItem>
          <RadioGroupItem value="mentor">mentor</RadioGroupItem>
          <RadioGroupItem value="both">either works</RadioGroupItem>
        </RadioGroup>
      </FieldRow>

      <FieldRow
        number="08"
        label="which time periods are you available to help?"
        hint="check every block that works — we'll build shifts around it."
        wide
      >
        <CheckboxList name="availability" options={AVAILABILITY_BLOCKS} />
      </FieldRow>

      <FieldRow
        number="09"
        label="what can you help with?"
        htmlFor="expertise"
        hint="mentors: languages, frameworks, or topics you can guide on. volunteers: anything you'd rather do or avoid."
        wide
      >
        <Textarea
          id="expertise"
          name="expertise"
          placeholder="…"
          defaultValue={defaults?.expertise}
        />
      </FieldRow>

      <FieldRow number="10" label="t-shirt size">
        <RadioGroup name="shirt" value={shirt} onValueChange={setShirt} required>
          {SHIRT_SIZES.map((size) => (
            <RadioGroupItem key={size} value={size}>
              {size}
            </RadioGroupItem>
          ))}
        </RadioGroup>
      </FieldRow>

      <FieldRow
        number="11"
        label="any accessibility, dietary, or other needs we should know about?"
        htmlFor="needs"
        hint="allergies, mobility, quiet space, anything at all."
        wide
      >
        <Textarea id="needs" name="needs" placeholder="…" defaultValue={defaults?.needs} />
      </FieldRow>

      <FieldRow
        number="12"
        label="are you currently taking any of these classes at OCC?"
        hint="extra credit is available — no double dipping. leave blank if none apply."
        wide
      >
        <CheckboxList name="classes" options={OCC_CLASSES} />
      </FieldRow>

      <div className="border-t border-border py-8">
        <label className="mx-auto flex max-w-md cursor-pointer items-start justify-center gap-3 text-left">
          <Checkbox name="eligibility" defaultChecked={isUpdate} required className="mt-0.5" />
          <span className="text-sm text-muted-foreground">
            I&apos;m 18 or older and I agree to follow the event code of conduct.
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
            {pending ? "saving…" : isUpdate ? "update sign-up" : "submit sign-up"}
          </Button>
        </motion.div>
        {state.message && (
          <p className="mt-4 text-sm text-ring" role="alert">
            {state.message}
          </p>
        )}
        <p className="mt-4 text-xs text-muted-foreground/70">
          meals covered for every shift · oct 10–11, 2026
        </p>
      </div>
    </form>
  );
}
