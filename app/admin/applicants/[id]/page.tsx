import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import DecisionPanel from "@/components/admin/applicant/DecisionPanel";
import EditApplicant from "@/components/admin/applicant/EditApplicant";
import NotesPanel from "@/components/admin/applicant/NotesPanel";
import ReviewPanel from "@/components/admin/applicant/ReviewPanel";
import TagPicker from "@/components/admin/applicant/TagPicker";
import SetupNotice from "@/components/admin/SetupNotice";
import {
  AttendanceBadge,
  Empty,
  Field,
  Panel,
  PanelHeader,
  Score,
  StatusBadge,
} from "@/components/admin/ui";
import {
  displayName,
  formatDate,
  formatDateTime,
  initials,
  relativeTime,
} from "@/lib/admin/format";
import { adminContext, fetchAdmins, fetchApplicantDetail, fetchTags } from "@/lib/admin/queries";
import { TRACKS } from "@/lib/form-options";

export default async function ApplicantProfile({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ back?: string }>;
}) {
  const ctx = await adminContext();
  if (!ctx.ready) return <SetupNotice />;

  const { id } = await params;
  const { back } = await searchParams;

  const [detail, tags, admins] = await Promise.all([
    fetchApplicantDetail(ctx, id),
    fetchTags(ctx),
    fetchAdmins(ctx),
  ]);

  if (!detail) notFound();
  const { applicant, reviews, notes, activity, ownReview } = detail;

  // The three tracks in the order this applicant ranked them.
  const ranked = TRACKS.map((track) => ({
    label: track.label,
    rank: applicant[`rank_${track.key}` as keyof typeof applicant] as number | null,
  }))
    .filter((track) => track.rank != null)
    .sort((a, b) => (a.rank ?? 9) - (b.rank ?? 9));

  return (
    <div className="space-y-4">
      <Link
        href={`/admin/applicants${back ? `?${decodeURIComponent(back)}` : ""}`}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to applicants
      </Link>

      <Panel className="px-4 py-4">
        <div className="flex flex-wrap items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border text-sm text-amber-500">
            {initials(applicant.full_name)}
          </span>

          <div className="min-w-0 flex-1">
            <h1 className="text-lg tracking-tight">{displayName(applicant)}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {applicant.email && (
                <a
                  href={`mailto:${applicant.email}`}
                  className="inline-flex items-center gap-1 hover:text-foreground"
                >
                  <Mail className="size-3" />
                  {applicant.email}
                </a>
              )}
              {applicant.phone && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="size-3" />
                  {applicant.phone}
                </span>
              )}
              <span>
                {applicant.completed_at
                  ? `Submitted ${formatDate(applicant.completed_at)}`
                  : `Draft, started ${formatDate(applicant.created_at)}`}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={applicant.status} />
              <AttendanceBadge attendance={applicant.attendance} />
              <span className="text-xs text-muted-foreground">
                Score <Score value={applicant.avg_score} /> ·{" "}
                {applicant.review_count === 1 ? "1 review" : `${applicant.review_count} reviews`}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <EditApplicant applicant={applicant} />
            <DecisionPanel applicant={applicant} admins={admins} />
          </div>
        </div>
      </Panel>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <Panel>
            <PanelHeader title="Personal" />
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-3 sm:grid-cols-3">
              <Field label="Name">{applicant.full_name}</Field>
              <Field label="Email">{applicant.email}</Field>
              <Field label="Phone">{applicant.phone}</Field>
              <Field label="Date of birth">{formatDate(applicant.dob)}</Field>
              <Field label="Age">{applicant.age}</Field>
              <Field label="OCC student ID">{applicant.occ_id}</Field>
            </dl>
          </Panel>

          <Panel>
            <PanelHeader title="Education" />
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-3 sm:grid-cols-3">
              <Field label="School">{applicant.school}</Field>
              <Field label="Major">{applicant.major}</Field>
              <Field label="Iota Xi member">
                {applicant.iota_xi == null ? null : applicant.iota_xi ? "Yes" : "No"}
              </Field>
              <Field label="Extra-credit classes" wide>
                {applicant.classes?.length ? applicant.classes.join(", ") : null}
              </Field>
            </dl>
          </Panel>

          <Panel>
            <PanelHeader
              title="Track preference"
              subtitle="Ranked on the registration form, first choice first"
            />
            {ranked.length ? (
              <ol className="space-y-1.5 px-4 py-3">
                {ranked.map((track) => (
                  <li key={track.label} className="flex items-center gap-3 text-sm">
                    <span className="flex size-5 items-center justify-center rounded-md border border-border text-xs tabular-nums text-muted-foreground">
                      {track.rank}
                    </span>
                    <span className="capitalize">{track.label}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <Empty title="Not ranked yet" hint="This step comes late in the form." />
            )}
          </Panel>

          <Panel>
            <PanelHeader title="Logistics" />
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-3 sm:grid-cols-3">
              <Field label="Shirt size">{applicant.shirt?.toUpperCase()}</Field>
              <Field label="Agreed to eligibility">
                {applicant.eligibility_agreed ? "Yes" : "Not yet"}
              </Field>
              <Field label="Email updates">{applicant.email_opt_in ? "Opted in" : "No"}</Field>
              <Field label="Accessibility or dietary needs" wide>
                {applicant.needs ? (
                  <span className="whitespace-pre-wrap">{applicant.needs}</span>
                ) : null}
              </Field>
            </dl>
          </Panel>

          <Panel>
            <PanelHeader title="Application record" />
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-3 sm:grid-cols-3">
              <Field label="Started">{formatDateTime(applicant.created_at)}</Field>
              <Field label="Submitted">
                {applicant.completed_at ? formatDateTime(applicant.completed_at) : "Not submitted"}
              </Field>
              <Field label="Last edited">{formatDateTime(applicant.updated_at)}</Field>
              <Field label="Welcome email">
                {applicant.welcome_email_sent_at
                  ? formatDateTime(applicant.welcome_email_sent_at)
                  : "Not sent"}
              </Field>
              <Field label="Application ID" wide>
                <code className="text-xs text-muted-foreground">{applicant.id}</code>
              </Field>
            </dl>
          </Panel>
        </div>

        <div className="space-y-3">
          <Panel>
            <PanelHeader title="Tags" />
            <TagPicker applicantId={applicant.id} applied={detail.tags} all={tags} />
          </Panel>

          <Panel>
            <PanelHeader title="Review" subtitle="Your score, and everyone else's" />
            <ReviewPanel
              applicantId={applicant.id}
              reviews={reviews}
              ownReview={ownReview}
              viewerId={ctx.userId}
              admins={admins}
            />
          </Panel>

          <Panel>
            <PanelHeader title="Organizer notes" subtitle="Never shown to the applicant" />
            <NotesPanel
              applicantId={applicant.id}
              notes={notes}
              admins={admins}
              viewerId={ctx.userId}
            />
          </Panel>

          <Panel>
            <PanelHeader title="Activity" />
            {activity.length ? (
              <ol className="space-y-2.5 px-4 py-3">
                {activity.map((event) => (
                  <li key={event.id} className="flex gap-2.5 text-xs">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--ring)]/60" />
                    <div className="min-w-0">
                      <p className="text-foreground">{event.summary}</p>
                      <p className="text-muted-foreground">
                        {event.actor_name ? `${event.actor_name} · ` : ""}
                        {formatDate(event.created_at)} · {relativeTime(event.created_at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <Empty
                title="No activity yet"
                hint="Decisions, reviews, tags and check-ins are recorded here."
              />
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
