import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getValidAccessToken, fetchRecentActivities, normalizeActivity } from "@/lib/strava";
import { supabaseServer } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("ironsuhba_uid")?.value;

  if (!userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const accessToken = await getValidAccessToken(userId);
    if (!accessToken) {
      return Response.json({ error: "No Strava token" }, { status: 401 });
    }

    // Fetch activities from 90 days ago to capture recent fitness baseline
    const ninetyDaysAgo = Math.floor((Date.now() - 90 * 24 * 60 * 60 * 1000) / 1000);
    const raw = await fetchRecentActivities(accessToken, ninetyDaysAgo);

    if (!raw.length) {
      return Response.json({ synced: 0, message: "No new activities" });
    }

    const activities = raw.map((a: any) => normalizeActivity(a, userId));

    // Upsert all activities
    const { error } = await supabaseServer.from("activities").upsert(
      activities.map((a) => ({
        user_id: a.user_id,
        strava_activity_id: a.strava_activity_id,
        name: a.name,
        type: a.type,
        start_date: a.start_date,
        duration_seconds: a.duration_seconds,
        distance_meters: a.distance_meters,
        avg_heartrate: a.avg_heartrate,
        max_heartrate: a.max_heartrate,
        total_elevation_gain: a.total_elevation_gain,
        average_speed: a.average_speed,
        average_watts: a.average_watts,
        suffer_score: a.suffer_score,
        strava_url: a.strava_url,
      })),
      { onConflict: "strava_activity_id" }
    );

    if (error) {
      console.error("Activity upsert error:", error);
      return Response.json({ error: "DB error" }, { status: 500 });
    }

    return Response.json({ synced: activities.length });
  } catch (err) {
    console.error("Sync error:", err);
    return Response.json({ error: "Sync failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("ironsuhba_uid")?.value;

  if (!userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: activities, error } = await supabaseServer
    .from("activities")
    .select("*")
    .eq("user_id", userId)
    .order("start_date", { ascending: false });

  if (error) {
    return Response.json({ error: "DB error" }, { status: 500 });
  }

  return Response.json({ activities });
}
