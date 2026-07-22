// Email notifications via Resend's free tier. Entirely optional: if
// RESEND_API_KEY isn't set, these become no-ops and the dashboard keeps
// working exactly as before. The dashboard is the product, email is a
// convenience on top of it.

import { Resend } from "resend";
import type { Lead, Trainer } from "./types";
import { goalLabel } from "./goals";

const FROM_ADDRESS = process.env.NOTIFICATIONS_FROM_EMAIL ?? "Fitaz Gym <onboarding@resend.dev>";

export const emailEnabled = !!process.env.RESEND_API_KEY;

function getClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendTrainerAllocationEmail(trainer: Trainer, lead: Lead) {
  const client = getClient();
  if (!client || !trainer.email) return;

  const goalsText = lead.goals.length > 0 ? lead.goals.map(goalLabel).join(", ") : "Not stated";
  const sourceText =
    lead.lead_source === "form"
      ? "Filled in the form themselves, so this is a warm lead."
      : "From GymMaster, so this is a cold lead. They haven't opted in yet, go in accordingly.";

  await client.emails.send({
    from: FROM_ADDRESS,
    to: trainer.email,
    subject: `New PT lead: ${lead.name}`,
    text: [
      `${lead.name} has been allocated to you for their complimentary PT session.`,
      "",
      `Source: ${sourceText}`,
      `Phone: ${lead.phone}`,
      `Email: ${lead.email ?? "Not provided"}`,
      `Goals: ${goalsText}`,
      lead.contact_preference ? `Best way to reach them: ${lead.contact_preference}` : null,
      "",
      `First contact is due within 48 hours of the lead coming in (by ${new Date(
        lead.first_contact_due_at,
      ).toLocaleString("en-AU", { timeZone: "Australia/Brisbane" })}).`,
    ]
      .filter(Boolean)
      .join("\n"),
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

  const section = (title: string, leads: DigestLeadSummary[]) =>
    leads.length === 0
      ? `${title}: none`
      : `${title}:\n${leads.map((l) => `  - ${l.name} (${l.source === "form" ? "form" : "sweep"})`).join("\n")}`;

  await client.emails.send({
    from: FROM_ADDRESS,
    to: managerEmail,
    subject: `Fitaz PT leads: ${breached.length} breached, ${approachingBreach.length} due soon`,
    text: [
      "Morning. Here's where the PT leads stand.",
      "",
      section("New overnight", overnight),
      "",
      section("Approaching the 48 hour mark", approachingBreach),
      "",
      section("Already breached", breached),
      "",
      "Open the dashboard to allocate or follow up.",
    ].join("\n"),
  });
}
