import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabase";
import { TRAINING_PLAN } from "@/lib/training-plan";
import { StravaActivity } from "@/lib/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Tools Claude can call ────────────────────────────────────────────────────

const TOOLS: Anthropic.Tool[] = [
  {
    name: "update_week_targets",
    description:
      "Adjust training volume targets for a specific week. Use this when recommending schedule changes — apply the change, don't just suggest it. You can update any combination of swim/bike/run targets. Always explain your rationale in the accompanying text.",
    input_schema: {
      type: "object" as const,
      properties: {
        week_number: {
          type: "number",
          description: "Week number to update (1–20)",
        },
        swim_meters: {
          type: "number",
          description: "New swim target in meters (omit to leave unchanged)",
        },
        bike_miles: {
          type: "number",
          description: "New bike target in miles (omit to leave unchanged)",
        },
        run_miles: {
          type: "number",
          description: "New run target in miles (omit to leave unchanged)",
        },
        reason: {
          type: "string",
          description:
            "Brief reason shown in the UI (e.g. 'Reduced to allow recovery after high-volume week')",
        },
      },
      required: ["week_number", "reason"],
    },
  },
  {
    name: "update_day_schedule",
    description:
      "Replace the session plan for a specific day within a training week. Use this when the athlete wants to swap workouts, move sessions between days, add or remove a session, or restructure a day. This directly updates the weekly schedule dashboard. Replaces ALL sessions for the specified day — include every session you want that day (not just the change). Use update_week_targets separately if volume totals also need updating.",
    input_schema: {
      type: "object" as const,
      properties: {
        week_number: {
          type: "number",
          description: "Week number (1–20)",
        },
        day: {
          type: "string",
          enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          description: "Day of the week to update",
        },
        sessions: {
          type: "array",
          description: "Full list of sessions for this day (replaces existing). Use an array with a single rest session to make it a rest day.",
          items: {
            type: "object",
            properties: {
              sport: {
                type: "string",
                enum: ["swim", "bike", "run", "strength", "brick", "rest"],
              },
              label: {
                type: "string",
                description: "Short session name (e.g. 'Easy road ride', 'Swim drills + laps')",
              },
              duration: {
                type: "number",
                description: "Duration in minutes",
              },
              distance: {
                type: "number",
                description: "Distance (optional)",
              },
              distanceUnit: {
                type: "string",
                enum: ["mi", "m"],
                description: "Unit for distance",
              },
              isKeyWorkout: {
                type: "boolean",
                description: "Flag as key/priority workout for the week",
              },
              note: {
                type: "string",
                description: "Coaching note shown on the card (e.g. '7am · Z2 · keep HR under 140')",
              },
            },
            required: ["sport", "label", "duration"],
          },
        },
        reason: {
          type: "string",
          description: "Brief reason shown in the UI (e.g. 'Moved swim to Thursday to allow upper body recovery')",
        },
      },
      required: ["week_number", "day", "sessions", "reason"],
    },
  },
];

// ─── System prompt ────────────────────────────────────────────────────────────

function buildSystemPrompt(
  athleteName: string,
  activities: StravaActivity[],
  weekOverrides: Record<number, { swim_meters?: number; bike_miles?: number; run_miles?: number; reason?: string }>,
  dayOverrides: Record<string, { sessions: Record<string, unknown>[]; reason?: string }>
): string {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recent = activities
    .filter((a) => new Date(a.start_date).getTime() > thirtyDaysAgo)
    .slice(0, 25);

  const activityLines = recent.map((a) => {
    const distMi = (a.distance_meters || 0) / 1609.34;
    const distYd = (a.distance_meters || 0) * 1.09361;
    const mins = a.duration_seconds / 60;
    const isSwim = a.type.toLowerCase().includes("swim");
    const isRun = a.type.toLowerCase().includes("run");
    const isBike = ["ride", "virtualride"].some((t) =>
      a.type.toLowerCase().includes(t)
    );

    let pace = "n/a";
    if (isRun && distMi > 0.1) {
      const mpm = mins / distMi;
      pace = `${Math.floor(mpm)}:${Math.round((mpm % 1) * 60).toString().padStart(2, "0")}/mi`;
    } else if (isBike && distMi > 0.1) {
      pace = `${(distMi / (mins / 60)).toFixed(1)} mph`;
    } else if (isSwim && distYd > 50) {
      const p = mins / (distYd / 100);
      pace = `${Math.floor(p)}:${Math.round((p % 1) * 60).toString().padStart(2, "0")}/100yd`;
    }

    const dateStr = new Date(a.start_date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const dist = isSwim ? `${Math.round(distYd)}yd` : `${distMi.toFixed(1)}mi`;
    const hr = a.avg_heartrate ? ` · ${Math.round(a.avg_heartrate)}bpm` : "";
    const watts = a.average_watts ? ` · ${Math.round(a.average_watts)}W` : "";
    return `  ${dateStr}  ${a.type.padEnd(12)}  ${dist.padEnd(8)}  ${Math.round(mins)}min  ${pace}${hr}${watts}`;
  });

  const planLines = TRAINING_PLAN.map((w) => {
    const ov = weekOverrides[w.weekNumber];
    const swim = ov?.swim_meters ?? w.swimMeters;
    const bike = ov?.bike_miles ?? w.bikeMiles;
    const run = ov?.run_miles ?? w.runMiles;
    const tag = ov ? " [COACH-ADJUSTED]" : "";
    const residency = w.isResidencyConstrained ? " ⚕" : "";
    return `  Wk ${String(w.weekNumber).padStart(2)}  ${w.startDate}  ${w.phase.padEnd(5)}${residency}  Swim ${swim}m  Bike ${bike}mi  Run ${run}mi  ${w.totalHours}h${tag}`;
  });

  const dayOverrideLines: string[] = [];
  for (const key of Object.keys(dayOverrides).sort()) {
    const ov = dayOverrides[key];
    const sessionSummary = ov.sessions.map((s) => {
      const dist = s.distance ? ` ${s.distance}${s.distanceUnit ?? ""}` : "";
      return `${s.sport}:${s.label}${dist} (${s.duration}min)`;
    }).join(", ");
    dayOverrideLines.push(`  ${key}: ${sessionSummary}${ov.reason ? ` — ${ov.reason}` : ""} [COACH-ADJUSTED]`);
  }

  return `You are ${athleteName}'s personal triathlon coach — expert-level credentials:
• PhD in exercise physiology (dissertation on lactate dynamics in endurance sport)
• 12 Ironman finishes, 30+ 70.3 finishes as an age-grouper
• 15 years coaching age-group athletes, specializing in time-crunched professionals

Your coaching canon:
• Joe Friel — "The Triathlon Training Bible" (foundational periodization, CTL/ATL, TSS)
• Matt Dixon — "The Well-Built Triathlete" (work-life-training balance for professionals)
• Stephen Seiler — 80/20 polarized training research (most training in Z1-Z2, not "medium")
• Dr. Andy Coggan — power training, Training Stress Score methodology
• Iñigo Mujika — tapering research and supercompensation

TARGET RACE: Augusta 70.3, September 27, 2026
TARGET FINISH: 6:30–7:00 total
  Swim 1.2mi: 45–50min (~2:05–2:15/100yd)
  Bike 56mi: 3:00–3:15 (17–18.5mph)
  Run 13.1mi: 2:20–2:45 (10:30–11:30/mi)

ATHLETE: ${athleteName}
• Current run fitness: 9:00/mi comfortable for 4–5mi
• Current bike: 25mi casual (~14–15mph)
• Swim: beginner, building
• Occupation: Medical resident — high cognitive load, irregular schedule, elevated life stress
  → Per Dixon: non-training stress counts as training load. Respect it.

TRAINING ZONES
  Run:  Z1 >11:30/mi | Z2 10:00–11:30/mi | Z3 9:00–10:00/mi | Z4 8:00–9:00/mi | Z5 <8:00/mi
  Bike: Z1 <14mph    | Z2 14–16mph        | Z3 16–18mph       | Z4 18–20mph
  Swim: Z2 target ~2:05–2:15/100yd
  → Friel: 75–80% of weekly volume in Z1–Z2. Junk miles at Z3 are the #1 age-grouper mistake.

RECENT ACTIVITIES (last 30 days):
${activityLines.length > 0 ? activityLines.join("\n") : "  (no activities logged)"}

TRAINING PLAN (current state — modify volume with update_week_targets, modify daily sessions with update_day_schedule):
${planLines.join("\n")}
${dayOverrideLines.length > 0 ? `\nCOACH-ADJUSTED DAY SCHEDULES:\n${dayOverrideLines.join("\n")}` : ""}

BEHAVIOR RULES:
1. Be direct and specific. Quote actual numbers from their activity data.
2. When you recommend a schedule change, USE THE TOOL to apply it immediately. Don't just suggest — commit.
   • Use update_week_targets to change swim/bike/run volume totals.
   • Use update_day_schedule to change what sessions appear on a specific day (move workouts, add rest days, restructure the week).
   • Use both tools together when restructuring requires both a volume change and day-level session changes.
3. Cite specific science when it adds value (e.g., "Seiler's research shows Z2 training drives ~80% of mitochondrial adaptation").
4. Flag zone violations with the consequence ("Running 9:10/mi on a Z2 day accumulates lactate without building aerobic base — you're getting the fatigue without the adaptation").
5. Keep responses concise. Bullet points > paragraphs. Numbers > adjectives.`;
}

// ─── Execute a tool call ──────────────────────────────────────────────────────

async function executeTool(
  userId: string,
  name: string,
  input: Record<string, unknown>
): Promise<{ ok: boolean; msg: string; display: Record<string, unknown> }> {
  if (name === "update_week_targets") {
    const weekNum = input.week_number as number;
    const week = TRAINING_PLAN.find((w) => w.weekNumber === weekNum);
    if (!week) return { ok: false, msg: `Week ${weekNum} not found`, display: {} };

    const update: Record<string, unknown> = {
      user_id: userId,
      week_number: weekNum,
      reason: input.reason,
      created_at: new Date().toISOString(),
    };
    if (input.swim_meters !== undefined) update.swim_meters = input.swim_meters;
    if (input.bike_miles !== undefined) update.bike_miles = input.bike_miles;
    if (input.run_miles !== undefined) update.run_miles = input.run_miles;

    const { error } = await supabaseServer
      .from("week_overrides")
      .upsert(update, { onConflict: "user_id,week_number" });

    if (error) {
      return { ok: false, msg: `DB error: ${error.message}`, display: {} };
    }

    const changes: string[] = [];
    if (input.swim_meters !== undefined)
      changes.push(`Swim: ${week.swimMeters}m → ${input.swim_meters}m`);
    if (input.bike_miles !== undefined)
      changes.push(`Bike: ${week.bikeMiles}mi → ${input.bike_miles}mi`);
    if (input.run_miles !== undefined)
      changes.push(`Run: ${week.runMiles}mi → ${input.run_miles}mi`);

    return {
      ok: true,
      msg: `Week ${weekNum} updated successfully`,
      display: {
        week_number: weekNum,
        changes,
        reason: input.reason,
      },
    };
  }
  if (name === "update_day_schedule") {
    const weekNum = input.week_number as number;
    const day = input.day as string;
    const sessions = input.sessions as object[];

    if (!weekNum || !day || !Array.isArray(sessions)) {
      return { ok: false, msg: "Missing required fields", display: {} };
    }

    const { error } = await supabaseServer
      .from("day_schedule_overrides")
      .upsert(
        {
          user_id: userId,
          week_number: weekNum,
          day,
          sessions,
          reason: input.reason,
          created_at: new Date().toISOString(),
        },
        { onConflict: "user_id,week_number,day" }
      );

    if (error) {
      return { ok: false, msg: `DB error: ${error.message}`, display: {} };
    }

    const sessionLines = (sessions as Record<string, unknown>[]).map((s) => {
      const dist = s.distance ? ` · ${s.distance}${s.distanceUnit ?? ""}` : "";
      const dur = s.duration ? ` · ${s.duration}min` : "";
      return `${s.label}${dist}${dur}`;
    });

    return {
      ok: true,
      msg: `Week ${weekNum} ${day} schedule updated`,
      display: {
        week_number: weekNum,
        day,
        sessions: sessionLines,
        reason: input.reason as string,
      },
    };
  }

  return { ok: false, msg: "Unknown tool", display: {} };
}

// ─── GET — load chat history ──────────────────────────────────────────────────

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("ironsuhba_uid")?.value;
  if (!userId) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { data } = await supabaseServer
    .from("coach_messages")
    .select("id, role, content, tool_events, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(120);

  return Response.json({ messages: data || [] });
}

// ─── POST — send message ──────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("ironsuhba_uid")?.value;
  if (!userId) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { messages } = await req.json() as {
    messages: { role: "user" | "assistant"; content: string }[];
  };

  if (!messages?.length) {
    return Response.json({ error: "messages required" }, { status: 400 });
  }

  // Load context from DB
  const [{ data: user }, { data: activities }, { data: overrideRows }, { data: dayOverrideRows }] = await Promise.all([
    supabaseServer.from("users").select("name").eq("id", userId).single(),
    supabaseServer
      .from("activities")
      .select("*")
      .eq("user_id", userId)
      .order("start_date", { ascending: false })
      .limit(100),
    supabaseServer
      .from("week_overrides")
      .select("*")
      .eq("user_id", userId),
    supabaseServer
      .from("day_schedule_overrides")
      .select("*")
      .eq("user_id", userId),
  ]);

  const athleteName = user?.name?.split(" ")[0] || "Athlete";
  const weekOverrides: Record<number, { swim_meters?: number; bike_miles?: number; run_miles?: number; reason?: string }> = {};
  for (const row of overrideRows || []) {
    weekOverrides[row.week_number] = row;
  }
  const dayOverrides: Record<string, { sessions: Record<string, unknown>[]; reason?: string }> = {};
  for (const row of dayOverrideRows || []) {
    dayOverrides[`Wk${row.week_number}-${row.day}`] = { sessions: row.sessions, reason: row.reason };
  }

  const systemPrompt = buildSystemPrompt(athleteName, (activities || []) as StravaActivity[], weekOverrides, dayOverrides);

  // Save the user's latest message
  const lastUserMsg = messages[messages.length - 1];
  await supabaseServer.from("coach_messages").insert({
    user_id: userId,
    role: "user",
    content: lastUserMsg.content,
  });

  // ─── Streaming response via TransformStream ────────────────────────────────
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  const send = (data: object) => {
    writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
  };

  // Run async logic without blocking
  (async () => {
    let assistantText = "";
    let collectedToolEvents: object[] = [];

    try {
      const anthropicMessages: Anthropic.MessageParam[] = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // ── First pass: stream with potential tool use ──────────────────────────
      const stream = client.messages.stream({
        model: "claude-sonnet-4-6",
        max_tokens: 2048,
        system: systemPrompt,
        messages: anthropicMessages,
        tools: TOOLS,
      });

      const toolUses: { id: string; name: string; inputJson: string }[] = [];
      let currentTool: { id: string; name: string; inputJson: string } | null = null;

      for await (const event of stream) {
        if (event.type === "content_block_start") {
          if (event.content_block.type === "tool_use") {
            currentTool = {
              id: event.content_block.id,
              name: event.content_block.name,
              inputJson: "",
            };
          }
        }
        if (event.type === "content_block_delta") {
          if (event.delta.type === "text_delta") {
            assistantText += event.delta.text;
            send({ t: "text", v: event.delta.text });
          } else if (event.delta.type === "input_json_delta" && currentTool) {
            currentTool.inputJson += event.delta.partial_json;
          }
        }
        if (event.type === "content_block_stop" && currentTool) {
          toolUses.push({ ...currentTool });
          currentTool = null;
        }
      }

      const finalMsg = await stream.finalMessage();

      // ── Tool use turn ──────────────────────────────────────────────────────
      if (finalMsg.stop_reason === "tool_use" && toolUses.length > 0) {
        const toolResults: Anthropic.ToolResultBlockParam[] = [];

        for (const tool of toolUses) {
          let input: Record<string, unknown> = {};
          try {
            input = JSON.parse(tool.inputJson || "{}");
          } catch {}

          const result = await executeTool(userId, tool.name, input);
          const toolEvent = { t: "tool", name: tool.name, ok: result.ok, msg: result.msg, display: result.display };
          collectedToolEvents.push(toolEvent);
          send(toolEvent);

          toolResults.push({
            type: "tool_result",
            tool_use_id: tool.id,
            content: result.msg,
          });
        }

        // ── Continue conversation after tool use ───────────────────────────
        const continuedMessages: Anthropic.MessageParam[] = [
          ...anthropicMessages,
          { role: "assistant", content: finalMsg.content },
          { role: "user", content: toolResults },
        ];

        const stream2 = client.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 1536,
          system: systemPrompt,
          messages: continuedMessages,
          tools: TOOLS,
          tool_choice: { type: "none" }, // prevent infinite tool loops
        });

        for await (const event of stream2) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            assistantText += event.delta.text;
            send({ t: "text", v: event.delta.text });
          }
        }
      }

      send({ t: "end" });

      // ── Persist assistant message ──────────────────────────────────────────
      await supabaseServer.from("coach_messages").insert({
        user_id: userId,
        role: "assistant",
        content: assistantText,
        tool_events: collectedToolEvents.length > 0 ? collectedToolEvents : null,
      });
    } catch (err) {
      console.error("Coach chat error:", err);
      send({ t: "error", msg: "Coach is unavailable right now. Try again." });
    } finally {
      writer.close();
    }
  })();

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
