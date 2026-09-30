import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AccountBackdrop from "@/components/AccountBackdrop";
import AccountSidebar from "@/components/AccountSidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "application status — OCC Hacks 2026",
  description: "Check the status of your OCC Hacks 2026 hacker application.",
};

type View = {
  label: string;
  body: string;
  accent?: boolean;
  details?: boolean;
  link?: { href: string; label: string };
};

/**
 * What an applicant sees for each state. Only a decision (accepted,
 * waitlisted, rejected, withdrawn) is shown as-is; `submitted` and `in_review`
 * are organizer working states and both read as "under review" here.
 */
function viewFor(
  completed: boolean,
  status: string | undefined,
  attendance: string | undefined
): View {
  switch (status) {
    case "accepted":
      return attendance === "confirmed"
        ? {
            label: "accepted",
            accent: true,
            details: true,
            body: "you're in, and your spot is confirmed. see you at OCC Hacks.",
          }
        : {
            label: "accepted",
            accent: true,
            details: true,
            body: "you're in. to confirm your spot, sign the waiver packet from your acceptance email and bring it to check-in, or reply to that email with a signed copy, by october 5 at 11:59pm.",
          };
    case "waitlisted":
      return {
        label: "waitlisted",
        body: "you're on the waitlist. we'll email you if a spot opens up before the event.",
      };
    case "rejected":
      return {
        label: "not accepted",
        body: "we weren't able to offer you a spot this year. thank you for applying, and we hope to see you at a future OCC Hacks.",
      };
    case "withdrawn":
      return {
        label: "withdrawn",
        body: "your application has been withdrawn. if that's a mistake, email hello@occhacks.com.",
      };
  }

  if (!completed) {
    return {
      label: "not submitted",
      body: "your application is still a draft. finish and submit it to be considered.",
      link: { href: "/register", label: "finish your application" },
    };
  }

  return {
    label: "under review",
    body: "we've got your application and are still reviewing it. your decision will show up here.",
  };
}

export default async function StatusPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Dev-only: allow viewing the page without a session.
  if (!user && process.env.NODE_ENV !== "development") redirect("/signin");

  // Both reads are scoped to the caller by RLS: applicants can read their own
  // `hackers` row and their own `application_status` row (migration 0018).
  const [{ data: hacker }, { data: decision }] = user
    ? await Promise.all([
        supabase
          .from("hackers")
          .select("full_name, completed_at")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("application_status")
          .select("status, attendance")
          .eq("user_id", user.id)
          .maybeSingle(),
      ])
    : [{ data: null }, { data: null }];

  const view = viewFor(!!hacker?.completed_at, decision?.status, decision?.attendance);

  return (
    <SidebarProvider>
      <AccountSidebar
        active="status"
        userId={user?.id}
        email={user?.email}
        name={hacker?.full_name}
      />
      <SidebarInset className="relative min-h-screen overflow-hidden">
        <header className="sticky top-0 z-50 flex items-center border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md md:hidden">
          <SidebarTrigger />
        </header>

        <AccountBackdrop />

        <section className="relative z-10 mx-auto w-full max-w-2xl px-6 py-16 sm:px-12">
          <h1 className="text-center font-display text-4xl tracking-tight sm:text-5xl">
            application status
          </h1>

          <div className="mt-10 rounded-2xl border border-border bg-background/60 p-6 backdrop-blur-md sm:p-8">
            <span
              className={
                view.accent
                  ? "inline-flex rounded-full border border-amber-500/60 px-3 py-1 text-sm text-amber-500"
                  : "inline-flex rounded-full border border-border px-3 py-1 text-sm text-muted-foreground"
              }
            >
              {view.label}
            </span>

            <p className="mt-5 text-base leading-relaxed text-foreground/90">{view.body}</p>

            {view.details && (
              <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t border-border pt-6 text-sm">
                <dt className="text-muted-foreground">when</dt>
                <dd>october 10–11</dd>
                <dt className="text-muted-foreground">where</dt>
                <dd>orange coast college, college center, floor 3 ballroom</dd>
                <dt className="text-muted-foreground">check-in</dt>
                <dd>8:00–8:40am, hacking starts at 9am</dd>
              </dl>
            )}

            {view.link && (
              <Link
                href={view.link.href}
                className="mt-6 inline-flex rounded-full bg-foreground px-6 py-3 text-sm text-background transition-colors hover:bg-foreground/85"
              >
                {view.link.label}
              </Link>
            )}
          </div>
        </section>
      </SidebarInset>
    </SidebarProvider>
  );
}
