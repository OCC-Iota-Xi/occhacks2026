-- OCC Hacks 2026 — hacker + volunteer/mentor form questions.
-- Run this in the Supabase dashboard: SQL Editor → New query → paste → Run.

-- 1. New hacker questions on the existing registrations table.
alter table public.registrations
  add column if not exists occ_id text,
  add column if not exists dob date,
  add column if not exists phone text,
  add column if not exists iota_xi boolean,
  add column if not exists needs text,
  add column if not exists classes text[] not null default '{}',
  add column if not exists rank_entertainment smallint,
  add column if not exists rank_education smallint,
  add column if not exists rank_productivity smallint;

-- The original questions (school / track / team / experience / diet) are no
-- longer asked. Keep the columns so existing rows survive, but drop NOT NULL
-- so new sign-ups can omit them.
alter table public.registrations
  alter column school drop not null,
  alter column track drop not null,
  alter column team drop not null,
  alter column experience drop not null;

-- Each track ranked exactly once, 1–3.
alter table public.registrations
  drop constraint if exists registrations_ranks_distinct;
alter table public.registrations
  add constraint registrations_ranks_distinct check (
    rank_entertainment is null
    or (
      rank_entertainment between 1 and 3
      and rank_education between 1 and 3
      and rank_productivity between 1 and 3
      and rank_entertainment <> rank_education
      and rank_education <> rank_productivity
      and rank_entertainment <> rank_productivity
    )
  );

-- 2. Volunteers and mentors — one row per authenticated user.
create table if not exists public.volunteers (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null,
  occ_id text,
  dob date not null,
  phone text not null,
  iota_xi boolean not null,
  role text not null check (role in ('volunteer', 'mentor', 'both')),
  availability text[] not null default '{}',
  expertise text,
  shirt text not null,
  needs text,
  classes text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.volunteers enable row level security;

-- Each person can see and manage only their own sign-up.
drop policy if exists "select own volunteer signup" on public.volunteers;
create policy "select own volunteer signup"
  on public.volunteers for select
  using (auth.uid() = user_id);

drop policy if exists "insert own volunteer signup" on public.volunteers;
create policy "insert own volunteer signup"
  on public.volunteers for insert
  with check (auth.uid() = user_id);

drop policy if exists "update own volunteer signup" on public.volunteers;
create policy "update own volunteer signup"
  on public.volunteers for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Organizers: read the roster with the service-role key (bypasses RLS),
-- or add a policy here later keyed to your admin user ids.
