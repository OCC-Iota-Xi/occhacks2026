import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import CampaignDetail from "@/components/admin/emails/CampaignDetail";
import Composer from "@/components/admin/emails/Composer";
import SetupNotice from "@/components/admin/SetupNotice";
import { PageHeader } from "@/components/admin/ui";
import { fetchAudienceCounts, fetchCampaign } from "@/lib/admin/email-queries";
import { adminContext } from "@/lib/admin/queries";

/** A draft opens in the composer; anything that's been sent opens as its log. */
export default async function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await adminContext();
  if (!ctx.ready) return <SetupNotice />;

  const { id } = await params;
  const found = await fetchCampaign(ctx, id);
  if (!found) notFound();

  if (found.campaign.status === "draft") {
    const counts = await fetchAudienceCounts(ctx);
    return (
      <div className="space-y-4">
        <Link
          href="/admin/emails"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3" /> All emails
        </Link>
        <PageHeader title="Draft" />
        <Composer
          key={found.campaign.id}
          draft={found.campaign}
          counts={counts}
          me={{ email: ctx.email }}
        />
      </div>
    );
  }

  return <CampaignDetail campaign={found.campaign} recipients={found.recipients} />;
}
