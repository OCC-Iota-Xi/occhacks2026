import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdmin, NON_ADMIN_REDIRECT, SIGN_IN_REDIRECT } from "@/lib/admin/access";

/**
 * Guards the signed-in pages: refreshes the Supabase session cookie, redirects
 * signed-out visitors to /signin, and turns non-organizers away from /admin.
 *
 * The refresh is the half that's easy to overlook. A server component can't
 * write cookies, so this is the only place the access token gets renewed — a
 * page left out of the matcher below lets someone's session lapse under them
 * while they're still filling the form in.
 *
 * The /admin check here is the first of three, not the only one. It's an
 * optimistic check in the sense the Next.js docs mean: cheap, runs before the
 * route renders, and saves a round trip — but the layout re-checks server-side
 * and every mutation re-checks again, because a proxy is not an authorization
 * boundary on its own.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

  // Carries where they were headed, so signing in lands them there rather than
  // on the registration form. Only a path — never a full URL — and the sign-in
  // page validates it again before using it.
  const bounce = (pathname: string, next?: string) => {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    url.search = next ? `?next=${encodeURIComponent(next)}` : "";
    return NextResponse.redirect(url);
  };

  if (isAdminRoute) {
    // No dev bypass here, unlike the sign-up forms below. The admin pages read
    // every applicant's personal details, and a hole opened for convenience in
    // development is a hole someone eventually ships.
    if (!user) {
      return bounce(SIGN_IN_REDIRECT, `${request.nextUrl.pathname}${request.nextUrl.search}`);
    }
    if (!isAdmin(user)) return bounce(NON_ADMIN_REDIRECT);
    return response;
  }

  // Dev-only: allow viewing the form without a session (saving still requires auth).
  if (!user && process.env.NODE_ENV !== "development") {
    return bounce(SIGN_IN_REDIRECT);
  }

  return response;
}

export const config = {
  // Both entries are needed for the admin area: `/admin/:path*` matches the
  // pages under it but not /admin itself.
  matcher: ["/register", "/volunteer", "/mentor", "/admin", "/admin/:path*"],
};
