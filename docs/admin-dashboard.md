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

Two views (`admin_applicants`, `admin_activity_feed`) and four RPCs
(`admin_overview_stats`, `admin_timeseries`, `admin_breakdowns`,
`admin_needs_attention`) do the joining and aggregating in Postgres, so the
dashboard is a handful of round trips no matter how many applicants there are.

Nothing here modifies `hackers`, `volunteers` or `mentors` beyond adding
organizer read policies (and one update policy on `hackers`, for correcting
typos). An applicant owns their own row, so a decision stored there would be a
decision they could edit.

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
