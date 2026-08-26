import { Suspense } from "react";
import Link from "next/link";
import ApplicantsWorkspace from "@/components/admin/applicants/Workspace";
import SetupNotice from "@/components/admin/SetupNotice";
import { PageHeader, StatCard } from "@/components/admin/ui";
import { parseFilters, toSearchParams } from "@/lib/admin/filters";
import { formatNumber } from "@/lib/admin/format";
import {
  adminContext,
  fetchAdmins,
  fetchApplicants,
  fetchFacets,
  fetchOverview,
  fetchSavedViews,
  fetchTags,
} from "@/lib/admin/queries";

/**
 * The review queue is the applicant list with a different starting point: only
 * submitted applications, oldest first, so the queue drains from the front.
 * Everything else — filters, bulk actions, columns — is the same workspace,
 * because a reviewer who wants to narrow it shouldn't get a lesser table.
 */
export default async function ReviewQueuePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const ctx = await adminContext();
  if (!ctx.ready) return <SetupNotice />;

  const params = toSearchParams(await searchParams);
  // The starting point, applied only to a bare URL. Once someone has touched a
  // filter — including clearing one — the URL is theirs and stays as they left
  // it, or "clear all" would silently put the queue's own filters back.
  if (Array.from(params.keys()).length === 0) {
    params.append("status", "submitted");
    params.append("status", "in_review");
    params.set("sort", "completed_at");
    params.set("dir", "asc");
  }
  const filters = parseFilters(params);

  const [page, facets, tags, admins, savedViews, stats] = await Promise.all([
    fetchApplicants(ctx, filters),
    fetchFacets(ctx),
    fetchTags(ctx),
    fetchAdmins(ctx),
    fetchSavedViews(ctx),
    fetchOverview(ctx, 30),
  ]);

  if (page.schemaMissing) return <SetupNotice detail={page.error} />;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Review queue"
        subtitle="Submitted applications, oldest first"
        actions={
          <Link
            href="/admin/review?reviewer=me"
            className="rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            My queue
          </Link>
        }
      />

      {stats && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Awaiting review" value={formatNumber(stats.pending_review)} emphasis />
          <StatCard label="Reviewed" value={formatNumber(stats.reviewed)} />
          <StatCard
            label="Unassigned"
            value={formatNumber(stats.unassigned)}
            href="/admin/applicants?reviewer=unassigned&status=submitted&status=in_review"
          />
          <StatCard label="Decided" value={formatNumber(stats.accepted + stats.waitlisted + stats.rejected)} />
        </div>
      )}

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
