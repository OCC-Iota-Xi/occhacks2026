import { Suspense } from "react";
import { AnalysisList } from "@/components/admin/analysis/List";
import AutoRefresh from "@/components/AutoRefresh";
import SetupNotice from "@/components/admin/SetupNotice";
import { PageHeader } from "@/components/admin/ui";
import { parseFilters, toSearchParams } from "@/lib/admin/filters";
import { formatNumber } from "@/lib/admin/format";
import { adminContext, fetchApplicants } from "@/lib/admin/queries";

/**
 * The applicants list as it was before the stage tabs: saved views across the
 * top and every filter on screen. Same rows, same URL filters and same export
 * as `/admin/applicants`, so a link or a saved view works on either.
 */
export default async function AnalysisPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const ctx = await adminContext();
  if (!ctx.ready) return <SetupNotice />;

  const params = toSearchParams(await searchParams);
  const filters = parseFilters(params);

  // Only the rows depend on the filters; the menus come from the layout.
  const page = await fetchApplicants(ctx, filters);

  if (page.schemaMissing) return <SetupNotice detail={page.error} />;

  return (
    <div className="space-y-4">
      {/* New sign-ups, waivers marked sent, another organizer's decisions. */}
      <AutoRefresh every={15_000} />
      <PageHeader
        title="Analysis"
        subtitle={`${formatNumber(page.total)} ${page.total === 1 ? "application" : "applications"} match this view`}
      />
      <Suspense fallback={null}>
        <AnalysisList
          rows={page.rows}
          total={page.total}
          filters={filters}
          viewerId={ctx.userId}
          error={page.error}
        />
      </Suspense>
    </div>
  );
}
