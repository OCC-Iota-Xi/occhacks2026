import { Panel } from "@/components/admin/ui";

/**
 * Shown when the organizer schema isn't in the database yet. The dashboard
 * can't invent the tables — this project has no service-role key by design, so
 * migrations are applied by hand in the Supabase dashboard, the same way the
 * other seventeen were.
 */
export default function SetupNotice({ detail }: { detail?: string | null }) {
  return (
    <Panel className="px-5 py-6">
      <h2 className="text-sm text-foreground">Run the organizer migration first</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        The decision, review, note, tag and activity tables this dashboard reads don&apos;t
        exist yet. Open the Supabase dashboard → SQL Editor → New query, paste the contents
        of the file below, and run it. Every statement is idempotent, so running it twice is
        safe.
      </p>
      <code className="mt-3 inline-block rounded-md border border-border bg-muted/60 px-2 py-1 text-xs">
        supabase/migrations/0018_admin_crm.sql
      </code>
      <p className="mt-3 max-w-2xl text-xs text-muted-foreground">
        It also adds the row-level security policies that let an organizer read the roster at
        all — until it runs, this account can see only its own rows, so every count here will
        read zero.
      </p>
      {detail && (
        <p className="mt-3 text-xs text-muted-foreground">
          Database said: <span className="text-rose-300">{detail}</span>
        </p>
      )}
    </Panel>
  );
}
