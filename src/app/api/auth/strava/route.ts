import { NextRequest } from "next/server";
import { getStravaAuthUrl } from "@/lib/strava";

export async function GET(req: NextRequest) {
  const url = getStravaAuthUrl();
  return Response.redirect(url);
}
