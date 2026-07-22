// The ONE place that talks to GymMaster's HTTP API.
//
// Everything about the wire format — base URL, auth scheme, endpoint paths,
// pagination, and the JSON field names — is confined to this file (and to
// mapMember.ts). When the owners send the real API documentation, only these
// two files change; the cron route, dedupe, and database mapping stay put.
//
// Until GYMMASTER_API_BASE_URL and GYMMASTER_API_KEY are set, the integration
// is a deliberate no-op (see gymmasterConfigured), so deploying this code
// changes nothing about the running app.
//
// NOTE: we cannot call GymMaster from the build workspace (no outbound
// network). This is written to be verified live on Vercel. The request shape
// below is a best-effort skeleton — the spots marked TODO(gymmaster-docs) must
// be confirmed against the real API before the pull is switched on.

// A member as this system cares about it: the small, stable subset we map onto
// a lead. `raw` keeps the untouched payload so live logs can show exactly what
// GymMaster returned when a field doesn't map cleanly.
export interface GymMasterMember {
  memberId: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  email: string | null;
  dateOfBirth: string | null; // ISO yyyy-mm-dd, or null
  createdAt: string; // ISO timestamp the member was created in GymMaster
  raw: unknown;
}

// True only when both the account-specific base URL and an API key are set.
// The cron checks this and skips cleanly when the owners haven't provisioned
// access yet, so nothing hard-fails in the meantime.
export function gymmasterConfigured(): boolean {
  return Boolean(process.env.GYMMASTER_API_BASE_URL && process.env.GYMMASTER_API_KEY);
}

// How many pages to walk before giving up, a guard against an unexpected
// pagination loop. 30 leads/month means real runs return well under one page.
const MAX_PAGES = 20;

// Tolerant field reader: GymMaster's exact JSON keys are confirmed against the
// real docs, but reading across the likely spellings keeps the mapper robust
// to snake_case vs camelCase and minor naming differences.
function pick(obj: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = obj[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value).trim();
    }
  }
  return null;
}

// Normalise one raw member object from GymMaster into a GymMasterMember.
// TODO(gymmaster-docs): confirm the real field names and prune the fallbacks.
function parseMember(raw: unknown): GymMasterMember | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  const memberId = pick(obj, ["memberid", "member_id", "memberId", "id"]);
  const createdAt = pick(obj, ["createddate", "created_at", "createdAt", "joindate", "signup_date"]);

  // Without an id there is nothing to dedupe on, and without a created date we
  // can't place the member in the sync window — skip and let the caller log it.
  if (!memberId || !createdAt) return null;

  return {
    memberId,
    firstName: pick(obj, ["firstname", "first_name", "firstName", "givenname"]),
    lastName: pick(obj, ["surname", "lastname", "last_name", "lastName", "familyname"]),
    phone: pick(obj, ["phonecell", "mobile", "cellphone", "phone", "phonemobile", "contactnumber"]),
    email: pick(obj, ["email", "emailaddress", "email_address"]),
    dateOfBirth: pick(obj, ["dob", "dateofbirth", "date_of_birth", "birthdate"]),
    createdAt,
    raw,
  };
}

// Fetch members created on or after `since`, paging through results. Returns
// the parsed members plus a count of raw records that couldn't be parsed, so
// the caller can log skips without aborting the whole run.
//
// TODO(gymmaster-docs): confirm the endpoint path, the auth scheme (the key
// may be a query/body param rather than a bearer header), the created-since
// filter parameter, and the pagination shape. The structure below is isolated
// on purpose so those are one-line edits.
export async function fetchMembersCreatedSince(
  since: Date,
): Promise<{ members: GymMasterMember[]; unparsed: number }> {
  const baseUrl = process.env.GYMMASTER_API_BASE_URL;
  const apiKey = process.env.GYMMASTER_API_KEY;
  if (!baseUrl || !apiKey) {
    throw new Error("GymMaster is not configured (GYMMASTER_API_BASE_URL / GYMMASTER_API_KEY).");
  }

  const members: GymMasterMember[] = [];
  let unparsed = 0;

  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = new URL("/portal/api/v1/members", baseUrl); // TODO(gymmaster-docs): confirm path
    url.searchParams.set("api_key", apiKey); // TODO(gymmaster-docs): confirm auth placement
    url.searchParams.set("created_since", since.toISOString()); // TODO(gymmaster-docs): confirm filter param
    url.searchParams.set("page", String(page));

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      // Never let a fetch response be served from a cache — always live data.
      cache: "no-store",
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`GymMaster API ${response.status} on page ${page}: ${body.slice(0, 500)}`);
    }

    const payload = (await response.json()) as unknown;
    // TODO(gymmaster-docs): confirm where the array lives in the response body.
    const rows = extractRows(payload);
    if (rows.length === 0) break;

    for (const row of rows) {
      const member = parseMember(row);
      if (member) members.push(member);
      else unparsed++;
    }

    // Last page if this page wasn't full. TODO(gymmaster-docs): if the API
    // returns explicit paging metadata, use that instead of a short-page check.
    if (rows.length < 100) break;
  }

  return { members, unparsed };
}

// Pull the member array out of whatever envelope GymMaster wraps it in.
// Handles a bare array or the common `{ result: [...] }` / `{ data: [...] }`
// / `{ members: [...] }` shapes. TODO(gymmaster-docs): confirm and simplify.
function extractRows(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    for (const key of ["result", "data", "members", "rows"]) {
      if (Array.isArray(obj[key])) return obj[key] as unknown[];
    }
  }
  return [];
}
