import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import RegisterBackdrop from "@/components/RegisterBackdrop";
import VolunteerForm, { type VolunteerDefaults } from "@/components/VolunteerForm";
import { signOut } from "@/app/register/actions";
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
  if (!user) redirect("/signin");

  const { data: existing } = await supabase
    .from("volunteers")
    .select("full_name, occ_id, dob, email, phone, iota_xi, role, shirt, needs, expertise")
    .eq("user_id", user.id)
    .maybeSingle();

  const defaults: Partial<VolunteerDefaults> = {
    ...existing,
    iota_xi: existing?.iota_xi == null ? "" : existing.iota_xi ? "yes" : "no",
    email: existing?.email ?? user.email ?? "",
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <RegisterBackdrop />
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/80 px-6 py-4 backdrop-blur-md sm:px-8">
        <Link
          href="/"
          className="select-none font-header text-lg tracking-wider text-[var(--text-primary)] transition-opacity hover:opacity-85"
        >
          OCC<span className="text-amber-500">Hacks</span>
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <LogOut className="size-4" />
            sign out
          </button>
        </form>
      </header>

      <section className="mx-auto max-w-2xl px-6 pb-24 pt-16">
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
    </main>
  );
}
