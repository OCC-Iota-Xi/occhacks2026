/**
 * Who can open /admin.
 *
 * One list, in one file. It's checked in three places — the proxy (before the
 * route renders), the admin layout (before any data is fetched), and every
 * server action (before anything is written) — and all three import from here,
 * so there is exactly one place to edit when the roster changes.
 *
 * The database has its own copy in `public.admin_users` (migration 0018), which
 * is what the RLS policies are written against. That's deliberate: the constant
 * makes the redirect fast and the table makes the data safe, and neither is
 * load-bearing on its own — an email removed from here can no longer reach the
 * pages, and an email removed from the table can no longer read a row.
 *
 * Replacing this with the table alone later is a change to `isAdminEmail`, not
 * to the dashboard: nothing outside this file mentions an address.
 */
export const ADMIN_EMAILS = [
  "envn001@gmail.com",
  "nngo62@student.cccd.edu",
  "swathanasaynee@student.cccd.edu",
] as const;

const ALLOWLIST = new Set<string>(ADMIN_EMAILS.map((email) => email.toLowerCase()));

/** Case- and whitespace-insensitive, because addresses arrive typed by hand. */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ALLOWLIST.has(email.trim().toLowerCase());
}

/** The shape of a Supabase user, narrowed to the one field that decides this. */
export interface AdminCandidate {
  email?: string | null;
}

export function isAdmin(user: AdminCandidate | null | undefined): boolean {
  return isAdminEmail(user?.email);
}

/** Where a signed-in non-organizer goes when they try an /admin URL. */
export const NON_ADMIN_REDIRECT = "/register";
/** Where a signed-out visitor goes. */
export const SIGN_IN_REDIRECT = "/signin";
