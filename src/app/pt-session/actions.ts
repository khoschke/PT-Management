"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { leadFormSchema } from "@/lib/validation";
import { hashIp } from "@/lib/ip";
import type { LeadFormState } from "./state";

export async function submitLead(
  _prevState: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  const raw = {
    name: formData.get("name")?.toString() ?? "",
    phone: formData.get("phone")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
    date_of_birth: formData.get("date_of_birth")?.toString() ?? "",
    goals: formData.getAll("goals").map((g) => g.toString()),
    goal_other: formData.get("goal_other")?.toString() || undefined,
    current_exercise: formData.get("current_exercise")?.toString() || undefined,
    gender_preference: formData.get("gender_preference")?.toString() || undefined,
    time_preference: formData.get("time_preference")?.toString() || undefined,
    preferred_trainer_id: formData.get("preferred_trainer_id")?.toString() || undefined,
    contact_preference: formData.get("contact_preference")?.toString() || undefined,
  };

  const parsed = leadFormSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString();
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      status: "error",
      message: "Please check the highlighted fields and try again.",
      fieldErrors,
    };
  }

  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || headersList.get("x-real-ip") || "unknown";
  const ipHash = hashIp(ip);

  const supabase = await createClient();

  // One security-definer call does the rate limiting and the insert together.
  // The anon key has no direct INSERT on `leads`, so this is the only way in
  // and the limit can't be skipped by posting straight at the REST API. The
  // function also pins lead_source, status and allocated_trainer_id, so those
  // aren't ours to send.
  const { data, error } = await supabase.rpc("submit_form_lead", {
    p_ip_hash: ipHash,
    p_name: parsed.data.name,
    p_phone: parsed.data.phone,
    p_email: parsed.data.email,
    p_date_of_birth: parsed.data.date_of_birth,
    p_goals: parsed.data.goals,
    p_goal_other: parsed.data.goals.includes("other") ? parsed.data.goal_other ?? null : null,
    p_current_exercise: parsed.data.current_exercise || null,
    p_gender_preference: parsed.data.gender_preference || null,
    p_time_preference: parsed.data.time_preference || null,
    p_preferred_trainer_id: parsed.data.preferred_trainer_id || null,
    p_contact_preference: parsed.data.contact_preference || null,
  });

  if (error) {
    console.error("Lead submission failed", error);
    return {
      status: "error",
      message: "Something went wrong on our end. Please try again, or call the gym directly.",
    };
  }

  const result = data as { ok: boolean; reason?: string } | null;

  if (!result?.ok) {
    if (result?.reason === "rate_limited") {
      return {
        status: "error",
        message: "That's a lot of attempts from this device. Please try again shortly.",
      };
    }
    return {
      status: "error",
      message: "Please check the highlighted fields and try again.",
    };
  }

  return { status: "success" };
}
