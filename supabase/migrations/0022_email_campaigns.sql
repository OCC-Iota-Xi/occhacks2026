-- OCC Hacks 2026 — organizer email campaigns.
-- Run this in the Supabase dashboard: SQL Editor → New query → paste → Run.

-- Until now the only mail the app sent was the welcome note on sign-up, and
-- decisions deliberately emailed nobody. This adds what /admin/emails needs to
-- write to a chosen slice of participants — accepted hackers, volunteers, the
-- notify list — and to know afterwards who got it and who didn't.
--
-- Three tables and a view:
--
--   email_contacts             hand-added addresses (sponsors, judges, a
--                              speaker's assistant) that live in no other table
--   email_campaigns            one row per message: the draft, the audience it
--                              was aimed at, and when it went out
--   email_campaign_recipients  one row per address per campaign, with the
--                              Resend id or the error — the send log
--   admin_email_campaigns      campaigns with their recipient counts folded in
--
-- The recipient rows are what make a send safe to retry: an address is
-- inserted once per campaign (unique below), only `queued` rows are ever
-- picked up, and a row is flipped to `sending` before the request to Resend
-- goes out — so two organizers looking at the same campaign, or a browser
-- retrying a dropped response, can't mail the same person twice.
--
-- Everything is admin-only through the `is_admin()` predicate from 0018.

-- ---------------------------------------------------------------------------
-- Contacts
-- ---------------------------------------------------------------------------

create table if not exists public.email_contacts (
  id uuid primary key default gen_random_uuid(),
  -- Stored normalised (lowercased, trimmed — see lib/admin/email.ts) so the
  -- unique constraint is a plain column and PostgREST's on_conflict can name it.
  email text not null unique
    check (email = lower(btrim(email)) and position('@' in email) > 1),
  name text,
  note text,
  added_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.email_contacts enable row level security;

drop policy if exists "admins read contacts" on public.email_contacts;
create policy "admins read contacts"
  on public.email_contacts for select
  using ((select public.is_admin()));

drop policy if exists "admins add contacts" on public.email_contacts;
create policy "admins add contacts"
  on public.email_contacts for insert
  with check ((select public.is_admin()) and added_by = (select auth.uid()));

drop policy if exists "admins edit contacts" on public.email_contacts;
create policy "admins edit contacts"
  on public.email_contacts for update
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "admins remove contacts" on public.email_contacts;
create policy "admins remove contacts"
  on public.email_contacts for delete
  using ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Campaigns
-- ---------------------------------------------------------------------------

create table if not exists public.email_campaigns (
  id uuid primary key default gen_random_uuid(),
  subject text not null default '',
  -- Plain text; paragraphs are separated by blank lines and wrapped in the
  -- branded shell at send time (lib/email/templates.ts `broadcastEmail`).
  body_text text not null default '',
  -- {"keys": ["accepted", "volunteers"], "applicantIds": [...], "extra": ["a@b.c"]}
  -- Kept as the organizer's *choice* rather than a list of addresses: the
  -- recipients are resolved when the send starts, so a draft aimed at
  -- "accepted" picks up whoever is accepted by then.
  audience jsonb not null default '{}'::jsonb,
  status text not null default 'draft'
    check (status in ('draft', 'sending', 'sent', 'failed')),
  sent_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- When the send started and when the last chunk finished.
  sent_at timestamptz,
  finished_at timestamptz
);

create index if not exists email_campaigns_recent_idx
  on public.email_campaigns (created_at desc);

drop trigger if exists touch_email_campaigns on public.email_campaigns;
create trigger touch_email_campaigns
  before update on public.email_campaigns
  for each row execute function public.touch_updated_at();

alter table public.email_campaigns enable row level security;

drop policy if exists "admins read campaigns" on public.email_campaigns;
create policy "admins read campaigns"
  on public.email_campaigns for select
  using ((select public.is_admin()));

drop policy if exists "admins create campaigns" on public.email_campaigns;
create policy "admins create campaigns"
  on public.email_campaigns for insert
  with check ((select public.is_admin()) and sent_by = (select auth.uid()));

drop policy if exists "admins update campaigns" on public.email_campaigns;
create policy "admins update campaigns"
  on public.email_campaigns for update
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- A sent campaign is a record of what went out; only drafts can be discarded.
drop policy if exists "admins delete drafts" on public.email_campaigns;
create policy "admins delete drafts"
  on public.email_campaigns for delete
  using ((select public.is_admin()) and status = 'draft');

-- ---------------------------------------------------------------------------
-- Recipients — the send log
-- ---------------------------------------------------------------------------

create table if not exists public.email_campaign_recipients (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.email_campaigns (id) on delete cascade,
  email text not null,
  name text,
  -- Which audience produced the row. An address in two audiences is kept once,
  -- under the first source that named it.
  source text not null check (source in (
    'selected', 'accepted', 'waitlisted', 'rejected', 'pending', 'confirmed',
    'checked_in', 'volunteers', 'mentors', 'notify', 'contacts', 'extra'
  )),
  -- Lets the log link back to a profile; null for helpers, lists and extras.
  applicant_id uuid references public.hackers (user_id) on delete set null,
  status text not null default 'queued'
    check (status in ('queued', 'sending', 'sent', 'failed')),
  resend_id text,
  error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (campaign_id, email)
);

create index if not exists email_campaign_recipients_status_idx
  on public.email_campaign_recipients (campaign_id, status);

alter table public.email_campaign_recipients enable row level security;

drop policy if exists "admins manage recipients" on public.email_campaign_recipients;
create policy "admins manage recipients"
  on public.email_campaign_recipients for all
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- History view
-- ---------------------------------------------------------------------------

-- `security_invoker` for the same reason as `admin_applicants`: the view runs
-- as whoever selects from it, so the policies above still apply.
drop view if exists public.admin_email_campaigns;
create view public.admin_email_campaigns with (security_invoker = on) as
select
  c.*,
  coalesce(a.display_name, a.email) as sent_by_name,
  coalesce(r.total, 0)  as recipient_count,
  coalesce(r.sent, 0)   as sent_count,
  coalesce(r.failed, 0) as failed_count,
  coalesce(r.queued, 0) as queued_count
from public.email_campaigns c
left join public.admin_users a on a.user_id = c.sent_by
left join lateral (
  select
    count(*)::int as total,
    count(*) filter (where x.status = 'sent')::int as sent,
    count(*) filter (where x.status = 'failed')::int as failed,
    count(*) filter (where x.status in ('queued', 'sending'))::int as queued
  from public.email_campaign_recipients x
  where x.campaign_id = c.id
) r on true;

grant select on public.admin_email_campaigns to authenticated;
