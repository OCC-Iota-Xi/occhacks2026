"use client";

import { useActionState, useState } from "react";
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
  // Held here rather than left to the inputs: a form resets its own fields
  // once its action finishes, and the answers should stay where they were put.
  const [course, setCourse] = useState(savedCourse);
  const [section, setSection] = useState(() => startingSection(savedCourse, savedSection));
  const sections = CLASS_SECTIONS[course] ?? [];

  return (
    <form action={formAction}>
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
                onChange={() => {
                  setCourse(option);
                  setSection(startingSection(option));
                }}
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
                  onChange={() => setSection(crn)}
                  required
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

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full border border-ring/60 px-6 py-2 text-sm text-ring transition-colors hover:bg-ring/10 disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save"}
        </button>
        {state.message && (
          <span role={state.ok ? "status" : "alert"} className="text-sm text-muted-foreground">
            {state.message}
          </span>
        )}
      </div>
    </form>
  );
}
