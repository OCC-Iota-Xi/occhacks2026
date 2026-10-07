# Organizer dashboard (`/admin`)

An internal operations console for running OCC Hacks: application analytics, an
applicant CRM, reviews and decisions, notes, tags and check-in. It reads live
Supabase data through the signed-in organizer's own session — there is no
service-role key in this project, and none is needed.

## Before it works: run the migration

`supabase/migrations/0018_admin_crm.sql` creates the organizer-side tables and,
just as importantly, the row-level security policies that let an organizer read
the roster at all. Until it runs, `/admin` shows a setup notice and every count
reads zero.

Supabase dashboard → SQL Editor → New query → paste the file → Run. Every
statement is idempotent; running it twice is safe.

`0019_event_time_zone.sql` follows it, and is needed too: it re-defines the two
counting functions to bucket by California days rather than UTC ones.

`0020_delete_applications.sql` adds the delete policy on `hackers` and the
append-only log that outlives a deleted row; without it the delete buttons are
there but every attempt fails. `0021_admin_display_name.sql` renames one
organizer.

`0022_email_campaigns.sql` adds the three tables behind `/admin/emails` — the
contact list, campaigns and their per-recipient send log — plus the
`admin_email_campaigns` view. Without it the Emails page shows its own setup
notice and everything else keeps working.

`0023_applicant_timeline.sql` adds `timeline_at` to the `admin_applicants` view
— the submit time, or the start time for a draft — which is what the applicant
list sorts by. Without it the list still loads, but drafts sort to the end.

`0024_waivers_sent.sql` adds `application_status.waivers_sent_at`, the
`mark_waivers_sent()` function the applicant's status page calls, and the
`flag_waivers_to_review` column on `admin_applicants`. Without it the status
page still loads, but the "i've sent my waivers" button fails and the "Waivers
to review" view errors.

`0026_first_submission.sql` makes `hackers.completed_at` the first submit
rather than the latest one: it restores the dates that re-saves had already
overwritten and adds a trigger that keeps the original from then on. Without it
the Date submitted column and the list's default order follow the applicant's
last edit, the same as Last edited.

`0027_checkin_days.sql` adds `application_status.checked_in_day2_at` and the
`checked_in_day1_at` / `checked_in_day2_at` columns on `admin_applicants`, so
each day of the event has its own check-in. Without it day 1 check-in works as
before and a day 2 check-in fails with a message naming this migration.

`0025_welcome_email_guard.sql` isn't an admin migration, but it has to run with
the rest: it moves the welcome-email claim into `claim_welcome_email()` and
blocks direct writes to `welcome_email_sent_at`. Without it sign-ups still save
and no welcome email is sent.

## Stages (`/admin/applicants`)

The list is organized by stage: one word for where an applicant is, read off
status, attendance and `waivers_sent_at` by `stageOf` (`lib/admin/stage.ts`).
The tabs are the stages in pipeline order with a count on each, and `stage=` is
a URL filter like any other.

| Stage | Stored as |
| --- | --- |
| Draft, Submitted, In review, Waitlisted, Rejected, Withdrawn | `status` of the same name |
| Accepted, waivers due | `status = accepted`, `attendance = pending`, `waivers_sent_at` null |
| Waivers to review | same, `waivers_sent_at` set |
| Confirmed | `status = accepted`, `attendance = confirmed` |
| Declined | `status = accepted`, `attendance = declined` |

The pipeline has an order, and each step has one owner:

| Step | Who | How |
| --- | --- | --- |
| not submitted → under review | applicant | submits the form (`hackers.completed_at`) |
| under review → accepted | organizer | Accept |
| accepted → waivers sent | applicant | "i've sent my waivers" (`mark_waivers_sent()`) |
| waivers sent → confirmed | organizer | Confirm |

The organizer's two steps can't skip it: a draft can't be accepted, and only an
accepted applicant can be confirmed. Confirm doesn't wait for "waivers sent",
because people email the forms and never press the button.

Each row's stage pill is a menu of the moves that make sense from there. The
button beside it appears only when the next step is an organizer's: Accept on a
submitted application, Confirm once waivers are marked sent. A draft has no
menu. A move from a row
is immediate, with no dialog. Selecting rows and using Move to does the same for
many, behind a dialog that says what they will each see. Nobody is emailed
either way.

Every move goes through `setStage`. On a mixed selection it leaves alone whoever
a move doesn't apply to rather than failing: Accept skips drafts and anyone
already accepted (so it cannot unconfirm them), Confirm skips anyone not
accepted, and Back to waivers due (unconfirm, or return a bad
packet; it clears `waivers_sent_at`) only applies to accepted applicants.

### Filtering and sorting

Every filter is described once, in `components/admin/applicants/controls.ts`,
and shown in two places:

- **On the column header.** Each header is a menu: the two sort orders, that
  column's filter, and Hide column. `COLUMN_CONTROL` maps a column to its
  filter. A funnel or an arrow on the header says the column is filtered or
  sorted.
- **Behind Filters.** The same filters as one folding list, which is how a
  hidden column's filter is still reached. Sections that are narrowing the list
  open by themselves.

Filters: stage, status, attendance, day 1 and day 2 check-in, checked in on
either day, school, major, has an OCC student ID, age range, Iota Xi, shirt,
has needs, extra-credit class, track, problems, date submitted, reviewer,
reviewed, score range and tags. All of them are query parameters
(`lib/admin/filters.ts`) applied in Postgres (`applyFilters` in
`lib/admin/queries.ts`), so a filtered list is a link, a saved view, and what
the export downloads. The day 1 / day 2 filters and sorts need migration 0027.

The search box matches each word separately against name, email, school, major,
student ID and phone, so "angelo manzano" finds Angelo Iyce Manzano.

A change is applied on top of the last one asked for, not the last one that
arrived (`intended` in `Workspace.tsx`), so ticking several values quickly keeps
all of them, and the ticks show before the rows do.

Columns (in the toolbar) chooses which columns show; the choice is per browser.
Save this view, at the end of the stage tabs, saves the filters and sort for
every organizer.

## Waivers

An accepted applicant's `/status` page walks three steps:

| Applicant sees | Stored as | Who moves it |
| --- | --- | --- |
| accepted, with the packet and where to email it | `status = accepted`, `waivers_sent_at` null | organizer accepts |
| waivers sent | `waivers_sent_at` set | applicant presses "i've sent my waivers" |
| confirmed, with their check-in QR | `attendance = confirmed` | organizer confirms them |
| checked in, QR still shown | `checked_in_at` or `checked_in_day2_at` set | organizer scans or checks them in |

To confirm someone, open the Waivers to review tab on the applicant list and
press Confirm on their row, or select several and use Move to. Mark reviewed, on
the Waivers row of a profile, does the same. `waivers_sent_at` is the applicant's word, not
proof — check the inbox before confirming.

None of these is a stored value. `status` and `attendance` are text columns
with check constraints, and the stage is read off them and the timestamps by
`applicantStage` (`lib/applicant-stage.ts`), which the status page and the
profile's "Applicant sees" row both use.

Send back, next to Mark reviewed, clears `waivers_sent_at`: the applicant's page
returns to accepted with the packet and the button. Nobody is emailed. Only an
organizer can write `attendance`, so only an organizer can produce the confirmed
page; the applicant's sole write is `mark_waivers_sent()`.

Waitlisted, rejected and withdrawn are not shown to applicants: all three read
as "under review" on `/status`.

## Check-in (`/admin/checkin`)

The desk is open both days, October 10 and 11, and each day is its own
check-in. On `application_status`, `checked_in_at` is day 1 (the column predates
the second day and kept its name) and `checked_in_day2_at` is day 2. Someone
checked in on Saturday is checked in again on Sunday with the same code, so
their status page keeps the QR after the first scan.

The board opens on today's day (`currentEventDay()` in `lib/checkin.ts`: day 1
until October 11 in event time, day 2 from then on) and has a Day 1 / Day 2
switch for looking at the other one or fixing a missed check-in. The count, the
list's Check in / Undo buttons and what a scan records all follow the switch.

On the `admin_applicants` view, `checked_in_at` and `checked_in` mean "on either
day" (first arrival), which is what the overview stats, the Checked in filter
and the checked-in email audience read. `checked_in_day1_at` and
`checked_in_day2_at` are the per-day times, shown as the Day 1 and Day 2 columns
on the applicant list and exported as `attendance_day_1` / `attendance_day_2`
(yes/no).

A confirmed applicant's `/status` page shows a QR, drawn on the server
(`components/CheckInQr.tsx`). It encodes `https://occhacks.com/admin/checkin?code=<user id>`
(`lib/checkin.ts`), and under it is a backup code: the first eight characters of
that id.

Ways to check someone in, each a fallback for the one before:

1. **Scan QR** on the check-in page. Uses the browser's `BarcodeDetector` where
   it reads QR, and jsQR (bundled, no worker or wasm) everywhere else.
2. **The phone's own camera.** It opens the link in the code, which lands on the
   check-in page leading with that person. Nothing is written until Check in is
   tapped.
3. **Search** by name, email, school, student ID, or backup code. The list is
   already on the page, so this needs no network.

All three end in the `checkIn` action, which takes the day and is safe to
repeat: a second scan on the same day reports "already checked in" and leaves
the original time alone. Anyone who
isn't accepted and confirmed is refused, with a Check in anyway override for a
waiver handed over at the desk.

If a check-in gets no answer within 10 seconds it is saved in that browser's
localStorage (`occhacks:checkin-queue`) and retried every 5 seconds until it
lands. Only people the loaded list shows as confirmed, or an explicit override,
are queued, each with the day it was made for. The queue lives on the device that scanned: keep that page open
until the banner clears.

The camera only opens on https (or localhost) and needs camera permission for
the site.

## Emails (`/admin/emails`)

Organizer mail through Resend. The composer picks audiences (hackers by
status, volunteers, mentors, the notify list, the hand-kept contact list) plus
any one-off addresses typed into the To field, dedupes them by address, and
wraps the plain-text message in the same branded shell as the welcome notes.
`{{first_name}}` is filled per recipient. "Send test to me" mails only the
organizer pressing it.

A send is chunked: `startSend` writes one `email_campaign_recipients` row per
address and the browser then calls `sendChunk` until it reports done, one
Resend batch of up to 100 per call. Rows are claimed (`queued` → `sending`)
before anything is mailed and the campaign/address pair is unique, so a
retried request or a second organizer can't double-send. Failures keep the
Resend error on the row; "Retry failed" re-queues only those. The applicants
table's bulk bar has an "Email" button that opens a draft aimed at the
selected rows.

Env: `RESEND_API_KEY`, `RESEND_FROM` (must be on a verified domain),
`RESEND_REPLY_TO`. Without the key every send is recorded as failed with a
message saying so.

## Who can get in

One list, in `lib/admin/access.ts`:

```ts
export const ADMIN_EMAILS = [
  "envn001@gmail.com",
  "nngo62@student.cccd.edu",
  "swathanasaynee@student.cccd.edu",
];
```

It is checked in three places, none of which is the UI:

1. **`proxy.ts`** — before an `/admin` route renders. Signed-out visitors go to
   `/signin`, signed-in non-organizers go to `/register`. No dev bypass here,
   unlike the sign-up forms.
2. **`app/admin/layout.tsx`** — on the server, on every render, via
   `requireAdmin()`. A proxy misconfiguration cannot route around it.
3. **Every server action and the export route** — via `assertAdmin()`, before
   anything is written or read.

The database keeps its own copy in `public.admin_users`, which is what the RLS
policies are written against through `public.is_admin()`. Hiding the nav link is
cosmetic; the data is protected by the database.

**To add or remove an organizer**, edit `ADMIN_EMAILS` *and* insert or delete the
matching row in `public.admin_users`. The first controls the pages, the second
controls the data. When the list outgrows a constant, `isAdminEmail()` is the
only function that has to change — nothing else in the dashboard mentions an
address.

## What the schema adds

| Table | What it holds |
|---|---|
| `admin_users` | The allowlist, and each organizer's `user_id` once they've signed in |
| `application_status` | Status, attendance, check-in, assigned reviewer, decision stamps |
| `application_reviews` | One scored review per organizer per applicant, with a stored overall |
| `applicant_notes` | Internal notes — no policy grants applicants any access |
| `tags` / `applicant_tags` | Shared tag vocabulary and what's applied to whom |
| `admin_saved_views` | A saved view is a stored applicant-list query string |
| `application_activity` | Audit log, written by triggers rather than by application code |
| `application_deletions` | Who deleted which application, and when — the one log a deletion can't erase |

Two views (`admin_applicants`, `admin_activity_feed`) and four RPCs
(`admin_overview_stats`, `admin_timeseries`, `admin_breakdowns`,
`admin_needs_attention`) do the joining and aggregating in Postgres, so the
dashboard is a handful of round trips no matter how many applicants there are.

Nothing here modifies `hackers`, `volunteers` or `mentors` beyond adding
organizer read policies (and, on `hackers`, an update policy for correcting
typos and a delete policy for removing an application outright). An applicant
owns their own row, so a decision stored there would be a decision they could
edit.

## Deleting an application

Two places: the **Danger** section of the overflow menu on an applicant's
profile, and the same section in the bulk-action bar when rows are selected.
Both ask you to type `DELETE` first, because there is no undo.

Deleting the `hackers` row cascades through the decision, reviews, notes, tags
and activity log. The applicant's Supabase account survives, so nothing stops
them registering again. Their name, email and who deleted them is recorded in
`application_deletions`, which has no foreign key back to `hackers` and so is
the only thing that outlives the row — no policy allows updating or deleting
from it, so a true erasure means running the delete by hand in the SQL editor.

For an applicant who has simply pulled out, **withdraw** them instead: the
status keeps their answers, their reviews and their history.

## Time zone

Everything an organizer sees is in `America/Los_Angeles` — the formatters in
`lib/admin/format.ts`, the date-range filters, and the day buckets inside
`admin_overview_stats` and `admin_timeseries`. Postgres stores `timestamptz`, so
the instants themselves are unambiguous; naming the zone is about which day an
instant belongs to. Left to the defaults, a server render would use UTC and
anything submitted after 4pm local would be dated the following day.

## Notes on the shape of the data

The registration form doesn't ask for graduation year, education level, country,
gender, or links, so the dashboard doesn't chart them. What it does ask — school,
major, date of birth, Iota Xi membership, the three-way track ranking, the
extra-credit courses, shirt size, accessibility and dietary needs — is what the
breakdowns, filters and columns are built from.

Résumés exist only on the mentor form; they're in the private `resumes` bucket
and organizers open them through short-lived signed URLs on `/admin/helpers`.

There is no teams table, so there is no Teams page.
