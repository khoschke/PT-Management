// Cookies that carry state across a Supabase Auth email round trip.
//
// Both exist because the `redirectTo` we hand Supabase has to be a **bare** URL.
// Supabase matches it against the Redirect URLs allowlist as a whole string, so
// `.../admin/auth/callback?next=/admin/reset-password` does NOT match an
// allowlist entry of `.../admin/auth/callback`. A near miss isn't an error
// either: Supabase quietly discards the redirect and falls back to the project's
// Site URL, and the email goes out with a link pointing somewhere else entirely.
// So no query strings on redirectTo, and what the callback needs to know travels
// in a cookie instead.

// Which flow is in flight, set when we send the email and read when the link
// comes back, so the callback knows where to land the user. Only matters for
// the PKCE `code` shape: a `token_hash` link states its own type in the URL.
export const AUTH_FLOW_COOKIE = "pt-auth-flow";

export type AuthFlow = "recovery" | "email_change";

// Comfortably longer than the hour a Supabase link stays valid would be
// pointless — the link dies first. This just has to outlive the walk to the
// inbox.
export const AUTH_FLOW_COOKIE_MAX_AGE = 60 * 60;

// Marks the short window after someone follows a password-recovery link, in
// which /admin/reset-password will set a new password without asking for the
// old one.
//
// Why a marker at all: exchanging a recovery link gives the user an ordinary
// session, indistinguishable from a normal sign-in. Without this cookie,
// /admin/reset-password would let *anyone* already signed in set a new password
// without knowing the current one — which is exactly the hole the Account
// screen's current-password check exists to close.
//
// The cookie is httpOnly and only ever written by the callback route, after a
// recovery code from a real email has been verified, so a signed-in user can't
// mint one for themselves.
export const RECOVERY_COOKIE = "pt-password-recovery";

// Long enough to pick a password, short enough that an abandoned tab doesn't
// leave the shortcut open.
export const RECOVERY_COOKIE_MAX_AGE = 15 * 60;

export const authCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/admin",
} as const;
