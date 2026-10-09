import { cache } from "react";
import { isAdmin } from "@/lib/admin/access";
import { applicantStage, type ApplicantStage } from "@/lib/applicant-stage";
import { createClient } from "@/lib/supabase/server";

interface Decision {
  status: string;
  attendance: string;
  waivers_sent_at?: string | null;
  checked_in_at?: string | null;
  checked_in_day2_at?: string | null;
}

/**
 * `waivers_sent_at` arrives with migration 0024 and `checked_in_day2_at` with
 * 0027. Against a database that hasn't had one yet, read the decision without
 * it rather than losing the whole row — an accepted applicant would otherwise
 * be told they're still under review.
 */
async function readDecision(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<Decision | null> {
  const read = (columns: string) =>
    supabase
      .from("application_status")
      .select(columns)
      .eq("user_id", userId)
      .maybeSingle<Decision>();

  const columns = [
    "status, attendance, checked_in_at, waivers_sent_at, checked_in_day2_at",
    "status, attendance, checked_in_at, waivers_sent_at",
  ];
  for (const list of columns) {
    const result = await read(list);
    if (result.error?.code !== "42703") return result.data;
  }
  return (await read("status, attendance, checked_in_at")).data;
}

/**
 * The signed-in applicant's own stage. Both reads are scoped to the caller by
 * RLS: applicants can read their own `hackers` row and their own
 * `application_status` row (migration 0018).
 *
 * Cached for the request, so the sidebar and the page under it asking about
 * the same person is one pair of reads rather than two.
 */
export const readApplicantStage = cache(async (userId: string): Promise<ApplicantStage> => {
  const supabase = await createClient();
  const [{ data: hacker }, decision] = await Promise.all([
    supabase.from("hackers").select("completed_at").eq("user_id", userId).maybeSingle(),
    readDecision(supabase, userId),
  ]);

  return applicantStage({
    completed: !!hacker?.completed_at,
    status: decision?.status,
    attendance: decision?.attendance,
    waiversSent: !!decision?.waivers_sent_at,
    checkedIn: !!(decision?.checked_in_at || decision?.checked_in_day2_at),
  });
});

/**
 * Who `/handbook` is for: hackers whose spot is confirmed, which checking in
 * doesn't undo. Organizers can open it too, to read what attendees are reading.
 */
export async function canReadHandbook(user: { id: string; email: string | null }) {
  if (isAdmin(user)) return true;
  const stage = await readApplicantStage(user.id);
  return stage === "confirmed" || stage === "checked_in";
}
