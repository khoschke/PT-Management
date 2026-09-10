// Refreshes the Supabase session on every request and keeps signed-out
// visitors out of /admin. The dashboard itself still checks role server
// side, this just stops an anonymous visitor loading the page at all.

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ADMIN_ROUTES = new Set(["/admin/login", "/admin/forgot-password"]);

const SIGNED_OUT_ONLY_ADMIN_ROUTES = new Set(["/admin/login", "/admin/forgot-password"]);

// The one /admin route that must be left completely alone. It is mid-flight in
// an auth handshake: the emailed link has just been verified and the route
// handler is about to turn the result into a session. Building a second
// Supabase client here and calling getUser() reads and writes the same cookie
// jar the handshake depends on, and a getUser() that fails (which it always
// does here, since there is no session yet — that is the entire point) can
// clear the auth storage keys, including the PKCE code verifier the handler
// needs a few milliseconds later.
//
// That is what broke the first live reset attempt: /verify succeeded and handed
// back a ?code=, then exchangeCodeForSession failed without even reaching the
// network, because the verifier was gone. The callback gates nothing and needs
// no session, so there is nothing here for the proxy to do.
const AUTH_CALLBACK_PATH = "/admin/auth/callback";

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === AUTH_CALLBACK_PATH) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase isn't configured, don't crash every /admin request. Let the
  // page's own server-side auth handling take over instead.
  if (!supabaseUrl || !supabaseKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Treat any auth lookup failure as "not signed in" rather than letting the
  // middleware throw and turn every admin request into a 500.
  let user = null;
  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    user = null;
  }

  const path = request.nextUrl.pathname;
  const isAdminRoute = path.startsWith("/admin");

  // Signed-out staff have to be able to reach these: the sign-in screen and
  // the "email me a reset link" screen. The callback returned earlier, above.
  // /admin/reset-password is deliberately NOT here — it needs the session the
  // callback creates, so a bounce to sign-in is the right answer.
  const isPublicRoute = PUBLIC_ADMIN_ROUTES.has(path);

  // Already signed in? These two screens have nothing to offer — the Account
  // screen is where a signed-in user changes their own password.
  const isSignedOutOnlyRoute = SIGNED_OUT_ONLY_ADMIN_ROUTES.has(path);

  if (isAdminRoute && !isPublicRoute && !user) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirectTo", path);
    return NextResponse.redirect(loginUrl);
  }

  if (isSignedOutOnlyRoute && user) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
