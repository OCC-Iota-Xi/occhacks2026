import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Handbook from "@/components/Handbook";
import { canReadHandbook } from "@/lib/read-applicant-stage";
import { createClient, getSessionUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "hacker handbook — OCC Hacks 2026",
  description: "Everything a confirmed hacker needs for the weekend of OCC Hacks 2026.",
};

export default async function HandbookPage() {
  const supabase = await createClient();
  const user = await getSessionUser(supabase);
  // Dev-only: allow viewing the page without a session.
  if (!user && process.env.NODE_ENV !== "development") redirect("/signin");
  // Anyone not yet confirmed goes to the page that says where they stand.
  if (user && !(await canReadHandbook(user))) redirect("/status");

  return <Handbook />;
}
