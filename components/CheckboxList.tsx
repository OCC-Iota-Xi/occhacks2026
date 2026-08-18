"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

const OTHER = "__other__";

/**
 * Stacked checkbox options that post as repeated `name` entries.
 *
 * With `single`, the list behaves like a radio group that can be emptied:
 * picking an option clears the others, and clicking the picked one again
 * clears it — the answer is still optional. With `other`, a final write-in row
 * posts whatever the reader types under the same `name`, and `otherNote` sets
 * expectations about what a write-in actually gets you.
 *
 * Every row is controlled, including the write-in. That matters more than it
 * looks: the forms autosave by posting themselves in full, so a list that
 * couldn't show what was already stored would overwrite it with nothing on the
 * next save. `defaultValues` seeds the boxes from the saved row; anything in it
 * that isn't a known option is treated as the previous write-in.
 */
export default function CheckboxList({
  name,
  options,
  single,
  other,
  otherPlaceholder = "which one?",
  otherNote,
  defaultValues = [],
  onChange,
}: {
  name: string;
  options: string[];
  single?: boolean;
  other?: boolean;
  otherPlaceholder?: string;
  otherNote?: string;
  defaultValues?: string[];
  /** Fired after any change, so the parent can kick off an autosave. */
  onChange?: () => void;
}) {
  const custom = other ? defaultValues.find((v) => !options.includes(v)) : undefined;
  const [picked, setPicked] = useState<string[]>(() => {
    const known = defaultValues.filter((v) => options.includes(v));
    return custom ? [...known, OTHER] : known;
  });
  const [written, setWritten] = useState(custom ?? "");
  const isPicked = (value: string) => picked.includes(value);

  function toggle(value: string, checked: boolean) {
    setPicked((prev) => {
      if (!checked) return prev.filter((v) => v !== value);
      return single ? [value] : [...prev, value];
    });
    onChange?.();
  }

  const rows = other ? [...options, OTHER] : options;

  return (
    <div className="flex flex-col gap-2">
      {rows.map((option) => {
        const isOther = option === OTHER;
        return (
          <div key={option}>
            <label className="flex cursor-pointer items-start gap-3 text-left text-sm text-muted-foreground transition-colors hover:text-foreground">
              <Checkbox
                // The write-in posts through its text field, not the box.
                name={isOther ? undefined : name}
                value={isOther ? undefined : option}
                className="mt-0.5"
                checked={isPicked(option)}
                onCheckedChange={(checked: boolean | "indeterminate") =>
                  toggle(option, checked === true)
                }
              />
              <span>{isOther ? "other" : option}</span>
            </label>
            {isOther && isPicked(OTHER) && (
              <>
                <Input
                  name={name}
                  placeholder={otherPlaceholder}
                  aria-label={otherPlaceholder}
                  autoFocus
                  value={written}
                  onChange={(event) => {
                    setWritten(event.target.value);
                    onChange?.();
                  }}
                  className="mx-auto mt-2 max-w-sm py-1.5 text-sm"
                />
                {otherNote && (
                  <p className="mt-2 text-center text-sm text-muted-foreground/70">
                    {otherNote}
                  </p>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
