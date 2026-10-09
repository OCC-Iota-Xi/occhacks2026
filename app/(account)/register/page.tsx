import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
// import ExtraCreditForm from "@/components/ExtraCreditForm";
import FloatingVideo from "@/components/FloatingVideo";
import RegisterForm, { type RegistrationDefaults } from "@/components/RegisterForm";
import { applicationsClosed, WALK_IN_POLICY } from "@/lib/deadline";
// import { readExtraCredit } from "@/lib/extra-credit";
import { TRACKS } from "@/lib/form-options";
// import { canReadHandbook } from "@/lib/read-applicant-stage";
import { createClient, getSessionUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "register — OCC Hacks 2026",
  description:
    "Register for OCC Hacks 2026 — Oct 10–11 at Orange Coast College. Free to attend, every meal covered.",
};

/** "2004-03-09" as "March 9, 2004", from its parts so no time zone can shift it. */
function formatDob(dob: string) {
  const [year, month, day] = dob.split("-").map(Number);
  if (!year || !month || !day) return dob;
  return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", dateStyle: "long" }).format(
    new Date(Date.UTC(year, month - 1, day))
  );
}

/**
 * The saved answers, read-only — what the form turns into once applications
 * close. Shows the stored row only: nothing here can be changed, so there's no
 * browser-side draft to overlay.
 */
function SavedAnswers({
  answers,
  withClasses,
}: {
  answers: Partial<RegistrationDefaults>;
  /** Off when the extra credit form below is showing the class instead. */
  withClasses: boolean;
}) {
  const ranked = TRACKS.filter((t) => answers.ranks?.[t.key])
    .sort((a, b) => Number(answers.ranks?.[a.key]) - Number(answers.ranks?.[b.key]))
    .map((t) => `${answers.ranks?.[t.key]}. ${t.label}`);

  const rows: [string, string | undefined][] = [
    ["full name", answers.full_name],
    ["school", answers.school],
    ["major", answers.major],
    ["OCC student ID", answers.occ_id],
    ["date of birth", answers.dob && formatDob(answers.dob)],
    ["email address", answers.email],
    ["phone number", answers.phone],
    ["Iota Xi member", answers.iota_xi],
    ["t-shirt size", answers.shirt],
    ["accessibility, dietary, or other needs", answers.needs],
    ["OCC classes", answers.classes?.join(", ")],
    ["track ranking", ranked.join(", ")],
  ];
  const shown = withClasses ? rows : rows.filter(([label]) => label !== "OCC classes");

  return (
    <dl className="grid gap-x-6 gap-y-3 border-t border-border pt-6 text-sm sm:grid-cols-[auto_1fr]">
      {shown.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="break-words">{value || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

export default async function RegisterPage() {
  const supabase = await createClient();
  const user = await getSessionUser(supabase);
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

  // Past the deadline the form comes down for everyone, and anyone with a
  // saved application or draft gets it back read-only. `submitRegistration`
  // and the autosave enforce the same freeze.
  const closed = applicationsClosed();

  // The one answer that can still change after that: which class a confirmed
  // hacker wants extra credit for, and which section of it they're in.
  // Off for now, along with its form at the bottom of the closed view.
  // const extraCredit =
  //   closed && user && existing?.completed_at && (await canReadHandbook(user))
  //     ? await readExtraCredit(supabase, user.id)
  //     : null;

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
    <>
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
                    Your application is in. You can still see it below, but it can no longer be
                    edited{/* extraCredit ? ", apart from your extra credit class at the bottom" : "" */}.
                    Your decision will show up on your status page.
                  </p>
                  <Link
                    href="/status"
                    className="inline-flex rounded-full bg-foreground px-6 py-3 text-sm text-background transition-colors hover:bg-foreground/85"
                  >
                    check your status
                  </Link>
                </>
              ) : existing ? (
                <>
                  <p>
                    Your draft was never submitted, so it wasn&apos;t considered. You can still
                    see what you saved below, but it can no longer be edited or submitted.
                  </p>
                  <p>{WALK_IN_POLICY}</p>
                </>
              ) : (
                <p>{WALK_IN_POLICY}</p>
              )}
              {/* `withClasses={!extraCredit}` again once the form below is back. */}
              {existing && <SavedAnswers answers={defaults} withClasses />}
              {/* {extraCredit && (
                <div id="extra-credit" className="scroll-mt-20 space-y-4 border-t border-border pt-6">
                  <h2 className="font-display text-xl tracking-tight">extra credit</h2>
                  <p>
                    If you&apos;re taking one of these classes at OCC, tell us which one and
                    which section you&apos;re in, so your attendance reaches the right
                    instructor. Extra credit counts toward one class only.
                  </p>
                  <ExtraCreditForm course={extraCredit.course} section={extraCredit.section} />
                </div>
              )} */}
            </div>
          ) : (
            // A draft row isn't an update — only a finished registration is.
            <RegisterForm defaults={defaults} isUpdate={!!existing?.completed_at} />
          )}
        </div>
      </section>
    </>
  );
}
