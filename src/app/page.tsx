import { redirect } from "next/navigation";

// Normally just a doorway to the public form. It also has to catch emailed
// auth links, because Supabase falls back to the project's Site URL — this
// root — whenever a link has no usable redirect of its own. Any link generated
// before `redirectTo` was set correctly, and any flow that defaults to the
// Site URL, lands here rather than at /admin/auth/callback.
//
// Without this, a locked-out trainer clicking a spent reset link was dropped on
// the public PT session form with a raw
// `#error=access_denied&error_code=otp_expired` in the address bar. Nothing
// explained it and there was no way back to sign-in.
//
// GoTrue puts the failure in the query string as well as the fragment, so it is
// readable server side. A fragment alone never reaches us, but it doesn't have
// to: the query string carries the same thing.

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  if (first(params.error) ?? first(params.error_code)) {
    redirect("/admin/login?authError=expired");
  }

  // A link that verified successfully but had no redirect of its own. Hand it
  // to the callback so the session still gets established rather than throwing
  // away a valid code.
  const code = first(params.code);
  if (code) {
    redirect(`/admin/auth/callback?code=${encodeURIComponent(code)}`);
  }

  const tokenHash = first(params.token_hash);
  const type = first(params.type);
  if (tokenHash && type) {
    redirect(
      `/admin/auth/callback?token_hash=${encodeURIComponent(tokenHash)}&type=${encodeURIComponent(type)}`,
    );
  }

  redirect("/pt-session");
}
