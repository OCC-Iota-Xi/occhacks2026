import CampaignHistory from "@/components/admin/emails/CampaignHistory";
import Composer from "@/components/admin/emails/Composer";
import ContactList from "@/components/admin/emails/ContactList";
import SetupNotice from "@/components/admin/SetupNotice";
import { PageHeader, Panel, PanelHeader } from "@/components/admin/ui";
import { fetchAudienceCounts, fetchCampaigns, fetchContacts } from "@/lib/admin/email-queries";
import { adminContext, isSchemaMissing } from "@/lib/admin/queries";
import { formatNumber } from "@/lib/admin/format";

/**
 * Organizer mail. One composer at the top for the next message, the contact
 * list and everything already sent underneath. Decisions on the applicants
 * page still email nobody — this is where the "you're in" note actually gets
 * written and sent.
 */
export default async function EmailsPage() {
  const ctx = await adminContext();
  if (!ctx.ready) return <SetupNotice />;

  const [counts, contacts, history] = await Promise.all([
    fetchAudienceCounts(ctx),
    fetchContacts(ctx),
    fetchCampaigns(ctx),
  ]);

  if (isSchemaMissing(history.error)) {
    return (
      <div className="space-y-4">
        <PageHeader title="Emails" />
        <SetupNotice file="supabase/migrations/0022_email_campaigns.sql" detail={history.error?.message} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Emails"
        subtitle="Write to a slice of the roster. Every send is logged below, person by person."
      />

      <Composer draft={null} counts={counts} me={{ email: ctx.email }} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Panel>
          <PanelHeader
            title="Contact list"
            subtitle={`${formatNumber(contacts.length)} hand-added — judges, sponsors, anyone without a sign-up`}
          />
          <ContactList contacts={contacts} />
        </Panel>

        <Panel>
          <PanelHeader title="History" subtitle="Drafts open in the composer; sent campaigns show who got them" />
          <CampaignHistory campaigns={history.campaigns} />
        </Panel>
      </div>
    </div>
  );
}
