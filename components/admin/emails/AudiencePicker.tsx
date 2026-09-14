"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AUDIENCE_HINT,
  AUDIENCE_LABEL,
  HACKER_AUDIENCES,
  LIST_AUDIENCES,
  type AudienceKey,
} from "@/lib/admin/email";
import { formatNumber } from "@/lib/admin/format";

/**
 * Who the message goes to. Checkbox rows in the same shape as the filter
 * menus, grouped so "everyone we accepted" and "everyone on the notify list"
 * don't read as the same kind of choice. The count beside each is that
 * audience on its own; the deduped total lives in the composer's footer.
 */

function Row({
  label,
  hint,
  count,
  active,
  locked,
  onToggle,
}: {
  label: string;
  hint?: string;
  count: number;
  active: boolean;
  locked?: boolean;
  onToggle?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={locked}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
        locked ? "cursor-default" : "hover:bg-accent/50"
      )}
    >
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-[4px] border",
          active ? "border-foreground bg-foreground text-background" : "border-border"
        )}
      >
        {active && <Check className="size-3" strokeWidth={3} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-foreground">{label}</span>
        {hint && <span className="block truncate text-xs text-muted-foreground">{hint}</span>}
      </span>
      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
        {formatNumber(count)}
      </span>
    </button>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="px-2.5 pb-1 text-[10px] tracking-wide text-muted-foreground uppercase">
        {title}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

export default function AudiencePicker({
  keys,
  counts,
  selectedApplicants,
  includeSelected,
  onToggle,
  onToggleSelected,
}: {
  keys: Set<AudienceKey>;
  counts: Record<AudienceKey, number>;
  /** Ids handed over from the applicants table; empty when composing from scratch. */
  selectedApplicants: number;
  includeSelected: boolean;
  onToggle: (key: AudienceKey) => void;
  onToggleSelected: () => void;
}) {
  return (
    <div className="space-y-4">
      {selectedApplicants > 0 && (
        <Group title="From the applicants table">
          <Row
            label="Selected applicants"
            hint="The rows you ticked before pressing Email selected"
            count={selectedApplicants}
            active={includeSelected}
            onToggle={onToggleSelected}
          />
        </Group>
      )}
      <Group title="Hackers">
        {HACKER_AUDIENCES.map((key) => (
          <Row
            key={key}
            label={AUDIENCE_LABEL[key]}
            hint={AUDIENCE_HINT[key]}
            count={counts[key] ?? 0}
            active={keys.has(key)}
            onToggle={() => onToggle(key)}
          />
        ))}
      </Group>
      <Group title="Helpers and lists">
        {LIST_AUDIENCES.map((key) => (
          <Row
            key={key}
            label={AUDIENCE_LABEL[key]}
            hint={AUDIENCE_HINT[key]}
            count={counts[key] ?? 0}
            active={keys.has(key)}
            onToggle={() => onToggle(key)}
          />
        ))}
      </Group>
    </div>
  );
}
