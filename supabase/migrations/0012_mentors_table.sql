-- OCC Hacks 2026 — mentors move to their own table.
-- Run this in the Supabase dashboard: SQL Editor → New query → paste → Run.

-- Migration 0009 gave the two roles their own page and their own form but left
-- them sharing a row shape, keyed by (user_id, role); 0010 then hung three
-- mentor-only columns off it that a volunteer row always leaves null. The forms
-- have drifted far enough apart that the shared table costs more than it saves,
-- so each sign-up gets its own table and `volunteers` goes back to one row per
-- account.
--
-- Note the mentor form never asks for an OCC student ID — that question is on
-- the volunteer form only — so `occ_id` doesn't come across. Anyone who signed
-- up through the old combined form and holds both roles keeps theirs on the
-- volunteer row. Check for the handful who don't before running this:
--
--   select v.user_id, v.email, v.occ_id
--     from public.volunteers v
--    where v.role = 'mentor'
--      and v.occ_id is not null
--      and not exists (
--        select 1 from public.volunteers w
--         where w.user_id = v.user_id and w.role = 'volunteer'
--      );

create table if not exists public.mentors (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  dob date,
  phone text,
  availability text[] not null default '{}',
  expertise text,
  -- The résumé itself lives in the `resumes` Storage bucket (migration 0010);
  -- this is the object path the browser posts back after uploading. Optional,
  -- like `mentor_reason` — neither blocks a submit.
  resume_path text,
  mentor_reason text,
  preferred_time text,
  shirt text,
  needs text,
  email_opt_in boolean not null default false,
  welcome_email_sent_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.mentors enable row level security;

-- Same shape as the volunteer policies: you can see and manage only your own
-- sign-up. Organizers read the roster with the service-role key, which bypasses
-- RLS entirely.
drop policy if exists "select own mentor signup" on public.mentors;
create policy "select own mentor signup"
  on public.mentors for select
  using (auth.uid() = user_id);

drop policy if exists "insert own mentor signup" on public.mentors;
create policy "insert own mentor signup"
  on public.mentors for insert
  with check (auth.uid() = user_id);

drop policy if exists "update own mentor signup" on public.mentors;
create policy "update own mentor signup"
  on public.mentors for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Move the existing mentor sign-ups across, drafts included — a half-finished
-- row is a normal state, and leaving those behind would hand someone an empty
-- form next time they opened the page. `welcome_email_sent_at` rides along so
-- nobody gets welcomed twice, and `created_at` is kept: they signed up when
-- they signed up, not when this migration ran.
insert into public.mentors (
  user_id, email, full_name, dob, phone, availability, expertise,
  resume_path, mentor_reason, preferred_time, shirt, needs, email_opt_in,
  welcome_email_sent_at, completed_at, created_at, updated_at
)
select
  user_id, email, full_name, dob, phone, availability, expertise,
  resume_path, mentor_reason, preferred_time, shirt, needs, email_opt_in,
  welcome_email_sent_at, completed_at, created_at, now()
from public.volunteers
where role = 'mentor'
on conflict (user_id) do nothing;

delete from public.volunteers
where role = 'mentor';

-- With the mentor rows gone, everything that existed to tell the two roles
-- apart is dead weight: the mentor-only columns, the role column itself, and
-- the composite key it was half of.
alter table public.volunteers
  drop column if exists resume_path,
  drop column if exists mentor_reason,
  drop column if exists preferred_time;

alter table public.volunteers
  drop constraint if exists volunteers_role_check;

alter table public.volunteers
  drop constraint if exists volunteers_pkey;

alter table public.volunteers
  drop column if exists role;

-- One volunteer sign-up per account, as it was before 0009.
alter table public.volunteers
  add constraint volunteers_pkey primary key (user_id);
