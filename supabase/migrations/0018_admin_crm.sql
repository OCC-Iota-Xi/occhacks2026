-- OCC Hacks 2026 — the organizer side: decisions, reviews, notes, tags, audit.
-- Run this in the Supabase dashboard: SQL Editor → New query → paste → Run.
--
-- Nothing here touches the answers people gave. `hackers`, `volunteers` and
-- `mentors` keep the shape their forms write; everything an organizer records
-- *about* an application lives in its own table, keyed to the applicant. That
-- split is the security boundary as much as it is a modelling choice — an
-- applicant owns their row and can write it, so a decision stored there would
-- be a decision they could edit.

-- ---------------------------------------------------------------------------
-- 1. Who counts as an organizer
-- ---------------------------------------------------------------------------

-- The allowlist, mirrored from lib/admin/access.ts. The app checks the code
-- constant (cheap, runs in the proxy on every request); the database checks
-- this table (authoritative, and what RLS is written against). Adding an
-- organizer later means one insert here and one line there — and when the
-- allowlist outgrows a constant, this table is already the source of truth.
create table if not exists public.admin_users (
  email text primary key,
  display_name text,
  -- Filled in the first time they load /admin (see `admin_touch_self`). Null
  -- until then: an organizer can be on the list before they've ever signed in,
  -- and there's no auth.users row to point at yet.
  user_id uuid references auth.users (id) on delete set null,
  last_seen_at timestamptz,
  created_at timestamptz not null default now()
);

insert into public.admin_users (email, display_name) values
  ('envn001@gmail.com', 'Long'),
  ('nngo62@student.cccd.edu', 'Long'),
  ('swathanasaynee@student.cccd.edu', 'Sav')
on conflict (email) do nothing;

create unique index if not exists admin_users_user_id_key
  on public.admin_users (user_id) where user_id is not null;

-- The predicate every admin policy in this file is written against.
--
-- Reads `auth.users` rather than the JWT's email claim, so an email change
-- takes effect without waiting for a token refresh, and a forged claim buys
-- nothing. SECURITY DEFINER because `authenticated` can't read auth.users;
-- STABLE so Postgres calls it once per statement rather than once per row.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from auth.users u
    join public.admin_users a on lower(u.email) = lower(a.email)
    where u.id = auth.uid()
  );
$$;

-- `anon` too, not because a signed-out visitor is ever an admin — the function
-- returns false when `auth.uid()` is null — but because the policies below call
-- it, and a role without EXECUTE gets a permission error instead of a plain
-- "no rows" when it touches one of these tables.
grant execute on function public.is_admin() to authenticated, anon;

alter table public.admin_users enable row level security;

-- Organizers see each other (the assignment picker and the "reviewed by" names
-- come from here). Nobody writes this table through the API — seats are added
-- in the SQL editor, and `admin_touch_self` below does the one write the app
-- needs.
drop policy if exists "admins read the roster" on public.admin_users;
create policy "admins read the roster"
  on public.admin_users for select
  using ((select public.is_admin()));

-- Binds the signed-in account to its allowlist row, so assignments and review
-- authorship have a user id to point at. Called on every admin page load; it's
-- a no-op after the first.
create or replace function public.admin_touch_self()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  update public.admin_users a
     set user_id = auth.uid(),
         last_seen_at = now()
    from auth.users u
   where u.id = auth.uid()
     and lower(u.email) = lower(a.email);
end;
$$;

grant execute on function public.admin_touch_self() to authenticated;

-- ---------------------------------------------------------------------------
-- 2. Organizers can read the rosters
-- ---------------------------------------------------------------------------

-- Added alongside the existing "own row" policies, not in place of them: a
-- policy is a grant, and Postgres ORs them together. Read-only for volunteers
-- and mentors; the hacker table also takes an update policy, because organizers
-- fix typos in names, schools and emails as people email in about them.
drop policy if exists "admins read all hackers" on public.hackers;
create policy "admins read all hackers"
  on public.hackers for select
  using ((select public.is_admin()));

drop policy if exists "admins correct hacker rows" on public.hackers;
create policy "admins correct hacker rows"
  on public.hackers for update
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "admins read all volunteers" on public.volunteers;
create policy "admins read all volunteers"
  on public.volunteers for select
  using ((select public.is_admin()));

drop policy if exists "admins read all mentors" on public.mentors;
create policy "admins read all mentors"
  on public.mentors for select
  using ((select public.is_admin()));

drop policy if exists "admins read the notify list" on public.notify_optins;
create policy "admins read the notify list"
  on public.notify_optins for select
  using ((select public.is_admin()));

-- Résumés: mentors upload into a folder named for their user id (migration
-- 0010). Organizers read any of them, which is what makes the résumé link on
-- the mentor profile work without a service-role key.
drop policy if exists "admins read every resume" on storage.objects;
create policy "admins read every resume"
  on storage.objects for select to authenticated
  using (bucket_id = 'resumes' and (select public.is_admin()));

-- ---------------------------------------------------------------------------
-- 3. Decision state
-- ---------------------------------------------------------------------------

-- One row per applicant, created lazily the first time an organizer touches
-- them. An applicant with no row here is exactly a "draft or submitted, not yet
-- looked at" — see the coalesce in `admin_applicants` below.
--
-- Attendance is its own column, not a status value: "accepted" and "confirmed"
-- are answers to different questions, and an accepted applicant who hasn't
-- replied yet is the single most important group to be able to count.
create table if not exists public.application_status (
  user_id uuid primary key references public.hackers (user_id) on delete cascade,
  status text not null default 'submitted'
    check (status in ('draft','submitted','in_review','accepted','waitlisted','rejected','withdrawn')),
  attendance text not null default 'pending'
    check (attendance in ('pending','confirmed','declined')),
  assigned_to uuid references auth.users (id) on delete set null,
  decided_at timestamptz,
  decided_by uuid references auth.users (id) on delete set null,
  confirmed_at timestamptz,
  checked_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists application_status_status_idx on public.application_status (status);
create index if not exists application_status_attendance_idx on public.application_status (attendance);
create index if not exists application_status_assigned_idx on public.application_status (assigned_to);

alter table public.application_status enable row level security;

drop policy if exists "admins manage decisions" on public.application_status;
create policy "admins manage decisions"
  on public.application_status for all
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Applicants may read their own decision — nothing in this build shows it to
-- them, but the day the dashboard says "you're in", this is the policy it
-- needs, and read-only is the safe half to grant now.
drop policy if exists "applicants read own decision" on public.application_status;
create policy "applicants read own decision"
  on public.application_status for select
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 4. Reviews
-- ---------------------------------------------------------------------------

-- One review per organizer per applicant; the unique key is what makes the
-- review form an upsert rather than an ever-growing pile. `overall` is stored
-- rather than computed on read so it can be sorted and filtered on directly.
create table if not exists public.application_reviews (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid not null references public.hackers (user_id) on delete cascade,
  reviewer_id uuid not null references auth.users (id) on delete cascade,
  technical smallint not null check (technical between 1 and 5),
  projects smallint not null check (projects between 1 and 5),
  community smallint not null check (community between 1 and 5),
  quality smallint not null check (quality between 1 and 5),
  fit smallint not null check (fit between 1 and 5),
  overall numeric(3,2) generated always as (
    round((technical + projects + community + quality + fit)::numeric / 5, 2)
  ) stored,
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (applicant_id, reviewer_id)
);

create index if not exists application_reviews_applicant_idx on public.application_reviews (applicant_id);
create index if not exists application_reviews_reviewer_idx on public.application_reviews (reviewer_id);

alter table public.application_reviews enable row level security;

-- Every organizer reads every review — the point of scoring is to compare — but
-- writes are your own. No policy for applicants, so a review is invisible to
-- the person it's about.
drop policy if exists "admins read reviews" on public.application_reviews;
create policy "admins read reviews"
  on public.application_reviews for select
  using ((select public.is_admin()));

drop policy if exists "admins write own review" on public.application_reviews;
create policy "admins write own review"
  on public.application_reviews for insert
  with check ((select public.is_admin()) and reviewer_id = auth.uid());

drop policy if exists "admins edit own review" on public.application_reviews;
create policy "admins edit own review"
  on public.application_reviews for update
  using ((select public.is_admin()) and reviewer_id = auth.uid())
  with check ((select public.is_admin()) and reviewer_id = auth.uid());

drop policy if exists "admins delete own review" on public.application_reviews;
create policy "admins delete own review"
  on public.application_reviews for delete
  using ((select public.is_admin()) and reviewer_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 5. Internal notes
-- ---------------------------------------------------------------------------

create table if not exists public.applicant_notes (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid not null references public.hackers (user_id) on delete cascade,
  author_id uuid not null references auth.users (id) on delete cascade,
  body text not null check (length(btrim(body)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists applicant_notes_applicant_idx
  on public.applicant_notes (applicant_id, created_at desc);

alter table public.applicant_notes enable row level security;

drop policy if exists "admins read notes" on public.applicant_notes;
create policy "admins read notes"
  on public.applicant_notes for select
  using ((select public.is_admin()));

drop policy if exists "admins write notes" on public.applicant_notes;
create policy "admins write notes"
  on public.applicant_notes for insert
  with check ((select public.is_admin()) and author_id = auth.uid());

drop policy if exists "admins edit own notes" on public.applicant_notes;
create policy "admins edit own notes"
  on public.applicant_notes for update
  using ((select public.is_admin()) and author_id = auth.uid())
  with check ((select public.is_admin()) and author_id = auth.uid());

drop policy if exists "admins delete own notes" on public.applicant_notes;
create policy "admins delete own notes"
  on public.applicant_notes for delete
  using ((select public.is_admin()) and author_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 6. Tags
-- ---------------------------------------------------------------------------

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (length(btrim(name)) between 1 and 40),
  -- One of a short set of names the UI maps to classes, not a raw colour: an
  -- arbitrary hex would fight the palette and can't be checked for contrast.
  color text not null default 'slate'
    check (color in ('gold','slate','sky','violet','emerald','rose')),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

insert into public.tags (name, color) values
  ('Strong Candidate', 'gold'),
  ('Hardware', 'sky'),
  ('AI/ML', 'violet'),
  ('Beginner', 'emerald'),
  ('Returning Hacker', 'sky'),
  ('Sponsor Referral', 'gold'),
  ('Travel Needed', 'rose'),
  ('Needs Follow-Up', 'rose'),
  ('VIP', 'gold')
on conflict (name) do nothing;

create table if not exists public.applicant_tags (
  applicant_id uuid not null references public.hackers (user_id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  added_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (applicant_id, tag_id)
);

create index if not exists applicant_tags_tag_idx on public.applicant_tags (tag_id);

alter table public.tags enable row level security;
alter table public.applicant_tags enable row level security;

drop policy if exists "admins manage tags" on public.tags;
create policy "admins manage tags"
  on public.tags for all
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "admins manage applicant tags" on public.applicant_tags;
create policy "admins manage applicant tags"
  on public.applicant_tags for all
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- 7. Saved views
-- ---------------------------------------------------------------------------

-- `query` is the applicant list's own query string ("status=accepted&tag=VIP"),
-- so saving a view is saving the URL and opening one is a navigation. No schema
-- to keep in step with the filter UI as it grows.
create table if not exists public.admin_saved_views (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (length(btrim(name)) between 1 and 60),
  query text not null default '',
  -- Shared views show up for every organizer; private ones only for their
  -- owner. Both are editable by their owner only.
  shared boolean not null default true,
  created_at timestamptz not null default now(),
  unique (owner_id, name)
);

alter table public.admin_saved_views enable row level security;

drop policy if exists "admins read saved views" on public.admin_saved_views;
create policy "admins read saved views"
  on public.admin_saved_views for select
  using ((select public.is_admin()) and (shared or owner_id = auth.uid()));

drop policy if exists "admins write own saved views" on public.admin_saved_views;
create policy "admins write own saved views"
  on public.admin_saved_views for insert
  with check ((select public.is_admin()) and owner_id = auth.uid());

drop policy if exists "admins edit own saved views" on public.admin_saved_views;
create policy "admins edit own saved views"
  on public.admin_saved_views for update
  using ((select public.is_admin()) and owner_id = auth.uid())
  with check ((select public.is_admin()) and owner_id = auth.uid());

drop policy if exists "admins delete own saved views" on public.admin_saved_views;
create policy "admins delete own saved views"
  on public.admin_saved_views for delete
  using ((select public.is_admin()) and owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 8. Activity log
-- ---------------------------------------------------------------------------

create table if not exists public.application_activity (
  id bigint generated always as identity primary key,
  applicant_id uuid not null references public.hackers (user_id) on delete cascade,
  actor_id uuid references auth.users (id) on delete set null,
  kind text not null,
  summary text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists application_activity_applicant_idx
  on public.application_activity (applicant_id, created_at desc);
create index if not exists application_activity_recent_idx
  on public.application_activity (created_at desc);

alter table public.application_activity enable row level security;

drop policy if exists "admins read activity" on public.application_activity;
create policy "admins read activity"
  on public.application_activity for select
  using ((select public.is_admin()));

-- Rows come from the triggers below, which are SECURITY DEFINER and so bypass
-- this; the policy exists for the handful of events the app records directly.
drop policy if exists "admins write activity" on public.application_activity;
create policy "admins write activity"
  on public.application_activity for insert
  with check ((select public.is_admin()) and actor_id = auth.uid());

create or replace function public.log_activity(
  p_applicant uuid, p_kind text, p_summary text, p_meta jsonb default '{}'::jsonb
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.application_activity (applicant_id, actor_id, kind, summary, meta)
  values (p_applicant, auth.uid(), p_kind, p_summary, coalesce(p_meta, '{}'::jsonb));
$$;

-- SECURITY DEFINER means this bypasses RLS, so it must not be reachable over
-- the API: Postgres grants EXECUTE to PUBLIC by default, which would let any
-- signed-in account write whatever it liked into the audit log. The triggers
-- below run as the function's owner and are unaffected.
revoke all on function public.log_activity(uuid, text, text, jsonb) from public;
revoke all on function public.log_activity(uuid, text, text, jsonb) from anon, authenticated;

-- Logging in triggers rather than in the server actions: the record is then a
-- property of the data changing, not of one code path remembering to write it.
create or replace function public.trg_log_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.status is distinct from 'submitted' then
      perform public.log_activity(new.user_id, 'status',
        'Status set to ' || new.status, jsonb_build_object('to', new.status));
    end if;
    if new.assigned_to is not null then
      perform public.log_activity(new.user_id, 'assignment', 'Assigned for review',
        jsonb_build_object('to', new.assigned_to));
    end if;
    return new;
  end if;

  if new.status is distinct from old.status then
    perform public.log_activity(new.user_id, 'status',
      'Status changed ' || old.status || ' → ' || new.status,
      jsonb_build_object('from', old.status, 'to', new.status));
  end if;

  if new.attendance is distinct from old.attendance then
    perform public.log_activity(new.user_id, 'attendance',
      'Attendance ' || old.attendance || ' → ' || new.attendance,
      jsonb_build_object('from', old.attendance, 'to', new.attendance));
  end if;

  if new.assigned_to is distinct from old.assigned_to then
    perform public.log_activity(new.user_id, 'assignment',
      case when new.assigned_to is null then 'Unassigned' else 'Assigned for review' end,
      jsonb_build_object('to', new.assigned_to));
  end if;

  if new.checked_in_at is distinct from old.checked_in_at then
    perform public.log_activity(new.user_id, 'checkin',
      case when new.checked_in_at is null then 'Check-in undone' else 'Checked in' end);
  end if;

  return new;
end;
$$;

drop trigger if exists log_status on public.application_status;
create trigger log_status
  after insert or update on public.application_status
  for each row execute function public.trg_log_status();

create or replace function public.trg_log_review()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.log_activity(new.applicant_id, 'review',
    'Scored ' || to_char(new.overall, 'FM9.99') || '/5',
    jsonb_build_object('overall', new.overall));
  return new;
end;
$$;

drop trigger if exists log_review on public.application_reviews;
create trigger log_review
  after insert or update on public.application_reviews
  for each row execute function public.trg_log_review();

create or replace function public.trg_log_tag()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  tag_name text;
begin
  if tg_op = 'INSERT' then
    select name into tag_name from public.tags where id = new.tag_id;
    perform public.log_activity(new.applicant_id, 'tag',
      'Tag “' || coalesce(tag_name, '?') || '” added', jsonb_build_object('tag', tag_name));
    return new;
  end if;

  select name into tag_name from public.tags where id = old.tag_id;
  perform public.log_activity(old.applicant_id, 'tag',
    'Tag “' || coalesce(tag_name, '?') || '” removed', jsonb_build_object('tag', tag_name));
  return old;
end;
$$;

drop trigger if exists log_tag on public.applicant_tags;
create trigger log_tag
  after insert or delete on public.applicant_tags
  for each row execute function public.trg_log_tag();

create or replace function public.trg_log_note()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.log_activity(new.applicant_id, 'note', 'Note added');
  return new;
end;
$$;

drop trigger if exists log_note on public.applicant_notes;
create trigger log_note
  after insert on public.applicant_notes
  for each row execute function public.trg_log_note();

-- Submission is an applicant-side event, so it's logged from the applicant's
-- own table: the row flipping from draft to finished is the event.
create or replace function public.trg_log_submission()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.completed_at is not null and old.completed_at is null then
    insert into public.application_activity (applicant_id, actor_id, kind, summary)
    values (new.user_id, new.user_id, 'submitted', 'Application submitted');
  end if;
  return new;
end;
$$;

drop trigger if exists log_submission on public.hackers;
create trigger log_submission
  after update on public.hackers
  for each row execute function public.trg_log_submission();

-- ---------------------------------------------------------------------------
-- 9. Indexes the organizer views lean on
-- ---------------------------------------------------------------------------

create index if not exists hackers_completed_at_idx on public.hackers (completed_at desc nulls last);
create index if not exists hackers_created_at_idx on public.hackers (created_at desc);
create index if not exists hackers_email_lower_idx on public.hackers (lower(email));
create index if not exists hackers_school_idx on public.hackers (school);

-- ---------------------------------------------------------------------------
-- 10. The applicant list
-- ---------------------------------------------------------------------------

-- One row per applicant with everything the CRM table sorts, filters and shows,
-- so a page of 50 is a single request rather than a join done in JavaScript.
--
-- `security_invoker = on` is what keeps this safe: the view runs as whoever
-- selects from it, so the admin policies above decide who sees rows. Without
-- it the view would run as its owner and hand every applicant's answers to
-- anyone who asked.
drop view if exists public.admin_applicants;
create view public.admin_applicants
with (security_invoker = on) as
select
  h.user_id                                as id,
  h.email,
  h.full_name,
  h.school,
  h.major,
  h.occ_id,
  h.phone,
  h.dob,
  h.shirt,
  h.needs,
  h.classes,
  h.iota_xi,
  h.rank_entertainment,
  h.rank_education,
  h.rank_productivity,
  h.eligibility_agreed,
  h.email_opt_in,
  h.welcome_email_sent_at,
  h.completed_at,
  h.created_at,
  h.updated_at,
  -- No decision row yet means nobody has touched them: a finished sign-up is
  -- 'submitted' and waiting, an unfinished one is still a draft.
  coalesce(s.status, case when h.completed_at is null then 'draft' else 'submitted' end) as status,
  coalesce(s.attendance, 'pending')        as attendance,
  s.assigned_to,
  admin.display_name                       as assigned_name,
  admin.email                              as assigned_email,
  s.decided_at,
  s.confirmed_at,
  s.checked_in_at,
  (s.checked_in_at is not null)            as checked_in,
  coalesce(r.review_count, 0)              as review_count,
  r.avg_score,
  coalesce(t.tags, array[]::text[])        as tags,
  case
    when h.rank_entertainment = 1 then 'entertainment'
    when h.rank_education = 1 then 'education'
    when h.rank_productivity = 1 then 'productivity'
  end                                      as first_choice_track,
  case when h.dob is null then null
       else extract(year from age(h.dob))::int end as age,
  -- Data-quality flags, computed once here so the operations filters are a
  -- plain equality rather than five clauses repeated in the client.
  (h.completed_at is not null and (
     h.full_name is null or h.email is null or h.school is null
     or h.major is null or h.shirt is null or h.dob is null
   ))                                      as flag_missing_info,
  (h.email is not null
     and count(*) filter (where h.email is not null)
         over (partition by lower(h.email)) > 1) as flag_duplicate_email,
  (h.completed_at is not null and coalesce(r.review_count, 0) = 0) as flag_unreviewed,
  (coalesce(s.status, '') = 'accepted' and coalesce(s.attendance, 'pending') <> 'confirmed') as flag_unconfirmed,
  (h.completed_at is null and h.created_at < now() - interval '3 days') as flag_stale_draft
from public.hackers h
left join public.application_status s on s.user_id = h.user_id
left join public.admin_users admin on admin.user_id = s.assigned_to
left join lateral (
  select count(*)::int as review_count, round(avg(overall), 2) as avg_score
  from public.application_reviews rv
  where rv.applicant_id = h.user_id
) r on true
left join lateral (
  select array_agg(tg.name order by tg.name) as tags
  from public.applicant_tags at
  join public.tags tg on tg.id = at.tag_id
  where at.applicant_id = h.user_id
) t on true;

grant select on public.admin_applicants to authenticated;

-- The activity feed, with the names already resolved. Same invoker rule.
drop view if exists public.admin_activity_feed;
create view public.admin_activity_feed
with (security_invoker = on) as
select
  a.id,
  a.applicant_id,
  a.kind,
  a.summary,
  a.meta,
  a.created_at,
  a.actor_id,
  coalesce(actor.display_name, actor.email) as actor_name,
  h.full_name                               as applicant_name,
  h.email                                   as applicant_email
from public.application_activity a
left join public.admin_users actor on actor.user_id = a.actor_id
left join public.hackers h on h.user_id = a.applicant_id;

grant select on public.admin_activity_feed to authenticated;

-- ---------------------------------------------------------------------------
-- 11. Aggregates
-- ---------------------------------------------------------------------------

-- Everything the dashboard counts, in one round trip and one pass over the
-- table. The alternative — pulling rows down and counting them in the browser —
-- gets slower with every sign-up and hands the whole applicant list to the
-- client to compute a number.
create or replace function public.admin_overview_stats(p_days int default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result jsonb;
  window_start timestamptz := now() - make_interval(days => greatest(p_days, 1));
  prev_start timestamptz := now() - make_interval(days => greatest(p_days, 1) * 2);
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'total', count(*),
    'submitted', count(*) filter (where completed_at is not null),
    'drafts', count(*) filter (where completed_at is null),
    'today', count(*) filter (where completed_at >= date_trunc('day', now())),
    'yesterday', count(*) filter (
      where completed_at >= date_trunc('day', now()) - interval '1 day'
        and completed_at < date_trunc('day', now())),
    'this_week', count(*) filter (where completed_at >= now() - interval '7 days'),
    'last_week', count(*) filter (
      where completed_at >= now() - interval '14 days'
        and completed_at < now() - interval '7 days'),
    'period', count(*) filter (where completed_at >= window_start),
    'prev_period', count(*) filter (
      where completed_at >= prev_start and completed_at < window_start),
    'in_review', count(*) filter (where status = 'in_review'),
    'accepted', count(*) filter (where status = 'accepted'),
    'waitlisted', count(*) filter (where status = 'waitlisted'),
    'rejected', count(*) filter (where status = 'rejected'),
    'withdrawn', count(*) filter (where status = 'withdrawn'),
    'pending_review', count(*) filter (
      where completed_at is not null and status in ('submitted','in_review')),
    'reviewed', count(*) filter (where review_count > 0),
    'confirmed', count(*) filter (where attendance = 'confirmed'),
    'declined', count(*) filter (where attendance = 'declined'),
    'checked_in', count(*) filter (where checked_in_at is not null),
    'assigned', count(*) filter (where assigned_to is not null),
    'unassigned', count(*) filter (
      where assigned_to is null and completed_at is not null),
    'eligibility_agreed', count(*) filter (where eligibility_agreed),
    'email_opt_in', count(*) filter (where email_opt_in)
  )
  into result
  from public.admin_applicants;

  return result || jsonb_build_object(
    'volunteers', (select count(*) from public.volunteers where completed_at is not null),
    'volunteer_drafts', (select count(*) from public.volunteers where completed_at is null),
    'mentors', (select count(*) from public.mentors where completed_at is not null),
    'mentor_drafts', (select count(*) from public.mentors where completed_at is null),
    'notify_optins', (select count(*) from public.notify_optins),
    'days', greatest(p_days, 1)
  );
end;
$$;

grant execute on function public.admin_overview_stats(int) to authenticated;

-- Daily counts across a range, with empty days present as zeroes so the chart
-- doesn't have to invent them.
create or replace function public.admin_timeseries(p_from date, p_to date)
returns table (
  day date,
  started bigint,
  submitted bigint,
  accepted bigint,
  confirmed bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  return query
  select
    d::date as day,
    (select count(*) from public.hackers h
      where h.created_at >= d and h.created_at < d + interval '1 day'),
    (select count(*) from public.hackers h
      where h.completed_at >= d and h.completed_at < d + interval '1 day'),
    (select count(*) from public.application_status s
      where s.status = 'accepted'
        and s.decided_at >= d and s.decided_at < d + interval '1 day'),
    (select count(*) from public.application_status s
      where s.attendance = 'confirmed'
        and s.confirmed_at >= d and s.confirmed_at < d + interval '1 day')
  from generate_series(p_from::timestamptz, p_to::timestamptz, interval '1 day') d
  order by day;
end;
$$;

grant execute on function public.admin_timeseries(date, date) to authenticated;

-- The demographic breakdowns, again as one round trip. Each is an ordered array
-- of {label, count}; the charts decide how many to show and what to group as
-- "other".
create or replace function public.admin_breakdowns()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'schools', (
      select coalesce(jsonb_agg(x order by x.count desc, x.label), '[]'::jsonb) from (
        select coalesce(nullif(btrim(school), ''), 'Not given') as label, count(*)::int as count
        from public.admin_applicants group by 1
      ) x
    ),
    'majors', (
      select coalesce(jsonb_agg(x order by x.count desc, x.label), '[]'::jsonb) from (
        select coalesce(nullif(btrim(major), ''), 'Not given') as label, count(*)::int as count
        from public.admin_applicants group by 1
      ) x
    ),
    'shirts', (
      select coalesce(jsonb_agg(x order by x.count desc), '[]'::jsonb) from (
        select coalesce(shirt, 'Not given') as label, count(*)::int as count
        from public.admin_applicants group by 1
      ) x
    ),
    'tracks', (
      select coalesce(jsonb_agg(x order by x.count desc), '[]'::jsonb) from (
        select coalesce(first_choice_track, 'Not ranked') as label, count(*)::int as count
        from public.admin_applicants group by 1
      ) x
    ),
    'status', (
      select coalesce(jsonb_agg(x order by x.count desc), '[]'::jsonb) from (
        select status as label, count(*)::int as count
        from public.admin_applicants group by 1
      ) x
    ),
    'attendance', (
      select coalesce(jsonb_agg(x order by x.count desc), '[]'::jsonb) from (
        select attendance as label, count(*)::int as count
        from public.admin_applicants
        where status = 'accepted' group by 1
      ) x
    ),
    'iota_xi', (
      select coalesce(jsonb_agg(x order by x.count desc), '[]'::jsonb) from (
        select case when iota_xi is null then 'Not answered'
                    when iota_xi then 'Member' else 'Not a member' end as label,
               count(*)::int as count
        from public.admin_applicants group by 1
      ) x
    ),
    'classes', (
      select coalesce(jsonb_agg(x order by x.count desc), '[]'::jsonb) from (
        select c as label, count(*)::int as count
        from public.admin_applicants, unnest(classes) c
        group by 1
      ) x
    ),
    'ages', (
      select coalesce(jsonb_agg(x order by x.label), '[]'::jsonb) from (
        select case
                 when age is null then 'Not given'
                 when age < 18 then 'Under 18'
                 when age between 18 and 20 then '18–20'
                 when age between 21 and 24 then '21–24'
                 when age between 25 and 29 then '25–29'
                 else '30+'
               end as label,
               count(*)::int as count
        from public.admin_applicants group by 1
      ) x
    ),
    'needs', (
      select coalesce(jsonb_agg(x order by x.count desc), '[]'::jsonb) from (
        select case when nullif(btrim(coalesce(needs, '')), '') is null
                    then 'No requirements listed' else 'Has requirements' end as label,
               count(*)::int as count
        from public.admin_applicants group by 1
      ) x
    ),
    'reviews', (
      select coalesce(jsonb_agg(x order by x.label), '[]'::jsonb) from (
        select case
                 when review_count = 0 then 'Unreviewed'
                 when review_count = 1 then '1 review'
                 else '2+ reviews'
               end as label,
               count(*)::int as count
        from public.admin_applicants
        where completed_at is not null group by 1
      ) x
    ),
    'reviewers', (
      select coalesce(jsonb_agg(x order by x.count desc), '[]'::jsonb) from (
        select coalesce(assigned_name, assigned_email, 'Unassigned') as label,
               count(*)::int as count
        from public.admin_applicants
        where completed_at is not null group by 1
      ) x
    )
  ) into result;

  return result;
end;
$$;

grant execute on function public.admin_breakdowns() to authenticated;

-- The operational to-do list. Counts only; each one is a link into the
-- applicant table with the matching filter already applied.
create or replace function public.admin_needs_attention()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  return (
    select jsonb_build_object(
      'unreviewed', count(*) filter (where flag_unreviewed),
      'unconfirmed', count(*) filter (where flag_unconfirmed),
      'missing_info', count(*) filter (where flag_missing_info),
      'duplicate_email', count(*) filter (where flag_duplicate_email),
      'stale_drafts', count(*) filter (where flag_stale_draft),
      'unassigned', count(*) filter (
        where assigned_to is null and completed_at is not null
          and status in ('submitted','in_review')),
      'confirmed_not_checked_in', count(*) filter (
        where attendance = 'confirmed' and checked_in_at is null)
    )
    from public.admin_applicants
  );
end;
$$;

grant execute on function public.admin_needs_attention() to authenticated;

-- ---------------------------------------------------------------------------
-- 12. Housekeeping
-- ---------------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_application_status on public.application_status;
create trigger touch_application_status
  before update on public.application_status
  for each row execute function public.touch_updated_at();

drop trigger if exists touch_application_reviews on public.application_reviews;
create trigger touch_application_reviews
  before update on public.application_reviews
  for each row execute function public.touch_updated_at();

drop trigger if exists touch_applicant_notes on public.applicant_notes;
create trigger touch_applicant_notes
  before update on public.applicant_notes
  for each row execute function public.touch_updated_at();
