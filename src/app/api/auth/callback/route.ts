import { NextRequest, NextResponse } from "next/server";
import { exchangeStravaCode } from "@/lib/strava";
import { supabaseServer } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?error=strava_denied`);
  }

  try {
    const { athlete, token } = await exchangeStravaCode(code);

    // Upsert user
    const { data: user, error: userErr } = await supabaseServer
      .from("users")
      .upsert(
        {
          strava_athlete_id: athlete.id,
          name: `${athlete.firstname} ${athlete.lastname}`,
          email: athlete.email || null,
          avatar_url: athlete.profile || null,
        },
        { onConflict: "strava_athlete_id" }
      )
      .select()
      .single();

    if (userErr || !user) {
      console.error("User upsert error:", userErr);
      return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?error=db_error`);
    }

    // Save token
    await supabaseServer.from("strava_tokens").upsert({
      user_id: user.id,
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      expires_at: token.expires_at,
      updated_at: new Date().toISOString(),
    });

    // Set a simple session cookie with the user ID
    const res = NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
    res.cookies.set("ironsuhba_uid", user.id, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Strava callback error:", msg);
    return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?error=auth_failed&detail=${encodeURIComponent(msg)}`);
  }
}
