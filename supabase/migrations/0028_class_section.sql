-- OCC Hacks 2026 — which section of their extra-credit class.
-- Run this in the Supabase dashboard: SQL Editor → New query → paste → Run.

-- The registration form asks which OCC course a hacker wants extra credit for
-- (`hackers.classes`), but not which section, and several of those courses run
-- more than one. Attendance goes back to an instructor, so the roster needs
-- the section to know whose it is. Confirmed hackers add it on the
-- registration page (`/register`, which the handbook sends them to), and can
-- still set or change the course there now that the rest of the form is closed.
--
-- Free text: section numbers come off the student's own schedule, and nothing
-- here knows the term's list to check them against.
--
-- No new policy. "update own registration" (0001) already lets an applicant
-- write their own row, and the server action only ever sets these two columns.
alter table public.hackers
  add column if not exists class_section text;

-- `create or replace` again, as in 0023, 0024 and 0027: the existing columns
-- keep their names, order and types, and the new one goes at the end.
create or replace view public.admin_applicants
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
  -- Their first arrival, whichever day that was. Everything that asks "did
  -- they come" reads these two, so a Sunday-only attendee counts.
  coalesce(s.checked_in_at, s.checked_in_day2_at) as checked_in_at,
  (s.checked_in_at is not null
     or s.checked_in_day2_at is not null)  as checked_in,
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
  (h.completed_at is null and h.created_at < now() - interval '3 days') as flag_stale_draft,
  -- Where this application sits on the timeline: when it was submitted, or for
  -- a draft, when it was started.
  coalesce(h.completed_at, h.created_at)    as timeline_at,
  -- When the applicant said they emailed their signed waivers, and whether an
  -- organizer still has to go and look for them.
  s.waivers_sent_at,
  (coalesce(s.status, '') = 'accepted'
     and s.waivers_sent_at is not null
     and coalesce(s.attendance, 'pending') = 'pending') as flag_waivers_to_review,
  -- Each morning's check-in on its own.
  s.checked_in_at                           as checked_in_day1_at,
  s.checked_in_day2_at,
  -- Which section of their extra-credit class they're in.
  h.class_section
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
