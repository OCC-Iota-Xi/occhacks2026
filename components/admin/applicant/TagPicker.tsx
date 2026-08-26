"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { ActionMenu, MenuItem, MenuLabel } from "@/components/admin/Menu";
import { useToast } from "@/components/admin/Toast";
import { TagPill } from "@/components/admin/ui";
import { addTag, removeTag } from "@/lib/admin/actions";
import type { Tag } from "@/lib/admin/types";

/** Tags on one applicant: the ones they have, and a menu of the ones they don't. */
export default function TagPicker({
  applicantId,
  applied,
  all,
}: {
  applicantId: string;
  applied: Tag[];
  all: Tag[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const appliedIds = new Set(applied.map((tag) => tag.id));
  const available = all.filter((tag) => !appliedIds.has(tag.id));

  const act = (action: () => Promise<{ ok: boolean; message?: string }>, success: string) =>
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast(success);
        router.refresh();
      } else {
        toast(result.message ?? "That didn't work.", "error");
      }
    });

  return (
    <div className="flex flex-wrap items-center gap-1.5 px-4 py-3">
      {applied.map((tag) => (
        <TagPill
          key={tag.id}
          name={tag.name}
          color={tag.color}
          onRemove={
            <button
              type="button"
              disabled={pending}
              aria-label={`Remove ${tag.name}`}
              onClick={() =>
                act(() => removeTag([applicantId], tag.id), `Removed “${tag.name}”`)
              }
            >
              <X className="size-3 opacity-60 hover:opacity-100" />
            </button>
          }
        />
      ))}

      {available.length > 0 && (
        <ActionMenu
          align="start"
          trigger={
            <button
              type="button"
              className="flex items-center gap-1 rounded-md border border-dashed border-border px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <Plus className="size-3" />
              Tag
            </button>
          }
        >
          <MenuLabel>Add tag</MenuLabel>
          {available.map((tag) => (
            <MenuItem
              key={tag.id}
              onSelect={() => act(() => addTag([applicantId], tag.id), `Tagged “${tag.name}”`)}
            >
              {tag.name}
            </MenuItem>
          ))}
        </ActionMenu>
      )}

      {!applied.length && !available.length && (
        <span className="text-xs text-muted-foreground">
          No tags exist yet — create some on the Tags page.
        </span>
      )}
    </div>
  );
}
