"use client";

import { Checkbox } from "@/components/ui/checkbox";

/** Stacked checkbox options that post as repeated `name` entries. */
export default function CheckboxList({
  name,
  options,
}: {
  name: string;
  options: string[];
}) {
  return (
    <div className="flex flex-col gap-3">
      {options.map((option) => (
        <label
          key={option}
          className="flex cursor-pointer items-start gap-3 text-left text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <Checkbox name={name} value={option} className="mt-0.5" />
          <span>{option}</span>
        </label>
      ))}
    </div>
  );
}
