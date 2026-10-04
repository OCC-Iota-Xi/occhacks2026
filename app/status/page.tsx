import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Download } from "lucide-react";
import AccountBackdrop from "@/components/AccountBackdrop";
import AccountSidebar from "@/components/AccountSidebar";
import WaiversSentButton from "@/components/WaiversSentButton";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { WAIVER_REPLY_TO } from "@/lib/email/templates";
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
  /** Show the waiver packet and the addresses to send it to. */
  waivers?: boolean;
  link?: { href: string; label: string };
};

/**
 * What an applicant sees for each state. Only accepted and withdrawn are shown
 * as-is; everything else an organizer can set — `submitted`, `in_review`, and
 * for now `waitlisted` and `rejected` — reads as "under review" here.
 *
 * Accepted has three steps: waivers still to send, sent and waiting on an
 * organizer (`waivers_sent_at`, set by the applicant's own button), and
 * confirmed — attendance, which an organizer sets once they've reviewed the
 * forms. Confirmed wins, so someone whose emailed waivers were reviewed without
 * them ever pressing the button still lands on "you're in".
 */
function viewFor(
  completed: boolean,
  status: string | undefined,
  attendance: string | undefined,
  waiversSent: boolean
): View {
  switch (status) {
    case "accepted":
      if (attendance === "confirmed") {
        return {
          label: "confirmed",
          accent: true,
          details: true,
          body: "Your waivers are reviewed and your spot is confirmed. You're in, see you there.",
        };
      }
      if (waiversSent) {
        return {
          label: "under review",
          details: true,
          body: "Thanks for sending your waivers. An organizer is reviewing them, and your spot will show as confirmed here once they're done.",
        };
      }
      return {
        label: "accepted",
        accent: true,
        details: true,
        waivers: true,
        body: "You're accepted. To confirm your spot, fill out the waiver packet and email your signed copy to both organizers below by October 5 at 11:59 PM. Once it's sent, let us know with the button below.",
      };
    // Not shown to applicants for now: both fall through to "under review".
    // case "waitlisted":
    //   return {
    //     label: "waitlisted",
    //     body: "you're on the waitlist. we'll email you if a spot opens up before the event.",
    //   };
    // case "rejected":
    //   return {
    //     label: "not accepted",
    //     body: "we weren't able to offer you a spot this year. thank you for applying, and we hope to see you at a future OCC Hacks.",
    //   };
    case "withdrawn":
      return {
        label: "withdrawn",
        body: "Your application has been withdrawn. If that's a mistake, email hello@occhacks.com.",
      };
  }

  if (!completed) {
    return {
      label: "not submitted",
      body: "Your application is still a draft. Finish and submit it to be considered.",
      link: { href: "/register", label: "finish your application" },
    };
  }

  return {
    label: "under review",
    body: "We've got your application and are still reviewing it. Your decision will show up here.",
  };
}

interface Decision {
  status: string;
  attendance: string;
  waivers_sent_at?: string | null;
}

/**
 * `waivers_sent_at` arrives with migration 0024. Against a database that hasn't
 * had it yet, read the decision without it rather than losing the whole row —
 * an accepted applicant would otherwise be told they're still under review.
 */
async function readDecision(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<Decision | null> {
  const read = (columns: string) =>
    supabase
      .from("application_status")
      .select(columns)
      .eq("user_id", userId)
      .maybeSingle<Decision>();

  const first = await read("status, attendance, waivers_sent_at");
  if (first.error?.code !== "42703") return first.data;
  return (await read("status, attendance")).data;
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
  const [{ data: hacker }, decision] = user
    ? await Promise.all([
        supabase
          .from("hackers")
          .select("full_name, completed_at")
          .eq("user_id", user.id)
          .maybeSingle(),
        readDecision(supabase, user.id),
      ])
    : [{ data: null }, null];

  const view = viewFor(
    !!hacker?.completed_at,
    decision?.status,
    decision?.attendance,
    !!decision?.waivers_sent_at
  );

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
                  ? "inline-flex rounded-full border border-ring/60 px-3 py-1 text-sm text-ring"
                  : "inline-flex rounded-full border border-border px-3 py-1 text-sm text-muted-foreground"
              }
            >
              {view.label}
            </span>

            <p className="mt-5 text-base leading-relaxed text-foreground/90">{view.body}</p>

            {view.waivers && (
              <>
                <a
                  href="/email/OCCHacksWaivers.pdf"
                  download="OCCHacksWaivers.pdf"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm text-background transition-colors hover:bg-foreground/85"
                >
                  <Download className="size-4" />
                  download waiver packet
                </a>

                <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t border-border pt-6 text-sm">
                  <dt className="text-muted-foreground">send to</dt>
                  <dd className="space-y-1">
                    {WAIVER_REPLY_TO.map((to) => (
                      <a
                        key={to}
                        href={`mailto:${to}`}
                        className="block break-all text-ring underline-offset-4 hover:underline"
                      >
                        {to}
                      </a>
                    ))}
                  </dd>
                </dl>

                <WaiversSentButton />
              </>
            )}

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
