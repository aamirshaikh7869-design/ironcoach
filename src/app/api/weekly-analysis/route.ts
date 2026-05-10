import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabase";
import { TRAINING_PLAN, getWeekActivities } from "@/lib/training-plan";
import { StravaActivity, WeekActuals } from "@/lib/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function buildAnalysisPrompt(
  weekNumber: number,
  actuals: WeekActuals,
  athleteName: string
): string {
  const week = TRAINING_PLAN.find((w) => w.weekNumber === weekNumber);
  if (!week) return "";

  const compliance = week.totalHours > 0
    ? Math.round(((actuals.totalMinutes / 60) / week.totalHours) * 100)
    : 0;

  const allSessions = [...actuals.swimSessions, ...actuals.bikeSessions, ...actuals.runSessions];

  const sessionDetails = allSessions.map((a) => {
    const distMi = (a.distance_meters || 0) / 1609.34;
    const distYd = (a.distance_meters || 0) * 1.09361;
    const mins = a.duration_seconds / 60;
    const isRun = a.type.toLowerCase().includes("run");
    const isSwim = a.type.toLowerCase().includes("swim");
    const isBike = ["ride","virtualride"].some(t => a.type.toLowerCase().includes(t));

    const paceStr = isRun && distMi > 0.1
      ? `${Math.floor(mins/distMi)}:${Math.round((mins/distMi%1)*60).toString().padStart(2,"0")}/mi`
      : isBike && distMi > 0.1
      ? `${(distMi/(mins/60)).toFixed(1)}mph`
      : isSwim && distYd > 50
      ? `${Math.floor(mins/(distYd/100))}:${Math.round((mins/(distYd/100)%1)*60).toString().padStart(2,"0")}/100yd`
      : "";

    return `  • ${a.type}: "${a.name}"
    Distance: ${isSwim ? `${Math.round(distYd)}yd` : `${distMi.toFixed(2)}mi`}
    Duration: ${Math.round(mins)}min
    Pace/Speed: ${paceStr || "n/a"}
    Avg HR: ${a.avg_heartrate ? `${Math.round(a.avg_heartrate)}bpm` : "not recorded"}
    Max HR: ${a.max_heartrate ? `${Math.round(a.max_heartrate)}bpm` : "not recorded"}
    ${a.average_watts ? `Avg Power: ${Math.round(a.average_watts)}W` : ""}
    ${a.total_elevation_gain ? `Elevation: ${Math.round(a.total_elevation_gain * 3.281)}ft` : ""}`;
  }).join("\n");

  return `You are a world-class triathlon coach with a PhD in exercise science and 15+ years of experience training age-group triathletes. You have completed multiple Ironman and 70.3 races yourself. Analyze ${athleteName}'s training for their Augusta 70.3 (Sep 27, 2026).

ATHLETE PROFILE:
- Current fitness: comfortable 4–5mi run at ~9:00/mi, 25mi bike casual, swim beginner
- Race targets: Swim ~45–50min (2:05–2:15/100yd), Bike ~3:00–3:15 (17–18.5mph), Run ~2:20–2:45 (10:30–11:30/mi)
- Training zones based on run fitness:
  • Z1 (Recovery): >11:30/mi run, <14mph bike
  • Z2 (Aerobic base): 10:00–11:30/mi run, 14–16mph bike — THIS IS WHERE MOST TRAINING SHOULD HAPPEN
  • Z3 (Tempo): 9:00–10:00/mi run, 16–18mph bike
  • Z4 (Threshold): 8:00–9:00/mi run, 18–20mph bike
  • Z5 (VO2max): <8:00/mi run — intervals only, very short

PLANNED WEEK ${weekNumber} (${week.startDate} – ${week.endDate}):
- Phase: ${week.phase.toUpperCase()} ${week.isResidencyConstrained ? "⚕ RESIDENCY WEEK" : ""}
- Target: Swim ${week.swimMeters}m / Bike ${week.bikeMiles}mi / Run ${week.runMiles}mi
- Total target: ${week.totalHours}hrs
- Phase focus: ${week.focusAreas.join(", ")}
- Key workouts prescribed:
${week.keyWorkouts.map(w => `  • ${w.sport.toUpperCase()} — ${w.label}: ${w.structure}
    Target zone: ${w.zone}
    ${w.targetPace ? `Target pace: ${w.targetPace}` : ""}${w.targetSpeed ? `Target speed: ${w.targetSpeed}` : ""}${w.targetPacePer100yd ? `Target swim pace: ${w.targetPacePer100yd}` : ""}`).join("\n")}

WHAT ${athleteName.toUpperCase()} ACTUALLY COMPLETED:
- Swim: ${Math.round(actuals.swimMeters)}m in ${actuals.swimMinutes}min (${actuals.swimSessions.length} sessions)
- Bike: ${actuals.bikeMiles.toFixed(1)}mi in ${actuals.bikeMinutes}min (${actuals.bikeSessions.length} sessions)
- Run: ${actuals.runMiles.toFixed(1)}mi in ${actuals.runMinutes}min (${actuals.runSessions.length} sessions)
- Total: ${(actuals.totalMinutes/60).toFixed(1)}hrs (${compliance}% of ${week.totalHours}hr target)

${allSessions.length === 0
  ? "⚠️ ZERO ACTIVITIES LOGGED THIS WEEK"
  : `DETAILED SESSION DATA:\n${sessionDetails}`}

Write a precise, evidence-based coaching analysis. Use specific numbers. Call out pace zones by name. Be direct — this athlete is preparing for an objective goal (6:30–7:00 finish) and needs honest feedback, not cheerleading.

Structure:
## Week ${weekNumber} Summary
2–3 sentences on overall execution vs plan.

## Performance Metrics Analysis
Break down the data sport by sport. For each session with HR data: assess whether they were in the right zone. For runs: was the pace appropriate for Z2 aerobic building vs the intended session? Flag if they went too hard on easy days (common mistake). For bike: assess speed relative to targets and what that suggests about fitness. For swim: pace per 100yd trend and what it means for race readiness.

## What's Working
1–2 specific, data-backed callouts.

## Coaching Corrections
Direct, specific adjustments. If they ran easy days too fast (a pace under 10:00/mi on base days = too hard for a 9:00/mi runner), call it out with the science: "Running Z2 at 9:15/mi when your aerobic threshold is ~10:00/mi accumulates fatigue without building aerobic base." Reference actual session data.

## Next Week's Targets
Give specific, personalized targets for each sport based on their current data:
- Run: exact pace range for each session type
- Bike: exact speed targets or power if available
- Swim: pace per 100yd target

## Race Readiness
One honest sentence. Where does this athlete stand for a 6:30–7:00 Augusta finish?

Tone: the best coach you ever had — the one who actually made you faster.`;
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("ironsuhba_uid")?.value;

  if (!userId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { weekNumber } = await req.json();
  if (!weekNumber) {
    return Response.json({ error: "weekNumber required" }, { status: 400 });
  }

  // Get user info
  const { data: user } = await supabaseServer
    .from("users")
    .select("name")
    .eq("id", userId)
    .single();

  const athleteName = user?.name?.split(" ")[0] || "Athlete";

  // Get all activities
  const { data: activities } = await supabaseServer
    .from("activities")
    .select("*")
    .eq("user_id", userId)
    .order("start_date", { ascending: true });

  const week = TRAINING_PLAN.find((w) => w.weekNumber === weekNumber);
  if (!week) {
    return Response.json({ error: "Week not found" }, { status: 404 });
  }

  const actuals = getWeekActivities((activities || []) as StravaActivity[], week);
  const compliance =
    week.totalHours > 0
      ? Math.round(((actuals.totalMinutes / 60) / week.totalHours) * 100)
      : 0;

  const prompt = buildAnalysisPrompt(weekNumber, actuals, athleteName);
  if (!prompt) {
    return Response.json({ error: "Could not build prompt" }, { status: 500 });
  }

  let stream: Awaited<ReturnType<typeof client.messages.stream>>;
  try {
    stream = await client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });
  } catch (err) {
    console.error("Anthropic stream error:", err);
    return Response.json({ error: "AI analysis unavailable" }, { status: 502 });
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
      } catch (err) {
        console.error("Stream read error:", err);
      } finally {
        controller.close();
      }
    },
  });

  // Save analysis to DB in background (fire and forget)
  stream.finalMessage().then(async (msg: Awaited<ReturnType<typeof stream.finalMessage>>) => {
    const analysisText =
      msg.content[0].type === "text" ? msg.content[0].text : "";
    await supabaseServer.from("weekly_analyses").upsert(
      {
        user_id: userId,
        week_number: weekNumber,
        analysis_text: analysisText,
        compliance_percentage: compliance,
        created_at: new Date().toISOString(),
      },
      { onConflict: "user_id,week_number" }
    );
  }).catch(console.error);

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
