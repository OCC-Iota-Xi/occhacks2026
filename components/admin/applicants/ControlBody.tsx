"use client";

import type { Control } from "@/components/admin/applicants/controls";
import { OptionList, RangeFields, Segmented } from "@/components/admin/Menu";

/**
 * One filter's inputs, wherever it is shown: two or three exclusive choices as
 * a row of buttons, any longer list as checkboxes, a range as a from–to pair.
 */
export default function ControlBody({
  control,
  onToggle,
  onRange,
}: {
  control: Control;
  onToggle: (control: Extract<Control, { kind: "options" }>, value: string) => void;
  onRange: (param: string, value: string) => void;
}) {
  if (control.kind === "range") {
    return (
      <RangeFields
        type={control.type}
        min={control.min}
        max={control.max}
        step={control.step}
        lo={control.lo}
        hi={control.hi}
        onChange={onRange}
      />
    );
  }

  if (control.single && control.options.length <= 3) {
    return (
      <Segmented
        options={control.options}
        value={control.selected[0] ?? ""}
        onSelect={(value) => onToggle(control, value)}
      />
    );
  }

  return (
    <OptionList
      options={control.options}
      selected={control.selected}
      onToggle={(value) => onToggle(control, value)}
      searchable={control.searchable || control.options.length > 8}
    />
  );
}
