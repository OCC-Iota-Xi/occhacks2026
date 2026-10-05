-- OCC Hacks 2026 — drafts take their place in the applicant list.
-- Run this in the Supabase dashboard: SQL Editor → New query → paste → Run.

-- The applicant list sorted by `completed_at`, newest first. A draft has no
-- `completed_at`, so every draft fell to the very end — behind the oldest
-- submission, pages away from the people who started the same afternoon.
--
-- `timeline_at` gives every row a date to be sorted by: the submit time for a
-- finished application, the start time for a draft. PostgREST orders by a
-- column, not an expression, which is why this lives in the view rather than in
-- the query.
--
-- `create or replace` rather than the drop-and-create of migration 0018: the
-- new column goes last, which is the one change a replace allows, and nothing
-- that depends on the view has to be rebuilt. Everything above the new column
-- is 0018's definition, unchanged.
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
  (h.completed_at is null and h.created_at < now() - interval '3 days') as flag_stale_draft,
  -- Where this application sits on the timeline: when it was submitted, or for
  -- a draft, when it was started.
  coalesce(h.completed_at, h.created_at)    as timeline_at
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
