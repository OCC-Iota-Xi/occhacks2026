"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const BUCKET = "resumes";
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Résumé upload for the mentor form.
 *
 * The file goes straight from the browser to Supabase Storage, and only the
 * resulting object path is posted with the form. That keeps a multi-megabyte
 * PDF out of the server action's request body, and — because the path is just
 * a short string — it rides along in the autosave and the browser draft like
 * every other answer, so a half-finished form doesn't lose the upload.
 *
 * The value is held by the parent rather than here: the draft restore has to
 * be able to put a path back after mount, and a hidden input can't be written
 * to directly (see `applyDraft`).
 */
export default function ResumeUpload({
  name,
  value,
  onValueChange,
}: {
  name: string;
  value: string;
  onValueChange: (path: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  /** The name the reader chose, recovered from the stored path. */
  const filename = value ? value.split("/").pop()!.replace(/^\d+-/, "") : "";

  async function upload(file: File) {
    setError("");

    // Firefox and a few mobile browsers hand back an empty type for a PDF, so
    // the extension is the fallback rather than the primary check.
    const looksPdf =
      file.type === "application/pdf" ||
      (!file.type && file.name.toLowerCase().endsWith(".pdf"));
    if (!looksPdf) {
      setError("that isn't a PDF — export or print your résumé to PDF and try again.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("that file is over 5 MB. try exporting it again at a smaller size.");
      return;
    }

    setBusy(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setBusy(false);
      setError("your session expired — sign in again and re-upload.");
      return;
    }

    // Owner's id as the folder: that's what the bucket's policies key on, so a
    // path shaped any other way is rejected server-side. The timestamp keeps a
    // replacement from colliding with what's already there.
    const safe = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-80);
    const path = `${user.id}/${Date.now()}-${safe}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: "application/pdf" });

    setBusy(false);
    if (uploadError) {
      console.error("[resume] upload failed:", uploadError);
      setError("the upload didn't go through — try again in a moment.");
      return;
    }

    onValueChange(path);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Deliberately nameless: giving it a name would post the file itself
          into the server action alongside the path we actually want. */}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          // Cleared so picking the same file twice still fires a change.
          event.target.value = "";
          if (file) void upload(file);
        }}
      />
      <input type="hidden" name={name} value={value} readOnly />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        // `aria-invalid` isn't a valid attribute on a button — a rejected file
        // is carried as data and read by the classes below.
        data-invalid={error ? "true" : undefined}
        className="flex items-center gap-2 rounded-full border border-border px-5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-60 data-[invalid=true]:border-destructive data-[invalid=true]:text-destructive"
      >
        {busy ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Upload className="size-4" />
        )}
        {busy ? "uploading…" : value ? "replace PDF" : "choose a PDF"}
      </button>

      {value && !busy && (
        <p className="flex max-w-full items-center gap-2 text-sm text-ring">
          <FileText className="size-4 shrink-0" />
          <span className="truncate">{filename}</span>
        </p>
      )}

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
