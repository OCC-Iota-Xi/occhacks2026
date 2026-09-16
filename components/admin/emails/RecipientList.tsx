"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { AUDIENCE_LABEL, type Recipient } from "@/lib/admin/email";
import { formatNumber } from "@/lib/admin/format";

const SOURCE_LABEL: Record<string, string> = {
  ...AUDIENCE_LABEL,
  selected: "Selected in the table",
  extra: "Typed in",
};

/** How many chips show before the list folds behind a "show all". */
const FOLD_AT = 60;

/**
 * Every address the current choices resolve to, as chips — the actual To line
 * of the send, deduped, so "Accepted + Contacts" is visibly 143 people rather
 * than a number. Chips from the To field are removable there, not here; the
 * rest come from an audience and go away by unticking it.
 */
export default function RecipientList({
  recipients,
  total,
  loading,
}: {
  recipients: Recipient[];
  /** The real count — `recipients` is capped server-side. */
  total: number;
  loading: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return <p className="text-xs text-muted-foreground">Working out who that reaches…</p>;
  }
  if (!recipients.length) {
    return <p className="text-xs text-muted-foreground">Nobody yet.</p>;
  }

  const shown = expanded ? recipients : recipients.slice(0, FOLD_AT);
  const hidden = recipients.length - shown.length;
  const beyondCap = total - recipients.length;

  return (
    <div>
      <div className="scroll-soft flex max-h-56 flex-wrap gap-1 overflow-y-auto">
        {shown.map((recipient) => (
          <span
            key={recipient.email}
            title={[recipient.name, SOURCE_LABEL[recipient.source] ?? recipient.source]
              .filter(Boolean)
              .join(" · ")}
            className={cn(
              "inline-flex max-w-full items-center rounded-md border px-1.5 py-0.5 text-xs",
              recipient.source === "extra"
                ? "border-[var(--ring)]/30 bg-accent/40 text-foreground"
                : "border-border bg-muted/60 text-foreground"
            )}
          >
            <span className="truncate">{recipient.email}</span>
          </span>
        ))}
      </div>
      {(hidden > 0 || expanded || beyondCap > 0) && (
        <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
          {hidden > 0 && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="text-[var(--ring)] underline-offset-2 hover:underline"
            >
              Show all {formatNumber(recipients.length)}
            </button>
          )}
          {expanded && recipients.length > FOLD_AT && (
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="underline-offset-2 hover:underline"
            >
              Show fewer
            </button>
          )}
          {beyondCap > 0 && <span>…and {formatNumber(beyondCap)} more not listed here.</span>}
        </div>
      )}
    </div>
  );
}
