# OCC Hacks 2026

The site for OCC Hacks 2026 — a free two-day hackathon at Orange Coast College,
October 10–11, 2026, run by the Iota Xi (ΙΞ) Society. One Next.js app holds all
of it: the public landing page, the three sign-up forms (hacker, volunteer,
mentor), and the organizer dashboard behind `/admin`.

Production: [occhacks.com](https://occhacks.com)

## Stack

- **Next.js 16** (App Router) with React 19 and TypeScript
- **Tailwind CSS v4** with shadcn/ui components over Base UI and Radix
- **Supabase** — OAuth sign-in, Postgres, and the row-level security policies
  the dashboard reads through. There is no service-role key in this project;
  every query runs as the signed-in user.
- **Resend** for transactional and campaign email
- **PostHog** for analytics and production error tracking
- **motion** for animation, **ogl** for the space backdrop

## Running it locally

```bash
npm install
cp .env.example .env.local   # then fill it in
npm run dev
```

The site comes up on <http://localhost:3000>.

Without Supabase credentials the app boots but nothing that touches the
database works. In development the proxy lets you open the sign-up forms
signed out so you can look at them; saving still requires a session.

### Environment

| Variable | What it does |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (Project Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `RESEND_API_KEY` | Email sending. Omit it and every send is skipped with a warning — the rest of the app is unaffected. |
| `RESEND_FROM` | Sender address, on a domain verified at resend.com/domains |
| `RESEND_REPLY_TO` | Optional reply-to |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project token. Missing in development, this throws on purpose, so events are never silently dropped. |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog host |

### Supabase setup

Run every file in `supabase/migrations/` in order — Supabase dashboard → SQL
Editor → New query → paste → Run. Each one is idempotent, so re-running is
safe. `0018_admin_crm.sql` onward is what `/admin` needs; until those run the
dashboard shows a setup notice and every count reads zero. See
[docs/admin-dashboard.md](docs/admin-dashboard.md) for which migration backs
which page.

Sign-in is OAuth only, Google and GitHub. Enable both providers in
Authentication → Providers and add `<origin>/auth/callback` to the redirect
allow-list.

## Routes

**Public** — `/` is the landing page (hero, about, tracks, mentors, sponsors,
schedule, FAQ), with JSON-LD for the event and the FAQ.

**Sign-up** — `/register` for hackers, `/volunteer` and `/mentor` for everyone
helping run the weekend. All three are multi-step forms that autosave a draft
as you go: partial rows in Postgres, plus a local copy per role. Everyone has
to be 18 by day one — the rule lives once, in `lib/eligibility.ts`, and both
the form and the server action read it from there. A finished sign-up sends a
welcome email.

**Auth** — `/signin`, and `/auth/callback`, which handles both the PKCE
`?code=` flow and the `?token_hash=` template flow.

**Organizer** — `/admin`, plus Applicants, Review queue, Analytics, Check-in,
Volunteers & mentors, Emails, Tags and Settings under it. `/admin/export`
streams the roster as CSV, taking the applicant list's own query string so
"export what I'm looking at" needs no second filter implementation. Who can open it is one list in
`lib/admin/access.ts`, checked in three places — the proxy, the admin layout
and every server action — and mirrored by `public.admin_users`, which is what
the RLS policies are written against.

## Layout

```
app/            routes: (site), register, volunteer, mentor, signin, auth, admin
components/     sections/ for the landing page, admin/ for the dashboard, ui/ for shadcn
lib/            supabase clients, admin queries and actions, email, form config
supabase/       SQL migrations, applied by hand in order
docs/           admin dashboard reference, design notes
assets/         source files for fonts, email art and the Devpost listing
```

`proxy.ts` is this app's middleware — Next.js 16 renamed the file and the
exported function. It refreshes the Supabase session cookie (a server
component can't write one, so this is the only place a token gets renewed) and
guards `/register`, `/volunteer`, `/mentor` and `/admin`.

## Scripts

| Command | |
| --- | --- |
| `npm run dev` | dev server on :3000 |
| `npm run build` | production build |
| `npm run start` | serve the build |
| `npm run lint` | ESLint |

## Working in this repo

This is Next.js 16, which changed enough to trip up anything written against
an older version — see [AGENTS.md](AGENTS.md). The shipped docs in
`node_modules/next/dist/docs/` are the version-accurate reference.
