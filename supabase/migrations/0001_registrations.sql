-- OCC Hacks 2026 registrations — one row per authenticated user.
-- Run this in the Supabase dashboard: SQL Editor → New query → paste → Run.

create table if not exists public.registrations (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null,
  school text not null,
  track text not null,
  team text not null,
  experience text not null,
  shirt text not null,
  diet text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.registrations enable row level security;

-- Each student can see and manage only their own registration.
create policy "select own registration"
  on public.registrations for select
  using (auth.uid() = user_id);

create policy "insert own registration"
  on public.registrations for insert
  with check (auth.uid() = user_id);

create policy "update own registration"
  on public.registrations for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Organizers: read the roster with the service-role key (bypasses RLS),
-- or add a policy here later keyed to your admin user ids.
