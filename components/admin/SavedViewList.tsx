"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import { Empty } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { deleteView } from "@/lib/admin/actions";
import { formatDate } from "@/lib/admin/format";
import type { SavedView } from "@/lib/admin/types";

/** The views organizers have saved. Only the owner can delete one. */
export default function SavedViewList({
  views,
  viewerId,
}: {
  views: SavedView[];
  viewerId: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  if (!views.length) {
    return (
      <Empty
        title="No saved views yet"
        hint="Filter the applicant list the way you like it, then use “Save this view”."
      />
    );
  }

  return (
    <ul className="divide-y divide-border/60">
      {views.map((view) => (
        <li key={view.id} className="flex items-center gap-3 px-4 py-2.5">
          <Link
            href={`/admin/applicants${view.query ? `?${view.query}` : ""}`}
            className="min-w-0 flex-1"
          >
            <span className="text-sm hover:text-[var(--ring)]">{view.name}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {view.query || "No filters"}
            </span>
          </Link>
          <span className="text-xs whitespace-nowrap text-muted-foreground">
            {formatDate(view.created_at)}
          </span>
          {view.owner_id === viewerId && (
            <Button
              size="icon-sm"
              variant="ghost"
              disabled={pending}
              aria-label={`Delete ${view.name}`}
              onClick={() =>
                startTransition(async () => {
                  const result = await deleteView(view.id);
                  if (result.ok) {
                    toast(`Deleted “${view.name}”`);
                    router.refresh();
                  } else {
                    toast(result.message ?? "Could not delete that view.", "error");
                  }
                })
              }
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}
