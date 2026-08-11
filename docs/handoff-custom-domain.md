# Handoff: Custom Domain (pt.fitazgym.com via Shopify DNS)

**Start a new session with this note.** Read `docs/PROJECT_STATUS.md` first, then this.

## The goal

Serve the app at **pt.fitazgym.com** (member-facing) instead of the
`pt-management-two.vercel.app` link. The gym owner (Georgio) has approved using
the gym domain. **fitazgym.com is hosted via Shopify**, so the DNS record gets
added in Shopify's domain settings.

Important: only the `pt.` subdomain is added. The apex `fitazgym.com` (the gym's
Shopify website) stays exactly as it is and is not affected.

## Who does what

- **Vercel side:** the PT Manager (Karl) has access — add the domain there.
- **Shopify DNS side:** the gym owner controls this. Karl has emailed Georgio to
  ask whether Georgio adds the record himself (Karl sends exact values) or grants
  Karl Shopify admin access to add it. Confirm which before proceeding.
- **This build workspace can't do any of it** — Vercel and Shopify are both
  dashboard actions. This thread's job is to guide the steps, produce the exact
  DNS record, and do any small code follow-ups.

## Steps

1. **Vercel:** Project → Settings → Domains → add `pt.fitazgym.com`. Vercel then
   shows the DNS record required. For a subdomain this is a **CNAME**:
   - Name/host: `pt`
   - Value/target: whatever Vercel shows (typically `cname.vercel-dns.com`)
   Use Vercel's exact value, don't assume.
2. **Shopify:** in the store admin → Settings → Domains → the fitazgym.com domain
   → manage / DNS settings → add a **custom CNAME record** with the host and
   target from step 1. (Shopify supports custom subdomain CNAME records. It does
   not allow CNAME on the apex, but we only need it on the `pt` subdomain, so
   that's fine.)
   - Caveat: if fitazgym.com is a *third-party* domain merely connected to
     Shopify (not bought through Shopify), the DNS records may live at the
     registrar instead. Check where DNS is actually managed first.
3. **Back in Vercel:** it verifies the record automatically and issues a free
   SSL certificate (HTTPS). Propagation is usually minutes, up to a few hours.
4. Optionally set `pt.fitazgym.com` as the primary domain; keep the
   `.vercel.app` URL working as a fallback.

## Small code follow-ups (optional, after the domain resolves)

- The app uses relative links, so nothing is hardcoded to the old URL. If you
  want absolute links (e.g. in future notification emails), add a
  `NEXT_PUBLIC_SITE_URL` env var and reference it there.
- Update the member-facing link anywhere it's shared (QR codes, the email to
  members, etc.) to the new address.

## What to send Georgio

Once step 1 produces the exact CNAME (name + target), send Georgio that single
record to add in Shopify, or add it yourself if he's granted access. Karl already
drafted the "which do you prefer" email; the follow-up is just the exact values.

## Definition of done

Opening **https://pt.fitazgym.com/pt-session** loads the form over HTTPS, the
dashboard works at `pt.fitazgym.com/admin`, and the gym's main Shopify website is
completely unaffected.
