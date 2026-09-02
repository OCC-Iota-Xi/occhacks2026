"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Trash2, UserPlus } from "lucide-react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { ActionMenu, MenuItem, MenuLabel } from "@/components/admin/Menu";
import { useToast } from "@/components/admin/Toast";
import { Button } from "@/components/ui/button";
import {
  assignReviewer,
  deleteApplicants,
  setAttendance,
  setCheckedIn,
  setStatus,
  type ActionResult,
} from "@/lib/admin/actions";
import { displayName, formatDateTime } from "@/lib/admin/format";
import {
  ATTENDANCE,
  ATTENDANCE_LABEL,
  DECISION_STATUSES,
  STATUS_LABEL,
  STATUS_VERB,
  type AdminUser,
  type Applicant,
  type Attendance,
  type Status,
} from "@/lib/admin/types";
import { cn } from "@/lib/utils";

/**
 * The decision controls on a profile.
 *
 * Application status and attendance sit next to each other but never merge:
 * accepting someone doesn't confirm them, and un-confirming someone doesn't
 * un-accept them. The three headline decisions get their own buttons; the
 * quieter transitions live in the overflow, where they can't be hit by accident.
 */
export default function DecisionPanel({
  applicant,
  admins,
}: {
  applicant: Applicant;
  admins: AdminUser[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState<{
    title: string;
    body: string;
    label: string;
    destructive?: boolean;
    /** Set only for deletion: a word to type before the button arms. */
    confirmText?: string;
    success?: string;
    /** What to do afterwards, when re-rendering this page is not the answer. */
    done?: () => void;
    run: () => Promise<ActionResult>;
  } | null>(null);

  const run = (
    action: () => Promise<ActionResult>,
    success: string,
    done?: () => void
  ) =>
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast(result.message ?? success);
        setConfirm(null);
        if (done) done();
        else router.refresh();
      } else {
        toast(result.message ?? "That didn't work.", "error");
      }
    });

  const decide = (status: Status) =>
    setConfirm({
      title: `${STATUS_VERB[status]} this applicant?`,
      body: `Sets the application status to ${STATUS_LABEL[status].toLowerCase()}. Nobody is emailed.`,
      label: STATUS_VERB[status],
      destructive: status === "rejected",
      run: () => setStatus([applicant.id], status),
    });

  // Deleting is not a decision — withdrawing is. This is for a duplicate, a
  // test signup, or someone who has asked to be taken off the list, and it
  // takes their reviews, notes, tags and history with it.
  const remove = () =>
    setConfirm({
      title: "Delete this application?",
      body: `This erases ${displayName(applicant)}'s application, along with every review, note, tag and decision attached to it. It cannot be undone. To take them out of the running without losing their answers, mark them withdrawn instead.`,
      label: "Delete application",
      destructive: true,
      confirmText: "DELETE",
      success: "Application deleted",
      run: () => deleteApplicants([applicant.id]),
      // The profile it was rendered on no longer exists.
      done: () => router.replace("/admin/applicants"),
    });

  const assignee = admins.find((admin) => admin.user_id === applicant.assigned_to);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        <Button
          size="sm"
          variant={applicant.status === "accepted" ? "default" : "outline"}
          onClick={() => decide("accepted")}
        >
          {applicant.status === "accepted" && <Check className="size-3.5" />}
          Accept
        </Button>
        <Button
          size="sm"
          variant={applicant.status === "waitlisted" ? "default" : "outline"}
          onClick={() => decide("waitlisted")}
        >
          {applicant.status === "waitlisted" && <Check className="size-3.5" />}
          Waitlist
        </Button>
        <Button
          size="sm"
          variant={applicant.status === "rejected" ? "destructive" : "outline"}
          onClick={() => decide("rejected")}
        >
          {applicant.status === "rejected" && <Check className="size-3.5" />}
          Reject
        </Button>

        <ActionMenu
          trigger={
            <Button size="sm" variant="ghost">
              More <ChevronDown className="size-3" />
            </Button>
          }
        >
          <MenuLabel>Application status</MenuLabel>
          {DECISION_STATUSES.filter(
            (status) => !["accepted", "waitlisted", "rejected"].includes(status)
          ).map((status) => (
            <MenuItem key={status} onSelect={() => decide(status as Status)}>
              {STATUS_VERB[status as Status]}
            </MenuItem>
          ))}

          <MenuLabel>Danger</MenuLabel>
          <MenuItem destructive onSelect={remove}>
            <Trash2 className="size-3.5" />
            Delete application
          </MenuItem>
        </ActionMenu>
      </div>

      <div className="grid gap-2 text-xs">
        <Row label="Attendance">
          <ActionMenu
            trigger={
              <button
                type="button"
                className="flex items-center gap-1 rounded-md border border-border px-1.5 py-0.5 transition-colors hover:text-foreground"
              >
                {ATTENDANCE_LABEL[applicant.attendance]}
                <ChevronDown className="size-3" />
              </button>
            }
            width="w-44"
          >
            {ATTENDANCE.map((value) => (
              <MenuItem
                key={value}
                onSelect={() =>
                  run(
                    () => setAttendance([applicant.id], value as Attendance),
                    `Attendance set to ${ATTENDANCE_LABEL[value].toLowerCase()}`
                  )
                }
              >
                {ATTENDANCE_LABEL[value]}
              </MenuItem>
            ))}
          </ActionMenu>
        </Row>

        <Row label="Check-in">
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              run(
                () => setCheckedIn([applicant.id], !applicant.checked_in),
                applicant.checked_in ? "Check-in undone" : "Checked in"
              )
            }
            className={cn(
              "rounded-md border px-1.5 py-0.5 transition-colors",
              applicant.checked_in
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {applicant.checked_in
              ? `Checked in ${formatDateTime(applicant.checked_in_at)}`
              : "Not checked in"}
          </button>
        </Row>

        <Row label="Reviewer">
          <ActionMenu
            trigger={
              <button
                type="button"
                className="flex items-center gap-1 rounded-md border border-border px-1.5 py-0.5 transition-colors hover:text-foreground"
              >
                <UserPlus className="size-3" />
                {assignee?.display_name ?? assignee?.email ?? "Unassigned"}
              </button>
            }
          >
            <MenuLabel>Assign to</MenuLabel>
            {admins
              .filter((admin) => admin.user_id)
              .map((admin) => (
                <MenuItem
                  key={admin.email}
                  onSelect={() =>
                    run(
                      () => assignReviewer([applicant.id], admin.user_id!),
                      `Assigned to ${admin.display_name ?? admin.email}`
                    )
                  }
                >
                  {admin.display_name ?? admin.email}
                </MenuItem>
              ))}
            <MenuItem onSelect={() => run(() => assignReviewer([applicant.id], null), "Unassigned")}>
              Unassign
            </MenuItem>
          </ActionMenu>
        </Row>

        {applicant.decided_at && (
          <Row label="Decided">
            <span className="text-muted-foreground">{formatDateTime(applicant.decided_at)}</span>
          </Row>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(confirm)}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={confirm?.title ?? ""}
        body={confirm?.body ?? ""}
        confirmLabel={confirm?.label ?? "Confirm"}
        confirmText={confirm?.confirmText}
        destructive={confirm?.destructive}
        pending={pending}
        onConfirm={() =>
          confirm && run(confirm.run, confirm.success ?? "Status updated", confirm.done)
        }
      />
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}
