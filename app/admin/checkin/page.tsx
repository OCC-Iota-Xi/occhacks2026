import CheckInBoard, { type Arrival } from "@/components/admin/CheckInBoard";
import SetupNotice from "@/components/admin/SetupNotice";
import AutoRefresh from "@/components/AutoRefresh";
import { PageHeader, StatCard } from "@/components/admin/ui";
import { displayName, formatNumber, formatPercent } from "@/lib/admin/format";
import { adminContext } from "@/lib/admin/queries";
import type { Applicant } from "@/lib/admin/types";
import { parseCheckInCode } from "@/lib/checkin";

/**
 * Event-day check-in. The list is everyone who has confirmed they're coming,
 * plus anyone already checked in — including someone who turned up despite an
 * unanswered confirmation, so the desk can still let them in.
 *
 * The desk is open both mornings, but a person checks in once and that covers
 * the whole event: whoever came on Saturday is already in on Sunday.
 *
 * `?code=` is what an attendee's QR links to. A phone's own camera opens this
 * page with it, and the page then leads with that one person. Opening the link
 * only looks them up; checking in takes a tap, so a link preview or a reload
 * can't do it by accident.
 */
export default async function CheckInPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string | string[] }>;
}) {
  const ctx = await adminContext();
  if (!ctx.ready) return <SetupNotice />;

  const { code } = await searchParams;
  const rawCode = Array.isArray(code) ? code[0] : code;
  const arrivalId = parseCheckInCode(rawCode);

  const { data, error } = await ctx.supabase
    .from("admin_applicants")
    .select("*")
    .eq("status", "accepted")
    .order("full_name", { ascending: true })
    .limit(2000);

  if (error) return <SetupNotice detail={error.message} />;

  const accepted = (data ?? []) as Applicant[];
  const expected = accepted.filter(
    (applicant) => applicant.attendance === "confirmed" || applicant.checked_in
  );
  const checkedIn = expected.filter((applicant) => applicant.checked_in).length;

  let arrival: Arrival | undefined;
  if (arrivalId) {
    // Usually someone on the list above; otherwise look them up, so a code from
    // an applicant who isn't accepted still says who they are and why not.
    let found = accepted.find((applicant) => applicant.id === arrivalId) ?? null;
    if (!found) {
      const { data: other } = await ctx.supabase
        .from("admin_applicants")
        .select("*")
        .eq("id", arrivalId)
        .maybeSingle<Applicant>();
      found = other;
    }
    arrival = {
      id: arrivalId,
      person: found && {
        id: found.id,
        name: displayName(found),
        email: found.email,
        shirt: found.shirt,
        needs: found.needs,
        status: found.status,
        attendance: found.attendance,
      },
      checkedInAt: found?.checked_in_at ?? null,
    };
  } else if (rawCode) {
    // A `code` that isn't one of ours: say so rather than ignoring it.
    arrival = { id: "", person: null, checkedInAt: null };
  }

  return (
    <div className="space-y-4">
      {/* Two desks stay in step: each sees who the other has checked in. */}
      <AutoRefresh />
      <PageHeader
        title="Check-in"
        subtitle="Confirmed attendees. Scan their QR or search, then check them in."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Checked in" value={formatNumber(checkedIn)} emphasis />
        <StatCard label="Expected" value={formatNumber(expected.length)} />
        <StatCard
          label="Turnout"
          value={formatPercent(checkedIn, expected.length, 0)}
          hint="of confirmed attendees"
        />
        <StatCard
          label="Accepted, unconfirmed"
          value={formatNumber(accepted.length - expected.length)}
          href="/admin/applicants?flag=unconfirmed"
        />
      </div>

      {/* Keyed so following a second code's link leads with the new person. */}
      <CheckInBoard key={arrivalId ?? "desk"} expected={expected} arrival={arrival} />
    </div>
  );
}
