"use client";

import type { ComponentProps } from "react";
import AnalysisWorkspace from "@/components/admin/analysis/Workspace";
import { useApplicantMenus } from "@/components/admin/applicants/Menus";

type MenuProps = "facets" | "tags" | "admins" | "savedViews";

/** The analysis workspace, with its menus supplied by the layout instead of the page. */
export function AnalysisList(props: Omit<ComponentProps<typeof AnalysisWorkspace>, MenuProps>) {
  const { facets, tags, admins, savedViews } = useApplicantMenus();
  return (
    <AnalysisWorkspace
      facets={facets}
      tags={tags}
      admins={admins}
      savedViews={savedViews}
      {...props}
    />
  );
}
