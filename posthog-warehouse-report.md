# PostHog Data Warehouse — Setup Report

## Summary

Both detected data sources (Supabase and Resend) need to be connected via the PostHog app. Credentials were not provided during this run, so no sources were created automatically.

## Changes Made

No project files were modified or created. This skill only connects external data sources — it does not edit application code.

## Sources

### Supabase (Postgres)

**Status:** Needs browser setup — credentials not provided.

Supabase connects to PostHog as a **Postgres** source using the Session pooler. Before connecting, note:

- Use the **Session pooler** host (e.g. `aws-0-<region>.pooler.supabase.com`), **not** the direct host — the direct host is IPv6-only and unreachable by PostHog.
- Port must be **6543** (not 5432).
- Username must be **`postgres.<project-ref>`** (e.g. `postgres.abcdefghijklm`).
- Password is the **database password** from Supabase → Settings → Database — not the anon key, service_role key, or your account password.

**Setup URL:**
[Connect Supabase in PostHog](https://us.i.posthog.com/project/575198/data-warehouse/new-source?kind=Supabase&utm_source=wizard&utm_campaign=warehouse-source)

---

### Resend

**Status:** Needs browser setup — credentials not provided.

Resend connects via API key or OAuth. The key in your env is likely a restricted send-only key — the warehouse import requires a **full-access** key with read permissions on Audiences, Broadcasts, Contacts, Domains, and Emails. Create one at [resend.com/api-keys](https://resend.com/api-keys).

**Setup URL:**
[Connect Resend in PostHog](https://us.i.posthog.com/project/575198/data-warehouse/new-source?kind=Resend&utm_source=wizard&utm_campaign=warehouse-source)

---

## Manual Steps

1. **Supabase:** Open the setup URL above, enter your Session pooler credentials, and select the tables you want to sync.
2. **Resend:** Open the setup URL above and paste a full-access Resend API key (or authenticate via OAuth).
3. After connecting each source, PostHog will begin syncing. You can monitor sync status in **Data Warehouse → Sources**.
