"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/Toast";
import { sendChunk } from "@/lib/admin/email-actions";
import { formatNumber } from "@/lib/admin/format";
import type { SendProgress as Progress } from "@/lib/admin/email";

/**
 * Drives a send to completion: one `sendChunk` after another until the
 * server says it's done, drawing the bar as it goes. A plain loop in an
 * effect rather than a transition — a transition would hold the whole page
 * pending for the minute a big send takes.
 */
export default function SendProgress({
  campaignId,
  initial,
  onDone,
}: {
  campaignId: string;
  initial: Progress;
  onDone?: (final: Progress) => void;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [progress, setProgress] = useState<Progress>(initial);
  const [halted, setHalted] = useState<string | null>(null);
  const running = useRef(false);

  useEffect(() => {
    if (running.current || initial.done) return;
    running.current = true;
    let cancelled = false;

    (async () => {
      let current = initial;
      let misses = 0;
      while (!cancelled && !current.done) {
        const next = await sendChunk(campaignId);
        if (cancelled) return;
        setProgress(next);
        if (!next.ok) {
          misses += 1;
          if (misses >= 3) {
            setHalted(next.message ?? "The send stopped responding.");
            toast(next.message ?? "The send stopped.", "error");
            return;
          }
        } else {
          misses = 0;
        }
        current = next;
      }
      if (cancelled) return;
      const failed = current.failed;
      toast(
        failed
          ? `Done — ${formatNumber(current.sent)} sent, ${formatNumber(failed)} failed`
          : `Sent to ${formatNumber(current.sent)} ${current.sent === 1 ? "person" : "people"}`,
        failed && current.sent === 0 ? "error" : "success"
      );
      router.refresh();
      onDone?.(current);
    })();

    return () => {
      cancelled = true;
    };
    // The loop belongs to one campaign; nothing about it should restart mid-send.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);

  const finished = progress.sent + progress.failed;
  const percent = progress.total ? Math.round((finished / progress.total) * 100) : 0;

  return (
    <div className="rounded-xl border border-[var(--ring)]/30 bg-accent/30 px-4 py-3">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-foreground">
          {progress.done ? "Finished" : halted ? "Stopped" : "Sending…"}
        </span>
        <span className="tabular-nums text-muted-foreground">
          {formatNumber(finished)} / {formatNumber(progress.total)}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-[var(--ring)] transition-[width] duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>
          <span className="text-emerald-200">{formatNumber(progress.sent)}</span> sent
        </span>
        <span>
          <span className={progress.failed ? "text-rose-200" : ""}>{formatNumber(progress.failed)}</span>{" "}
          failed
        </span>
        <span>{formatNumber(progress.queued)} waiting</span>
        {!progress.done && !halted && <span className="ml-auto">Keep this page open.</span>}
        {halted && <span className="ml-auto text-rose-200">{halted}</span>}
      </div>
    </div>
  );
}
