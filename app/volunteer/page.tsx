import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AccountSidebar from "@/components/AccountSidebar";
import VolunteerForm, { type VolunteerDefaults } from "@/components/VolunteerForm";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "volunteer & mentor — OCC Hacks 2026",
  description:
    "Help run OCC Hacks 2026 — Oct 10–11 at Orange Coast College. Volunteer a shift or mentor a team.",
};

export default async function VolunteerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Dev-only: allow viewing the form without a session (saving still requires auth).
  if (!user && process.env.NODE_ENV !== "development") redirect("/signin");

  const { data: existing } = user
    ? await supabase
        .from("volunteers")
        .select("full_name, occ_id, dob, email, phone, iota_xi, role, shirt, needs, expertise")
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };

  const defaults: Partial<VolunteerDefaults> = {
    ...existing,
    iota_xi: existing?.iota_xi == null ? "" : existing.iota_xi ? "yes" : "no",
    email: existing?.email ?? user?.email ?? "",
  };

  return (
    <SidebarProvider>
      <AccountSidebar
        active="volunteer"
        email={user?.email}
        name={existing?.full_name}
      />
      <SidebarInset className="relative min-h-screen overflow-hidden">
        <header className="sticky top-0 z-50 flex items-center border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md md:hidden">
          <SidebarTrigger />
        </header>

        <section className="mx-auto w-full max-w-2xl px-6 pb-24 pt-16">
        <div className="text-center">
          <h1 className="font-display text-4xl tracking-tight sm:text-5xl">
            volunteer or mentor
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            oct 10–11, 2026 · meals covered for every shift.{" "}
            <Link
              href="/register"
              className="underline underline-offset-4 transition-colors hover:text-foreground"
            >
              want to hack instead?
            </Link>
          </p>
        </div>

        <div className="mt-12">
          <VolunteerForm defaults={defaults} isUpdate={!!existing} />
        </div>
      </section>
      </SidebarInset>
    </SidebarProvider>
  );
}
