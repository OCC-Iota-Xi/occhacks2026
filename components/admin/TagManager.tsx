"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import { Empty, TagPill } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { createTag, deleteTag } from "@/lib/admin/actions";
import { TAG_COLORS, type Tag, type TagColor } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

const SWATCH: Record<TagColor, string> = {
  gold: "bg-amber-400",
  slate: "bg-slate-400",
  sky: "bg-sky-400",
  violet: "bg-violet-400",
  emerald: "bg-emerald-400",
  rose: "bg-rose-400",
};

/** Create, colour and retire the tags organizers can apply to applicants. */
export default function TagManager({
  tags,
  usage,
}: {
  tags: Tag[];
  usage: Record<string, number>;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [color, setColor] = useState<TagColor>("slate");
  const [doomed, setDoomed] = useState<Tag | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card/40 p-3">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="New tag name"
          className="h-8 min-w-[14rem] flex-1 rounded-lg border border-border bg-transparent px-2.5 text-sm outline-none focus:border-[var(--ring)]/50"
        />
        <div className="flex items-center gap-1">
          {TAG_COLORS.map((option) => (
            <button
              key={option}
              type="button"
              aria-label={option}
              onClick={() => setColor(option)}
              className={cn(
                "size-5 rounded-full border-2 transition-transform",
                SWATCH[option],
                color === option ? "border-foreground scale-110" : "border-transparent"
              )}
            />
          ))}
        </div>
        <Button
          size="sm"
          disabled={!name.trim() || pending}
          onClick={() =>
            startTransition(async () => {
              const result = await createTag(name, color);
              if (result.ok) {
                toast(`Created “${name.trim()}”`);
                setName("");
                router.refresh();
              } else {
                toast(result.message ?? "Could not create that tag.", "error");
              }
            })
          }
        >
          <Plus className="size-3.5" />
          Create tag
        </Button>
      </div>

      {tags.length ? (
        <ul className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border bg-card/40">
          {tags.map((tag) => (
            <li key={tag.id} className="flex items-center gap-3 px-3 py-2.5">
              <TagPill name={tag.name} color={tag.color} />
              <Link
                href={`/admin/applicants?tag=${encodeURIComponent(tag.name)}`}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {usage[tag.id] ?? 0} {usage[tag.id] === 1 ? "applicant" : "applicants"}
              </Link>
              <Button
                size="icon-sm"
                variant="ghost"
                className="ml-auto"
                aria-label={`Delete ${tag.name}`}
                onClick={() => setDoomed(tag)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <Empty title="No tags yet" hint="Create one above — they show up in the applicant list and its filters." />
      )}

      <ConfirmDialog
        open={Boolean(doomed)}
        onOpenChange={(open) => !open && setDoomed(null)}
        title={`Delete “${doomed?.name}”?`}
        body={`This removes the tag from ${usage[doomed?.id ?? ""] ?? 0} applicants. Their applications are untouched.`}
        confirmLabel="Delete tag"
        destructive
        pending={pending}
        onConfirm={() =>
          doomed &&
          startTransition(async () => {
            const result = await deleteTag(doomed.id);
            if (result.ok) {
              toast(`Deleted “${doomed.name}”`);
              setDoomed(null);
              router.refresh();
            } else {
              toast(result.message ?? "Could not delete that tag.", "error");
            }
          })
        }
      />
    </div>
  );
}
