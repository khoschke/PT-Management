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
import type { Lead, Trainer } from "./types";
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

// Wraps body content in the shared monochrome shell. Inline styles only —
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

export async function sendTrainerAllocationEmail(trainer: Trainer, lead: Lead) {
  const client = getClient();
  if (!client || !trainer.email) return;

  const goalsText = lead.goals.length > 0 ? lead.goals.map(goalLabel).join(", ") : "Not stated";
  const sourceText =
    lead.lead_source === "form"
      ? "Filled in the form themselves, so this is a warm lead."
      : "Found on the GymMaster sweep, so this is a cold lead. They haven't opted in yet, go in accordingly.";
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
) {
  const client = getClient();
  if (!client) return;

  const sourceLabel = (source: DigestLeadSummary["source"]) => (source === "form" ? "form" : "sweep");

  const textSection = (title: string, leads: DigestLeadSummary[]) =>
    leads.length === 0
      ? `${title}: none`
      : `${title}:\n${leads.map((l) => `  - ${l.name} (${sourceLabel(l.source)})`).join("\n")}`;

  const text = [
    "Morning. Here's where the PT leads stand.",
    "",
    textSection("New overnight", overnight),
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
    ${htmlSection("Approaching the 48 hour mark", approachingBreach, "#111111")}
    ${htmlSection("Already breached", breached, "#111111")}
    ${ctaButton()}
  `);

  await client.emails.send({
    from: FROM_ADDRESS,
    to: managerEmail,
    subject: `Fitaz PT leads: ${breached.length} breached, ${approachingBreach.length} due soon`,
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
    subject: `Document to review: ${params.trainerName} — ${params.documentLabel}`,
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
      ? `Expired: ${params.trainerName} — ${params.documentLabel}`
      : `Renewal due: ${params.trainerName} — ${params.documentLabel}`,
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
