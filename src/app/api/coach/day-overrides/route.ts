import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabase";

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("ironsuhba_uid")?.value;
  if (!userId) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { data: overrides, error } = await supabaseServer
    .from("day_schedule_overrides")
    .select("week_number, day, sessions, reason, created_at")
    .eq("user_id", userId)
    .order("week_number", { ascending: true });

  if (error) return Response.json({ error: "DB error" }, { status: 500 });

  return Response.json({ overrides: overrides || [] });
}
