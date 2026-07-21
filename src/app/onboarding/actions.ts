"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { OnboardingPartStatus } from "@/lib/onboarding/progress";

export interface ActionResult {
  ok: boolean;
  message?: string;
}

async function requireTrainerId(): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user?.profile || user.profile.role !== "trainer" || !user.profile.trainer_id) {
    return null;
  }
  return user.profile.trainer_id;
}

export async function saveResponse(
  partNumber: number,
  activityKey: string,
  response: string,
): Promise<ActionResult> {
  const trainerId = await requireTrainerId();
  if (!trainerId) {
    return { ok: false, message: "Only a signed-in trainer can save answers here." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("onboarding_responses").upsert(
    {
      trainer_id: trainerId,
      part_number: partNumber,
      activity_key: activityKey,
      response,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "trainer_id,part_number,activity_key" },
  );

  if (error) {
    console.error("onboarding_responses upsert failed", error);
    return { ok: false, message: "Couldn't save that just now. Try again in a moment." };
  }

  revalidatePath(`/onboarding/${partNumber}`);
  revalidatePath("/onboarding");
  return { ok: true };
}

export async function setPartStatus(
  partNumber: number,
  status: OnboardingPartStatus,
): Promise<ActionResult> {
  const trainerId = await requireTrainerId();
  if (!trainerId) {
    return { ok: false, message: "Only a signed-in trainer can update progress here." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("onboarding_part_status").upsert(
    {
      trainer_id: trainerId,
      part_number: partNumber,
      status,
      completed_at: status === "complete" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "trainer_id,part_number" },
  );

  if (error) {
    console.error("onboarding_part_status upsert failed", error);
    return { ok: false, message: "Couldn't update that just now. Try again in a moment." };
  }

  revalidatePath(`/onboarding/${partNumber}`);
  revalidatePath("/onboarding");
  return { ok: true };
}
