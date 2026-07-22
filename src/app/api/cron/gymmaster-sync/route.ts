// GymMaster integration, Phase 1 (the pull). Runs on a schedule (Vercel Cron,
// see vercel.json): fetches members created in GymMaster since the last
// successful run and creates a cold lead for each new one, so new sign-ups land
// on the board with no manual entry. Deduped on gymmaster_member_id, so re-runs
// never double-import. Every run writes a gymmaster_sync_log row for auditing.
//
// A clean no-op if the GymMaster API isn't configured yet, so shipping this
// leaves the running app unchanged until the owners provision access. The
// manual "Add sweep lead" button stays as a fallback either way.

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchMembersCreatedSince, gymmasterConfigured } from "@/lib/gymmaster/client";
import { isContactable, mapMemberToLead } from "@/lib/gymmaster/mapMember";

// How far back the very first run looks, before any watermark exists.
const BOOTSTRAP_DAYS = Number(process.env.GYMMASTER_BOOTSTRAP_DAYS ?? "30");

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!gymmasterConfigured()) {
    return NextResponse.json({ skipped: true, reason: "GymMaster not configured" });
  }

  const supabase = createAdminClient();

  // "Created since" cursor: the watermark of the last successful run, or a
  // bootstrap window on the first run.
  const { data: lastSuccess } = await supabase
    .from("gymmaster_sync_log")
    .select("watermark")
    .eq("status", "success")
    .order("finished_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const previousWatermark = lastSuccess?.watermark ? new Date(lastSuccess.watermark) : null;
  const since =
    previousWatermark ?? new Date(Date.now() - BOOTSTRAP_DAYS * 24 * 60 * 60 * 1000);

  // Open a log row so an in-flight or crashed run is visible.
  const { data: logRow, error: logError } = await supabase
    .from("gymmaster_sync_log")
    .insert({ status: "running" })
    .select("id")
    .single();

  if (logError || !logRow) {
    console.error("GymMaster sync: could not open sync log", logError);
    return NextResponse.json({ error: "Could not start sync" }, { status: 500 });
  }

  try {
    const { members, unparsed } = await fetchMembersCreatedSince(since);

    const contactable = members.filter(isContactable);
    const skippedUncontactable = members.length - contactable.length;

    // Dedupe against leads already imported for these members.
    const memberIds = contactable.map((m) => m.memberId);
    let alreadyImported = new Set<string>();
    if (memberIds.length > 0) {
      const { data: existing, error: existingError } = await supabase
        .from("leads")
        .select("gymmaster_member_id")
        .in("gymmaster_member_id", memberIds);
      if (existingError) throw new Error(`Dedupe lookup failed: ${existingError.message}`);
      alreadyImported = new Set(
        (existing ?? []).map((r) => r.gymmaster_member_id).filter((v): v is string => Boolean(v)),
      );
    }

    const toInsert = contactable
      .filter((m) => !alreadyImported.has(m.memberId))
      .map(mapMemberToLead);

    let leadsCreated = 0;
    if (toInsert.length > 0) {
      // ignoreDuplicates guards against a race with a previous overlapping run:
      // the unique index on gymmaster_member_id makes the insert idempotent.
      const { data: inserted, error: insertError } = await supabase
        .from("leads")
        .upsert(toInsert, { onConflict: "gymmaster_member_id", ignoreDuplicates: true })
        .select("id");
      if (insertError) throw new Error(`Lead insert failed: ${insertError.message}`);
      leadsCreated = inserted?.length ?? 0;
    }

    // Advance the watermark to the newest member we saw, never backwards.
    const newestSeen = members.reduce<Date | null>((max, m) => {
      const created = new Date(m.createdAt);
      return !max || created > max ? created : max;
    }, null);
    const watermark =
      newestSeen && (!previousWatermark || newestSeen > previousWatermark)
        ? newestSeen
        : previousWatermark;

    await supabase
      .from("gymmaster_sync_log")
      .update({
        status: "success",
        finished_at: new Date().toISOString(),
        members_seen: members.length,
        leads_created: leadsCreated,
        watermark: watermark ? watermark.toISOString() : null,
      })
      .eq("id", logRow.id);

    console.log(
      `GymMaster sync: seen=${members.length} created=${leadsCreated} ` +
        `dupes=${alreadyImported.size} uncontactable=${skippedUncontactable} unparsed=${unparsed}`,
    );

    return NextResponse.json({
      ok: true,
      membersSeen: members.length,
      leadsCreated,
      duplicatesSkipped: alreadyImported.size,
      uncontactableSkipped: skippedUncontactable,
      unparsed,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("GymMaster sync failed", message);
    await supabase
      .from("gymmaster_sync_log")
      .update({ status: "error", finished_at: new Date().toISOString(), error: message })
      .eq("id", logRow.id);
    return NextResponse.json({ error: "Sync failed", detail: message }, { status: 500 });
  }
}
