// Lightweight keep-alive cron. On the Supabase free tier a project is paused
// after ~7 days without database activity, so this runs a trivial query on a
// schedule (see vercel.json) purely to keep the project warm. Unlike the daily
// digest it has no email dependency and never no-ops, so it generates activity
// regardless of how the rest of the app is configured.

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("leads").select("id").limit(1);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, pingedAt: new Date().toISOString() });
}
