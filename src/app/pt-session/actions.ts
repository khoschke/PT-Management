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

  const { data: allowed, error: rateLimitError } = await supabase.rpc(
    "check_form_rate_limit",
    { p_ip_hash: ipHash },
  );

  if (rateLimitError || allowed === false) {
    return {
      status: "error",
      message: "That's a lot of attempts from this device. Please try again shortly.",
    };
  }

  const { error } = await supabase.from("leads").insert({
    name: parsed.data.name,
    phone: parsed.data.phone,
    email: parsed.data.email,
    date_of_birth: parsed.data.date_of_birth,
    goals: parsed.data.goals,
    goal_other: parsed.data.goals.includes("other") ? parsed.data.goal_other ?? null : null,
    current_exercise: parsed.data.current_exercise || null,
    gender_preference: parsed.data.gender_preference || null,
    time_preference: parsed.data.time_preference || null,
    preferred_trainer_id: parsed.data.preferred_trainer_id || null,
    contact_preference: parsed.data.contact_preference || null,
    lead_source: "form",
    status: "New",
    ip_hash: ipHash,
  });

  if (error) {
    console.error("Lead insert failed", error);
    return {
      status: "error",
      message: "Something went wrong on our end. Please try again, or call the gym directly.",
    };
  }

  return { status: "success" };
}
