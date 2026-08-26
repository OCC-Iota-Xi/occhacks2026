import { BarList, Donut } from "@/components/admin/charts";
import RangePicker from "@/components/admin/RangePicker";
import SetupNotice from "@/components/admin/SetupNotice";
import TrendChart from "@/components/admin/TrendChart";
import { Empty, PageHeader, Panel, PanelHeader, StatCard } from "@/components/admin/ui";
import { formatNumber, formatPercent } from "@/lib/admin/format";
import {
  adminContext,
  fetchBreakdowns,
  fetchEarliestDate,
  fetchOverview,
  fetchTimeseries,
} from "@/lib/admin/queries";
import { eventDay, shiftDay } from "@/lib/admin/time";
import { STATUS_LABEL, type Status } from "@/lib/admin/types";

/**
 * The demographic picture.
 *
 * Only breakdowns the registration form actually collects: there's no
 * graduation year, no country and no gender question on this form, so there are
 * no charts pretending otherwise. What the form does ask — school, major, track
 * ranking, Iota Xi membership, the extra-credit courses — is here instead, and
 * every row links into the applicant list already filtered.
 */
export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string; from?: string; to?: string }>;
}) {
  const ctx = await adminContext();
  if (!ctx.ready) return <SetupNotice />;

  const params = await searchParams;
  // Same California-day range as the dashboard.
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

  const [breakdowns, stats, points] = await Promise.all([
    fetchBreakdowns(ctx),
    fetchOverview(ctx, days ?? 3650),
    fetchTimeseries(ctx, from, to),
  ]);

  if (!breakdowns || !stats) return <SetupNotice detail="admin_breakdowns is missing" />;

  const list = (query: string) => `/admin/applicants?${query}`;
  const schoolCount = breakdowns.schools.filter((b) => b.label !== "Not given").length;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Analytics"
        subtitle="Every chart filters the applicant list when you click it"
        actions={<RangePicker basePath="/admin/analytics" />}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard label="Applications" value={formatNumber(stats.total)} emphasis />
        <StatCard label="Schools represented" value={formatNumber(schoolCount)} />
        <StatCard
          label="Completion rate"
          value={formatPercent(stats.submitted, stats.total, 1)}
          hint={`${formatNumber(stats.drafts)} drafts`}
        />
        <StatCard
          label="Acceptance rate"
          value={formatPercent(stats.accepted, stats.submitted, 1)}
        />
        <StatCard
          label="Confirmation rate"
          value={formatPercent(stats.confirmed, stats.accepted, 1)}
        />
      </div>

      <Panel>
        <PanelHeader
          title="Applications over time"
          subtitle={custom ? `${from} → ${to}` : days === null ? "All time" : `Last ${days} days`}
        />
        {points.length ? <TrendChart points={points} /> : <Empty title="No data in this range" />}
      </Panel>

      <div className="grid gap-3 lg:grid-cols-2">
        <Panel>
          <PanelHeader title="Schools" subtitle="Every school that has applied" />
          <BarList
            items={breakdowns.schools}
            limit={12}
            hrefFor={(label) => list(`school=${encodeURIComponent(label)}`)}
          />
        </Panel>

        <Panel>
          <PanelHeader title="Majors" />
          <BarList
            items={breakdowns.majors}
            limit={12}
            hrefFor={(label) => list(`major=${encodeURIComponent(label)}`)}
          />
        </Panel>

        <Panel>
          <PanelHeader title="Application status" />
          <Donut
            items={breakdowns.status.map((bucket) => ({
              ...bucket,
              label: STATUS_LABEL[bucket.label as Status] ?? bucket.label,
            }))}
            hrefFor={(label) => {
              const match = Object.entries(STATUS_LABEL).find(([, value]) => value === label);
              return match ? list(`status=${match[0]}`) : null;
            }}
          />
        </Panel>

        <Panel>
          <PanelHeader
            title="Attendance"
            subtitle="Accepted applicants only"
          />
          {breakdowns.attendance.length ? (
            <Donut
              items={breakdowns.attendance.map((bucket) => ({
                ...bucket,
                label:
                  bucket.label === "pending"
                    ? "Awaiting reply"
                    : bucket.label === "confirmed"
                      ? "Confirmed"
                      : "Declined",
              }))}
              hrefFor={(label) =>
                list(
                  `status=accepted&attendance=${
                    label === "Confirmed" ? "confirmed" : label === "Declined" ? "declined" : "pending"
                  }`
                )
              }
            />
          ) : (
            <Empty title="No decisions yet" hint="This fills in once applications are accepted." />
          )}
        </Panel>

        <Panel>
          <PanelHeader title="First-choice track" />
          <BarList
            items={breakdowns.tracks}
            limit={4}
            groupOther={false}
            hrefFor={(label) =>
              label === "Not ranked" ? null : list(`track=${encodeURIComponent(label)}`)
            }
          />
        </Panel>

        <Panel>
          <PanelHeader title="Age" subtitle="From the date of birth on the form" />
          <BarList items={breakdowns.ages} limit={6} groupOther={false} />
        </Panel>

        <Panel>
          <PanelHeader title="Shirt sizes" subtitle="What to order" />
          <BarList
            items={breakdowns.shirts}
            limit={8}
            groupOther={false}
            hrefFor={(label) =>
              label === "Not given" ? null : list(`shirt=${encodeURIComponent(label)}`)
            }
          />
        </Panel>

        <Panel>
          <PanelHeader title="Extra-credit courses" subtitle="Instructors expecting a roster" />
          <BarList
            items={breakdowns.classes}
            limit={8}
            groupOther={false}
            hrefFor={(label) => list(`class=${encodeURIComponent(label)}`)}
          />
        </Panel>

        <Panel>
          <PanelHeader title="Iota Xi membership" />
          <BarList
            items={breakdowns.iota_xi}
            limit={3}
            groupOther={false}
            hrefFor={(label) =>
              label === "Member" ? list("iota=yes") : label === "Not a member" ? list("iota=no") : null
            }
          />
        </Panel>

        <Panel>
          <PanelHeader
            title="Accessibility and dietary needs"
            subtitle="Anyone who wrote something in that box"
          />
          <BarList items={breakdowns.needs} limit={2} groupOther={false} />
        </Panel>

        <Panel>
          <PanelHeader title="Review coverage" subtitle="Submitted applications" />
          <BarList
            items={breakdowns.reviews}
            limit={3}
            groupOther={false}
            hrefFor={(label) =>
              label === "Unreviewed" ? list("flag=unreviewed") : list("reviewed=yes")
            }
          />
        </Panel>

        <Panel>
          <PanelHeader title="Reviewer load" subtitle="Assigned submitted applications" />
          <BarList
            items={breakdowns.reviewers}
            limit={6}
            groupOther={false}
            hrefFor={(label) => (label === "Unassigned" ? list("reviewer=unassigned") : null)}
          />
        </Panel>
      </div>
    </div>
  );
}
