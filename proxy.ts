import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Guards the sign-up pages: refreshes the Supabase session cookie and redirects
 * signed-out visitors to /signin.
 *
 * The refresh is the half that's easy to overlook. A server component can't
 * write cookies, so this is the only place the access token gets renewed — a
 * page left out of the matcher below lets someone's session lapse under them
 * while they're still filling the form in.
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

  // Dev-only: allow viewing the form without a session (saving still requires auth).
  if (!user && process.env.NODE_ENV !== "development") {
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/register", "/volunteer", "/mentor"],
};
