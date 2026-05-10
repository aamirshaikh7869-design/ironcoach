import { supabaseServer } from "./supabase";
import { StravaActivity, StravaToken } from "./types";

const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";
const STRAVA_API_BASE = "https://www.strava.com/api/v3";

export function getStravaAuthUrl(userId?: string): string {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;
  const scope = "read,activity:read_all";
  const state = userId || "new";
  return `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${state}`;
}

export async function exchangeStravaCode(
  code: string
): Promise<{ athlete: any; token: Omit<StravaToken, "user_id"> }> {
  const res = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Strava token exchange failed: ${err}`);
  }

  const data = await res.json();
  return {
    athlete: data.athlete,
    token: {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
    },
  };
}

export async function refreshStravaToken(
  userId: string,
  refreshToken: string
): Promise<string> {
  const res = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) throw new Error("Failed to refresh Strava token");

  const data = await res.json();

  await supabaseServer.from("strava_tokens").upsert({
    user_id: userId,
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
    updated_at: new Date().toISOString(),
  });

  return data.access_token;
}

export async function getValidAccessToken(userId: string): Promise<string | null> {
  const { data: tokenRow } = await supabaseServer
    .from("strava_tokens")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!tokenRow) return null;

  const now = Math.floor(Date.now() / 1000);
  if (tokenRow.expires_at > now + 300) {
    return tokenRow.access_token;
  }

  // Refresh needed
  return refreshStravaToken(userId, tokenRow.refresh_token);
}

export async function fetchRecentActivities(
  accessToken: string,
  after?: number // unix timestamp
): Promise<any[]> {
  const params = new URLSearchParams({ per_page: "100" });
  if (after) params.set("after", String(after));

  const res = await fetch(
    `${STRAVA_API_BASE}/athlete/activities?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) throw new Error("Failed to fetch Strava activities");
  return res.json();
}

export function normalizeActivity(raw: any, userId: string): StravaActivity {
  return {
    id: "", // set by DB
    user_id: userId,
    strava_activity_id: raw.id,
    name: raw.name,
    type: raw.sport_type || raw.type,
    start_date: raw.start_date,
    duration_seconds: raw.moving_time || raw.elapsed_time,
    distance_meters: raw.distance || 0,
    avg_heartrate: raw.average_heartrate || null,
    max_heartrate: raw.max_heartrate || null,
    total_elevation_gain: raw.total_elevation_gain || null,
    average_speed: raw.average_speed || null,
    average_watts: raw.average_watts || null,
    suffer_score: raw.suffer_score || null,
    strava_url: `https://www.strava.com/activities/${raw.id}`,
  };
}
