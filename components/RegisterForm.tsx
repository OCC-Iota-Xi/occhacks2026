"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { motion } from "motion/react";
import { submitRegistration, type RegistrationState } from "@/app/register/actions";
import RevealLines from "@/components/motion/RevealLines";
import Reveal from "@/components/motion/Reveal";
import FieldRow from "@/components/FieldRow";
import CheckboxList from "@/components/CheckboxList";
import Combobox from "@/components/Combobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";
import { OCC_CLASSES, SHIRT_SIZES, TRACKS } from "@/lib/form-options";
import { isOldEnough, LATEST_DOB, UNDER_18_MESSAGE } from "@/lib/eligibility";
import { MAJORS, SCHOOLS } from "@/lib/school-options";

export interface RegistrationDefaults {
  full_name: string;
  school: string;
  major: string;
  occ_id: string;
  dob: string;
  email: string;
  phone: string;
  iota_xi: string;
  shirt: string;
  needs: string;
}

const initialState: RegistrationState = { ok: false, message: "" };

const STEPS = ["you", "contact", "details", "interests"] as const;
const LAST = STEPS.length;

/** Digits only, laid out US-style as you type: (714) 555-0123. */
function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/**
 * Names of the controls in one step that fail native constraint validation.
 * Radix's hidden bubble inputs are skipped — they're checked against React
 * state instead, since an invisible input can't be marked up in red.
 */
function nativeGaps(container: HTMLElement | null) {
  if (!container) return [];
  const gaps: string[] = [];
  const controls = container.querySelectorAll<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >("input, select, textarea");
  for (const control of controls) {
    if (control.getAttribute("aria-hidden") === "true") continue;
    if (control.type === "hidden") continue;
    if (!control.checkValidity()) gaps.push(control.name);
  }
  return gaps;
}

export default function RegisterForm({
  defaults,
  isUpdate,
}: {
  defaults?: Partial<RegistrationDefaults>;
  isUpdate?: boolean;
}) {
  const [state, formAction, pending] = useActionState(submitRegistration, initialState);
  const [iotaXi, setIotaXi] = useState(defaults?.iota_xi ?? "");
  const [shirt, setShirt] = useState(defaults?.shirt ?? "");
  const [phone, setPhone] = useState(formatPhone(defaults?.phone ?? ""));
  const [eligible, setEligible] = useState(!!isUpdate);

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  // Fields flagged red after a failed attempt to move on.
  const [invalid, setInvalid] = useState<string[]>([]);
  const isInvalid = (name: string) => invalid.includes(name);

  const formRef = useRef<HTMLFormElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (state.ok) window.scrollTo({ top: 0 });
  }, [state.ok]);

  /** Drops a field's red mark as soon as it's filled in. */
  function clearMark(name: string) {
    setInvalid((prev) => (prev.includes(name) ? prev.filter((f) => f !== name) : prev));
  }

  /** What's still missing in a step: a message plus the fields to mark red. */
  function validate(target: number) {
    const fields = nativeGaps(stepRefs.current[target - 1]);
    let message = "";

    if (target === 1) {
      const dob = String(new FormData(formRef.current!).get("dob") ?? "");
      if (!isOldEnough(dob)) {
        message = UNDER_18_MESSAGE;
        fields.push("dob");
      }
    }

    if (target === 3) {
      if (!iotaXi) fields.push("iota_xi");
      if (!shirt) fields.push("shirt");
    }

    if (target === LAST) {
      const data = new FormData(formRef.current!);
      const ranks = TRACKS.map((t) => String(data.get(`rank_${t.key}`) ?? ""));
      // Every rank picked, but not all three distinct.
      if (!ranks.includes("") && new Set(ranks).size !== TRACKS.length) {
        message = "rank each track once, using 1, 2, and 3.";
        fields.push(...TRACKS.map((t) => `rank_${t.key}`));
      }
      if (!eligible) fields.push("eligibility");
    }

    if (fields.length && !message) message = "fill in the fields marked in red.";
    return { message, fields: [...new Set(fields)] };
  }

  function goTo(target: number) {
    if (target > step) {
      // Walk forward one step at a time so nothing gets skipped over.
      for (let i = step; i < target; i++) {
        const { message, fields } = validate(i);
        if (fields.length) {
          setStep(i);
          setInvalid(fields);
          setError(message);
          return;
        }
      }
    }
    setError("");
    setInvalid([]);
    setStep(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    const { message, fields } = validate(LAST);
    if (fields.length) {
      event.preventDefault();
      setInvalid(fields);
      setError(message);
    }
  }

  if (state.ok) {
    return (
      <div className="py-24 text-center">
        <RevealLines
          onMount
          className="font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl"
          lines={[
            <span key="1">
              see you <span className="text-ring">out there</span>
            </span>,
          ]}
        />
        <Reveal className="mt-8" delay={0.3}>
          <p className="text-base text-muted-foreground">
            You&apos;re registered. We&apos;ll email you closer to the event
            with everything you need — see you oct 10–11.
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
      ref={formRef}
      action={formAction}
      onSubmit={onSubmit}
      // Steps that aren't on screen are display:none, and the browser refuses to
      // validate (or focus) those — every step is checked by hand instead.
      noValidate
      onChange={(event) => {
        const { name } = event.target as unknown as { name?: string };
        if (name) clearMark(name);
      }}
      onKeyDown={(event) => {
        const tag = (event.target as HTMLElement).tagName;
        if (event.key === "Enter" && step < LAST && tag !== "TEXTAREA" && tag !== "BUTTON") {
          event.preventDefault();
          goTo(step + 1);
        }
      }}
    >
      <Stepper
        value={step}
        onValueChange={goTo}
        indicators={{ completed: <Check className="size-4" strokeWidth={2.5} /> }}
      >
        <StepperNav className="mb-8 items-start">
          {STEPS.map((title, i) => (
            <StepperItem key={title} step={i + 1} className="relative flex-1 items-start">
              <StepperTrigger className="grow flex-col gap-3">
                <StepperIndicator className="size-8 border border-border bg-transparent text-sm text-muted-foreground/70 data-[state=active]:border-ring data-[state=active]:bg-transparent data-[state=active]:text-ring data-[state=completed]:border-ring data-[state=completed]:bg-ring data-[state=completed]:text-background">
                  {i + 1}
                </StepperIndicator>
                <StepperTitle className="text-sm font-normal data-[state=inactive]:text-muted-foreground/70">
                  {title}
                </StepperTitle>
              </StepperTrigger>
              {/* Pinned to the indicator's centre line so it bridges the two
                  circles rather than sitting under the titles. */}
              {i < LAST - 1 && (
                <StepperSeparator className="absolute left-[calc(50%+1.5rem)] top-4 m-0 h-px w-[calc(100%-3rem)] flex-none bg-border data-[state=completed]:bg-ring" />
              )}
            </StepperItem>
          ))}
        </StepperNav>

        <StepperPanel>
          <StepperContent value={1} forceMount>
            <div
              ref={(el) => {
                stepRefs.current[0] = el;
              }}
            >
              <FieldRow number="01" label="full name" htmlFor="name" invalid={isInvalid("name")}>
                <Input
                  id="name"
                  name="name"
                  placeholder="ada lovelace"
                  autoComplete="name"
                  defaultValue={defaults?.full_name}
                  aria-invalid={isInvalid("name")}
                  required
                />
              </FieldRow>

              <FieldRow
                number="02"
                label="what school do you go to?"
                htmlFor="school"
                hint="type to search — if yours isn't listed, just type it in."
                invalid={isInvalid("school")}
              >
                <Combobox
                  name="school"
                  groups={SCHOOLS}
                  placeholder="search for your school"
                  defaultValue={defaults?.school}
                  invalid={isInvalid("school")}
                />
              </FieldRow>

              <FieldRow
                number="03"
                label="what's your major?"
                htmlFor="major"
                invalid={isInvalid("major")}
              >
                <Combobox
                  name="major"
                  groups={MAJORS}
                  placeholder="search for your major"
                  defaultValue={defaults?.major}
                  invalid={isInvalid("major")}
                />
              </FieldRow>

              <FieldRow
                number="04"
                label="OCC student ID (if applicable)"
                htmlFor="occ_id"
              >
                <Input
                  id="occ_id"
                  name="occ_id"
                  placeholder="C01234567"
                  defaultValue={defaults?.occ_id}
                />
              </FieldRow>

              <FieldRow
                number="05"
                label="date of birth"
                htmlFor="dob"
                hint="you have to be 18 by oct 10, 2026 — we check IDs at check-in."
                invalid={isInvalid("dob")}
              >
                <Input
                  id="dob"
                  name="dob"
                  type="date"
                  // Opens on the last birthday that still clears 18, so the
                  // picker starts in range and scrolls back from there.
                  defaultValue={defaults?.dob || LATEST_DOB}
                  max={LATEST_DOB}
                  aria-invalid={isInvalid("dob")}
                  required
                />
              </FieldRow>
            </div>
          </StepperContent>

          <StepperContent value={2} forceMount>
            <div
              ref={(el) => {
                stepRefs.current[1] = el;
              }}
            >
              <FieldRow number="06" label="email address" htmlFor="email" invalid={isInvalid("email")}>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  defaultValue={defaults?.email}
                  aria-invalid={isInvalid("email")}
                  required
                />
              </FieldRow>

              <FieldRow
                number="07"
                label="phone number"
                htmlFor="phone"
                hint="optional — only used for day-of updates."
              >
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="(714) 555-0123"
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) => setPhone(formatPhone(event.target.value))}
                />
              </FieldRow>
            </div>
          </StepperContent>

          <StepperContent value={3} forceMount>
            <div
              ref={(el) => {
                stepRefs.current[2] = el;
              }}
            >
              <FieldRow
                number="08"
                label={
                  <>
                    are you a member of{" "}
                    <a
                      href="https://orangecoastcollege.edu/academics/honor-societies/societies/iota-xi.html"
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-4 transition-colors hover:text-ring"
                    >
                      Iota Xi Honor Society
                    </a>
                    ?
                  </>
                }
                invalid={isInvalid("iota_xi")}
              >
                <RadioGroup
                  name="iota_xi"
                  value={iotaXi}
                  onValueChange={(value) => {
                    setIotaXi(value);
                    clearMark("iota_xi");
                  }}
                  aria-invalid={isInvalid("iota_xi")}
                  required
                >
                  <RadioGroupItem value="yes">yes</RadioGroupItem>
                  <RadioGroupItem value="no">no</RadioGroupItem>
                </RadioGroup>
              </FieldRow>

              <FieldRow number="09" label="t-shirt size" invalid={isInvalid("shirt")}>
                <RadioGroup
                  name="shirt"
                  value={shirt}
                  onValueChange={(value) => {
                    setShirt(value);
                    clearMark("shirt");
                  }}
                  aria-invalid={isInvalid("shirt")}
                  required
                >
                  {SHIRT_SIZES.map((size) => (
                    <RadioGroupItem key={size} value={size}>
                      {size}
                    </RadioGroupItem>
                  ))}
                </RadioGroup>
              </FieldRow>

              <FieldRow
                number="10"
                label="any accessibility, dietary, or other needs we should know about?"
                htmlFor="needs"
                hint="allergies, mobility, quiet space, anything at all."
                wide
              >
                <Textarea
                  id="needs"
                  name="needs"
                  placeholder="…"
                  defaultValue={defaults?.needs}
                  className="min-h-20"
                />
              </FieldRow>
            </div>
          </StepperContent>

          <StepperContent value={LAST} forceMount>
            <div
              ref={(el) => {
                stepRefs.current[3] = el;
              }}
            >
              <FieldRow
                number="11"
                label="are you currently taking any of these classes at OCC?"
                hint="extra credit is available — no double dipping. leave blank if none apply."
                wide
              >
                <CheckboxList name="classes" options={OCC_CLASSES} />
              </FieldRow>

              <FieldRow
                number="12"
                label="rank the tracks"
                hint="1 = most interested, 3 = least. use each number once."
                wide
                invalid={TRACKS.some((t) => isInvalid(`rank_${t.key}`))}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-5">
                  {TRACKS.map((t) => (
                    <div key={t.key} className="flex items-center justify-between gap-3">
                      <span className="text-sm text-muted-foreground">{t.label}</span>
                      <Select
                        name={`rank_${t.key}`}
                        defaultValue=""
                        aria-invalid={isInvalid(`rank_${t.key}`)}
                        required
                        className="max-w-24 sm:w-12"
                      >
                        <option value="" disabled>
                          —
                        </option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                      </Select>
                    </div>
                  ))}
                </div>
              </FieldRow>

              <div className="py-4">
                <label className="mx-auto flex max-w-xl cursor-pointer items-center justify-center gap-3 text-left">
                  <Checkbox
                    name="eligibility"
                    checked={eligible}
                    onCheckedChange={(checked) => {
                      setEligible(checked === true);
                      clearMark("eligibility");
                    }}
                    aria-invalid={isInvalid("eligibility")}
                    required
                  />
                  <span
                    className={`text-base ${
                      isInvalid("eligibility") ? "text-destructive" : "text-muted-foreground"
                    }`}
                  >
                    I&apos;ll be 18 or older by oct 10, 2026, I&apos;m currently enrolled as a
                    student, and I agree to follow the event code of conduct.
                  </span>
                </label>
              </div>
            </div>
          </StepperContent>
        </StepperPanel>
      </Stepper>

      <div className="flex items-center justify-between gap-4 py-8">
        <Button
          type="button"
          onClick={() => goTo(step - 1)}
          disabled={step === 1}
          className="h-auto rounded-full border border-border bg-transparent px-6 py-3 text-sm text-muted-foreground hover:text-foreground disabled:invisible md:px-8 md:py-4 md:text-base"
        >
          back
        </Button>

        <p className="text-sm tabular-nums text-muted-foreground/70">
          step {step} of {LAST}
        </p>

        <motion.div whileTap={{ scale: 0.97 }}>
          {step === LAST ? (
            <Button
              type="submit"
              disabled={pending}
              className="h-auto rounded-full bg-foreground px-6 py-3 text-sm text-background hover:bg-foreground/85 disabled:opacity-60 md:px-8 md:py-4 md:text-base"
            >
              {pending ? "saving…" : isUpdate ? "update registration" : "submit registration"}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => goTo(step + 1)}
              className="h-auto rounded-full bg-foreground px-6 py-3 text-sm text-background hover:bg-foreground/85 md:px-8 md:py-4 md:text-base"
            >
              next
            </Button>
          )}
        </motion.div>
      </div>

      {(error || state.message) && (
        <p className="pb-8 text-center text-base text-destructive" role="alert">
          {error || state.message}
        </p>
      )}
    </form>
  );
}
