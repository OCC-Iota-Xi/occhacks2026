import { redirect } from "next/navigation";
import AccountBackdrop from "@/components/AccountBackdrop";
import AccountSidebar from "@/components/AccountSidebar";
import FloatingVideo from "@/components/FloatingVideo";
import HelperForm, { type HelperDefaults } from "@/components/HelperForm";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { HELPER_TABLE, type HelperCopy } from "@/lib/helper-roles";
import { createClient } from "@/lib/supabase/server";

/** A stored sign-up from either table, as the form wants to read it. */
type StoredSignup = Partial<HelperDefaults> & { completed_at: string | null };

/**
 * The reader's saved sign-up for one role, or null if they haven't started.
 *
 * Two spelled-out queries rather than one keyed by the role: the tables hold
 * different columns, and the Supabase client derives the row type from the
 * select string, so it only types the result when that string is a literal.
 * The two shapes meet again as `StoredSignup`, which is the union of both.
 */
async function loadSignup(
  supabase: Awaited<ReturnType<typeof createClient>>,
  copy: HelperCopy,
  userId: string
): Promise<StoredSignup | null> {
  const shared =
    "full_name, dob, email, phone, shirt, needs, expertise, eligibility_agreed, email_opt_in, availability, completed_at";

  if (copy.role === "mentor") {
    const { data } = await supabase
      .from(HELPER_TABLE.mentor)
      .select(`${shared}, resume_path, mentor_reason`)
      .eq("user_id", userId)
      .maybeSingle();
    return data as StoredSignup | null;
  }

  const { data } = await supabase
    .from(HELPER_TABLE.volunteer)
    .select(`${shared}, occ_id`)
    .eq("user_id", userId)
    .maybeSingle();
  return data as StoredSignup | null;
}

/**
 * The volunteer and mentor sign-up pages.
 *
 * Both routes render this with their own `copy`; the only thing the route
 * itself owns is its metadata. Each role reads its own table, so someone who
 * has already volunteered still lands on an empty mentor form — the two
 * sign-ups don't see each other.
 */
export default async function HelperPage({ copy }: { copy: HelperCopy }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Dev-only: allow viewing the form without a session (saving still requires auth).
  if (!user && process.env.NODE_ENV !== "development") redirect("/signin");

  const existing = user ? await loadSignup(supabase, copy, user.id) : null;

  // Columns are nullable now that a half-finished row is a normal state, but
  // the form's controlled inputs still need strings and arrays.
  const defaults: Partial<HelperDefaults> = {
    ...existing,
    full_name: existing?.full_name ?? "",
    occ_id: existing?.occ_id ?? "",
    dob: existing?.dob ?? "",
    phone: existing?.phone ?? "",
    shirt: existing?.shirt ?? "",
    needs: existing?.needs ?? "",
    expertise: existing?.expertise ?? "",
    resume_path: existing?.resume_path ?? "",
    mentor_reason: existing?.mentor_reason ?? "",
    availability: existing?.availability ?? [],
    email: existing?.email ?? user?.email ?? "",
  };

  return (
    <SidebarProvider>
      <AccountSidebar
        active={copy.role}
        userId={user?.id}
        email={user?.email}
        name={existing?.full_name}
      />
      <SidebarInset className="relative min-h-screen overflow-hidden">
        <header className="sticky top-0 z-50 flex items-center border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md md:hidden">
          <SidebarTrigger />
        </header>

        <AccountBackdrop />
        {copy.showsVideo && <FloatingVideo />}

        <section className="relative z-10 mx-auto w-full max-w-2xl px-6 py-16 sm:px-12">
          <div className="text-center">
            <h1 className="font-display text-4xl tracking-tight sm:text-5xl">
              {copy.heading}
            </h1>
          </div>

          <div className="mt-10">
            {/* A draft row isn't an update — only a finished sign-up is. */}
            <HelperForm copy={copy} defaults={defaults} isUpdate={!!existing?.completed_at} />
          </div>
        </section>
      </SidebarInset>
    </SidebarProvider>
  );
}
