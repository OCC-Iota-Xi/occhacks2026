import type { createClient } from "@/lib/supabase/server";

/**
 * The class a hacker wants extra credit for and the section of it they're in,
 * as their application has them.
 *
 * `class_section` arrives with migration 0028. Against a database that hasn't
 * had it yet, read the class alone rather than losing it too.
 */
export async function readExtraCredit(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  const read = (columns: string) =>
    supabase
      .from("hackers")
      .select(columns)
      .eq("user_id", userId)
      .maybeSingle<{ classes: string[] | null; class_section?: string | null }>();

  let { data, error } = await read("classes, class_section");
  if (error?.code === "42703") ({ data, error } = await read("classes"));
  return { course: data?.classes?.[0] ?? "", section: data?.class_section ?? "" };
}
