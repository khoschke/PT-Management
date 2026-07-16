// Trainer allocation suggestion engine.
//
// This only ever suggests. The PT Manager makes the final call with one
// click, and the reasoning here is shown in the UI so the suggestion is
// never a black box.
//
// Priority order, per the brief:
//   1. A trainer named by the member in the form wins outright, if active.
//   2. Gender preference is a hard filter, if the member stated one.
//   3. Goal match against trainer specialties, and availability match.
//   4. Lowest current lead load breaks any remaining tie.

import { goalLabel } from "./goals";
import type { Lead, Trainer } from "./types";

export interface TrainerWithLoad extends Trainer {
  currentLoad: number;
}

export interface AllocationSuggestion {
  trainer: TrainerWithLoad;
  reason: string;
}

export function suggestTrainer(
  lead: Pick<Lead, "preferred_trainer_id" | "gender_preference" | "time_preference" | "goals">,
  activeTrainers: TrainerWithLoad[],
): AllocationSuggestion | null {
  if (activeTrainers.length === 0) return null;

  // Rule 1: named trainer wins outright.
  if (lead.preferred_trainer_id) {
    const requested = activeTrainers.find((t) => t.id === lead.preferred_trainer_id);
    if (requested) {
      return {
        trainer: requested,
        reason: `${requested.name} was requested by name.`,
      };
    }
  }

  // Rule 2: gender preference as a hard filter, when it narrows the pool.
  let pool = activeTrainers;
  let genderFiltered = false;
  if (lead.gender_preference && lead.gender_preference !== "no_preference") {
    const filtered = activeTrainers.filter((t) => t.gender === lead.gender_preference);
    if (filtered.length > 0) {
      pool = filtered;
      genderFiltered = true;
    }
  }

  // Rule 3: score by goal overlap and availability match.
  const scored = pool.map((trainer) => {
    const goalOverlap = (lead.goals ?? []).filter((g) => trainer.specialties.includes(g));
    const availabilityMatch =
      !!lead.time_preference &&
      lead.time_preference !== "either" &&
      (trainer.availability === "both" || trainer.availability === lead.time_preference);

    const score = goalOverlap.length * 10 + (availabilityMatch ? 5 : 0);

    return { trainer, goalOverlap, availabilityMatch, score };
  });

  const topScore = Math.max(...scored.map((s) => s.score));
  const topScorers = scored.filter((s) => s.score === topScore);

  // Rule 4: lowest current lead load breaks the tie.
  topScorers.sort((a, b) => a.trainer.currentLoad - b.trainer.currentLoad);
  const winner = topScorers[0];

  const reasonParts: string[] = [];
  if (genderFiltered) {
    reasonParts.push(`matches gender preference (${lead.gender_preference})`);
  }
  if (winner.goalOverlap.length > 0) {
    reasonParts.push(
      `shares ${winner.goalOverlap.length} goal${winner.goalOverlap.length > 1 ? "s" : ""} (${winner.goalOverlap
        .map(goalLabel)
        .join(", ")})`,
    );
  }
  if (winner.availabilityMatch) {
    reasonParts.push(`available ${lead.time_preference}`);
  }

  let reason: string;
  if (reasonParts.length > 0) {
    reason = `${capitalise(reasonParts.join(", "))}; ${winner.trainer.currentLoad} active lead${
      winner.trainer.currentLoad === 1 ? "" : "s"
    } on their books.`;
  } else {
    reason = `No strong signal from goals or availability, so this is the lowest current load (${winner.trainer.currentLoad} active lead${
      winner.trainer.currentLoad === 1 ? "" : "s"
    }).`;
  }

  return { trainer: winner.trainer, reason };
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
