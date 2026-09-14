import { cn } from "@/lib/utils";
import type { CampaignStatus, RecipientStatus } from "@/lib/admin/email";

/**
 * Status pills for campaigns and their recipients — the same desaturated
 * palette the applicant badges use, for the same reason: a column of them has
 * to be scannable.
 */

const CAMPAIGN_STYLE: Record<CampaignStatus, string> = {
  draft: "border-border bg-muted/60 text-muted-foreground",
  sending: "border-amber-400/25 bg-amber-400/10 text-amber-200",
  sent: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
  failed: "border-rose-400/25 bg-rose-400/10 text-rose-200",
};

const CAMPAIGN_LABEL: Record<CampaignStatus, string> = {
  draft: "Draft",
  sending: "Sending",
  sent: "Sent",
  failed: "Failed",
};

export function CampaignBadge({ status, className }: { status: CampaignStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs whitespace-nowrap",
        CAMPAIGN_STYLE[status] ?? CAMPAIGN_STYLE.draft,
        className
      )}
    >
      {CAMPAIGN_LABEL[status] ?? status}
    </span>
  );
}

const RECIPIENT_STYLE: Record<RecipientStatus, string> = {
  queued: "border-border bg-muted/60 text-muted-foreground",
  sending: "border-amber-400/25 bg-amber-400/10 text-amber-200",
  sent: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
  failed: "border-rose-400/25 bg-rose-400/10 text-rose-200",
};

export function RecipientBadge({ status }: { status: RecipientStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs whitespace-nowrap capitalize",
        RECIPIENT_STYLE[status] ?? RECIPIENT_STYLE.queued
      )}
    >
      {status}
    </span>
  );
}
