"use client";

import { createContext, useContext, type ComponentProps } from "react";
import ApplicantsWorkspace from "@/components/admin/applicants/Workspace";
import type { FilterFacets } from "@/lib/admin/queries";
import type { Stage } from "@/lib/admin/stage";
import type { AdminUser, SavedView, Tag } from "@/lib/admin/types";

/**
 * Everything the applicants list shows that doesn't depend on the filters: the
 * values in the filter menus and the counts on the stage tabs.
 */
export interface ApplicantMenus {
  facets: FilterFacets;
  tags: Tag[];
  admins: AdminUser[];
  savedViews: SavedView[];
  stageCounts?: Record<Stage, number>;
}

const MenusContext = createContext<ApplicantMenus>({
  facets: { schools: [], majors: [], shirts: [], classes: [] },
  tags: [],
  admins: [],
  savedViews: [],
});

export function ApplicantMenusProvider({
  value,
  children,
}: {
  value: ApplicantMenus;
  children: React.ReactNode;
}) {
  return <MenusContext.Provider value={value}>{children}</MenusContext.Provider>;
}

/** The workspace, with its menus supplied by the layout instead of the page. */
export function ApplicantsList(
  props: Omit<ComponentProps<typeof ApplicantsWorkspace>, keyof ApplicantMenus>
) {
  const menus = useContext(MenusContext);
  return <ApplicantsWorkspace {...menus} {...props} />;
}
