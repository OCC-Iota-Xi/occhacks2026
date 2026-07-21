import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import NotifyButton from "@/components/NotifyButton";
import RegisterBackdrop from "@/components/RegisterBackdrop";
import { signOut } from "./actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "register — OCC Hacks 2026",
  description:
    "Register for OCC Hacks 2026 — Oct 11–12 at Orange Coast College. Free to attend, every meal covered.",
};

export default async function RegisterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: optin } = await supabase
    .from("notify_optins")
    .select("email")
    .eq("user_id", user.id)
    .maybeSingle<{ email: string }>();

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

      <section className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="font-display text-4xl tracking-tight sm:text-5xl">
          registration is coming soon
        </h1>
        <p className="mt-4 max-w-md text-sm text-muted-foreground">
          We&apos;re still putting the questions together. Check back shortly —{" "}
          <Link href="/" className="underline underline-offset-4 transition-colors hover:text-foreground">
            go back to the home page
          </Link>
          .
        </p>

        <div className="mt-10 flex w-full justify-center">
          <NotifyButton
            initialOptedIn={!!optin}
            defaultEmail={
              optin?.email ??
              user.email ??
              (typeof user.user_metadata?.email === "string" ? user.user_metadata.email : "")
            }
          />
        </div>
      </section>
    </main>
  );
}
