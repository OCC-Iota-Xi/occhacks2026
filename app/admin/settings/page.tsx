import { Download } from "lucide-react";
import SavedViewList from "@/components/admin/SavedViewList";
import SetupNotice from "@/components/admin/SetupNotice";
import { PageHeader, Panel, PanelHeader } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/admin/format";
import { adminContext, fetchAdmins, fetchSavedViews } from "@/lib/admin/queries";
import { ADMIN_EMAILS } from "@/lib/admin/access";

export default async function SettingsPage() {
  const ctx = await adminContext();
  if (!ctx.ready) return <SetupNotice />;

  const [admins, views] = await Promise.all([fetchAdmins(ctx), fetchSavedViews(ctx)]);

  return (
    <div className="space-y-4">
      <PageHeader title="Settings" subtitle="Who can get in here, and what's saved" />

      <div className="grid gap-3 lg:grid-cols-2">
        <Panel>
          <PanelHeader
            title="Organizers"
            subtitle="Everyone on this list has full access to every applicant"
          />
          <ul className="divide-y divide-border/60">
            {admins.map((admin) => (
              <li key={admin.email} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                <span className="min-w-0 flex-1 truncate">
                  {admin.display_name ?? admin.email}
                  <span className="ml-2 text-xs text-muted-foreground">{admin.email}</span>
                </span>
                {admin.user_id === ctx.userId && (
                  <span className="rounded-md border border-[var(--ring)]/30 bg-amber-400/10 px-1.5 py-0.5 text-xs text-amber-200">
                    You
                  </span>
                )}
                <span className="text-xs whitespace-nowrap text-muted-foreground">
                  {admin.last_seen_at ? formatDateTime(admin.last_seen_at) : "Never signed in"}
                </span>
              </li>
            ))}
          </ul>
          <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
            <p>
              Access is checked in three places, all reading one list: the proxy before the
              route renders, the admin layout on the server, and every mutation before it
              writes. The database keeps its own copy in{" "}
              <code className="text-foreground">public.admin_users</code>, which is what the
              row-level security policies are written against.
            </p>
            <p className="mt-2">
              To add or remove an organizer, edit{" "}
              <code className="text-foreground">lib/admin/access.ts</code> and insert or delete
              the matching row in <code className="text-foreground">public.admin_users</code>.
              Both are needed: the first controls the pages, the second controls the data.
            </p>
            <p className="mt-2">
              In code right now: {ADMIN_EMAILS.join(", ")}
            </p>
          </div>
        </Panel>

        <div className="space-y-3">
          <Panel>
            <PanelHeader title="Saved views" subtitle="Shared with every organizer" />
            <SavedViewList views={views} viewerId={ctx.userId} />
          </Panel>

          <Panel>
            <PanelHeader title="Exports" subtitle="CSV, with internal notes and reviews left out" />
            <div className="flex flex-wrap gap-2 px-4 py-3">
              <a
                href="/admin/export"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs transition-colors hover:border-[var(--ring)]/40"
              >
                <Download className="size-3.5" />
                All applicants
              </a>
              <a
                href="/admin/export?status=accepted"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs transition-colors hover:border-[var(--ring)]/40"
              >
                <Download className="size-3.5" />
                Accepted
              </a>
              <a
                href="/admin/export?attendance=confirmed"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs transition-colors hover:border-[var(--ring)]/40"
              >
                <Download className="size-3.5" />
                Confirmed attendees
              </a>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
