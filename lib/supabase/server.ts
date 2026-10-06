import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Supabase client for server components, server actions, and route handlers. */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a server component — session refresh is handled
            // by the proxy, so this is safe to ignore.
          }
        },
      },
    }
  );
}

/**
 * Who is signed in, read from the session token itself. The token is verified
 * against the project's public signing key, so unlike `auth.getUser()` this
 * doesn't cost a trip to Supabase — and on the signed-in pages the proxy has
 * already made that trip for the same request.
 *
 * If the token can't be verified that way, this asks Supabase after all rather
 * than treating the reader as signed out: a page that redirects on a null here
 * would otherwise lock out someone with a perfectly good session.
 */
export async function getSessionUser(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<{ id: string; email: string | null } | null> {
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (claims?.sub) {
    return { id: claims.sub, email: typeof claims.email === "string" ? claims.email : null };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? { id: user.id, email: user.email ?? null } : null;
}
