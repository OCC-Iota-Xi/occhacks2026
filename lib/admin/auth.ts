import { cache } from "react";
import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isAdmin, NON_ADMIN_REDIRECT, SIGN_IN_REDIRECT } from "@/lib/admin/access";

/**
 * One `getUser()` per request, however many times the layout, the page and the
 * helpers below ask. `getUser` revalidates the token against Supabase — worth
 * paying once, not five times on a page that renders four server components.
 */
const getViewer = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
});

export interface AdminSession {
  supabase: SupabaseClient;
  user: User;
  /** Display name from the allowlist row, once they've loaded /admin once. */
  email: string;
}

/**
 * The gate for admin *pages*. Redirects rather than throwing, so an expired
 * session lands on the sign-in page instead of an error screen.
 *
 * `getUser()` rather than `getSession()`: it revalidates the token against
 * Supabase instead of trusting a cookie the browser handed us.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const { supabase, user } = await getViewer();

  if (!user) redirect(SIGN_IN_REDIRECT);
  if (!isAdmin(user)) redirect(NON_ADMIN_REDIRECT);

  return { supabase, user, email: user.email ?? "" };
}

/**
 * The gate for admin *mutations* — server actions and route handlers. Throws,
 * because a redirect from inside an action is a worse failure mode than an
 * error the caller can render.
 *
 * Every action calls this. The RLS policies would refuse the write anyway, but
 * a check here means the refusal is a clear message rather than a silent
 * zero-rows-affected.
 */
export async function assertAdmin(): Promise<AdminSession> {
  const { supabase, user } = await getViewer();

  if (!user || !isAdmin(user)) {
    throw new Error("not authorized");
  }

  return { supabase, user, email: user.email ?? "" };
}

/**
 * Whether the current visitor is an organizer, without redirecting — for the
 * site navigation, which shows an "admin" link only to people who can use it.
 */
export async function viewerIsAdmin(): Promise<boolean> {
  const { user } = await getViewer();
  return isAdmin(user);
}
