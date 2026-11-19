// Email notifications via Resend's free tier. Entirely optional: if
// RESEND_API_KEY isn't set, these become no-ops and the dashboard keeps
// working exactly as before. The dashboard is the product, email is a
// convenience on top of it.
//
// Each email is sent as both HTML (branded, monochrome to match /admin) and
// plain text (fallback for clients that won't render HTML, and better for
// deliverability). Lead-supplied values are HTML-escaped before they go into
// the markup.

import { Resend } from "resend";
import { ATTENDED_DECISION_DAYS, COMP_BOOKED_CHECK_DAYS, type Lead, type LeadStatus, type Trainer } from "./types";
import { goalLabel } from "./goals";

const FROM_ADDRESS = process.env.NOTIFICATIONS_FROM_EMAIL ?? "Fitaz Gym <onboarding@resend.dev>";

// Set NEXT_PUBLIC_SITE_URL (e.g. https://pt-management-two.vercel.app, or the
// custom domain once it's live) to turn the "open the dashboard" prompts into
// real links. If it's unset, the emails fall back to a plain sentence.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
const DASHBOARD_URL = SITE_URL ? `${SITE_URL}/admin` : null;

export const emailEnabled = !!process.env.RESEND_API_KEY;

function getClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Wraps body content in the shared monochrome shell. Inline styles only:
// email clients strip <style> blocks and don't support external CSS.
function layout(bodyHtml: string): string {
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f5f5f5;">
    <div style="display:none;max-height:0;overflow:hidden;">Fitaz Gym PT leads</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #e5e5e5;border-radius:12px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#111111;">
            <tr>
              <td style="padding:20px 28px;border-bottom:1px solid #eeeeee;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#111111;font-weight:600;">
                Fitaz Gym · PT Leads
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                ${bodyHtml}
              </td>
            </tr>
          </table>
          <div style="max-width:520px;margin:16px auto 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;color:#999999;">
            Automated notification from the Fitaz PT leads dashboard.
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function ctaButton(): string {
  if (!DASHBOARD_URL) return "";
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 4px;">
    <tr>
      <td style="border-radius:8px;background:#111111;">
        <a href="${esc(DASHBOARD_URL)}" style="display:inline-block;padding:12px 22px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">
          Open the dashboard
        </a>
      </td>
    </tr>
  </table>`;
}

// "Open the dashboard" line for the plain-text bodies: a real URL when we have
// one, the plain prompt otherwise.
function dashboardTextLine(prompt: string): string {
  return DASHBOARD_URL ? `${prompt} ${DASHBOARD_URL}` : prompt;
}

// What the trainer's allocation email says about where the lead came from. The
// wording follows the workbook's three lead types (Part 7, item 7).
const ALLOCATION_SOURCE_TEXT: Record<Lead["lead_source"], string> = {
  form: "Filled in the form themselves, so this is a warm lead.",
  gymmaster_sweep:
    "Added by the PT Manager after a conversation, an email or a heads-up, so they've shown some interest. Check the notes for the context and mention it when you get in touch.",
  own: "Found by a trainer themselves and passed to you by the PT Manager. Check the notes for the context.",
  unverified:
    "Unverified lead: a new member who hasn't asked about PT yet. They've had two of the gym's three welcome emails telling them a complimentary session comes with their membership, so this is a cold lead. Use the cold call or cold text from Part 7.",
};

export async function sendTrainerAllocationEmail(trainer: Trainer, lead: Lead) {
  const client = getClient();
  if (!client || !trainer.email) return;

  const goalsText = lead.goals.length > 0 ? lead.goals.map(goalLabel).join(", ") : "Not stated";
  const sourceText = ALLOCATION_SOURCE_TEXT[lead.lead_source];
  const dueText = new Date(lead.first_contact_due_at).toLocaleString("en-AU", {
    timeZone: "Australia/Brisbane",
  });

  const text = [
    `${lead.name} has been allocated to you for their complimentary PT session.`,
    "",
    `Source: ${sourceText}`,
    `Phone: ${lead.phone}`,
    `Email: ${lead.email ?? "Not provided"}`,
    `Goals: ${goalsText}`,
    lead.contact_preference ? `Best way to reach them: ${lead.contact_preference}` : null,
    "",
    `First contact is due within 48 hours of the lead coming in (by ${dueText}).`,
    "",
    dashboardTextLine("Open the dashboard to see the full lead."),
  ]
    .filter(Boolean)
    .join("\n");

  const detailRow = (label: string, value: string) =>
    `<tr>
      <td style="padding:6px 0;font-size:13px;color:#777777;width:150px;vertical-align:top;">${label}</td>
      <td style="padding:6px 0;font-size:14px;color:#111111;vertical-align:top;">${value}</td>
    </tr>`;

  const html = layout(`
    <p style="margin:0 0 6px;font-size:20px;font-weight:600;line-height:1.3;">${esc(lead.name)}</p>
    <p style="margin:0 0 20px;font-size:14px;line-height:1.5;color:#444444;">
      has been allocated to you for their complimentary PT session.
    </p>
    <p style="margin:0 0 20px;font-size:14px;line-height:1.5;color:#444444;">${esc(sourceText)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #eeeeee;">
      ${detailRow("Phone", esc(lead.phone))}
      ${detailRow("Email", lead.email ? esc(lead.email) : "Not provided")}
      ${detailRow("Goals", esc(goalsText))}
      ${lead.contact_preference ? detailRow("Best way to reach them", esc(lead.contact_preference)) : ""}
    </table>
    <p style="margin:20px 0 0;font-size:13px;line-height:1.5;color:#777777;">
      First contact is due within 48 hours of the lead coming in
      (by <strong style="color:#111111;">${esc(dueText)}</strong>).
    </p>
    ${ctaButton()}
  `);

  await client.emails.send({
    from: FROM_ADDRESS,
    to: trainer.email,
    subject: `New PT lead: ${lead.name}`,
    text,
    html,
  });
}

// One email per trainer per import of the GymMaster new members report, listing
// every unverified lead they were given, instead of one email per lead. The
// 48-hour clock is the same for all of them because they came in together.
export async function sendTrainerUnverifiedBatchEmail(trainer: Trainer, leads: Lead[]) {
  const client = getClient();
  if (!client || !trainer.email || leads.length === 0) return;

  const count = leads.length;
  const plural = count === 1 ? "lead" : "leads";
  const dueText = new Date(leads[0].first_contact_due_at).toLocaleString("en-AU", {
    timeZone: "Australia/Brisbane",
  });

  const text = [
    `You've been allocated ${count} new unverified ${plural}.`,
    "",
    ALLOCATION_SOURCE_TEXT.unverified,
    "",
    ...leads.map((lead) => `- ${lead.name}, ${lead.phone}${lead.email ? `, ${lead.email}` : ""}`),
    "",
    `First contact is due within 48 hours (by ${dueText}).`,
    "",
    dashboardTextLine("Open the dashboard to see them."),
  ].join("\n");

  const rows = leads
    .map(
      (lead) => `<tr>
      <td style="padding:8px 0;border-bottom:1px solid #eeeeee;font-size:14px;color:#111111;vertical-align:top;">${esc(lead.name)}</td>
      <td style="padding:8px 0;border-bottom:1px solid #eeeeee;font-size:14px;color:#444444;vertical-align:top;text-align:right;">${esc(lead.phone)}</td>
    </tr>`,
    )
    .join("");

  const html = layout(`
    <p style="margin:0 0 6px;font-size:20px;font-weight:600;line-height:1.3;">${count} new unverified ${plural}</p>
    <p style="margin:0 0 20px;font-size:14px;line-height:1.5;color:#444444;">${esc(ALLOCATION_SOURCE_TEXT.unverified)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #eeeeee;">
      ${rows}
    </table>
    <p style="margin:20px 0 0;font-size:13px;line-height:1.5;color:#777777;">
      First contact is due within 48 hours
      (by <strong style="color:#111111;">${esc(dueText)}</strong>).
    </p>
    ${ctaButton()}
  `);

  await client.emails.send({
    from: FROM_ADDRESS,
    to: trainer.email,
    subject: `${count} new unverified ${plural}`,
    text,
    html,
  });
}

interface NewLeadAlertParams {
  name: string;
  phone: string;
  email: string | null;
  goals: string[];
  preferredTrainerName: string | null;
  timePreference: Lead["time_preference"];
  dueAt: Date;
}

const TIME_PREFERENCE_LABELS: Record<NonNullable<Lead["time_preference"]>, string> = {
  AM: "Morning",
  PM: "Evening",
  either: "Either",
};

// Sent to the PT Manager the moment a member submits the public form. The 48
// hour clock starts at submission, so waiting for the next morning's digest
// can eat most of it (a Friday-evening lead breached that way in Oct 2026).
export async function sendManagerNewLeadAlert(managerEmail: string, params: NewLeadAlertParams) {
  const client = getClient();
  if (!client) return;

  const goalsText = params.goals.length > 0 ? params.goals.map(goalLabel).join(", ") : "Not stated";
  const trainerText = params.preferredTrainerName ?? "No preference";
  const timeText = params.timePreference ? TIME_PREFERENCE_LABELS[params.timePreference] : "No preference";
  const dueText = params.dueAt.toLocaleString("en-AU", { timeZone: "Australia/Brisbane" });

  const text = [
    `${params.name} has just filled in the complimentary PT session form.`,
    "",
    `Phone: ${params.phone}`,
    `Email: ${params.email ?? "Not provided"}`,
    `Goals: ${goalsText}`,
    `Preferred trainer: ${trainerText}`,
    `Time preference: ${timeText}`,
    "",
    `First contact is due by ${dueText}. Allocate soon so the trainer has the time.`,
    "",
    dashboardTextLine("Open the dashboard to allocate."),
  ].join("\n");

  const detailRow = (label: string, value: string) =>
    `<tr>
      <td style="padding:6px 0;font-size:13px;color:#777777;width:150px;vertical-align:top;">${label}</td>
      <td style="padding:6px 0;font-size:14px;color:#111111;vertical-align:top;">${value}</td>
    </tr>`;

  const html = layout(`
    <p style="margin:0 0 6px;font-size:20px;font-weight:600;line-height:1.3;">${esc(params.name)}</p>
    <p style="margin:0 0 20px;font-size:14px;line-height:1.5;color:#444444;">
      has just filled in the complimentary PT session form.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #eeeeee;">
      ${detailRow("Phone", esc(params.phone))}
      ${detailRow("Email", params.email ? esc(params.email) : "Not provided")}
      ${detailRow("Goals", esc(goalsText))}
      ${detailRow("Preferred trainer", esc(trainerText))}
      ${detailRow("Time preference", esc(timeText))}
    </table>
    <p style="margin:20px 0 0;font-size:13px;line-height:1.5;color:#777777;">
      First contact is due by <strong style="color:#111111;">${esc(dueText)}</strong>.
      Allocate soon so the trainer has the time.
    </p>
    ${ctaButton()}
  `);

  await client.emails.send({
    from: FROM_ADDRESS,
    to: managerEmail,
    subject: `New PT lead to allocate: ${params.name}`,
    text,
    html,
  });
}

interface DigestLeadSummary {
  name: string;
  hoursRemaining: number;
  source: Lead["lead_source"];
}

export async function sendManagerDailyDigest(
  managerEmail: string,
  overnight: DigestLeadSummary[],
  approachingBreach: DigestLeadSummary[],
  breached: DigestLeadSummary[],
  ownLeadsAdded: { trainerName: string; count: number }[] = [],
  timerCloses: string[] = [],
) {
  const client = getClient();
  if (!client) return;

  // "New own leads: Julie added 2" (item 8). Only shown when there are some.
  const ownLeadsLine =
    ownLeadsAdded.length === 0
      ? null
      : `New own leads: ${ownLeadsAdded.map((o) => `${o.trainerName} added ${o.count}`).join(", ")}`;

  // Closed by the 48-hour timer since yesterday (item 11).
  const timerLine =
    timerCloses.length === 0
      ? null
      : `Closed by the 48-hour timer (no response to a no): ${timerCloses.join(", ")}. You can reopen these from the lead board.`;

  const sourceLabel = (source: DigestLeadSummary["source"]) =>
    source === "form" ? "form" : source === "unverified" ? "unverified" : source === "own" ? "own lead" : "flagged";

  const textSection = (title: string, leads: DigestLeadSummary[]) =>
    leads.length === 0
      ? `${title}: none`
      : `${title}:\n${leads.map((l) => `  - ${l.name} (${sourceLabel(l.source)})`).join("\n")}`;

  const text = [
    "Morning. Here's where the PT leads stand.",
    "",
    textSection("New overnight", overnight),
    ...(ownLeadsLine ? [ownLeadsLine] : []),
    ...(timerLine ? ["", timerLine] : []),
    "",
    textSection("Approaching the 48 hour mark", approachingBreach),
    "",
    textSection("Already breached", breached),
    "",
    dashboardTextLine("Open the dashboard to allocate or follow up."),
  ].join("\n");

  const htmlSection = (title: string, leads: DigestLeadSummary[], accent: string) => {
    const items =
      leads.length === 0
        ? `<p style="margin:6px 0 0;font-size:14px;color:#999999;">None</p>`
        : `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 0;">${leads
            .map(
              (l) =>
                `<tr><td style="padding:5px 0;font-size:14px;color:#111111;">${esc(l.name)} <span style="color:#999999;">· ${sourceLabel(
                  l.source,
                )}</span></td></tr>`,
            )
            .join("")}</table>`;
    return `<div style="margin:0 0 22px;">
      <p style="margin:0;font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:${accent};">
        ${title} <span style="color:#bbbbbb;">(${leads.length})</span>
      </p>
      ${items}
    </div>`;
  };

  const html = layout(`
    <p style="margin:0 0 6px;font-size:20px;font-weight:600;line-height:1.3;">Daily PT leads digest</p>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.5;color:#444444;">
      Morning. Here's where the PT leads stand.
    </p>
    ${htmlSection("New overnight", overnight, "#111111")}
    ${ownLeadsLine ? `<p style="margin:-14px 0 22px;font-size:14px;color:#444444;">${esc(ownLeadsLine)}</p>` : ""}
    ${timerLine ? `<p style="margin:0 0 22px;font-size:14px;font-weight:600;color:#b91c1c;">${esc(timerLine)}</p>` : ""}
    ${htmlSection("Approaching the 48 hour mark", approachingBreach, "#111111")}
    ${htmlSection("Already breached", breached, "#111111")}
    ${ctaButton()}
  `);

  await client.emails.send({
    from: FROM_ADDRESS,
    to: managerEmail,
    subject: `Fitaz PT leads: ${overnight.length} new, ${approachingBreach.length} due soon, ${breached.length} breached`,
    text,
    html,
  });
}

// A trainer uploaded a document that now needs the manager to review it.
export async function sendDocumentUploadedManagerNotification(
  managerEmail: string,
  params: { trainerName: string; documentLabel: string; expiryDate: string | null },
) {
  const client = getClient();
  if (!client) return;

  await client.emails.send({
    from: FROM_ADDRESS,
    to: managerEmail,
    subject: `Document to review: ${params.trainerName} (${params.documentLabel})`,
    text: [
      `${params.trainerName} has uploaded a new compliance document that needs your review.`,
      "",
      `Document: ${params.documentLabel}`,
      params.expiryDate ? `Expiry: ${params.expiryDate}` : "Expiry: none recorded",
      "",
      "Open the compliance dashboard to verify or reject it.",
    ].join("\n"),
  });
}

interface ExpiryReminderParams {
  trainerName: string;
  documentLabel: string;
  expiryDate: string;
  expired: boolean;
  daysRemaining: number;
}

// Reminder that a document is approaching expiry, or has lapsed. Sent to both
// the trainer and the PT manager. `to` may be one or more addresses; nulls are
// dropped so a missing trainer email doesn't stop the manager's copy.
export async function sendDocumentExpiryReminder(
  to: (string | null | undefined)[],
  params: ExpiryReminderParams,
) {
  const client = getClient();
  const recipients = [...new Set(to.filter((address): address is string => !!address))];
  if (!client || recipients.length === 0) return;

  const when = params.expired
    ? `expired on ${params.expiryDate}`
    : `expires on ${params.expiryDate} (${params.daysRemaining} day${params.daysRemaining === 1 ? "" : "s"} away)`;

  await client.emails.send({
    from: FROM_ADDRESS,
    to: recipients,
    subject: params.expired
      ? `Expired: ${params.trainerName} (${params.documentLabel})`
      : `Renewal due: ${params.trainerName} (${params.documentLabel})`,
    text: [
      params.expired
        ? `${params.trainerName}'s ${params.documentLabel} has ${when}.`
        : `${params.trainerName}'s ${params.documentLabel} ${when}.`,
      "",
      params.expired
        ? "Please renew it and upload the new document as soon as possible."
        : "Please arrange the renewal and upload the new document before it lapses.",
      "",
      "Once a replacement with a later expiry date is uploaded and approved, these reminders stop.",
    ].join("\n"),
  });
}

// ---------------------------------------------------------------------------
// Weekly lead summary to each trainer (Batch 1 item [3])
// ---------------------------------------------------------------------------
// The daily digest tells the manager when a trainer has already missed the
// 48 hour rule. This is the prompt that comes before: every Monday, each
// trainer sees their own active leads, the ones they have gone longest without
// contacting at the top. It still sends with no leads, so a trainer can tell
// the system is running rather than wonder whether it broke.

export interface WeeklySummaryLead {
  name: string;
  status: LeadStatus;
  allocatedAt: string | null;
  lastContactedAt: string | null;
  // When the lead moved into its current status, for the two flags below.
  statusSince: string | null;
  // The 2-2-2 touch or no to respond to that's due in the coming week, if any
  // ("2-week touch due Wed 25 Nov", "Respond to a no: 20h left").
  followUp?: string | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-AU", {
    timeZone: "Australia/Brisbane",
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

// Built separately from sending so a sample can be rendered against real data
// and read before the cron is ever switched on.
export function buildTrainerWeeklySummary(
  trainerName: string,
  leads: WeeklySummaryLead[],
  now: Date = new Date(),
): { subject: string; text: string; html: string } {
  const firstName = trainerName.split(" ")[0];

  // Never contacted first, then longest since contact.
  const sorted = [...leads].sort((a, b) => {
    if (!a.lastContactedAt) return b.lastContactedAt ? -1 : 0;
    if (!b.lastContactedAt) return 1;
    return a.lastContactedAt.localeCompare(b.lastContactedAt);
  });

  // Two statuses are waiting rooms, and a lead sitting in one too long needs
  // the trainer to act. Written as what to do next, not just how long it's
  // been, because the likeliest reason is that the outcome happened and the
  // status was never updated.
  const flagFor = (lead: WeeklySummaryLead): string | null => {
    if (!lead.statusSince) return null;
    const days = Math.floor((now.getTime() - new Date(lead.statusSince).getTime()) / DAY_MS);
    if (lead.status === "Attended" && days > ATTENDED_DECISION_DAYS) {
      return `Waiting on a decision for ${days} days. Follow up, or update to Converted or Not interested if they've decided.`;
    }
    if (lead.status === "Comp. Booked" && days > COMP_BOOKED_CHECK_DAYS) {
      return `Booked ${days} days ago. If the session's happened, update to Attended. If they didn't show, rebook.`;
    }
    return null;
  };

  const count = leads.length;
  const dueCount = leads.filter((l) => l.followUp).length;
  const headline =
    (count === 0
      ? "No active leads this week."
      : `You have ${count} active lead${count === 1 ? "" : "s"} assigned to you.`) +
    (dueCount > 0 ? ` Follow-ups due this week: ${dueCount}.` : "");
  const subject =
    count === 0 ? "Your PT leads this week: none active" : `Your PT leads this week: ${count} active`;

  const lastContactedLabel = (lead: WeeklySummaryLead) =>
    lead.lastContactedAt ? `Last contacted ${shortDate(lead.lastContactedAt)}` : "Not yet contacted";
  const assignedLabel = (lead: WeeklySummaryLead) =>
    lead.allocatedAt ? `Assigned ${shortDate(lead.allocatedAt)}` : "Assigned date unknown";

  const textLines = sorted.map((lead) => {
    const flag = flagFor(lead);
    return [
      `- ${lead.name} (${lead.status})`,
      `  ${lastContactedLabel(lead)} · ${assignedLabel(lead)}`,
      ...(lead.followUp ? [`  Follow-up: ${lead.followUp}`] : []),
      ...(flag ? [`  ${flag}`] : []),
    ].join("\n");
  });

  const text = [
    `Morning ${firstName}.`,
    "",
    headline,
    ...(count > 0
      ? ["Anyone you haven't contacted for a while is at the top.", "", ...textLines]
      : []),
    "",
    dashboardTextLine("Update a status or log contact in the dashboard."),
  ].join("\n");

  const rows = sorted
    .map((lead) => {
      const flag = flagFor(lead);
      return `<tr><td style="padding:12px 0;border-top:1px solid #eeeeee;">
        <p style="margin:0;font-size:15px;font-weight:600;color:#111111;">${esc(lead.name)}
          <span style="font-weight:500;color:#666666;"> · ${esc(lead.status)}</span></p>
        <p style="margin:4px 0 0;font-size:13px;color:#666666;">${lastContactedLabel(lead)} · ${assignedLabel(lead)}</p>
        ${lead.followUp ? `<p style="margin:4px 0 0;font-size:13px;font-weight:600;color:#4338ca;">Follow-up: ${esc(lead.followUp)}</p>` : ""}
        ${flag ? `<p style="margin:4px 0 0;font-size:13px;font-weight:600;color:#111111;">${esc(flag)}</p>` : ""}
      </td></tr>`;
    })
    .join("");

  const html = layout(`
    <p style="margin:0 0 6px;font-size:20px;font-weight:600;line-height:1.3;">Your leads this week</p>
    <p style="margin:0 0 4px;font-size:14px;line-height:1.5;color:#444444;">Morning ${esc(firstName)}. ${headline}</p>
    ${
      count > 0
        ? `<p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:#444444;">Anyone you haven't contacted for a while is at the top.</p>
           <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>`
        : ""
    }
    ${ctaButton()}
  `);

  return { subject, text, html };
}

export async function sendTrainerWeeklySummary(
  trainer: Pick<Trainer, "name" | "email">,
  managerEmail: string,
  leads: WeeklySummaryLead[],
) {
  const client = getClient();
  if (!client || !trainer.email) return;

  const { subject, text, html } = buildTrainerWeeklySummary(trainer.name, leads);
  // Karl is the manager and one of the trainers: don't CC him on his own.
  const cc = managerEmail.toLowerCase() === trainer.email.toLowerCase() ? undefined : managerEmail;

  const { error } = await client.emails.send({ from: FROM_ADDRESS, to: trainer.email, cc, subject, text, html });
  if (error) throw new Error(`Weekly summary to ${trainer.name} failed: ${error.message}`);
}

// ---------------------------------------------------------------------------
// 2-2-2 follow-ups and the 48-hour clock on a no (Part 7 amendments, item 11)
// ---------------------------------------------------------------------------

export interface TimerClose {
  leadName: string;
  trainerName: string;
  saidNoAt: string;
  closedAt: string;
}

function brisbaneDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-AU", {
    timeZone: "Australia/Brisbane",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

// The PT Manager hears straight away when the 48-hour timer closes a lead, so
// they can follow it up with the trainer, and reopen it if the trainer did ask
// in time but didn't log it.
export async function sendTimerCloseNotification(managerEmail: string, closes: TimerClose[]) {
  const client = getClient();
  if (!client || closes.length === 0) return;

  const lines = closes.map(
    (c) =>
      `- ${c.leadName} (${c.trainerName}): no logged ${brisbaneDateTime(c.saidNoAt)}, window closed ${brisbaneDateTime(c.closedAt)}`,
  );
  const intro =
    closes.length === 1
      ? "The 48-hour window to respond to a no has closed on this lead, so the portal has closed it as Not interested."
      : `The 48-hour window to respond to a no has closed on ${closes.length} leads, so the portal has closed them as Not interested.`;
  const after =
    "Worth a word with the trainer. If they did ask the permission question in time and just didn't update the portal, you can reopen the lead from its panel on the lead board.";

  const text = [intro, "", ...lines, "", after, "", dashboardTextLine("Open the lead board:")].join("\n");
  const html = layout(`
    <p style="margin:0 0 6px;font-size:20px;font-weight:600;line-height:1.3;">48-hour window missed</p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:#444444;">${esc(intro)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${closes
      .map(
        (c) => `<tr><td style="padding:10px 0;border-top:1px solid #eeeeee;">
          <p style="margin:0;font-size:15px;font-weight:600;color:#111111;">${esc(c.leadName)}
            <span style="font-weight:500;color:#666666;"> · ${esc(c.trainerName)}</span></p>
          <p style="margin:4px 0 0;font-size:13px;color:#666666;">No logged ${esc(brisbaneDateTime(c.saidNoAt))} · window closed ${esc(brisbaneDateTime(c.closedAt))}</p>
        </td></tr>`,
      )
      .join("")}</table>
    <p style="margin:16px 0 0;font-size:14px;line-height:1.5;color:#444444;">${esc(after)}</p>
    ${ctaButton()}
  `);

  await client.emails.send({
    from: FROM_ADDRESS,
    to: managerEmail,
    subject:
      closes.length === 1
        ? `48-hour window missed: ${closes[0].leadName}`
        : `48-hour window missed on ${closes.length} leads`,
    text,
    html,
  });
}

export interface FollowUpReminder {
  leadName: string;
  label: string;
}

// The short daily email a trainer gets only on days something is due: a
// 2-2-2 touch, or a no to respond to within 48 hours.
export async function sendTrainerFollowUpReminder(
  trainer: Pick<Trainer, "name" | "email">,
  items: FollowUpReminder[],
) {
  const client = getClient();
  if (!client || !trainer.email || items.length === 0) return;

  const firstName = trainer.name.split(" ")[0];
  const headline = `You have ${items.length} follow-up${items.length === 1 ? "" : "s"} to do today.`;
  const text = [
    `Morning ${firstName}.`,
    "",
    headline,
    "",
    ...items.map((i) => `- ${i.leadName}: ${i.label}`),
    "",
    "Tap Done on each one in the portal once it's sent, and the next one is scheduled for you.",
    "",
    dashboardTextLine("Open your leads:"),
  ].join("\n");
  const html = layout(`
    <p style="margin:0 0 6px;font-size:20px;font-weight:600;line-height:1.3;">Follow-ups today</p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:#444444;">Morning ${esc(firstName)}. ${esc(headline)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${items
      .map(
        (i) => `<tr><td style="padding:10px 0;border-top:1px solid #eeeeee;">
          <p style="margin:0;font-size:15px;font-weight:600;color:#111111;">${esc(i.leadName)}</p>
          <p style="margin:4px 0 0;font-size:13px;color:#4338ca;font-weight:600;">${esc(i.label)}</p>
        </td></tr>`,
      )
      .join("")}</table>
    <p style="margin:16px 0 0;font-size:14px;line-height:1.5;color:#444444;">Tap Done on each one in the portal once it's sent, and the next one is scheduled for you.</p>
    ${ctaButton()}
  `);

  const { error } = await client.emails.send({
    from: FROM_ADDRESS,
    to: trainer.email,
    subject: `Follow-ups today: ${items.length}`,
    text,
    html,
  });
  if (error) throw new Error(`Follow-up reminder to ${trainer.name} failed: ${error.message}`);
}
