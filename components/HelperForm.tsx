"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { motion } from "motion/react";
import {
  saveMentorDraft,
  saveVolunteerDraft,
  submitMentor,
  submitVolunteer,
  type RegistrationState,
} from "@/app/register/actions";
import RevealLines from "@/components/motion/RevealLines";
import Reveal from "@/components/motion/Reveal";
import FieldRow from "@/components/FieldRow";
import CheckboxList from "@/components/CheckboxList";
import ResumeUpload from "@/components/ResumeUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { AVAILABILITY_BLOCKS, SHIRT_SIZES } from "@/lib/form-options";
import {
  firstGap,
  formatPhone,
  nativeGaps,
  scrollToField,
  type Gap,
} from "@/lib/form-fields";
import { applyDraft, many, one, readDraft, type Draft } from "@/lib/form-draft";
import type { HelperCopy } from "@/lib/helper-roles";
import { useAutosave } from "@/lib/use-autosave";
import { isOldEnough, LATEST_DOB, UNDER_18_MESSAGE } from "@/lib/eligibility";

export interface HelperDefaults {
  full_name: string;
  occ_id: string;
  dob: string;
  email: string;
  phone: string;
  shirt: string;
  needs: string;
  expertise: string;
  /** Mentors only — see `HelperCopy.details`. */
  resume_path: string;
  mentor_reason: string;
  eligibility_agreed: boolean;
  email_opt_in: boolean;
  availability: string[];
}

const initialState: RegistrationState = { ok: false, message: "" };

/** The first three steps are the same either way; the fourth is the role's own. */
const SHARED_STEPS = ["you", "contact", "details"] as const;
const LAST = SHARED_STEPS.length + 1;

const SUBMIT = { volunteer: submitVolunteer, mentor: submitMentor };
const SAVE_DRAFT = { volunteer: saveVolunteerDraft, mentor: saveMentorDraft };

/**
 * The volunteer and mentor sign-up forms.
 *
 * One component, two pages: the person, contact, and logistics questions are
 * identical, and the role only changes the last step's wording, whether the
 * expertise question is required, and which row the answers land in. Everything
 * that differs comes in through `copy` — see lib/helper-roles.ts.
 */
export default function HelperForm({
  copy,
  defaults,
  isUpdate,
}: {
  copy: HelperCopy;
  defaults?: Partial<HelperDefaults>;
  isUpdate?: boolean;
}) {
  const STEPS = [...SHARED_STEPS, copy.lastStep];
  const DRAFT_KEY = copy.draftKey;

  const [state, formAction, pending] = useActionState(SUBMIT[copy.role], initialState);
  const [shirt, setShirt] = useState(defaults?.shirt ?? "");
  // Both post through inputs React owns, so they're held here rather than read
  // off the DOM — same reason as `shirt`.
  const [resumePath, setResumePath] = useState(defaults?.resume_path ?? "");
  const [phone, setPhone] = useState(formatPhone(defaults?.phone ?? ""));
  const [eligible, setEligible] = useState(!!defaults?.eligibility_agreed);
  const [emailOptIn, setEmailOptIn] = useState(!!defaults?.email_opt_in);

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
    save: SAVE_DRAFT[copy.role],
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
    if (one(saved, "shirt")) setShirt(one(saved, "shirt"));
    if (one(saved, "resume_path")) setResumePath(one(saved, "resume_path"));
    if (one(saved, "phone")) setPhone(formatPhone(one(saved, "phone")));
    if (saved.eligibility) setEligible(true);
    if (saved.email_opt_in) setEmailOptIn(true);
    setDraft(saved);
    /* eslint-enable react-hooks/set-state-in-effect */
    // `DRAFT_KEY` is fixed for a mounted form — the role can't change under it.
    // It's listed only to satisfy the dependency check; `restored` is what
    // actually keeps this to one run.
  }, [DRAFT_KEY]);

  useEffect(() => {
    if (state.ok) {
      autosave.done();
      window.scrollTo({ top: 0 });
    }
  }, [state.ok, autosave]);

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
    const gaps: Gap[] = nativeGaps(stepRefs.current[target - 1]).map((name) => ({
      fields: [name],
    }));

    if (target === 1) {
      const dob = String(new FormData(formRef.current!).get("dob") ?? "");
      if (!isOldEnough(dob)) gaps.push({ fields: ["dob"], message: UNDER_18_MESSAGE });
    }

    // The shirt picker posts through a Radix radio, which `nativeGaps` can't
    // see. The mentor questions on this step are all optional.
    if (target === 3 && !shirt) gaps.push({ fields: ["shirt"] });

    if (target === LAST) {
      // Checkboxes post nothing at all when none are ticked.
      const availability = new FormData(formRef.current!).getAll("availability");
      if (!availability.length) {
        gaps.push({ fields: ["availability"], message: copy.availability.error });
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
              {copy.thanks.lead} <span className="text-ring">{copy.thanks.accent}</span>
            </span>,
          ]}
        />
        <Reveal className="mt-8" delay={0.3}>
          <p className="text-base text-muted-foreground">
            {copy.thanks.body}
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

  // Question numbers count what this role is actually asked, so a question
  // the copy leaves out doesn't punch a hole in the sequence. Reset on every
  // render, and read top to bottom with the JSX below.
  let asked = 0;
  const num = () => String(++asked).padStart(2, "0");

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
          {/*
            The warning sits with the section that raised it rather than under
            the nav buttons — `flag` always switches to the failing step first,
            so whatever is showing is the step the message is about.
          */}
          {/* It lives and dies with the mark it points at — once the flagged
              question is answered there's nothing left to fill in. */}
          {(invalid.length ? error : state.message) && (
            <p className="pt-2 text-center text-base text-destructive" role="alert">
              {invalid.length ? error : state.message}
            </p>
          )}

          <StepperContent value={1} forceMount>
            <div
              ref={(el) => {
                stepRefs.current[0] = el;
              }}
            >
              <FieldRow number={num()} label="full name" htmlFor="name" invalid={isInvalid("name")}>
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

              {copy.asksOccId && (
                <FieldRow
                  number={num()}
                  label="OCC student ID (if applicable)"
                  htmlFor="occ_id"
                  hint="leave blank if you're not an OCC student."
                >
                  <Input
                    id="occ_id"
                    name="occ_id"
                    placeholder="C01234567"
                    defaultValue={defaults?.occ_id}
                  />
                </FieldRow>
              )}

              <FieldRow
                number={num()}
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
              <FieldRow number={num()} label="email address" htmlFor="email" invalid={isInvalid("email")}>
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
                number={num()}
                label="phone number"
                htmlFor="phone"
                hint="how we reach you about shift changes on the day."
                invalid={isInvalid("phone")}
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
                  aria-invalid={isInvalid("phone")}
                  required
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
              <FieldRow number={num()} label="t-shirt size" invalid={isInvalid("shirt")}>
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
                number={num()}
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

              {/* Mentors only. Volunteers finish the step here. */}
              {copy.details && (
                <>
                  <FieldRow
                    number={num()}
                    label={copy.details.resume.label}
                    hint={copy.details.resume.hint}
                    wide
                  >
                    <ResumeUpload
                      name="resume_path"
                      value={resumePath}
                      onValueChange={(path) => {
                        setResumePath(path);
                        autosave.touch();
                      }}
                    />
                  </FieldRow>

                  <FieldRow
                    number={num()}
                    label={copy.details.reason.label}
                    htmlFor="mentor_reason"
                    hint={copy.details.reason.hint}
                    wide
                  >
                    <Textarea
                      id="mentor_reason"
                      name="mentor_reason"
                      placeholder="…"
                      defaultValue={defaults?.mentor_reason}
                      className="min-h-20"
                    />
                  </FieldRow>
                </>
              )}
            </div>
          </StepperContent>

          <StepperContent value={LAST} forceMount>
            <div
              ref={(el) => {
                stepRefs.current[3] = el;
              }}
            >
              <FieldRow
                number={num()}
                label={copy.availability.label}
                hint={copy.availability.hint}
                wide
                invalid={isInvalid("availability")}
              >
                {/* Radix's checkbox posts through a hidden input that only
                    bubbles a click, so the form's onChange never sees it. */}
                <div onClick={() => clearMark("availability")}>
                  <CheckboxList
                    // Remounts once the browser draft lands, so the boxes can
                    // re-seed from it rather than from the stored row.
                    key={draft ? "draft" : "stored"}
                    name="availability"
                    options={AVAILABILITY_BLOCKS}
                    defaultValues={listDefaults("availability", defaults?.availability ?? [])}
                    onChange={autosave.touch}
                  />
                </div>
              </FieldRow>

              <FieldRow
                number={num()}
                label={copy.expertise.label}
                htmlFor="expertise"
                hint={copy.expertise.hint}
                wide
                invalid={isInvalid("expertise")}
              >
                <Textarea
                  id="expertise"
                  name="expertise"
                  placeholder="…"
                  defaultValue={defaults?.expertise}
                  className="min-h-20"
                  aria-invalid={isInvalid("expertise")}
                  // A mentor who hasn't said what they can mentor on hasn't
                  // answered the question the sign-up exists to ask.
                  required={copy.expertise.required}
                />
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
                    I&apos;ll be 18 or older by oct 10, 2026, and I agree to follow the
                    event code of conduct.
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
                    I allow OCC Hacks 2026 to email me event updates — schedule changes,
                    logistics, and day-of details.
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
              {pending ? "saving…" : isUpdate ? "update sign-up" : "submit sign-up"}
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
    </form>
  );
}
