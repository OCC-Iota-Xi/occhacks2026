import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import SignInForm from "@/components/SignInForm";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "sign in — OCC Hacks 2026",
  description: "Sign in to register for OCC Hacks 2026.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/register");

  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col">
      <div className="px-6 py-5 sm:px-8">
        <Link
          href="/"
          className="select-none font-header text-lg tracking-wider text-[var(--text-primary)] transition-opacity hover:opacity-85"
        >
          OCC<span className="text-amber-500">Hacks</span>
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 pb-24">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-black/30 p-8 text-center">
          <h1 className="font-display text-3xl tracking-tight">Sign into OCC Hacks</h1>
          {error === "expired" && (
            <p className="mt-3 text-sm text-ring">
              that sign-in didn&apos;t go through — try again.
            </p>
          )}
          <SignInForm />
        </div>
      </div>
    </main>
  );
}
