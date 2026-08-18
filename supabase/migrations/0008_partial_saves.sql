-- OCC Hacks 2026 — save each step as the reader goes.
-- Run this in the Supabase dashboard: SQL Editor → New query → paste → Run.

-- Both forms now write on every step advance, not just on submit, so a row can
-- exist long before it holds a complete answer set. Every column the form
-- collects has to tolerate null until the reader gets that far. The columns
-- with defaults (`classes`, `availability`, `email_opt_in`) are already fine —
-- an omitted key takes the default rather than failing.
alter table public.registrations
  alter column email drop not null,
  alter column full_name drop not null,
  alter column shirt drop not null;

alter table public.volunteers
  alter column email drop not null,
  alter column full_name drop not null,
  alter column dob drop not null,
  alter column phone drop not null,
  alter column role drop not null,
  alter column shirt drop not null;

-- `volunteers.role` keeps its check constraint: a null passes, because a CHECK
-- only fails on an outright false. Same for `registrations_ranks_distinct`,
-- which already short-circuits when the first rank is null.

-- Marks the row as a finished sign-up rather than an abandoned draft. This is
-- the roster filter — organizers want `where completed_at is not null` — and
-- it's what the forms read to decide between "submit" and "update".
alter table public.registrations
  add column if not exists completed_at timestamptz;

alter table public.volunteers
  add column if not exists completed_at timestamptz;

-- Every row that predates drafts came in through a full submit.
update public.registrations
  set completed_at = coalesce(updated_at, created_at)
  where completed_at is null;

update public.volunteers
  set completed_at = coalesce(updated_at, created_at)
  where completed_at is null;
