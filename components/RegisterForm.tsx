"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { motion } from "motion/react";
import posthog from "posthog-js";
import {
  saveRegistrationDraft,
  submitRegistration,
  type RegistrationState,
} from "@/app/register/actions";
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
import {
  firstGap,
  formatPhone,
  nativeGaps,
  scrollToField,
  type Gap,
} from "@/lib/form-fields";
import {
  applyDraft,
  many,
  one,
  readDraft,
  snapshotForm,
  writeDraft,
  type Draft,
} from "@/lib/form-draft";
import { useAutosave } from "@/lib/use-autosave";
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
  eligibility_agreed: boolean;
  email_opt_in: boolean;
  classes: string[];
  /** Track key -> "1" | "2" | "3" | "", as stored. */
  ranks: Record<string, string>;
}

const initialState: RegistrationState = { ok: false, message: "" };

const STEPS = ["you", "contact", "details", "interest and extra credit"] as const;
const LAST = STEPS.length;

const DRAFT_KEY = "occhacks:register-draft";

export default function RegisterForm({
  defaults,
  isUpdate,
}: {
  defaults?: Partial<RegistrationDefaults>;
  isUpdate?: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    async (previousState: RegistrationState, formData: FormData) => {
      const nextState = await submitRegistration(previousState, formData);
      if (nextState.ok) posthog.capture("registration_submitted");
      return nextState;
    },
    initialState
  );
  const [iotaXi, setIotaXi] = useState(defaults?.iota_xi ?? "");
  const [shirt, setShirt] = useState(defaults?.shirt ?? "");
  const [phone, setPhone] = useState(formatPhone(defaults?.phone ?? ""));
  const [eligible, setEligible] = useState(!!defaults?.eligibility_agreed);
  const [emailOptIn, setEmailOptIn] = useState(!!defaults?.email_opt_in);

  // Track key -> "1" | "2" | "3" | "". Kept controlled so a number can never be
  // used twice: picking a taken number hands the picker's old value to whoever
  // had it, which is always a swap between two tracks.
  const [ranks, setRanks] = useState<Record<string, string>>(() =>
    Object.fromEntries(TRACKS.map((t) => [t.key, defaults?.ranks?.[t.key] ?? ""]))
  );

  function setRank(key: string, value: string) {
    setRanks((prev) => {
      const next = { ...prev, [key]: value };
      const taken = TRACKS.find((t) => t.key !== key && prev[t.key] === value);
      if (taken) next[taken.key] = prev[key];
      return next;
    });
    for (const t of TRACKS) clearMark(`rank_${t.key}`);
    autosave.touch();
  }

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  // Fields flagged red after a failed attempt to move on.
  const [invalid, setInvalid] = useState<string[]>([]);
  const isInvalid = (name: string) => invalid.includes(name);

  const formRef = useRef<HTMLFormElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  /** When the step on screen last changed — see the guard in `onSubmit`. */
  const arrivedAt = useRef(0);

  const autosave = useAutosave({
    form: formRef,
    storageKey: DRAFT_KEY,
    save: saveRegistrationDraft,
  });

  /**
   * The browser-side draft, once it has been read.
   *
   * localStorage can't be touched while rendering — the server has no such
   * thing, and reading it during the first pass would hydrate to different
   * markup. So the first render shows the stored row, and this arrives on mount
   * to overlay anything newer the reader typed before the last write landed.
   */
  const [draft, setDraft] = useState<Draft | null>(null);
  const restored = useRef(false);
  /**
   * The exact answers the last submit posted — see the restore effect below.
   * Bumped into `draftKeyed` so components seeded off the draft remount when a
   * failed submit puts the snapshot back.
   */
  const submitted = useRef<Draft | null>(null);
  const [restores, setRestores] = useState(0);
  const draftKeyed = (label: string) => `${draft ? "draft" : "stored"}-${label}-${restores}`;

  useEffect(() => {
    if (restored.current) return;
    restored.current = true;

    const saved = readDraft(DRAFT_KEY);
    if (!saved) return;

    applyDraft(formRef.current, saved);
    /* eslint-disable react-hooks/set-state-in-effect -- localStorage has no
       server equivalent, so the draft can only be read after hydration. These
       are a one-shot handoff from that read, not a render loop. */
    // The controlled questions can't be restored through the DOM.
    if (one(saved, "iota_xi")) setIotaXi(one(saved, "iota_xi"));
    if (one(saved, "shirt")) setShirt(one(saved, "shirt"));
    if (one(saved, "phone")) setPhone(formatPhone(one(saved, "phone")));
    if (saved.eligibility) setEligible(true);
    if (saved.email_opt_in) setEmailOptIn(true);
    setRanks((prev) =>
      Object.fromEntries(
        TRACKS.map((t) => [t.key, one(saved, `rank_${t.key}`) || prev[t.key]])
      )
    );
    setDraft(saved);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (state.ok) {
      autosave.done();
      window.scrollTo({ top: 0 });
    }
  }, [state.ok, autosave]);

  /**
   * React resets every uncontrolled field once the action settles, success or
   * failure alike. Success swaps in the thank-you screen, so only failure
   * needs the answers back — restored from the snapshot `onSubmit` banked.
   */
  useEffect(() => {
    if (state.ok || !state.message) return;
    const saved = submitted.current ?? readDraft(DRAFT_KEY);
    if (!saved) return;

    applyDraft(formRef.current, saved);
    setDraft(saved);
    // Remounts the draft-keyed components so checkboxes re-seed from it.
    setRestores((n) => n + 1);
  }, [state]);

  /** Saved answers for a multi-answer question, newest source first. */
  function listDefaults(key: string, stored: string[]): string[] {
    return many(draft, key) ?? stored;
  }

  /** Drops a field's red mark as soon as it's filled in. */
  function clearMark(name: string) {
    setInvalid((prev) => (prev.includes(name) ? prev.filter((f) => f !== name) : prev));
  }

  /**
   * The step's unanswered questions, in the order they're asked — native gaps
   * first, since those controls come before the ones checked against state.
   */
  function gapsIn(target: number): Gap[] {
    const native = nativeGaps(stepRefs.current[target - 1]);
    // The three rank pickers read as one question, so they're flagged as one.
    const isRank = (name: string) => name.startsWith("rank_");
    const gaps: Gap[] = native.filter((n) => !isRank(n)).map((name) => ({ fields: [name] }));
    if (native.some(isRank)) {
      gaps.push({ fields: TRACKS.map((t) => `rank_${t.key}`) });
    }

    if (target === 1) {
      const dob = String(new FormData(formRef.current!).get("dob") ?? "");
      if (!isOldEnough(dob)) gaps.push({ fields: ["dob"], message: UNDER_18_MESSAGE });
    }

    if (target === 3) {
      if (!iotaXi) gaps.push({ fields: ["iota_xi"] });
      if (!shirt) gaps.push({ fields: ["shirt"] });
    }

    if (target === LAST) {
      const data = new FormData(formRef.current!);
      const ranks = TRACKS.map((t) => String(data.get(`rank_${t.key}`) ?? ""));
      // Every rank picked, but not all three distinct.
      if (!ranks.includes("") && new Set(ranks).size !== TRACKS.length) {
        gaps.push({
          fields: TRACKS.map((t) => `rank_${t.key}`),
          message: "rank each track once, using 1, 2, and 3.",
        });
      }
      if (!eligible) gaps.push({ fields: ["eligibility"] });
      if (!emailOptIn) gaps.push({ fields: ["email_opt_in"] });
    }

    return gaps;
  }

  /** Flags one question and brings it into view. */
  function flag(target: number, gap: { fields: string[]; message: string }) {
    setStep(target);
    setInvalid(gap.fields);
    setError(gap.message);
    arrivedAt.current = performance.now();
    // After the paint — a step being switched back to is still hidden here,
    // and hidden elements can't be scrolled to.
    requestAnimationFrame(() => scrollToField(formRef.current, gap.fields[0]));
  }

  function goTo(target: number) {
    if (target > step) {
      // Walk forward one step at a time so nothing gets skipped over.
      for (let i = step; i < target; i++) {
        const gap = firstGap(gapsIn(i));
        if (gap) {
          flag(i, gap);
          return;
        }
      }
      // Only a validated forward move counts as finishing a step, so the
      // funnel measures progress rather than flipping back and forth.
      posthog.capture("registration_step_completed", {
        step,
        step_title: STEPS[step - 1],
      });
    }
    setError("");
    setInvalid([]);
    setStep(target);
    arrivedAt.current = performance.now();
    // A step change is the reader visibly finishing a section — bank it now
    // instead of waiting out the debounce.
    autosave.flush();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    // "next" and the "submit" that replaces it share a corner, so the second
    // half of a double-click on the last "next" lands on submit. Anything that
    // fast is that stray click, not an answer — swallow it rather than mark a
    // step red the reader hasn't seen yet.
    if (performance.now() - arrivedAt.current < 700) {
      event.preventDefault();
      return;
    }

    const gap = firstGap(gapsIn(LAST));
    if (gap) {
      event.preventDefault();
      flag(LAST, gap);
      return;
    }

    // The submit is going ahead — bank exactly what it posts, in the ref for
    // the restore effect and in localStorage for a reload.
    submitted.current = snapshotForm(formRef.current);
    writeDraft(DRAFT_KEY, submitted.current);
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
            {/* Only the first submit sends one — an edit doesn't. */}
            {!isUpdate && " A confirmation email is on its way; check your spam folder if it doesn't turn up."}
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
        autosave.touch();
      }}
      // Enter advances a step, and on the last one does nothing at all —
      // submitting has to be a deliberate click, or a stray keystroke in the
      // write-in field would mark every unanswered question red.
      onKeyDown={(event) => {
        const tag = (event.target as HTMLElement).tagName;
        if (event.key !== "Enter" || tag === "TEXTAREA" || tag === "BUTTON") return;
        event.preventDefault();
        if (step < LAST) goTo(step + 1);
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
                  key={draftKeyed("school")}
                  name="school"
                  groups={SCHOOLS}
                  placeholder="search for your school"
                  defaultValue={one(draft, "school") || defaults?.school}
                  onCommit={autosave.touch}
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
                  key={draftKeyed("major")}
                  name="major"
                  groups={MAJORS}
                  placeholder="search for your major"
                  defaultValue={one(draft, "major") || defaults?.major}
                  onCommit={autosave.touch}
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
                hint="you have to be 18 by oct 10, 2026."
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
                label={
                  <>
                    phone number{" "}
                    <span className="text-muted-foreground/70">(optional)</span>
                  </>
                }
                htmlFor="phone"
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
                    autosave.touch();
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
                    autosave.touch();
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
                hint="extra credit is available — pick one, no double dipping. leave blank if none apply."
                wide
              >
                <CheckboxList
                  // Remounts once the browser draft lands (or a failed submit
                  // restores it), so the boxes re-seed from it rather than
                  // from the stored row.
                  key={draftKeyed("classes")}
                  name="classes"
                  options={OCC_CLASSES}
                  single
                  defaultValues={listDefaults("classes", defaults?.classes ?? [])}
                  onChange={autosave.touch}
                />
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
                        value={ranks[t.key]}
                        onChange={(event) => setRank(t.key, event.target.value)}
                        aria-invalid={isInvalid(`rank_${t.key}`)}
                        required
                        className="max-w-24 sm:w-12"
                      >
                        <option value="" disabled>
                          —
                        </option>
                        {TRACKS.map((_, i) => (
                          <option key={i} value={String(i + 1)}>
                            {i + 1}
                          </option>
                        ))}
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
                      autosave.touch();
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

                <label className="mx-auto mt-5 flex max-w-xl cursor-pointer items-center justify-center gap-3 text-left">
                  <Checkbox
                    name="email_opt_in"
                    checked={emailOptIn}
                    onCheckedChange={(checked) => {
                      setEmailOptIn(checked === true);
                      clearMark("email_opt_in");
                      autosave.touch();
                    }}
                    aria-invalid={isInvalid("email_opt_in")}
                    required
                  />
                  <span
                    className={`text-base ${
                      isInvalid("email_opt_in") ? "text-destructive" : "text-muted-foreground"
                    }`}
                  >
                    I allow OCC Hacks 2026 to email me event updates — schedule
                    changes, logistics, and day-of details.
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
          {autosave.status !== "idle" && (
            <span className="ml-2 hidden sm:inline">
              · {autosave.status === "saving" ? "saving…" : "saved"}
            </span>
          )}
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

      {/* The prompt lives and dies with the mark it points at — once the
          flagged question is answered there's nothing left to fill in. */}
      {(invalid.length ? error : state.message) && (
        <p className="pb-8 text-center text-base text-destructive" role="alert">
          {invalid.length ? error : state.message}
        </p>
      )}
    </form>
  );
}
