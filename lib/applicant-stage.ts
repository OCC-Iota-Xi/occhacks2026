/**
 * Where an applicant stands, as they see it on `/status`.
 *
 * None of these is stored as such. The database keeps an application status, an
 * attendance state and a few timestamps (see `application_status`, migration
 * 0018), and the stage is read off those. It lives here so the status page and
 * the organizer's profile of the same person can't disagree about it.
 */
export type ApplicantStage =
  | "not_submitted"
  | "under_review"
  | "accepted"
  | "waivers_review"
  | "confirmed"
  | "checked_in";

/** For organizers. The status page words these for the applicant itself. */
export const APPLICANT_STAGE_LABEL: Record<ApplicantStage, string> = {
  not_submitted: "Not submitted",
  under_review: "Under review",
  accepted: "Accepted, waivers to send",
  waivers_review: "Waivers sent, awaiting review",
  confirmed: "Confirmed, with check-in QR",
  checked_in: "Checked in",
};

/**
 * Only an accepted application moves past "under review": `submitted`,
 * `in_review`, `withdrawn`, and for now `waitlisted` and `rejected` all read the
 * same to the applicant.
 *
 * Accepted then has three steps: waivers still to send, sent and waiting on an
 * organizer (`waivers_sent_at`, set by the applicant's own button), and
 * confirmed, which is attendance and only an organizer can set. Confirmed wins
 * over the waiver timestamp, so someone whose emailed waivers were reviewed
 * without them ever pressing the button still lands on "you're in". Checked in
 * wins over everything, including a desk override for someone never confirmed.
 */
export function applicantStage(row: {
  completed: boolean;
  status: string | null | undefined;
  attendance: string | null | undefined;
  waiversSent: boolean;
  checkedIn: boolean;
}): ApplicantStage {
  if (row.status === "accepted") {
    if (row.checkedIn) return "checked_in";
    if (row.attendance === "confirmed") return "confirmed";
    return row.waiversSent ? "waivers_review" : "accepted";
  }
  return row.completed ? "under_review" : "not_submitted";
}
