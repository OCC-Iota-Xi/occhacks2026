import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AccountBackdrop from "@/components/AccountBackdrop";
import AccountSidebar from "@/components/AccountSidebar";
import FloatingVideo from "@/components/FloatingVideo";
import RegisterForm, { type RegistrationDefaults } from "@/components/RegisterForm";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
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
          "full_name, school, major, occ_id, dob, email, phone, iota_xi, shirt, needs, email_opt_in, classes, rank_entertainment, rank_education, rank_productivity, completed_at"
        )
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };

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
        email={user?.email}
        name={existing?.full_name}
      />
      <SidebarInset className="relative min-h-screen overflow-hidden">
        <header className="sticky top-0 z-50 flex items-center border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md md:hidden">
          <SidebarTrigger />
        </header>

        <AccountBackdrop />
        <FloatingVideo />

        <section className="relative z-10 mx-auto w-full max-w-2xl px-6 py-16 sm:px-12">
        <div className="text-center">
          <h1 className="font-display text-4xl tracking-tight sm:text-5xl">
            register as a hacker
          </h1>
        </div>

        <div className="mt-10">
          {/* A draft row isn't an update — only a finished registration is. */}
          <RegisterForm defaults={defaults} isUpdate={!!existing?.completed_at} />
        </div>
      </section>
      </SidebarInset>
    </SidebarProvider>
  );
}
