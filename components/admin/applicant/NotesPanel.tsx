"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import { Empty } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { addNote, deleteNote } from "@/lib/admin/actions";
import { formatDateTime } from "@/lib/admin/format";
import type { AdminUser, Note } from "@/lib/admin/types";

/**
 * Organizer notes. Private by construction, not by convention: `applicant_notes`
 * has no policy granting an applicant any access, so there is no request an
 * applicant's session can make that returns one.
 *
 * Rendered as text — never as markup — so a note quoting something an applicant
 * wrote can't bring anything with it.
 */
export default function NotesPanel({
  applicantId,
  notes,
  admins,
  viewerId,
}: {
  applicantId: string;
  notes: Note[];
  admins: AdminUser[];
  viewerId: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();

  const authorName = (id: string) => {
    const admin = admins.find((a) => a.user_id === id);
    return admin?.display_name ?? admin?.email ?? "Organizer";
  };

  const submit = () =>
    startTransition(async () => {
      const result = await addNote(applicantId, body);
      if (result.ok) {
        setBody("");
        toast("Note added");
        router.refresh();
      } else {
        toast(result.message ?? "Could not save that note.", "error");
      }
    });

  return (
    <div className="space-y-3 px-4 py-3">
      <div>
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "Enter" && body.trim()) {
              submit();
            }
          }}
          rows={3}
          placeholder="Something the other organizers should know. Applicants never see this."
          className="w-full rounded-lg border border-border bg-transparent px-2.5 py-2 text-xs outline-none focus:border-[var(--ring)]/50"
        />
        <div className="mt-1.5 flex justify-end">
          <Button size="sm" disabled={!body.trim() || pending} onClick={submit}>
            Add note
          </Button>
        </div>
      </div>

      {notes.length ? (
        <ul className="space-y-3 border-t border-border pt-3">
          {notes.map((note) => (
            <li key={note.id} className="group text-xs">
              <p className="whitespace-pre-wrap text-foreground">{note.body}</p>
              <div className="mt-1 flex items-center gap-2 text-muted-foreground">
                <span>— {authorName(note.author_id)}</span>
                <span>{formatDateTime(note.created_at)}</span>
                {note.author_id === viewerId && (
                  <button
                    type="button"
                    className="ml-auto opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Delete note"
                    onClick={() =>
                      startTransition(async () => {
                        const result = await deleteNote(note.id);
                        if (result.ok) {
                          toast("Note deleted");
                          router.refresh();
                        } else {
                          toast(result.message ?? "Could not delete that note.", "error");
                        }
                      })
                    }
                  >
                    <Trash2 className="size-3.5 hover:text-rose-300" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <Empty title="No notes yet" hint="Notes are visible to organizers only." />
      )}
    </div>
  );
}
