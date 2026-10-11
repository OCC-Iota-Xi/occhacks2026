"use client";

import { startTransition, useActionState, useState } from "react";
import { saveExtraCredit, type ExtraCreditState } from "@/app/(account)/register/actions";
import { CLASS_SECTIONS, isClassSection, OCC_CLASSES } from "@/lib/form-options";

const INITIAL: ExtraCreditState = { ok: false, message: "" };

/**
 * The section to start `course` on: the one given if the course runs it, or
 * the only one there is when the course runs a single section.
 */
function startingSection(course: string, section = "") {
  if (isClassSection(course, section)) return section;
  const sections = CLASS_SECTIONS[course] ?? [];
  return sections.length === 1 ? sections[0].crn : "";
}

/**
 * Where a hacker says which class they want extra credit for and which
 * section of it they're in. The one part of the registration page that still
 * takes an answer once applications have closed.
 *
 * Saves on its own, like the rest of the registration form: every pick that
 * makes a complete answer is written as soon as it's made. "None of these" is
 * complete by itself, a class with one section fills the section in, and a
 * class with several waits for the section to be picked.
 *
 * `course` and `section` are what's already on their application: the class
 * they picked when registering, and a section's CRN if they've been here
 * before. A section saved back when it was typed in, and that isn't one the
 * class runs, is dropped so it gets picked again.
 */
export default function ExtraCreditForm({
  course: savedCourse,
  section: savedSection,
}: {
  course: string;
  section: string;
}) {
  const [state, formAction, pending] = useActionState(saveExtraCredit, INITIAL);
  const [course, setCourse] = useState(savedCourse);
  const [section, setSection] = useState(() => startingSection(savedCourse, savedSection));
  const sections = CLASS_SECTIONS[course] ?? [];
  // A class picked but not yet its section: nothing to save until it is.
  const awaitingSection = !!course && !isClassSection(course, section);

  const save = (nextCourse: string, nextSection: string) => {
    if (nextCourse && !isClassSection(nextCourse, nextSection)) return;
    const formData = new FormData();
    formData.set("course", nextCourse);
    formData.set("section", nextSection);
    startTransition(() => formAction(formData));
  };

  const pickCourse = (option: string) => {
    const nextSection = startingSection(option);
    setCourse(option);
    setSection(nextSection);
    save(option, nextSection);
  };

  const pickSection = (crn: string) => {
    setSection(crn);
    save(course, crn);
  };

  const status = pending
    ? "Saving..."
    : awaitingSection
      ? "Pick your section and it'll save."
      : state.message;

  return (
    <form onSubmit={(event) => event.preventDefault()}>
      <fieldset>
        <legend className="text-foreground">Which class are you taking?</legend>
        <div className="mt-3 space-y-2">
          {[...OCC_CLASSES, ""].map((option) => (
            <label key={option || "none"} className="flex items-center gap-3">
              <input
                type="radio"
                name="course"
                value={option}
                checked={course === option}
                onChange={() => pickCourse(option)}
                className="size-4 accent-ring"
              />
              {option || "None of these"}
            </label>
          ))}
        </div>
      </fieldset>

      {sections.length > 0 && (
        <fieldset className="mt-5">
          <legend className="text-foreground">Which section are you in?</legend>
          <p className="mt-1 text-sm text-muted-foreground">
            The CRN is next to the class on your schedule.
          </p>
          <div className="mt-3 space-y-2">
            {sections.map(({ crn, label }) => (
              <label key={crn} className="flex items-start gap-3">
                <input
                  type="radio"
                  name="section"
                  value={crn}
                  checked={section === crn}
                  onChange={() => pickSection(crn)}
                  className="mt-1 size-4 shrink-0 accent-ring"
                />
                <span>
                  {label}
                  <span className="block text-sm text-muted-foreground">CRN {crn}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {status && (
        <p
          role={!pending && !awaitingSection && !state.ok ? "alert" : "status"}
          className="mt-5 text-sm text-muted-foreground"
        >
          {status}
        </p>
      )}
    </form>
  );
}
