import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Download } from "lucide-react";
import AccountBackdrop from "@/components/AccountBackdrop";
import AccountSidebar from "@/components/AccountSidebar";
import AutoRefresh from "@/components/AutoRefresh";
import CheckInQr from "@/components/CheckInQr";
import WaiversSentButton from "@/components/WaiversSentButton";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { applicantStage, type ApplicantStage } from "@/lib/applicant-stage";
import { applicationsClosed, WALK_IN_POLICY } from "@/lib/deadline";
import { EVENT, MEDICAL_NOTE, WAIVER_DUE_DAY, WAIVER_REPLY_TO } from "@/lib/email/templates";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "application status — OCC Hacks 2026",
  description: "Check the status of your OCC Hacks 2026 hacker application.",
};

type View = {
  label: string;
  /** One paragraph, or several. */
  body: string | string[];
  accent?: boolean;
  details?: boolean;
  /** Show the waiver packet and the addresses to send it to. */
  waivers?: boolean;
  /** Close with what the weekend holds and where to find the Discord. */
  outro?: boolean;
  /** Show the check-in QR. */
  qr?: boolean;
  link?: { href: string; label: string };
};

/**
 * What an applicant sees at each stage (`applicantStage` decides which one
 * they're at). Waitlisted and rejected aren't shown to applicants for now: both
 * read as "under review", and the wording for them is kept under the rejected
 * preview below.
 */
const VIEWS: Record<ApplicantStage, View> = {
  not_submitted: {
    label: "not submitted",
    body: "Your application is still a draft. Finish and submit it to be considered.",
    link: { href: "/register", label: "finish your application" },
  },
  under_review: {
    label: "under review",
    body: "We've got your application and are still reviewing it. Your decision will show up here.",
  },
  // Says what the acceptance email says (`acceptanceEmail`), so someone who
  // reads one and then the other isn't told two different things.
  accepted: {
    label: "accepted",
    accent: true,
    details: true,
    waivers: true,
    outro: true,
    body: [
      "Congratulations. You've been accepted to OCC Hacks 2026, and we're excited to have you join us.",
      `To confirm your spot, sign the waiver packet and email your signed copy to both organizers below by ${WAIVER_DUE_DAY} at 11:59 PM. Once we have your forms, your spot is officially confirmed.`,
      "Unconfirmed spots will be reallocated to waitlisted participants, so be sure to send them over promptly to guarantee your entry!",
    ],
  },
  waivers_review: {
    label: "waivers sent",
    details: true,
    body: "Thanks for sending your waivers. An organizer is reviewing them, and your spot will show as confirmed here once they're done.",
  },
  confirmed: {
    label: "confirmed",
    accent: true,
    details: true,
    qr: true,
    body: "Your waivers are reviewed and your spot is confirmed. You're in, see you there.",
  },
  // Once, for the whole event: nothing left to scan, so the code comes down.
  checked_in: {
    label: "checked in",
    accent: true,
    details: true,
    body: "You're checked in. Welcome to OCC Hacks.",
  },
};

/**
 * `not_submitted` once the deadline has passed. There's nothing left to finish,
 * and this is also where someone who never applied lands from the homepage's
 * status button.
 */
const CLOSED_VIEW: View = {
  label: "not submitted",
  body: [
    "Hacker applications closed on October 5 at 11:59 PM, and we don't have a submitted application from this account.",
    WALK_IN_POLICY,
  ],
};

/**
 * Every state the page can show, so each one can be looked at without the
 * database row to match: `?preview=<key>` renders that state in place of the
 * caller's own. Development only, and not linked from anywhere — the page
 * otherwise follows the applicant's real stage on its own.
 */
const PREVIEWS = [
  { key: "not-submitted", label: "not submitted", view: VIEWS.not_submitted },
  { key: "closed", label: "closed", view: CLOSED_VIEW },
  { key: "under-review", label: "under review", view: VIEWS.under_review },
  { key: "accepted", label: "accepted", view: VIEWS.accepted },
  { key: "waivers-sent", label: "waivers sent", view: VIEWS.waivers_review },
  { key: "confirmed", label: "confirmed", view: VIEWS.confirmed },
  { key: "checked-in", label: "checked in", view: VIEWS.checked_in },
  // Preview only: a rejected applicant still reads as "under review" above.
  {
    key: "rejected",
    label: "rejected",
    view: {
      label: "not accepted",
      body: "We weren't able to offer you a spot this year. Thank you for applying, and we hope to see you at a future OCC Hacks.",
    } as View,
  },
] as const;

interface Decision {
  status: string;
  attendance: string;
  waivers_sent_at?: string | null;
  checked_in_at?: string | null;
}

/** Stands in for the caller's id when a preview is drawn without a session. */
const PREVIEW_USER_ID = "00000000-0000-4000-8000-000000000000";

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

  const first = await read("status, attendance, checked_in_at, waivers_sent_at");
  if (first.error?.code !== "42703") return first.data;
  return (await read("status, attendance, checked_in_at")).data;
}

export default async function StatusPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string | string[] }>;
}) {
  const previewing = process.env.NODE_ENV === "development";
  const previewKey = previewing ? (await searchParams).preview : undefined;
  const preview = PREVIEWS.find((p) => p.key === previewKey);

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

  const stage = applicantStage({
    completed: !!hacker?.completed_at,
    status: decision?.status,
    attendance: decision?.attendance,
    waiversSent: !!decision?.waivers_sent_at,
    checkedIn: !!decision?.checked_in_at,
  });
  const view: View =
    preview?.view ??
    (stage === "not_submitted" && applicationsClosed() ? CLOSED_VIEW : VIEWS[stage]);

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
        {/* A preview is fixed by its URL; there's nothing for it to catch up to. */}
        {!preview && <AutoRefresh />}

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

            <div className="mt-5 space-y-4 text-base leading-relaxed text-foreground/90">
              {[view.body].flat().map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

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

                <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{MEDICAL_NOTE}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Once it&apos;s sent, let us know with the button below.
                </p>

                <WaiversSentButton
                  previewNext={preview ? "/status?preview=waivers-sent" : undefined}
                />
              </>
            )}

            {view.qr && <CheckInQr userId={user?.id ?? PREVIEW_USER_ID} />}

            {view.details && (
              <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t border-border pt-6 text-sm">
                <dt className="text-muted-foreground">when</dt>
                <dd>october 10–11</dd>
                <dt className="text-muted-foreground">where</dt>
                <dd>orange coast college, college center, floor 3 ballroom</dd>
                <dt className="text-muted-foreground">check-in</dt>
                <dd>8:00–8:40am saturday</dd>
                <dt className="text-muted-foreground">kickoff</dt>
                <dd>9:00am</dd>
                <dt className="text-muted-foreground">parking</dt>
                <dd>
                  free in{" "}
                  <a
                    href={EVENT.parkingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-ring underline-offset-4 hover:underline"
                  >
                    Lot C
                  </a>
                  , at merrimac way and fairview road
                </dd>
              </dl>
            )}

            {view.outro && (
              <div className="mt-6 space-y-4 border-t border-border pt-6 text-sm leading-relaxed text-foreground/90">
                <p>
                  Then get ready for a weekend of $2,000 in prizes, free food, and guest speakers
                  you won&apos;t want to miss.
                </p>
                <p>
                  Join the Discord if you haven&apos;t already. That&apos;s where we post
                  announcements and run team formation.
                </p>
                <p className="flex flex-wrap gap-x-6 gap-y-2">
                  <a
                    href={EVENT.discordUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-ring underline-offset-4 hover:underline"
                  >
                    join the discord
                  </a>
                  <Link href="/#schedule" className="text-ring underline-offset-4 hover:underline">
                    see the schedule
                  </Link>
                </p>
              </div>
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
