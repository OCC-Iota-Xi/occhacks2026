import type { Applicant } from "@/lib/admin/types";

/**
 * Where an applicant is, as one word.
 *
 * The database keeps this as two fields and a timestamp — application status,
 * attendance, and when they said their waivers were sent — because those change
 * independently. An organizer working the list doesn't think in three fields,
 * though: they think "decide these, chase those, confirm these". A stage is
 * that reading, and `setStage` (lib/admin/actions.ts) is the one write that
 * moves someone between them.
 *
 * Check-in isn't a stage. It happens to someone who stays confirmed, and it can
 * be undone without changing where they stand, so it's shown beside the stage
 * rather than as one.
 */
export const STAGES = [
  "draft",
  "submitted",
  "in_review",
  "accepted",
  "waivers_review",
  "confirmed",
  "declined",
  "waitlisted",
  "rejected",
  "withdrawn",
] as const;
export type Stage = (typeof STAGES)[number];

export const STAGE_LABEL: Record<Stage, string> = {
  draft: "Draft",
  submitted: "Submitted",
  in_review: "In review",
  accepted: "Accepted, waivers due",
  waivers_review: "Waivers to review",
  confirmed: "Confirmed",
  declined: "Declined",
  waitlisted: "Waitlisted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export function stageOf(
  applicant: Pick<Applicant, "status" | "attendance" | "waivers_sent_at">
): Stage {
  if (applicant.status !== "accepted") return applicant.status;
  if (applicant.attendance === "confirmed") return "confirmed";
  if (applicant.attendance === "declined") return "declined";
  return applicant.waivers_sent_at ? "waivers_review" : "accepted";
}

/**
 * The same reading as `stageOf`, as PostgREST conditions on `admin_applicants`,
 * so the list can be filtered by stage in the database. Keep the two in step.
 */
export const STAGE_CONDITION: Record<Stage, string> = {
  draft: "status.eq.draft",
  submitted: "status.eq.submitted",
  in_review: "status.eq.in_review",
  accepted: "and(status.eq.accepted,attendance.eq.pending,waivers_sent_at.is.null)",
  waivers_review: "and(status.eq.accepted,attendance.eq.pending,waivers_sent_at.not.is.null)",
  confirmed: "and(status.eq.accepted,attendance.eq.confirmed)",
  declined: "and(status.eq.accepted,attendance.eq.declined)",
  waitlisted: "status.eq.waitlisted",
  rejected: "status.eq.rejected",
  withdrawn: "status.eq.withdrawn",
};

/**
 * What an organizer can move someone to.
 *
 * `accepted` and `waivers_due` both end at "accepted, waivers due" but mean
 * different things, and the difference matters in bulk: accepting leaves anyone
 * already accepted exactly as they are, so it can't undo a confirmation, while
 * `waivers_due` is the deliberate step back — unconfirm, or send a bad packet
 * back — and only touches people who are already accepted.
 */
export const MOVES = [
  // In the order of the pipeline, then the ways out of it.
  "submitted",
  "accepted",
  "waivers_due",
  "confirmed",
  "waitlisted",
  "rejected",
  "withdrawn",
] as const;
export type Move = (typeof MOVES)[number];

export const MOVE_LABEL: Record<Move, string> = {
  accepted: "Accept",
  confirmed: "Confirm",
  waivers_due: "Back to waivers due",
  waitlisted: "Waitlist",
  rejected: "Reject",
  withdrawn: "Mark withdrawn",
  submitted: "Back to submitted",
};

/** How a finished move reads back: "Ada Lovelace: confirmed". */
export const MOVE_DONE: Record<Move, string> = {
  accepted: "accepted",
  confirmed: "confirmed",
  waivers_due: "back to waivers due",
  waitlisted: "waitlisted",
  rejected: "rejected",
  withdrawn: "marked withdrawn",
  submitted: "back to submitted",
};

/** What each move does, in the applicant's terms, for the confirmation dialog. */
export const MOVE_EFFECT: Record<Move, string> = {
  accepted:
    "Their status page shows accepted, with the waiver packet. Anyone already accepted is left as they are, and drafts are skipped.",
  confirmed:
    "Their status page shows confirmed, with their check-in QR. Only applies to accepted applicants.",
  waivers_due:
    "Their status page goes back to accepted with the waiver packet, as if no waivers were sent. Only applies to accepted applicants.",
  waitlisted: "Their status page keeps reading under review.",
  rejected: "Their status page keeps reading under review.",
  withdrawn: "Takes them out of the running without deleting their answers.",
  submitted: "Clears the decision and puts them back in the pile to decide.",
};

/** The path an applicant travels, in order. The stage menu lists it this way. */
export const PIPELINE: Stage[] = ["submitted", "accepted", "waivers_review", "confirmed"];

/** The ways off the path, listed under it. */
export const EXITS: Stage[] = ["waitlisted", "rejected", "withdrawn"];

/**
 * The move that takes someone from one stage to another, or null when it isn't
 * an organizer's to make. That's the order of the pipeline again: a draft has
 * nothing to decide until it's submitted, "waivers sent" is the applicant's own
 * button, and confirming is only for someone already accepted.
 */
export function moveTo(from: Stage, to: Stage): Move | null {
  if (from === to || from === "draft") return null;
  const accepted =
    from === "accepted" ||
    from === "waivers_review" ||
    from === "confirmed" ||
    from === "declined";
  switch (to) {
    case "submitted":
    case "waitlisted":
    case "rejected":
    case "withdrawn":
      return to;
    case "accepted":
      // For someone already past it, going back here is the deliberate step
      // back: unconfirm, or return a bad packet.
      return accepted ? "waivers_due" : "accepted";
    case "confirmed":
      return accepted ? "confirmed" : null;
    default:
      return null;
  }
}

/**
 * The one obvious next step, offered as a button on the row — only where the
 * next step is an organizer's. From "accepted, waivers due" it's the
 * applicant's turn (send the forms, press the button), so there is no button:
 * confirming them anyway is in the menu, for forms that arrived by email.
 */
export function nextMove(stage: Stage): Move | null {
  if (stage === "submitted" || stage === "in_review") return "accepted";
  if (stage === "waivers_review") return "confirmed";
  return null;
}
