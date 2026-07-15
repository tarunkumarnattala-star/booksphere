import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const configuration = {
    appUrl: Boolean(process.env.NEXT_PUBLIC_APP_URL),
    supportEmail: Boolean(process.env.NEXT_PUBLIC_SUPPORT_EMAIL),
    supabase: Boolean(supabase)
  };

  if (!configuration.appUrl || !configuration.supportEmail || !supabase) {
    return NextResponse.json({ status: "not_ready", configuration }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  const { error } = await supabase.from("books").select("id").limit(1);
  const healthy = !error;
  return NextResponse.json(
    { status: healthy ? "healthy" : "degraded", configuration, database: healthy ? "reachable" : "unavailable" },
    { status: healthy ? 200 : 503, headers: { "Cache-Control": "no-store" } }
  );
}
