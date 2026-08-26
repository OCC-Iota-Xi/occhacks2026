import { FileText } from "lucide-react";
import SetupNotice from "@/components/admin/SetupNotice";
import { Empty, PageHeader, Panel, PanelHeader, StatCard } from "@/components/admin/ui";
import { displayName, formatDate, formatNumber } from "@/lib/admin/format";
import { adminContext, fetchHelpers } from "@/lib/admin/queries";
import type { Helper } from "@/lib/admin/types";

/**
 * Volunteers and mentors.
 *
 * They're separate sign-ups in separate tables — someone can be both — and
 * neither goes through the accept/reject workflow, so they get a roster rather
 * than the CRM: who signed up, when they can be there, and what they can help
 * with. That's what shift-building needs.
 */
export default async function HelpersPage() {
  const ctx = await adminContext();
  if (!ctx.ready) return <SetupNotice />;

  const { volunteers, mentors, error } = await fetchHelpers(ctx);

  // Résumés live in a private bucket; organizers get a short-lived signed URL
  // rather than a public link, and only for rows that have one.
  const paths = mentors.map((mentor) => mentor.resume_path).filter((path): path is string =>
    Boolean(path)
  );
  const signed = paths.length
    ? ((await ctx.supabase.storage.from("resumes").createSignedUrls(paths, 3600)).data ?? [])
    : [];
  const resumeUrl = new Map<string, string>();
  for (const entry of signed) {
    if (entry.path && entry.signedUrl) resumeUrl.set(entry.path, entry.signedUrl);
  }

  const shiftCounts = countShifts([...volunteers, ...mentors]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Volunteers & mentors"
        subtitle="Two separate sign-ups — one person can be on both rosters"
      />

      {error && <SetupNotice detail={error} />}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Volunteers"
          value={formatNumber(volunteers.filter((v) => v.completed_at).length)}
          hint={`${volunteers.filter((v) => !v.completed_at).length} drafts`}
          emphasis
        />
        <StatCard
          label="Mentors"
          value={formatNumber(mentors.filter((m) => m.completed_at).length)}
          hint={`${mentors.filter((m) => !m.completed_at).length} drafts`}
        />
        <StatCard label="Résumés uploaded" value={formatNumber(paths.length)} />
        <StatCard
          label="Shift slots filled"
          value={formatNumber(shiftCounts.reduce((sum, shift) => sum + shift.count, 0))}
          hint="across every block"
        />
      </div>

      <Panel>
        <PanelHeader title="Coverage by block" subtitle="Volunteers and mentors combined" />
        {shiftCounts.length ? (
          <ul className="divide-y divide-border/60">
            {shiftCounts.map((shift) => (
              <li key={shift.label} className="flex items-center gap-3 px-4 py-2 text-xs">
                <span className="min-w-0 flex-1 truncate">{shift.label}</span>
                <span className="tabular-nums text-foreground">{shift.count}</span>
              </li>
            ))}
          </ul>
        ) : (
          <Empty title="Nobody has picked a block yet" />
        )}
      </Panel>

      <Roster
        title="Volunteers"
        people={volunteers}
        columns={["Availability", "Preferences"]}
        render={(person) => [
          person.availability?.join(", ") || "—",
          person.expertise || "—",
        ]}
      />

      <Roster
        title="Mentors"
        people={mentors}
        columns={["Availability", "Can mentor on", "Résumé"]}
        render={(person) => [
          person.availability?.join(", ") || "—",
          person.expertise || "—",
          person.resume_path && resumeUrl.get(person.resume_path) ? (
            <a
              href={resumeUrl.get(person.resume_path)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[var(--ring)] hover:underline"
            >
              <FileText className="size-3" />
              Open
            </a>
          ) : (
            "—"
          ),
        ]}
      />
    </div>
  );
}

function Roster({
  title,
  people,
  columns,
  render,
}: {
  title: string;
  people: Helper[];
  columns: string[];
  render: (person: Helper) => React.ReactNode[];
}) {
  return (
    <Panel className="overflow-hidden">
      <PanelHeader
        title={title}
        subtitle={`${people.filter((p) => p.completed_at).length} signed up`}
      />
      {people.length ? (
        <div className="scroll-soft overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="px-4 py-2 text-left font-normal">Name</th>
                <th className="px-3 py-2 text-left font-normal">Contact</th>
                {columns.map((column) => (
                  <th key={column} className="px-3 py-2 text-left font-normal">
                    {column}
                  </th>
                ))}
                <th className="px-3 py-2 text-left font-normal">Shirt</th>
                <th className="px-4 py-2 text-left font-normal">Signed up</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {people.map((person) => (
                <tr key={person.user_id} className="hover:bg-accent/25">
                  <td className="px-4 py-2">
                    {displayName(person)}
                    {!person.completed_at && (
                      <span className="ml-2 rounded-md border border-border px-1 py-0.5 text-[10px] text-muted-foreground">
                        draft
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    <div className="truncate">{person.email ?? "—"}</div>
                    <div>{person.phone ?? ""}</div>
                  </td>
                  {render(person).map((cell, index) => (
                    <td key={index} className="max-w-[260px] px-3 py-2 text-xs">
                      <div className="line-clamp-2">{cell}</div>
                    </td>
                  ))}
                  <td className="px-3 py-2 text-xs uppercase">{person.shirt ?? "—"}</td>
                  <td className="px-4 py-2 text-xs whitespace-nowrap text-muted-foreground">
                    {formatDate(person.completed_at ?? person.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty
          title={`No ${title.toLowerCase()} yet`}
          hint="Sign-ups arrive from the volunteer and mentor forms on the site."
        />
      )}
    </Panel>
  );
}

/** How many people picked each availability block, in the order the form lists them. */
function countShifts(people: Helper[]) {
  const counts = new Map<string, number>();
  for (const person of people) {
    for (const block of person.availability ?? []) {
      counts.set(block, (counts.get(block) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
