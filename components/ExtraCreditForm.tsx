"use client";

import { useActionState, useState } from "react";
import { saveExtraCredit, type ExtraCreditState } from "@/app/(account)/register/actions";
import { OCC_CLASSES } from "@/lib/form-options";

const INITIAL: ExtraCreditState = { ok: false, message: "" };

/**
 * Where a hacker says which class they want extra credit for and which
 * section of it they're in. The one part of the registration page that still
 * takes an answer once applications have closed.
 *
 * `course` and `section` are what's already on their application: the class
 * they picked when registering, and a section if they've been here before.
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
  const [section, setSection] = useState(savedSection);

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
                onChange={() => setCourse(option)}
                className="size-4 accent-ring"
              />
              {option || "None of these"}
            </label>
          ))}
        </div>
      </fieldset>

      {course && (
        <label className="mt-5 block">
          <span className="text-foreground">Section number</span>
          <span className="mt-1 block text-sm text-muted-foreground">
            It&apos;s next to the class on your schedule, for example 12345.
          </span>
          <input
            name="section"
            value={section}
            onChange={(event) => setSection(event.target.value)}
            maxLength={20}
            required
            autoComplete="off"
            className="mt-2 w-full max-w-xs rounded-md border border-border bg-transparent px-3 py-2 text-foreground outline-none focus-visible:border-ring"
          />
        </label>
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
