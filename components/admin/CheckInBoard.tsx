"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Search, Undo2 } from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import { AttendanceBadge, Empty, StatusBadge } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { setCheckedIn } from "@/lib/admin/actions";
import { displayName, formatDateTime, initials } from "@/lib/admin/format";
import type { Applicant } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

/**
 * The desk on the morning of the event.
 *
 * The whole expected list is already on the page, so the search is instant and
 * keeps working if the venue wifi doesn't — only the check-in itself needs the
 * network. That's the right trade here: this list is the people who confirmed,
 * a few hundred rows at most, not the whole applicant table.
 */
export default function CheckInBoard({ expected }: { expected: Applicant[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [term, setTerm] = useState("");
  const [pending, startTransition] = useTransition();

  const needle = term.trim().toLowerCase();
  const rows = useMemo(() => {
    if (!needle) return expected;
    return expected.filter((applicant) =>
      [applicant.full_name, applicant.email, applicant.school, applicant.occ_id]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(needle))
    );
  }, [expected, needle]);

  const checkedIn = expected.filter((applicant) => applicant.checked_in).length;

  const toggle = (applicant: Applicant) =>
    startTransition(async () => {
      const result = await setCheckedIn([applicant.id], !applicant.checked_in);
      if (result.ok) {
        toast(
          applicant.checked_in
            ? `Check-in undone for ${displayName(applicant)}`
            : `${displayName(applicant)} checked in`
        );
        router.refresh();
      } else {
        toast(result.message ?? "Could not update check-in.", "error");
      }
    });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-9 min-w-[18rem] flex-1 items-center gap-2 rounded-lg border border-border px-3 focus-within:border-[var(--ring)]/50">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Name, email, school, or student ID"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {checkedIn} of {expected.length} checked in
        </span>
      </div>

      {rows.length ? (
        <ul className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border bg-card/40">
          {rows.map((applicant) => (
            <li
              key={applicant.id}
              className={cn(
                "flex flex-wrap items-center gap-3 px-3 py-2.5",
                applicant.checked_in && "bg-emerald-400/[0.04]"
              )}
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border text-[10px] text-muted-foreground">
                {initials(applicant.full_name)}
              </span>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/applicants/${applicant.id}`}
                  className="text-sm hover:text-[var(--ring)]"
                >
                  {displayName(applicant)}
                </Link>
                <div className="truncate text-xs text-muted-foreground">
                  {[applicant.school, applicant.email].filter(Boolean).join(" · ")}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <StatusBadge status={applicant.status} />
                <AttendanceBadge attendance={applicant.attendance} />
                {applicant.shirt && (
                  <span className="rounded-md border border-border px-1.5 py-0.5 text-xs uppercase">
                    {applicant.shirt}
                  </span>
                )}
                {applicant.needs && (
                  <span
                    title={applicant.needs}
                    className="rounded-md border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 text-xs text-amber-200"
                  >
                    Needs
                  </span>
                )}
              </div>

              {applicant.checked_in ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-300">
                    {formatDateTime(applicant.checked_in_at)}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={pending}
                    onClick={() => toggle(applicant)}
                  >
                    <Undo2 className="size-3.5" />
                    Undo
                  </Button>
                </div>
              ) : (
                <Button size="sm" disabled={pending} onClick={() => toggle(applicant)}>
                  <Check className="size-3.5" />
                  Check in
                </Button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <Empty
          title={needle ? "Nobody matches that" : "Nobody is expected yet"}
          hint={
            needle
              ? "Try their email, or check the applicant list for someone who wasn't accepted."
              : "This fills in as accepted applicants confirm their attendance."
          }
        />
      )}
    </div>
  );
}
