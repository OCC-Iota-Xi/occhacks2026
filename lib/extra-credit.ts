import { canReadHandbook } from "@/lib/read-applicant-stage";
import type { createClient } from "@/lib/supabase/server";

type Supabase = Awaited<ReturnType<typeof createClient>>;

/**
 * The class a hacker wants extra credit for and the section of it they're in,
 * as their application has them.
 *
 * `class_section` arrives with migration 0028. Against a database that hasn't
 * had it yet, read the class alone rather than losing it too; `ready` says
 * which happened, since "no section" then means nothing can be saved, not
 * that one is owed.
 */
export async function readExtraCredit(supabase: Supabase, userId: string) {
  const read = (columns: string) =>
    supabase.from("hackers").select(columns).eq("user_id", userId).maybeSingle<{
      classes: string[] | null;
      completed_at: string | null;
      class_section?: string | null;
    }>();

  let { data, error } = await read("classes, completed_at, class_section");
  const ready = error?.code !== "42703";
  if (!ready) ({ data, error } = await read("classes, completed_at"));

  return {
    course: data?.classes?.[0] ?? "",
    section: data?.class_section ?? "",
    submitted: !!data?.completed_at,
    ready,
  };
}

/**
 * Whether this hacker still owes us a section: they picked a class for extra
 * credit, haven't said which section of it, and are someone the registration
 * page will let fix that. What the sidebar's reminder is shown for.
 */
export async function needsClassSection(
  supabase: Supabase,
  user: { id: string; email: string | null }
) {
  if (!(await canReadHandbook(user))) return false;
  const { course, section, submitted, ready } = await readExtraCredit(supabase, user.id);
  return ready && submitted && !!course && !section;
}
