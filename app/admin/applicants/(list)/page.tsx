import { Suspense } from "react";
import { ApplicantsList } from "@/components/admin/applicants/Menus";
import AutoRefresh from "@/components/AutoRefresh";
import SetupNotice from "@/components/admin/SetupNotice";
import { PageHeader } from "@/components/admin/ui";
import { parseFilters, toSearchParams } from "@/lib/admin/filters";
import { formatNumber } from "@/lib/admin/format";
import { adminContext, fetchApplicants } from "@/lib/admin/queries";

export default async function ApplicantsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const ctx = await adminContext();
  if (!ctx.ready) return <SetupNotice />;

  const params = toSearchParams(await searchParams);
  const filters = parseFilters(params);

  // Only the rows depend on the filters. The menus and the stage counts come
  // from the layout, which a change of query string doesn't re-run.
  const page = await fetchApplicants(ctx, filters);

  if (page.schemaMissing) return <SetupNotice detail={page.error} />;

  return (
    <div className="space-y-4">
      {/* New sign-ups, waivers marked sent, another organizer's decisions. */}
      <AutoRefresh every={15_000} />
      <PageHeader
        title="Applicants"
        subtitle={`${formatNumber(page.total)} ${page.total === 1 ? "application" : "applications"} match this view`}
      />
      <Suspense fallback={null}>
        <ApplicantsList
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
