import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AccountBackdrop from "@/components/AccountBackdrop";
import AccountSidebar from "@/components/AccountSidebar";
import FloatingVideo from "@/components/FloatingVideo";
import RegisterForm, { type RegistrationDefaults } from "@/components/RegisterForm";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { applicationsClosed, WALK_IN_POLICY } from "@/lib/deadline";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "register — OCC Hacks 2026",
  description:
    "Register for OCC Hacks 2026 — Oct 10–11 at Orange Coast College. Free to attend, every meal covered.",
};

export default async function RegisterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Dev-only: allow viewing the form without a session (saving still requires auth).
  if (!user && process.env.NODE_ENV !== "development") redirect("/signin");

  const { data: existing } = user
    ? await supabase
        .from("hackers")
        .select(
          "full_name, school, major, occ_id, dob, email, phone, iota_xi, shirt, needs, eligibility_agreed, email_opt_in, classes, rank_entertainment, rank_education, rank_productivity, completed_at"
        )
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };

  // Past the deadline the form comes down for everyone, submitted or not.
  // `submitRegistration` and the autosave enforce the same freeze.
  const closed = applicationsClosed();

  const rank = (value: number | null | undefined) => (value == null ? "" : String(value));

  const defaults: Partial<RegistrationDefaults> = {
    ...existing,
    // Columns are nullable, but the form's controlled inputs need strings.
    full_name: existing?.full_name ?? "",
    school: existing?.school ?? "",
    major: existing?.major ?? "",
    occ_id: existing?.occ_id ?? "",
    dob: existing?.dob ?? "",
    phone: existing?.phone ?? "",
    shirt: existing?.shirt ?? "",
    needs: existing?.needs ?? "",
    classes: existing?.classes ?? [],
    iota_xi: existing?.iota_xi == null ? "" : existing.iota_xi ? "yes" : "no",
    ranks: {
      entertainment: rank(existing?.rank_entertainment),
      education: rank(existing?.rank_education),
      productivity: rank(existing?.rank_productivity),
    },
    email: existing?.email ?? user?.email ?? "",
  };

  return (
    <SidebarProvider>
      <AccountSidebar
        active="register"
        userId={user?.id}
        email={user?.email}
        name={existing?.full_name}
      />
      <SidebarInset className="relative min-h-screen overflow-hidden">
        <header className="sticky top-0 z-50 flex items-center border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md md:hidden">
          <SidebarTrigger />
        </header>

        <AccountBackdrop />
        {!closed && <FloatingVideo />}

        <section className="relative z-10 mx-auto w-full max-w-2xl px-6 py-16 sm:px-12">
        <div className="text-center">
          <h1 className="font-display text-4xl tracking-tight sm:text-5xl">
            {closed ? "applications are closed" : "register as a hacker"}
          </h1>
        </div>

        <div className="mt-10">
          {closed ? (
            <div className="space-y-4 rounded-2xl border border-border bg-background/60 p-6 text-base leading-relaxed text-foreground/90 backdrop-blur-md sm:p-8">
              <p>Hacker applications closed on October 5 at 11:59 PM.</p>
              {existing?.completed_at ? (
                <>
                  <p>
                    Your application is in and can no longer be edited. Your decision will show
                    up on your status page.
                  </p>
                  <Link
                    href="/status"
                    className="inline-flex rounded-full bg-foreground px-6 py-3 text-sm text-background transition-colors hover:bg-foreground/85"
                  >
                    check your status
                  </Link>
                </>
              ) : (
                <p>{WALK_IN_POLICY}</p>
              )}
            </div>
          ) : (
            // A draft row isn't an update — only a finished registration is.
            <RegisterForm defaults={defaults} isUpdate={!!existing?.completed_at} />
          )}
        </div>
      </section>
      </SidebarInset>
    </SidebarProvider>
  );
}
