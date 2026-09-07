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

export const recoveryCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/admin",
} as const;
