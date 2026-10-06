import { ApplicantMenusProvider } from "@/components/admin/applicants/Menus";
import {
  adminContext,
  fetchAdmins,
  fetchFacets,
  fetchSavedViews,
  fetchTags,
} from "@/lib/admin/queries";

/**
 * The filter menus live here for the same reason they do on the applicants
 * list (`app/admin/applicants/(list)/layout.tsx`): a layout doesn't re-render
 * when only the query string changes, so a filter, a sort or a page turn costs
 * one query — the rows. No stage counts: this list has no stage tabs.
 */
export default async function AnalysisLayout({ children }: { children: React.ReactNode }) {
  const ctx = await adminContext();
  // The page renders the setup notice; there are no menus to fetch for it.
  if (!ctx.ready) return children;

  const [facets, tags, admins, savedViews] = await Promise.all([
    fetchFacets(ctx),
    fetchTags(ctx),
    fetchAdmins(ctx),
    fetchSavedViews(ctx),
  ]);

  return (
    <ApplicantMenusProvider value={{ facets, tags, admins, savedViews }}>
      {children}
    </ApplicantMenusProvider>
  );
}
