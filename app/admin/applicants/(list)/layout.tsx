import { ApplicantMenusProvider } from "@/components/admin/applicants/Menus";
import {
  adminContext,
  fetchAdmins,
  fetchFacets,
  fetchSavedViews,
  fetchStageCounts,
  fetchTags,
} from "@/lib/admin/queries";

/**
 * The filter menus and the stage counts live here rather than in the page
 * because a layout doesn't re-render when only the query string changes: a
 * search, a sort or a page turn then costs one query — the rows — instead of
 * six. Every mutation revalidates the admin layout, which refetches these.
 *
 * In a route group so the applicant detail page doesn't pay for menus it
 * never shows.
 */
export default async function ApplicantsListLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await adminContext();
  // The page renders the setup notice; there are no menus to fetch for it.
  if (!ctx.ready) return children;

  const [facets, tags, admins, savedViews, stageCounts] = await Promise.all([
    fetchFacets(ctx),
    fetchTags(ctx),
    fetchAdmins(ctx),
    fetchSavedViews(ctx),
    fetchStageCounts(ctx),
  ]);

  return (
    <ApplicantMenusProvider value={{ facets, tags, admins, savedViews, stageCounts }}>
      {children}
    </ApplicantMenusProvider>
  );
}
