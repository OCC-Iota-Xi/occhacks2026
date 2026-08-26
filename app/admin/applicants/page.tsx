import { Suspense } from "react";
import ApplicantsWorkspace from "@/components/admin/applicants/Workspace";
import SetupNotice from "@/components/admin/SetupNotice";
import { PageHeader } from "@/components/admin/ui";
import { parseFilters, toSearchParams } from "@/lib/admin/filters";
import { formatNumber } from "@/lib/admin/format";
import {
  adminContext,
  fetchAdmins,
  fetchApplicants,
  fetchFacets,
  fetchSavedViews,
  fetchTags,
} from "@/lib/admin/queries";

export default async function ApplicantsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const ctx = await adminContext();
  if (!ctx.ready) return <SetupNotice />;

  const params = toSearchParams(await searchParams);
  const filters = parseFilters(params);

  // The page of rows is the only query that depends on the filters; the rest
  // are small, cacheable lists that populate the menus.
  const [page, facets, tags, admins, savedViews] = await Promise.all([
    fetchApplicants(ctx, filters),
    fetchFacets(ctx),
    fetchTags(ctx),
    fetchAdmins(ctx),
    fetchSavedViews(ctx),
  ]);

  if (page.schemaMissing) return <SetupNotice detail={page.error} />;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Applicants"
        subtitle={`${formatNumber(page.total)} ${page.total === 1 ? "application" : "applications"} match this view`}
      />
      <Suspense fallback={null}>
        <ApplicantsWorkspace
          rows={page.rows}
          total={page.total}
          filters={filters}
          facets={facets}
          tags={tags}
          admins={admins}
          savedViews={savedViews}
          viewerId={ctx.userId}
          error={page.error}
        />
      </Suspense>
    </div>
  );
}
