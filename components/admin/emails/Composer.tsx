"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import AudiencePicker from "@/components/admin/emails/AudiencePicker";
import RecipientChips from "@/components/admin/emails/RecipientChips";
import SendProgress from "@/components/admin/emails/SendProgress";
import { useToast } from "@/components/admin/Toast";
import { Panel, PanelHeader } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BODY_MAX,
  EMAIL_RE,
  SUBJECT_MAX,
  summarizeAudience,
  type AudienceKey,
  type AudienceSpec,
  type Campaign,
  type SendProgress as Progress,
} from "@/lib/admin/email";
import {
  deleteDraft,
  previewAudience,
  saveDraft,
  sendTest,
  startSend,
  type AudiencePreview,
} from "@/lib/admin/email-actions";
import { formatNumber } from "@/lib/admin/format";
import { broadcastEmail } from "@/lib/email/templates";

/**
 * Where a campaign is written. Audience on the left, the letter as it will
 * arrive on the right, and one footer that says how many people that adds up
 * to before the button that sends it.
 *
 * Saving is explicit — there's no autosave — because a half-written draft
 * that quietly persisted would show up in the history as if it were a thing.
 * The send button saves first, so nothing typed is lost on the way out.
 */
export default function Composer({
  draft,
  counts,
  me,
}: {
  /** An existing draft to continue, or null to start from nothing. */
  draft: Campaign | null;
  counts: Record<AudienceKey, number>;
  me: { email: string };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const [campaignId, setCampaignId] = useState<string | null>(draft?.id ?? null);
  const [keys, setKeys] = useState<Set<AudienceKey>>(new Set(draft?.audience.keys ?? []));
  const selectedIds = draft?.audience.applicantIds ?? [];
  const [includeSelected, setIncludeSelected] = useState(selectedIds.length > 0);
  const [extra, setExtra] = useState<string[]>(draft?.audience.extra ?? []);
  const [subject, setSubject] = useState(draft?.subject ?? "");
  const [body, setBody] = useState(draft?.body_text ?? "");
  const [previewMode, setPreviewMode] = useState<"html" | "text">("html");
  // Tagged with the spec it answers, so a stale answer is simply not shown.
  const [audience, setAudience] = useState<{ key: string; result: AudiencePreview } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState<Progress | null>(null);

  const spec = useMemo<AudienceSpec>(
    () => ({
      keys: Array.from(keys),
      applicantIds: includeSelected ? selectedIds : [],
      extra: extra.filter((email) => EMAIL_RE.test(email)),
    }),
    // selectedIds comes from props and never changes for a mounted composer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [keys, includeSelected, extra]
  );
  const nobodyChosen = !spec.keys.length && !spec.applicantIds.length && !spec.extra.length;
  const specKey = JSON.stringify(spec);

  // The deduped total, refreshed a beat after the last change so a run of
  // clicks is one request rather than six.
  useEffect(() => {
    if (nobodyChosen) return;
    let stale = false;
    const timer = setTimeout(async () => {
      const result = await previewAudience(spec);
      if (!stale) setAudience({ key: specKey, result });
    }, 300);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [spec, specKey, nobodyChosen]);

  const resolved = nobodyChosen
    ? { count: 0, skipped: 0, sample: [] }
    : audience?.key === specKey
      ? audience.result
      : null;

  const preview = useMemo(
    () =>
      broadcastEmail({
        subject: subject.trim() || "Your subject line",
        bodyText: body.trim() || "Your message will appear here.\n\nBlank lines start a new paragraph.",
        firstName: "Alex",
      }),
    [subject, body]
  );

  const input = { subject, bodyText: body, audience: spec };
  const ready = subject.trim().length > 0 && body.trim().length > 0;
  const invalidExtras = extra.filter((email) => !EMAIL_RE.test(email)).length;

  const toggleKey = (key: AudienceKey) =>
    setKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const save = () =>
    startTransition(async () => {
      const result = await saveDraft(campaignId, input);
      if (result.ok && result.id) {
        setCampaignId(result.id);
        toast("Draft saved");
        router.refresh();
      } else {
        toast(result.message ?? "Could not save the draft.", "error");
      }
    });

  const test = () =>
    startTransition(async () => {
      const result = await sendTest({ subject, bodyText: body });
      toast(result.message ?? (result.ok ? "Test sent" : "That didn't work."), result.ok ? "success" : "error");
    });

  const discard = () => {
    if (!campaignId) return;
    startTransition(async () => {
      const result = await deleteDraft(campaignId);
      if (result.ok) {
        toast("Draft discarded");
        router.push("/admin/emails");
        router.refresh();
      } else {
        toast(result.message ?? "Could not discard the draft.", "error");
      }
    });
  };

  const send = () =>
    startTransition(async () => {
      const saved = await saveDraft(campaignId, input);
      if (!saved.ok || !saved.id) {
        toast(saved.message ?? "Could not save the draft.", "error");
        return;
      }
      setCampaignId(saved.id);
      const progress = await startSend(saved.id);
      setConfirmOpen(false);
      if (!progress.ok) {
        toast(progress.message ?? "Could not start the send.", "error");
        return;
      }
      setSending(progress);
    });

  const count = resolved?.count ?? null;
  const locked = pending || sending !== null;

  return (
    <>
      <Panel>
        <PanelHeader
          title={draft ? "Draft" : "New email"}
          subtitle={
            campaignId
              ? "Saved — it stays in the history below until it's sent or discarded."
              : "Nothing is saved until you press Save draft or Send."
          }
          action={
            campaignId && (
              <Button variant="ghost" size="sm" onClick={discard} disabled={locked}>
                Discard draft
              </Button>
            )
          }
        />

        <div className="grid gap-0 xl:grid-cols-[minmax(0,7fr)_minmax(0,6fr)]">
          <div className="space-y-5 border-b border-border p-4 xl:border-r xl:border-b-0">
            <section>
              <div className="mb-2 text-xs text-muted-foreground">Audiences</div>
              <AudiencePicker
                keys={keys}
                counts={counts}
                selectedApplicants={selectedIds.length}
                includeSelected={includeSelected}
                onToggle={toggleKey}
                onToggleSelected={() => setIncludeSelected((v) => !v)}
              />
            </section>

            <section>
              <label className="mb-1.5 block text-xs text-muted-foreground" htmlFor="composer-to">
                Also send to
              </label>
              <RecipientChips value={extra} onChange={setExtra} disabled={locked} />
              <p className="mt-1 text-xs text-muted-foreground">
                One-off addresses. They&apos;re sent to but not added to the contact list.
                {invalidExtras > 0 && (
                  <span className="text-rose-200">
                    {" "}
                    {invalidExtras} {invalidExtras === 1 ? "doesn't" : "don't"} look like an address and will be skipped.
                  </span>
                )}
              </p>
            </section>

            <section>
              <label className="mb-1.5 block text-xs text-muted-foreground" htmlFor="composer-subject">
                Subject
              </label>
              <input
                id="composer-subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value.slice(0, SUBJECT_MAX))}
                disabled={locked}
                placeholder="You're in — OCC Hacks 2026"
                autoComplete="off"
                className="h-8 w-full rounded-lg border border-border bg-transparent px-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-[var(--ring)]/50 disabled:opacity-60"
              />
            </section>

            <section>
              <div className="mb-1.5 flex items-baseline justify-between">
                <label className="text-xs text-muted-foreground" htmlFor="composer-body">
                  Message
                </label>
                <span className="text-[10px] tabular-nums text-muted-foreground">
                  {formatNumber(body.length)} / {formatNumber(BODY_MAX)}
                </span>
              </div>
              <textarea
                id="composer-body"
                value={body}
                onChange={(event) => setBody(event.target.value.slice(0, BODY_MAX))}
                disabled={locked}
                rows={12}
                placeholder={"Hi {{first_name}},\n\nWrite the message here. A blank line starts a new paragraph, and links become clickable on their own."}
                className="scroll-soft w-full resize-y rounded-lg border border-border bg-transparent px-2.5 py-2 text-sm leading-relaxed outline-none placeholder:text-muted-foreground focus:border-[var(--ring)]/50 disabled:opacity-60"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                <code className="rounded border border-border bg-muted/60 px-1 py-px text-[11px]">
                  {"{{first_name}}"}
                </code>{" "}
                becomes each person&apos;s first name, or &ldquo;there&rdquo; when we don&apos;t have one.
              </p>
            </section>
          </div>

          <div className="flex min-h-[32rem] flex-col">
            <div className="flex items-center justify-between border-b border-border px-4 py-2">
              <span className="text-xs text-muted-foreground">Preview · as Alex would see it</span>
              <div className="flex gap-1">
                {(["html", "text"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPreviewMode(mode)}
                    className={cn(
                      "rounded-md px-2 py-0.5 text-xs transition-colors",
                      previewMode === mode
                        ? "bg-accent/60 text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {mode === "html" ? "Email" : "Plain text"}
                  </button>
                ))}
              </div>
            </div>
            {previewMode === "html" ? (
              <iframe
                title="Email preview"
                sandbox=""
                srcDoc={preview.html}
                className="min-h-[30rem] w-full flex-1 bg-[#0a0a0a]"
              />
            ) : (
              <pre className="scroll-soft flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-muted-foreground">
                {`Subject: ${preview.subject}\n\n${preview.text}`}
              </pre>
            )}
          </div>
        </div>

        <div className="border-t border-border px-4 py-3">
          {sending ? (
            <SendProgress
              campaignId={campaignId!}
              initial={sending}
              onDone={() => router.push(`/admin/emails/${campaignId}`)}
            />
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1 text-sm">
                {nobodyChosen ? (
                  <span className="text-muted-foreground">Pick an audience or add an address.</span>
                ) : count === null ? (
                  <span className="text-muted-foreground">Counting…</span>
                ) : (
                  <>
                    <span className="text-foreground">
                      {formatNumber(count)} {count === 1 ? "person" : "people"}
                    </span>
                    <span className="text-muted-foreground"> · {summarizeAudience(spec)}</span>
                    {resolved && resolved.skipped > 0 && (
                      <span className="text-muted-foreground">
                        {" "}
                        · {resolved.skipped} without an address skipped
                      </span>
                    )}
                  </>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Button variant="ghost" size="sm" onClick={save} disabled={locked}>
                  Save draft
                </Button>
                <Button variant="outline" size="sm" onClick={test} disabled={locked || !ready} title={`Sends to ${me.email}`}>
                  Send test to me
                </Button>
                <Button
                  size="sm"
                  onClick={() => setConfirmOpen(true)}
                  disabled={locked || !ready || !count}
                >
                  <Send className="size-3.5" />
                  Send…
                </Button>
              </div>
            </div>
          )}
        </div>
      </Panel>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Send “${subject.trim()}” to ${formatNumber(count ?? 0)} ${count === 1 ? "person" : "people"}?`}
        body={`Goes to ${summarizeAudience(spec)}, one copy each. There's no unsend.`}
        confirmLabel="Send"
        confirmText={(count ?? 0) >= 200 ? "SEND" : undefined}
        onConfirm={send}
        pending={pending}
      />
    </>
  );
}
