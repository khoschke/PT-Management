"use client";

import { useState } from "react";
import { FOLLOW_UP_LABELS, formatShortDay, getFollowUpState } from "@/lib/followUps";
import { CLOSED_LEAD_STATUSES, CLOSED_REASON_LABELS, type Lead } from "@/lib/types";
import {
  completeFollowUp,
  endCommunication,
  recordPermissionAnswer,
  reopenTimerClose,
  startFollowUps,
} from "../actions";

// The lead panel's follow-up block (Part 7 amendments, item 11): the 2-2-2
// touch that's due, the permission question on a no and its 48-hour clock,
// End communication, and the PT Manager's reopen for a timer close.

type RunAction = (fn: () => Promise<{ ok: boolean; message?: string }>) => void;

const btnFocus =
  "outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-surface";
const primary = `press rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 ${btnFocus}`;
const secondary = `press rounded-full bg-fill px-4 py-2 text-xs font-semibold text-foreground disabled:opacity-50 ${btnFocus}`;

function Heading() {
  return <h3 className="text-xs font-semibold uppercase tracking-wide text-secondary-label">Follow-up</h3>;
}

export default function FollowUpSection({
  lead,
  isManager,
  isPending,
  runAction,
}: {
  lead: Lead;
  isManager: boolean;
  isPending: boolean;
  runAction: RunAction;
}) {
  const [reopenTo, setReopenTo] = useState<"Agreed to check-in" | "Not interested">("Agreed to check-in");
  const [reopenReason, setReopenReason] = useState("");
  const state = getFollowUpState(lead);
  const closed = CLOSED_LEAD_STATUSES.includes(lead.status);

  // Closed by the 48-hour timer: stands unless the PT Manager reopens it.
  if (lead.closed_reason === "no_response_to_no") {
    return (
      <section className="border-t border-black/5 pt-6">
        <Heading />
        <p className="mt-2 text-sm text-foreground">
          Closed by the 48-hour timer{lead.closed_at ? ` on ${formatShortDay(new Date(lead.closed_at))}` : ""}: the
          permission question wasn&apos;t logged in time after a no.
        </p>
        {isManager ? (
          <div className="mt-3 rounded-2xl bg-fill px-4 py-3.5">
            <p className="text-sm font-semibold text-foreground">Reopen this lead</p>
            <p className="mt-0.5 text-xs text-secondary-label">
              Only if the trainer did ask in time and didn&apos;t update the portal, or it was an accident.
            </p>
            <select
              value={reopenTo}
              onChange={(e) => setReopenTo(e.target.value as typeof reopenTo)}
              className="mt-2.5 w-full rounded-xl border-none bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none ring-1 ring-black/10"
            >
              <option value="Agreed to check-in">They agreed to a check-in</option>
              <option value="Not interested">They said leave it there</option>
            </select>
            <input
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              maxLength={500}
              placeholder="Reason, e.g. asked on the phone, forgot to log it"
              className="mt-2 w-full rounded-xl border-none bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none ring-1 ring-black/10"
            />
            <button
              type="button"
              disabled={isPending || !reopenReason.trim()}
              onClick={() => runAction(() => reopenTimerClose(lead.id, reopenTo, reopenReason))}
              className={`mt-2.5 ${primary}`}
            >
              Reopen
            </button>
          </div>
        ) : (
          <p className="mt-1.5 text-xs text-secondary-label">
            If you did ask in time and just didn&apos;t update the portal, tell the PT Manager. They can reopen it.
          </p>
        )}
      </section>
    );
  }

  // Any other close: say why, and that's that.
  if (closed) {
    if (!lead.closed_reason) return null;
    return (
      <section className="border-t border-black/5 pt-6">
        <Heading />
        <p className="mt-2 text-sm text-foreground">
          Closed: {CLOSED_REASON_LABELS[lead.closed_reason]}
          {lead.closed_at ? `, ${formatShortDay(new Date(lead.closed_at))}` : ""}.
          {lead.status === "Not interested" ? " Don't contact them about PT again." : ""}
        </p>
      </section>
    );
  }

  const endButtons = (
    <div className="mt-5 border-t border-black/5 pt-4">
      <p className="text-xs font-semibold text-secondary-label">End communication</p>
      <p className="mt-0.5 text-xs text-secondary-label">
        Use this when they&apos;ve ended it. It closes the lead as Not interested and can&apos;t be undone.
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            if (window.confirm(`Record that ${lead.name} replied STOP? They won't be contacted about PT again.`)) {
              runAction(() => endCommunication(lead.id, "replied_stop"));
            }
          }}
          className={secondary}
        >
          They replied STOP
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            if (window.confirm(`Record that ${lead.name} asked you to leave it there? They won't be contacted about PT again.`)) {
              runAction(() => endCommunication(lead.id, "ended_by_trainer"));
            }
          }}
          className={secondary}
        >
          They asked me to leave it
        </button>
      </div>
    </div>
  );

  let body: React.ReactNode = null;

  if (lead.status === "Said no" && state?.kind === "no_clock") {
    body = (
      <>
        <p className="mt-2 text-sm font-semibold text-foreground">{state.label}</p>
        <p className="mt-1 text-xs text-secondary-label">
          Reply once with: &ldquo;Totally fine. Mind if I check in down the track, or would you rather I leave it
          there?&rdquo; Then record what happened. If nothing&apos;s recorded by{" "}
          {state.dueAt.toLocaleString("en-AU", { timeZone: "Australia/Brisbane", weekday: "short", hour: "numeric", minute: "2-digit" })}
          , the lead closes automatically.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" disabled={isPending} onClick={() => runAction(() => recordPermissionAnswer(lead.id, "yes"))} className={primary}>
            They said yes to a check-in
          </button>
          <button type="button" disabled={isPending} onClick={() => runAction(() => recordPermissionAnswer(lead.id, "leave_it"))} className={secondary}>
            They said leave it there
          </button>
          <button type="button" disabled={isPending} onClick={() => runAction(() => recordPermissionAnswer(lead.id, "asked_by_text"))} className={secondary}>
            Asked by text, waiting
          </button>
        </div>
      </>
    );
  } else if (lead.status === "Said no" && state?.kind === "awaiting_answer") {
    body = (
      <>
        <p className="mt-2 text-sm font-semibold text-foreground">{state.label}</p>
        <p className="mt-1 text-xs text-secondary-label">
          You&apos;ve asked the permission question. No answer means a STOP, so the lead closes on that date.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" disabled={isPending} onClick={() => runAction(() => recordPermissionAnswer(lead.id, "yes"))} className={primary}>
            They said yes to a check-in
          </button>
          <button type="button" disabled={isPending} onClick={() => runAction(() => recordPermissionAnswer(lead.id, "leave_it"))} className={secondary}>
            They said leave it there
          </button>
        </div>
      </>
    );
  } else if (state?.kind === "follow_up" && lead.follow_up_step) {
    body = (
      <>
        <p className="mt-2 text-sm font-semibold text-foreground">{state.label}</p>
        <p className="mt-1 text-xs text-secondary-label">
          {lead.follow_up_step === 3
            ? "Treat it as a fresh first contact and end it with “Reply STOP to opt out.”"
            : "Scripts for each touch are in Part 7 of the workbook, under the 2-2-2 rule."}{" "}
          Tap Done once it&apos;s sent and the next one is scheduled.
        </p>
        <button type="button" disabled={isPending} onClick={() => runAction(() => completeFollowUp(lead.id))} className={`mt-3 ${primary}`}>
          Done: {FOLLOW_UP_LABELS[lead.follow_up_step]} sent
        </button>
      </>
    );
  } else if (lead.follow_up_step === 4 && lead.next_follow_up_at) {
    body = (
      <p className="mt-2 text-sm text-foreground">
        2-month reconnect sent. If nothing changes, the lead closes as Unreachable on{" "}
        {formatShortDay(new Date(lead.next_follow_up_at))}.
      </p>
    );
  } else if (lead.status === "Contacted" && !lead.follow_up_step) {
    body = (
      <>
        <p className="mt-2 text-sm text-foreground">No 2-2-2 running on this lead yet.</p>
        <button type="button" disabled={isPending} onClick={() => runAction(() => startFollowUps(lead.id))} className={`mt-3 ${secondary}`}>
          Start the 2-2-2
        </button>
      </>
    );
  }

  const showEnd = lead.allocated_trainer_id && lead.status !== "New";
  if (!body && !showEnd) return null;

  return (
    <section className="border-t border-black/5 pt-6">
      <Heading />
      {body}
      {showEnd && endButtons}
    </section>
  );
}
