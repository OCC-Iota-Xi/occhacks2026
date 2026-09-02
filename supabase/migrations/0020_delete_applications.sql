-- OCC Hacks 2026 — organizers can delete an application outright.
-- Run this in the Supabase dashboard: SQL Editor → New query → paste → Run.

-- Until now `hackers` gave organizers select and update only: they could read
-- the roster and fix a typo, but never remove a row. That covers almost
-- everything — a withdrawn applicant is a status, not a deletion — and the two
-- cases it doesn't cover are the reasons for this file: a junk or duplicate
-- signup that should never have existed, and somebody writing in to ask that
-- their data be removed.
--
-- Deleting the `hackers` row takes the whole application with it: the decision,
-- the reviews, the notes, the tags and the activity log all reference
-- `hackers (user_id)` with `on delete cascade`. The auth.users row is *not*
-- touched — that's Supabase's to manage, and someone whose application is
-- deleted can sign in and register again.

drop policy if exists "admins delete hacker rows" on public.hackers;
create policy "admins delete hacker rows"
  on public.hackers for delete
  using ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- The one record that survives
-- ---------------------------------------------------------------------------

-- Every other organizer action is traceable through `application_activity`,
-- which is keyed to the applicant and therefore cascades away with them. A
-- deletion is the one write that would erase its own audit trail, so it gets a
-- table of its own with no foreign key back to `hackers`.
--
-- The name and email are kept deliberately: the question this table answers is
-- "who did we remove, and who removed them", asked weeks later by an organizer
-- holding an email from someone whose application has vanished. If a true
-- erasure is ever required, that is a `delete from public.application_deletions`
-- run by hand in the SQL editor — no policy here permits it, on purpose.
create table if not exists public.application_deletions (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid not null,
  full_name text,
  email text,
  deleted_by uuid references auth.users (id) on delete set null,
  deleted_at timestamptz not null default now()
);

create index if not exists application_deletions_recent_idx
  on public.application_deletions (deleted_at desc);

alter table public.application_deletions enable row level security;

drop policy if exists "admins read deletions" on public.application_deletions;
create policy "admins read deletions"
  on public.application_deletions for select
  using ((select public.is_admin()));

-- Insert only, and only ever under your own name: no update or delete policy
-- exists, which is what makes the log append-only.
drop policy if exists "admins record deletions" on public.application_deletions;
create policy "admins record deletions"
  on public.application_deletions for insert
  with check ((select public.is_admin()) and deleted_by = (select auth.uid()));
