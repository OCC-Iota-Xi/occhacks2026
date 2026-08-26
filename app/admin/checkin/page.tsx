import CheckInBoard from "@/components/admin/CheckInBoard";
import SetupNotice from "@/components/admin/SetupNotice";
import { PageHeader, StatCard } from "@/components/admin/ui";
import { formatNumber, formatPercent } from "@/lib/admin/format";
import { adminContext } from "@/lib/admin/queries";
import type { Applicant } from "@/lib/admin/types";

/**
 * Event-day check-in. The list is everyone who has confirmed they're coming,
 * plus anyone already checked in — including someone who turned up despite an
 * unanswered confirmation, so the desk can still let them in.
 */
export default async function CheckInPage() {
  const ctx = await adminContext();
  if (!ctx.ready) return <SetupNotice />;

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

  return (
    <div className="space-y-4">
      <PageHeader
        title="Check-in"
        subtitle="Confirmed attendees. Search, then check them in."
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

      <CheckInBoard expected={expected} />
    </div>
  );
}
