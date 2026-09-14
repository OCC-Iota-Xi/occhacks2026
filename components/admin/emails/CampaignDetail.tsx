"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Copy, RotateCcw } from "lucide-react";
import { CampaignBadge, RecipientBadge } from "@/components/admin/emails/badges";
import SendProgress from "@/components/admin/emails/SendProgress";
import { useToast } from "@/components/admin/Toast";
import { Empty, Panel, PanelHeader } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AUDIENCE_LABEL,
  summarizeAudience,
  type AudienceKey,
  type Campaign,
  type CampaignRecipient,
  type RecipientStatus,
  type SendProgress as Progress,
} from "@/lib/admin/email";
import { retryFailed, reuseCampaign } from "@/lib/admin/email-actions";
import { formatDateTime, formatNumber } from "@/lib/admin/format";
import { broadcastEmail } from "@/lib/email/templates";

const SOURCE_LABEL: Record<string, string> = {
  ...AUDIENCE_LABEL,
  selected: "Selected",
  extra: "Typed in",
};

const FILTERS: { value: RecipientStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "sent", label: "Sent" },
  { value: "failed", label: "Failed" },
  { value: "queued", label: "Waiting" },
];

/**
 * A campaign after it's gone out: who it reached, who it didn't and why, and
 * the two things worth doing about it — retry the failures, or start a new
 * draft from the same letter.
 *
 * If the page loads while the campaign is still `sending` (a refresh
 * mid-send, or a tab that was closed), the progress loop picks the send back
 * up from here rather than leaving the queue stranded.
 */
export default function CampaignDetail({
  campaign,
  recipients,
}: {
  campaign: Campaign;
  recipients: CampaignRecipient[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [filter, setFilter] = useState<RecipientStatus | "all">("all");
  const [showBody, setShowBody] = useState(false);
  const [sending, setSending] = useState<Progress | null>(
    campaign.status === "sending"
      ? {
          ok: true,
          status: "sending",
          total: campaign.recipient_count,
          sent: campaign.sent_count,
          failed: campaign.failed_count,
          queued: campaign.queued_count,
          done: false,
        }
      : null
  );

  const retry = () =>
    startTransition(async () => {
      const progress = await retryFailed(campaign.id);
      if (!progress.ok) {
        toast(progress.message ?? "Could not retry.", "error");
        return;
      }
      setSending(progress);
    });

  const reuse = () =>
    startTransition(async () => {
      const result = await reuseCampaign(campaign.id);
      if (result.ok && result.id) {
        router.push(`/admin/emails/${result.id}`);
      } else {
        toast(result.message ?? "Could not copy the campaign.", "error");
      }
    });

  const shown = filter === "all" ? recipients : recipients.filter((r) => r.status === filter);
  const preview = broadcastEmail({
    subject: campaign.subject,
    bodyText: campaign.body_text,
    firstName: "Alex",
  });

  return (
    <div className="space-y-4">
      <Link
        href="/admin/emails"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3" /> All emails
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl tracking-tight text-foreground">
              {campaign.subject.trim() || "(no subject)"}
            </h1>
            <CampaignBadge status={campaign.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {summarizeAudience(campaign.audience)}
            {campaign.sent_by_name && ` · sent by ${campaign.sent_by_name}`}
            {campaign.sent_at && ` · ${formatDateTime(campaign.sent_at)}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {campaign.failed_count > 0 && !sending && (
            <Button variant="outline" size="sm" onClick={retry} disabled={pending}>
              <RotateCcw className="size-3.5" />
              Retry {formatNumber(campaign.failed_count)} failed
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={reuse} disabled={pending}>
            <Copy className="size-3.5" />
            Reuse as draft
          </Button>
        </div>
      </div>

      {sending && (
        <SendProgress
          campaignId={campaign.id}
          initial={sending}
          onDone={() => {
            setSending(null);
            router.refresh();
          }}
        />
      )}

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Recipients", value: campaign.recipient_count },
          { label: "Sent", value: campaign.sent_count },
          { label: "Failed", value: campaign.failed_count, alert: campaign.failed_count > 0 },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card/40 px-4 py-3">
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div
              className={cn(
                "mt-1.5 text-2xl tabular-nums tracking-tight",
                stat.alert ? "text-rose-200" : "text-foreground"
              )}
            >
              {formatNumber(stat.value)}
            </div>
          </div>
        ))}
      </div>

      <Panel>
        <PanelHeader
          title="Message"
          action={
            <button
              type="button"
              onClick={() => setShowBody((v) => !v)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {showBody ? "Hide" : "Show"}
            </button>
          }
        />
        {showBody && (
          <iframe title="Email preview" sandbox="" srcDoc={preview.html} className="h-[36rem] w-full bg-[#0a0a0a]" />
        )}
      </Panel>

      <Panel>
        <PanelHeader
          title="Recipients"
          subtitle={`${formatNumber(shown.length)} shown`}
          action={
            <div className="flex gap-1">
              {FILTERS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFilter(option.value)}
                  className={cn(
                    "rounded-md px-2 py-0.5 text-xs transition-colors",
                    filter === option.value
                      ? "bg-accent/60 text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          }
        />
        {shown.length === 0 ? (
          <Empty title="Nobody here" hint="Try a different filter." />
        ) : (
          <div className="scroll-soft max-h-[36rem] overflow-auto">
            <table className="w-full border-separate border-spacing-0 text-sm">
              <thead className="sticky top-0 z-20 bg-card">
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="border-b border-border px-4 py-2 font-normal">Email</th>
                  <th className="border-b border-border px-3 py-2 font-normal">Name</th>
                  <th className="border-b border-border px-3 py-2 font-normal">From</th>
                  <th className="border-b border-border px-3 py-2 font-normal">Status</th>
                  <th className="border-b border-border px-4 py-2 font-normal">Result</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-accent/40">
                    <td className="border-b border-border px-4 py-1.5 whitespace-nowrap">
                      {row.applicant_id ? (
                        <Link
                          href={`/admin/applicants/${row.applicant_id}`}
                          className="text-foreground hover:underline hover:underline-offset-2"
                        >
                          {row.email}
                        </Link>
                      ) : (
                        <span className="text-foreground">{row.email}</span>
                      )}
                    </td>
                    <td className="border-b border-border px-3 py-1.5 whitespace-nowrap text-muted-foreground">
                      {row.name ?? "—"}
                    </td>
                    <td className="border-b border-border px-3 py-1.5 whitespace-nowrap text-muted-foreground">
                      {SOURCE_LABEL[row.source as AudienceKey] ?? row.source}
                    </td>
                    <td className="border-b border-border px-3 py-1.5">
                      <RecipientBadge status={row.status} />
                    </td>
                    <td className="max-w-[20rem] truncate border-b border-border px-4 py-1.5 text-xs text-muted-foreground">
                      {row.status === "sent"
                        ? formatDateTime(row.sent_at)
                        : row.error ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
