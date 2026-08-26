import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { BarList, Donut, Funnel } from "@/components/admin/charts";
import RangePicker from "@/components/admin/RangePicker";
import SetupNotice from "@/components/admin/SetupNotice";
import TrendChart from "@/components/admin/TrendChart";
import {
  Empty,
  PageHeader,
  Panel,
  PanelHeader,
  Score,
  StatCard,
  StatusBadge,
} from "@/components/admin/ui";
import {
  delta,
  displayName,
  formatDate,
  formatNumber,
  formatPercent,
  relativeTime,
} from "@/lib/admin/format";
import {
  adminContext,
  fetchBreakdowns,
  fetchEarliestDate,
  fetchNeedsAttention,
  fetchOverview,
  fetchRecentActivity,
  fetchRecentApplicants,
  fetchTimeseries,
} from "@/lib/admin/queries";
import { eventDay, shiftDay } from "@/lib/admin/time";
import { STATUS_LABEL, type Status } from "@/lib/admin/types";

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ days?: string; from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const ctx = await adminContext();
  if (!ctx.ready) return <SetupNotice />;

  // Ranges are counted in California days, so "last 7 days" ends on the day it
  // is at the venue rather than the day it is in UTC.
  const today = eventDay();
  const custom = params.from && params.to;
  const days = params.days === "all" ? null : Number(params.days ?? 30) || 30;

  const earliest = days === null || custom ? await fetchEarliestDate(ctx) : null;
  const from = custom
    ? params.from!
    : days === null
      ? earliest
        ? eventDay(new Date(earliest))
        : shiftDay(today, -90)
      : shiftDay(today, -(days - 1));
  const to = custom ? params.to! : today;

  // One RPC each, all in flight together: the whole dashboard is five round
  // trips regardless of how many applicants there are.
  const [stats, breakdowns, attention, points, recent, activity] = await Promise.all([
    fetchOverview(ctx, days ?? 3650),
    fetchBreakdowns(ctx),
    fetchNeedsAttention(ctx),
    fetchTimeseries(ctx, from, to),
    fetchRecentApplicants(ctx, 8),
    fetchRecentActivity(ctx, 10),
  ]);

  if (!stats) return <SetupNotice detail="admin_overview_stats is missing" />;

  const list = (query: string) => `/admin/applicants?${query}`;

  const attentionItems = attention
    ? [
        {
          label: "applications awaiting review",
          count: attention.unreviewed,
          href: list("flag=unreviewed"),
        },
        {
          label: "accepted applicants haven't confirmed",
          count: attention.unconfirmed,
          href: list("flag=unconfirmed"),
        },
        {
          label: "submitted applications are unassigned",
          count: attention.unassigned,
          href: list("reviewer=unassigned&status=submitted&status=in_review"),
        },
        {
          label: "applications missing required information",
          count: attention.missing_info,
          href: list("flag=missing_info"),
        },
        {
          label: "possible duplicate emails",
          count: attention.duplicate_email,
          href: list("flag=duplicate_email"),
        },
        {
          label: "drafts abandoned over three days ago",
          count: attention.stale_drafts,
          href: list("flag=stale_draft"),
        },
      ].filter((item) => item.count > 0)
    : [];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Dashboard"
        subtitle={
          custom
            ? `${from} → ${to}`
            : days === null
              ? "All time"
              : `Last ${days} days`
        }
        actions={<RangePicker />}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Total applications"
          value={formatNumber(stats.total)}
          hint={`${formatNumber(stats.drafts)} still drafts`}
          href={list("")}
          emphasis
        />
        <StatCard
          label="Submitted"
          value={formatNumber(stats.submitted)}
          change={delta(stats.period, stats.prev_period)}
          hint={days === null ? undefined : `vs previous ${days} days`}
          href={list("status=submitted&status=in_review&status=accepted&status=waitlisted&status=rejected")}
        />
        <StatCard
          label="Today"
          value={formatNumber(stats.today)}
          change={delta(stats.today, stats.yesterday)}
          hint="vs yesterday"
        />
        <StatCard
          label="This week"
          value={formatNumber(stats.this_week)}
          change={delta(stats.this_week, stats.last_week)}
          hint="vs last week"
        />
        <StatCard
          label="Pending review"
          value={formatNumber(stats.pending_review)}
          hint={`${formatNumber(stats.unassigned)} unassigned`}
          href={list("flag=unreviewed")}
        />
        <StatCard
          label="Drafts"
          value={formatNumber(stats.drafts)}
          hint="started, not submitted"
          href={list("status=draft")}
        />
        <StatCard
          label="Accepted"
          value={formatNumber(stats.accepted)}
          hint={`${formatPercent(stats.accepted, stats.submitted, 1)} acceptance rate`}
          href={list("status=accepted")}
        />
        <StatCard
          label="Waitlisted"
          value={formatNumber(stats.waitlisted)}
          href={list("status=waitlisted")}
        />
        <StatCard
          label="Rejected"
          value={formatNumber(stats.rejected)}
          href={list("status=rejected")}
        />
        <StatCard
          label="Confirmed"
          value={formatNumber(stats.confirmed)}
          hint={`${formatPercent(stats.confirmed, stats.accepted, 1)} of accepted`}
          href={list("attendance=confirmed")}
        />
        <StatCard
          label="Checked in"
          value={formatNumber(stats.checked_in)}
          hint={`${formatPercent(stats.checked_in, stats.confirmed, 1)} of confirmed`}
          href={list("checked_in=yes")}
        />
        <StatCard
          label="Helpers"
          value={formatNumber(stats.volunteers + stats.mentors)}
          hint={`${formatNumber(stats.volunteers)} volunteers · ${formatNumber(stats.mentors)} mentors`}
          href="/admin/helpers"
        />
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <PanelHeader
            title="Applications over time"
            subtitle={custom ? `${from} → ${to}` : days === null ? "All time" : `Last ${days} days`}
          />
          {points.length ? (
            <TrendChart points={points} />
          ) : (
            <Empty title="No applications in this range" />
          )}
        </Panel>

        <Panel>
          <PanelHeader title="Funnel" subtitle="Conversion from the stage above" />
          <Funnel
            stages={[
              { label: "Started", count: stats.total, href: list("") },
              {
                label: "Submitted",
                count: stats.submitted,
                href: list("status=submitted&status=in_review&status=accepted&status=waitlisted&status=rejected"),
              },
              { label: "Reviewed", count: stats.reviewed, href: list("reviewed=yes") },
              { label: "Accepted", count: stats.accepted, href: list("status=accepted") },
              {
                label: "Confirmed",
                count: stats.confirmed,
                href: list("attendance=confirmed"),
              },
              {
                label: "Checked in",
                count: stats.checked_in,
                href: list("checked_in=yes"),
                note:
                  stats.checked_in === 0
                    ? "Nobody checked in yet — the check-in page writes this on the day."
                    : undefined,
              },
            ]}
          />
        </Panel>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <Panel>
          <PanelHeader title="Application status" />
          <Donut
            items={(breakdowns?.status ?? []).map((bucket) => ({
              ...bucket,
              label: STATUS_LABEL[bucket.label as Status] ?? bucket.label,
            }))}
            hrefFor={(label) => {
              const status = Object.entries(STATUS_LABEL).find(([, value]) => value === label);
              return status ? list(`status=${status[0]}`) : null;
            }}
          />
        </Panel>

        <Panel>
          <PanelHeader title="Top schools" subtitle="Click a row to filter the list" />
          <BarList
            items={breakdowns?.schools ?? []}
            limit={7}
            hrefFor={(label) => list(`school=${encodeURIComponent(label)}`)}
          />
        </Panel>

        <Panel>
          <PanelHeader title="First-choice track" />
          <BarList
            items={breakdowns?.tracks ?? []}
            limit={4}
            groupOther={false}
            hrefFor={(label) =>
              label === "Not ranked" ? null : list(`track=${encodeURIComponent(label)}`)
            }
          />
          <PanelHeader title="Review coverage" className="border-t" />
          <BarList
            items={breakdowns?.reviews ?? []}
            limit={3}
            groupOther={false}
            hrefFor={(label) =>
              label === "Unreviewed" ? list("flag=unreviewed") : list("reviewed=yes")
            }
          />
        </Panel>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <PanelHeader
            title="Recent applications"
            action={
              <Link
                href="/admin/applicants"
                className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                All applicants <ArrowRight className="size-3" />
              </Link>
            }
          />
          {recent.length ? (
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border/60">
                {recent.map((applicant) => (
                  <tr key={applicant.id} className="hover:bg-accent/30">
                    <td className="px-4 py-2">
                      <Link href={`/admin/applicants/${applicant.id}`} className="block">
                        <span className="text-foreground">{displayName(applicant)}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {applicant.school ?? "No school given"}
                        </span>
                      </Link>
                    </td>
                    <td className="px-2 py-2">
                      <StatusBadge status={applicant.status} />
                    </td>
                    <td className="px-2 py-2 text-right text-xs">
                      <Score value={applicant.avg_score} />
                    </td>
                    <td className="px-4 py-2 text-right text-xs whitespace-nowrap text-muted-foreground">
                      {formatDate(applicant.completed_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <Empty
              title="No submitted applications yet"
              hint="Rows appear here the moment someone finishes the registration form."
            />
          )}
        </Panel>

        <div className="space-y-3">
          <Panel>
            <PanelHeader title="Needs attention" />
            {attentionItems.length ? (
              <ul className="divide-y divide-border/60">
                {attentionItems.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs hover:bg-accent/40"
                    >
                      <AlertTriangle className="size-3.5 shrink-0 text-amber-400/80" />
                      <span className="tabular-nums text-foreground">{item.count}</span>
                      <span className="min-w-0 flex-1 truncate text-muted-foreground">
                        {item.label}
                      </span>
                      <ArrowRight className="size-3 shrink-0 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty title="Nothing needs attention" hint="Every application is reviewed, assigned and complete." />
            )}
          </Panel>

          <Panel>
            <PanelHeader title="Recent activity" />
            {activity.length ? (
              <ul className="divide-y divide-border/60">
                {activity.map((event) => (
                  <li key={event.id} className="px-4 py-2 text-xs">
                    <Link
                      href={`/admin/applicants/${event.applicant_id}`}
                      className="block hover:opacity-80"
                    >
                      <span className="text-foreground">
                        {event.actor_name ?? event.applicant_name ?? "Someone"}
                      </span>{" "}
                      <span className="text-muted-foreground">{event.summary.toLowerCase()}</span>
                      {event.applicant_name && event.actor_name && (
                        <span className="text-muted-foreground"> · {event.applicant_name}</span>
                      )}
                      <span className="ml-1 text-muted-foreground/70">
                        {relativeTime(event.created_at)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty title="No activity yet" hint="Decisions, reviews, tags and check-ins land here as they happen." />
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
