-- Opt-in list: users who want an email when registration opens.
-- Run in the Supabase dashboard: SQL Editor → New query → paste → Run.

create table if not exists public.notify_optins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.notify_optins enable row level security;

create policy "select own optin"
  on public.notify_optins for select
  using (auth.uid() = user_id);

create policy "insert own optin"
  on public.notify_optins for insert
  with check (auth.uid() = user_id);

create policy "update own optin"
  on public.notify_optins for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "delete own optin"
  on public.notify_optins for delete
  using (auth.uid() = user_id);
