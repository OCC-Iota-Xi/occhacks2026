import Link from "next/link";
import { CampaignBadge } from "@/components/admin/emails/badges";
import { Empty } from "@/components/admin/ui";
import { summarizeAudience, type Campaign } from "@/lib/admin/email";
import { formatDateTime, formatNumber } from "@/lib/admin/format";

/** Everything that's been written so far, newest first. Drafts open in the composer. */
export default function CampaignHistory({ campaigns }: { campaigns: Campaign[] }) {
  if (!campaigns.length) {
    return <Empty title="Nothing sent yet" hint="Campaigns you send show up here with who got them." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-0 text-sm">
        <thead>
          <tr className="text-left text-xs text-muted-foreground">
            <th className="border-b border-border px-4 py-2 font-normal">Subject</th>
            <th className="border-b border-border px-3 py-2 font-normal">Status</th>
            <th className="border-b border-border px-3 py-2 font-normal">Audience</th>
            <th className="border-b border-border px-3 py-2 font-normal">By</th>
            <th className="border-b border-border px-3 py-2 font-normal">When</th>
            <th className="border-b border-border px-4 py-2 text-right font-normal">Sent / failed</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => (
            <tr key={campaign.id} className="group transition-colors hover:bg-accent/40">
              <td className="max-w-[18rem] border-b border-border px-4 py-2">
                <Link
                  href={`/admin/emails/${campaign.id}`}
                  className="block truncate text-foreground group-hover:underline group-hover:underline-offset-2"
                >
                  {campaign.subject.trim() || <span className="text-muted-foreground">(no subject)</span>}
                </Link>
              </td>
              <td className="border-b border-border px-3 py-2">
                <CampaignBadge status={campaign.status} />
              </td>
              <td className="max-w-[16rem] truncate border-b border-border px-3 py-2 text-muted-foreground">
                {summarizeAudience(campaign.audience)}
              </td>
              <td className="border-b border-border px-3 py-2 whitespace-nowrap text-muted-foreground">
                {campaign.sent_by_name ?? "—"}
              </td>
              <td className="border-b border-border px-3 py-2 whitespace-nowrap text-muted-foreground">
                {formatDateTime(campaign.sent_at ?? campaign.created_at)}
              </td>
              <td className="border-b border-border px-4 py-2 text-right tabular-nums whitespace-nowrap">
                {campaign.status === "draft" ? (
                  <span className="text-muted-foreground">—</span>
                ) : (
                  <>
                    <span className="text-foreground">{formatNumber(campaign.sent_count)}</span>
                    <span className="text-muted-foreground"> / </span>
                    <span className={campaign.failed_count ? "text-rose-200" : "text-muted-foreground"}>
                      {formatNumber(campaign.failed_count)}
                    </span>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
