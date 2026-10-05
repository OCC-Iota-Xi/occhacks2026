import Link from "next/link";
import CheckInBoard, { type Arrival } from "@/components/admin/CheckInBoard";
import SetupNotice from "@/components/admin/SetupNotice";
import { PageHeader, StatCard } from "@/components/admin/ui";
import { displayName, formatNumber, formatPercent } from "@/lib/admin/format";
import { adminContext } from "@/lib/admin/queries";
import { eventDay } from "@/lib/admin/time";
import type { Applicant } from "@/lib/admin/types";
import { CHECKIN_DAYS, checkInDayOn, parseCheckInCode, parseCheckInDay } from "@/lib/checkin";
import { cn } from "@/lib/utils";

/**
 * Event-day check-in. The list is everyone who has confirmed they're coming,
 * plus anyone already checked in — including someone who turned up despite an
 * unanswered confirmation, so the desk can still let them in.
 *
 * People check in on each of the two days, and the page works one day at a
 * time: today's, by the event's clock, unless `?day=` says otherwise. Each
 * person's check-in below is the selected day's.
 *
 * `?code=` is what an attendee's QR links to. A phone's own camera opens this
 * page with it, and the page then leads with that one person. Opening the link
 * only looks them up; checking in takes a tap, so a link preview or a reload
 * can't do it by accident.
 */
export default async function CheckInPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string | string[]; day?: string | string[] }>;
}) {
  const ctx = await adminContext();
  if (!ctx.ready) return <SetupNotice />;

  const { code, day: dayParam } = await searchParams;
  const rawCode = Array.isArray(code) ? code[0] : code;
  const arrivalId = parseCheckInCode(rawCode);
  const day =
    parseCheckInDay(Array.isArray(dayParam) ? dayParam[0] : dayParam) ??
    checkInDayOn(eventDay());

  const { data, error } = await ctx.supabase
    .from("admin_applicants")
    .select("*")
    .eq("status", "accepted")
    .order("full_name", { ascending: true })
    .limit(2000);

  if (error) return <SetupNotice detail={error.message} />;

  const rows = (data ?? []) as Applicant[];
  // Day 2's column reaches this view with migration 0026.
  const day2Ready = !rows.length || "checked_in_day2_at" in rows[0];

  // From here down, "checked in" means checked in on the selected day.
  const forDay = (applicant: Applicant): Applicant => {
    const at = day === 2 ? (applicant.checked_in_day2_at ?? null) : applicant.checked_in_at;
    return { ...applicant, checked_in_at: at, checked_in: Boolean(at) };
  };
  const accepted = rows.map(forDay);
  const expected = accepted.filter(
    (applicant, index) =>
      applicant.attendance === "confirmed" ||
      rows[index].checked_in ||
      Boolean(rows[index].checked_in_day2_at)
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
      found = other && forDay(other);
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
      <PageHeader
        title="Check-in"
        subtitle="Confirmed attendees. Scan their QR or search, then check them in."
        actions={
          <div className="flex rounded-lg border border-border p-0.5">
            {CHECKIN_DAYS.map((option) => (
              <Link
                key={option.day}
                href={`/admin/checkin?day=${option.day}`}
                aria-current={option.day === day ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-1 text-xs transition-colors",
                  option.day === day
                    ? "bg-accent/70 text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {option.label}
              </Link>
            ))}
          </div>
        }
      />

      {day === 2 && !day2Ready && (
        <p className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
          Day 2 check-in isn&apos;t set up yet. Run migration 0026_checkin_days.sql in the
          Supabase SQL editor; until then check-ins on this tab won&apos;t save.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label={`Checked in, day ${day}`} value={formatNumber(checkedIn)} emphasis />
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
      <CheckInBoard
        key={`${day}-${arrivalId ?? "desk"}`}
        expected={expected}
        day={day}
        arrival={arrival}
      />
    </div>
  );
}
