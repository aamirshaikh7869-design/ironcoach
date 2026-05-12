"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  TRAINING_PLAN,
  getCurrentWeek,
  getDaysUntilRace,
  getWeekActivities,
  buildFitnessProfile,
  generateWeekSchedule,
} from "@/lib/training-plan";
import { StravaActivity, TrainingWeek, WeekActuals, FitnessProfile, DaySchedule, WeekOverride, ChatMessage, ToolEvent } from "@/lib/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtPace(secPerMile: number) {
  const m = Math.floor(secPerMile / 60);
  const s = Math.round(secPerMile % 60);
  return `${m}:${s.toString().padStart(2, "0")}/mi`;
}
function fmtPacePer100m(minPer100m: number) {
  const m = Math.floor(minPer100m);
  const s = Math.round((minPer100m % 1) * 60);
  return `${m}:${s.toString().padStart(2, "0")}/100m`;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function SwimIcon({ size = 15 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12c.6.5 1.2 1 2.5 1C7 13 7 11 9.5 11s2.4 2 5 2 2.5-2 5-2c1.3 0 1.9.5 2.5 1"/><path d="M2 19c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.4 2 5 2 2.5-2 5-2c1.3 0 1.9.5 2.5 1"/><circle cx="12" cy="5" r="2"/><path d="M9 8l3-3 3 3"/></svg>;
}
function BikeIcon({ size = 15 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>;
}
function RunIcon({ size = 15 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13" cy="4" r="2"/><path d="M5.6 11.4 8 8l3 3 3-3 3.4 3.4"/><path d="M9 12l-1.6 5L6 20"/><path d="M14.6 12.6 16 17l2 3"/></svg>;
}
function StrengthIcon({ size = 15 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 6.5h11"/><path d="M6.5 17.5h11"/><path d="M3 9.5h2v5H3z"/><path d="M19 9.5h2v5h-2z"/><path d="M5 12h14"/></svg>;
}
function CheckIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function SyncIcon({ spinning }: { spinning: boolean }) {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: spinning ? "spin 1s linear infinite" : "none" }}><style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>;
}

const SPORT_COLOR: Record<string, string> = {
  swim: "var(--cyan)", bike: "var(--orange)", run: "var(--green)",
  strength: "#D29922", brick: "#A78BFA", rest: "var(--muted)",
};
const SPORT_ICON: Record<string, React.ReactNode> = {
  swim: <SwimIcon />, bike: <BikeIcon />, run: <RunIcon />,
  strength: <StrengthIcon />, brick: <BikeIcon />, rest: null,
};

// ─── Weekly Schedule Component ────────────────────────────────────────────────

// ─── Zone guide (Joe Friel / exercise science consensus for this athlete) ──────

const ZONE_GUIDE: Record<string, Record<string, { label: string; range: string; feel: string; science: string }>> = {
  run: {
    "1": {
      label: "Z1 — Recovery",
      range: ">11:30/mi",
      feel: "So easy it almost feels wrong. You could sing. Nose-breathe the whole thing.",
      science: "Keeps blood flowing without creating fatigue. Pure recovery — don't go harder.",
    },
    "2": {
      label: "Z2 — Aerobic Base",
      range: "10:00–11:30/mi",
      feel: "Full conversation pace. Complete sentences with no gasping. If you're breathing hard, slow down.",
      science: "This is where your aerobic engine is built — mitochondrial density, fat oxidation, capillary development. Friel's Triathlon Training Bible: 70–80% of all training volume should be here. Going faster feels better but produces less aerobic adaptation.",
    },
    "3": {
      label: "Z3 — Tempo",
      range: "9:00–10:00/mi",
      feel: "Comfortably uncomfortable. You can say a few words but not a sentence. Sustainable for about 60 min.",
      science: "Raises lactate threshold — the speed at which your body switches from fat to carb burning. Use sparingly (10–15% of weekly volume).",
    },
    "4": {
      label: "Z4 — Threshold",
      range: "8:00–9:00/mi",
      feel: "Hard. A word or two only. This is 'race-hard.' Max 20–30 min at this effort.",
      science: "Interval work. Builds speed and VO2max ceiling. Requires full recovery after.",
    },
    "5": {
      label: "Z5 — VO2max",
      range: "<8:00/mi",
      feel: "All out. Can't speak. Only maintainable for 30 sec – 2 min per rep.",
      science: "Stresses the cardiovascular ceiling. Rarely used in 70.3 prep — risk of injury/overtraining outweighs benefit for long-course athletes.",
    },
  },
  bike: {
    "1": {
      label: "Z1 — Recovery",
      range: "<14mph",
      feel: "Easy spinning. Legs moving, heart rate barely elevated. Could ride indefinitely.",
      science: "Active recovery only. Gets blood into the legs after a hard session without adding training stress.",
    },
    "2": {
      label: "Z2 — Aerobic Base",
      range: "14–16mph",
      feel: "Conversational pace. Full sentences. You should be able to hold a full conversation — if you can't, back off. Cadence 85–95rpm.",
      science: "This is your race-building zone for Augusta. The bike leg is 3+ hours — your body needs to be trained to burn fat efficiently at this effort level. Most of your long rides belong here. Going faster feels productive but trains the wrong energy system.",
    },
    "3": {
      label: "Z3 — Tempo",
      range: "16–18mph",
      feel: "Working but controlled. Short sentences. Your Augusta race pace target — sustainable for 3+ hours once trained.",
      science: "Race-specific effort. Interval sets at this pace build the fitness to hold 17–18mph for 56 miles. Use for intervals and race-pace practice.",
    },
    "4": {
      label: "Z4 — Threshold",
      range: "18–20mph",
      feel: "Hard. Few words. This is maximal sustainable effort — 20–30 min only.",
      science: "Used in specific threshold intervals to raise your ceiling. Not race pace for a 70.3.",
    },
  },
  swim: {
    "1": {
      label: "Z1 — Recovery",
      range: "3:00+/100m",
      feel: "Just moving. Drills, technique focus, no pace pressure.",
      science: "Water feel and mechanics. Getting comfortable, not training energy systems.",
    },
    "2": {
      label: "Z2 — Aerobic",
      range: "2:20–2:45/100m",
      feel: "Smooth and controlled. Long strokes, full exhale underwater. If you're gasping at the wall, slow down.",
      science: "Where your swim aerobic base is built. Technique holds, stroke rate is steady.",
    },
    "3": {
      label: "Z3 — Race Pace",
      range: "2:05–2:20/100m",
      feel: "Focused effort. Technique still holds but you're working. This is your Augusta target pace.",
      science: "Race-specific. Practiced in intervals so your neuromuscular system knows this pattern on race day.",
    },
  },
  strength: {
    "0": {
      label: "Strength Session",
      range: "2×/week base, 1×/week peak",
      feel: "Heavy enough that the last 2 reps of each set are hard. Light enough to maintain perfect form.",
      science: "Triathlon strength work targets: unilateral hip hinge (run economy), glute power (bike/run engine), pull strength (swim), anti-rotation core (all three sports). Friel emphasizes: strength training reduces injury risk and improves power-to-weight — both critical for a 6:30–7:00 finish.",
    },
  },
};

function getZoneInfo(sport: string, note: string, label: string) {
  const combined = (note + " " + label).toLowerCase();
  const guide = ZONE_GUIDE[sport] ?? ZONE_GUIDE.run;

  // Find the highest zone mentioned (Z4 before Z2, etc.)
  for (const z of ["5","4","3","2","1","0"]) {
    if (combined.includes(`z${z}`) || combined.includes(`zone ${z}`)) {
      return guide[z] ?? null;
    }
  }
  // Defaults by sport/keyword
  if (sport === "strength") return ZONE_GUIDE.strength["0"];
  if (combined.includes("easy") || combined.includes("recovery")) return guide["1"] ?? guide["2"] ?? null;
  if (combined.includes("tempo") || combined.includes("interval") || combined.includes("quality")) return guide["3"] ?? null;
  if (combined.includes("race pace") || combined.includes("race-pace")) return guide["3"] ?? null;
  return guide["2"] ?? null; // default to Z2
}

function SessionModal({
  sess,
  day,
  done,
  onClose,
}: {
  sess: DaySchedule["sessions"][0];
  day: string;
  done: boolean;
  onClose: () => void;
}) {
  const color = SPORT_COLOR[sess.sport];
  const zoneInfo = sess.sport !== "rest" ? getZoneInfo(sess.sport, sess.note ?? "", sess.label) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid var(--border)", background: color + "12" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: color + "25", color }}>
            {SPORT_ICON[sess.sport] ? <span style={{ transform: "scale(1.3)", display: "block" }}>{SPORT_ICON[sess.sport]}</span> : null}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base" style={{ color: "var(--text)" }}>{sess.label}</span>
              {done && <span className="badge badge-green text-xs">✓ Done</span>}
              {sess.isKeyWorkout && <span className="badge text-xs" style={{ background: color + "25", color }}>KEY ★</span>}
            </div>
            <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
              {day}
              {sess.distance ? ` · ${sess.distanceUnit === "m" ? `${sess.distance}m` : `${sess.distance}mi`}` : ""}
              {sess.duration > 0 ? ` · ${sess.duration}min` : ""}
            </div>
          </div>
          <button onClick={onClose} className="text-lg leading-none flex-shrink-0" style={{ color: "var(--muted)" }}>✕</button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Coaching note */}
          {sess.note && (
            <div className="rounded-xl p-4" style={{ background: "var(--surface2)" }}>
              <div className="text-xs font-semibold mb-1.5" style={{ color: "var(--muted)" }}>SESSION FOCUS</div>
              <div className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>{sess.note}</div>
            </div>
          )}

          {/* Zone explanation */}
          {zoneInfo && (
            <div className="rounded-xl p-4" style={{ background: color + "10", border: `1px solid ${color}30` }}>
              <div className="text-xs font-semibold mb-1" style={{ color }}>{zoneInfo.label}</div>
              <div className="text-sm font-bold mb-2" style={{ color: "var(--text)" }}>{zoneInfo.range}</div>
              <div className="text-xs mb-3 leading-relaxed" style={{ color: "var(--text)" }}>
                <span className="font-semibold">How it should feel: </span>{zoneInfo.feel}
              </div>
              <div className="text-xs leading-relaxed" style={{ color: "var(--muted)", borderTop: "1px solid " + color + "20", paddingTop: 10 }}>
                <span className="font-semibold" style={{ color: "var(--muted)" }}>Why: </span>{zoneInfo.science}
              </div>
            </div>
          )}

          {/* Full zone reference for the sport */}
          {sess.sport !== "rest" && sess.sport !== "strength" && sess.sport !== "brick" && (
            <div>
              <div className="text-xs font-semibold mb-2" style={{ color: "var(--muted)" }}>
                {sess.sport.toUpperCase()} ZONE REFERENCE
              </div>
              <div className="space-y-1.5">
                {Object.entries(ZONE_GUIDE[sess.sport] ?? {}).map(([z, info]) => {
                  const isActive = zoneInfo?.label === info.label;
                  return (
                    <div key={z} className="flex items-baseline gap-2 rounded-lg px-3 py-2 text-xs"
                      style={{
                        background: isActive ? color + "18" : "var(--surface2)",
                        border: isActive ? `1px solid ${color}` : "1px solid transparent",
                      }}>
                      <span className="font-bold flex-shrink-0" style={{ color: isActive ? color : "var(--muted)", minWidth: 60 }}>
                        {info.label.split("—")[0].trim()}
                      </span>
                      <span className="font-semibold flex-shrink-0" style={{ color: isActive ? "var(--text)" : "var(--muted)", minWidth: 80 }}>
                        {info.range}
                      </span>
                      <span style={{ color: "var(--muted)" }}>{info.feel.split(".")[0]}.</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WeeklySchedule({
  schedule,
  activities,
  weekStart,
}: {
  schedule: DaySchedule[];
  activities: StravaActivity[];
  weekStart: string;
}) {
  const [modal, setModal] = useState<{ sess: DaySchedule["sessions"][0]; day: string; done: boolean } | null>(null);
  const startDate = new Date(weekStart + "T00:00:00");

  function getDateForDay(dayIdx: number) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + dayIdx);
    return d;
  }

  // Only count activities that actually fall within this week (Mon 00:00 → Sun 23:59)
  const weekEnd = new Date(startDate);
  weekEnd.setDate(startDate.getDate() + 7);

  const thisWeekActivities = activities.filter((a) => {
    const d = new Date(a.start_date);
    return d >= startDate && d < weekEnd;
  });

  function sportOf(a: StravaActivity): "swim" | "bike" | "run" | "strength" | null {
    const t = a.type.toLowerCase();
    if (t.includes("swim")) return "swim";
    if (["ride", "virtualride", "bike"].some((k) => t.includes(k))) return "bike";
    if (t.includes("run")) return "run";
    if (["weighttraining", "workout", "crossfit", "weights"].some((k) => t.includes(k))) return "strength";
    return null;
  }

  const weekCompleted: Record<string, number> = { swim: 0, bike: 0, run: 0, strength: 0 };
  for (const a of thisWeekActivities) {
    const s = sportOf(a);
    if (s) weekCompleted[s]++;
  }

  // Walk sessions Mon→Sun in order, claim the earliest slot per sport
  // A session is "done" if there are enough completed activities of that sport
  // to cover all sessions up to and including this one.
  const claimed: Record<string, number> = { swim: 0, bike: 0, run: 0, strength: 0, brick: 0 };
  const sessionDone: boolean[][] = schedule.map((dayPlan) =>
    dayPlan.sessions.map((sess) => {
      if (sess.sport === "rest") return true;
      if (sess.sport === "brick") {
        // Brick consumes one bike + one run from the weekly totals
        const bikeFree = weekCompleted.bike - claimed.bike;
        const runFree  = weekCompleted.run  - claimed.run;
        if (bikeFree > 0 && runFree > 0) {
          claimed.bike++;
          claimed.run++;
          claimed.brick++;
          return true;
        }
        return false;
      }
      const sport = sess.sport as "swim" | "bike" | "run" | "strength";
      if (weekCompleted[sport] > claimed[sport]) {
        claimed[sport]++;
        return true;
      }
      return false;
    })
  );

  const today = new Date();

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
        <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>WEEKLY SCHEDULE</span>
      </div>
      <div className="grid grid-cols-7" style={{ borderBottom: "1px solid var(--border)" }}>
        {schedule.map((dayPlan, idx) => {
          const date = getDateForDay(idx);
          const isToday = date.toDateString() === today.toDateString();
          const isPast  = date < today && !isToday;
          const doneBits = sessionDone[idx];
          const allDone     = doneBits.every(Boolean);
          const hasSomeDone = doneBits.some(Boolean);

          return (
            <div key={dayPlan.day}
              className="p-2 border-r last:border-r-0 flex flex-col gap-1.5 min-h-[120px]"
              style={{
                borderColor: "var(--border)",
                background: isToday ? "var(--orange)08" : "transparent",
              }}>
              {/* Day header */}
              <div className="flex items-center justify-between mb-1">
                <div>
                  <div className="text-xs font-bold" style={{ color: isToday ? "var(--orange)" : "var(--text)" }}>
                    {dayPlan.day}
                  </div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>
                    {date.toLocaleDateString("en-US", { month: "numeric", day: "numeric" })}
                  </div>
                </div>
                {isPast && hasSomeDone && (
                  <div className="w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: allDone ? "var(--green)" : "var(--yellow)", color: "#fff" }}>
                    {allDone ? <CheckIcon /> : <span style={{ fontSize: 8, fontWeight: 700 }}>!</span>}
                  </div>
                )}
              </div>

              {/* Sessions */}
              {dayPlan.sessions.map((sess, si) => {
                if (sess.sport === "rest") {
                  return (
                    <div key={si} className="text-xs" style={{ color: "var(--muted)" }}>REST</div>
                  );
                }
                const done = sessionDone[idx][si];
                const color = SPORT_COLOR[sess.sport];
                return (
                  <button
                    key={si}
                    onClick={() => setModal({ sess, day: `${dayPlan.day} ${date.toLocaleDateString("en-US", { month: "numeric", day: "numeric" })}`, done })}
                    className="rounded-lg px-2 py-1.5 flex flex-col gap-0.5 w-full text-left"
                    style={{
                      background: done ? color + "20" : "var(--surface2)",
                      border: `1px solid ${done ? color : "var(--border)"}`,
                      opacity: isPast && !done ? 0.5 : 1,
                      cursor: "pointer",
                    }}>
                    <div className="flex items-center gap-1">
                      <span style={{ color }}>{SPORT_ICON[sess.sport]}</span>
                      <span className="text-xs font-semibold truncate" style={{ color: done ? color : "var(--text)" }}>
                        {sess.sport.charAt(0).toUpperCase() + sess.sport.slice(1)}
                      </span>
                      {done && <CheckIcon />}
                    </div>
                    {sess.distance ? (
                      <div className="text-xs" style={{ color: "var(--muted)" }}>
                        {sess.distanceUnit === "m" ? `${sess.distance}m` : `${sess.distance}mi`}
                        {sess.duration > 0 ? ` · ${sess.duration}min` : ""}
                      </div>
                    ) : sess.duration > 0 ? (
                      <div className="text-xs" style={{ color: "var(--muted)" }}>{sess.duration}min</div>
                    ) : null}
                    {sess.isKeyWorkout && (
                      <div className="text-xs font-bold" style={{ color }}>KEY ★</div>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="px-5 py-2.5" style={{ borderTop: "1px solid var(--border)" }}>
        <span className="text-xs" style={{ color: "var(--muted)" }}>Tap any session for zone guidance and coaching notes</span>
      </div>

      {modal && (
        <SessionModal
          sess={modal.sess}
          day={modal.day}
          done={modal.done}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

// ─── Strength Tracker Component ───────────────────────────────────────────────

function StrengthTracker({
  week,
  actuals,
}: {
  week: TrainingWeek;
  actuals: WeekActuals;
}) {
  const [open, setOpen] = useState(false);
  const s = week.strengthWork;
  if (s.frequency === 0) return null;

  const done = actuals.strengthSessions.length;
  const target = s.frequency;
  const pct = Math.min((done / target) * 100, 100);

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left"
        style={{ borderBottom: open ? "1px solid var(--border)" : "none" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "#D2992220", color: "#D29922" }}>
          <StrengthIcon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>{s.label}</span>
            <span className="badge" style={{
              background: done >= target ? "var(--green-dim)" : "#D2992220",
              color: done >= target ? "var(--green)" : "#D29922",
            }}>
              {done}/{target} done
            </span>
          </div>
          <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
            {s.duration}min · {s.exercises.length} exercises · {target}×/week
          </div>
          <div className="progress-bar mt-2" style={{ width: "100%" }}>
            <div className="progress-fill" style={{ width: `${pct}%`, background: done >= target ? "var(--green)" : "#D29922" }} />
          </div>
        </div>
        <span style={{ color: "var(--muted)", fontSize: 18 }}>{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 pt-4">
          {actuals.strengthSessions.length > 0 && (
            <div className="mb-4 p-3 rounded-xl text-xs" style={{ background: "var(--green-dim)", color: "var(--green)" }}>
              ✓ {actuals.strengthSessions.length} session{actuals.strengthSessions.length > 1 ? "s" : ""} logged on Strava:{" "}
              {actuals.strengthSessions.map((a) => a.name).join(", ")}
            </div>
          )}
          <div className="text-xs italic mb-4 p-3 rounded-lg" style={{ background: "var(--surface2)", color: "var(--muted)" }}>
            Log as <strong style={{ color: "var(--text)" }}>"Weight Training"</strong> on Strava to track completion here.
            {target === 2 ? " Mon + Thu work best." : " Monday works best."}
          </div>
          <div className="space-y-2">
            {s.exercises.map((ex, i) => (
              <div key={i} className="flex gap-3 rounded-xl p-3" style={{ background: "var(--surface2)" }}>
                <div className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold"
                  style={{ background: "#D2992220", color: "#D29922" }}>{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>{ex.name}</span>
                    <span className="badge text-xs" style={{ background: "#D2992220", color: "#D29922" }}>{ex.sets}×{ex.reps}</span>
                  </div>
                  {ex.cues && <div className="text-xs italic" style={{ color: "var(--muted)" }}>{ex.cues}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Volume Summary ───────────────────────────────────────────────────────────

function SportBar({ label, icon, actual, target, unit, color }: {
  label: string; icon: React.ReactNode; actual: number; target: number; unit: string; color: string;
}) {
  const pct = target > 0 ? Math.min((actual / target) * 100, 100) : 0;
  const over = target > 0 && actual > target;
  const fmt = (n: number) => unit === "mi" ? n.toFixed(1) : unit === "m" ? Math.round(n).toLocaleString() : Math.round(n).toString();

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--text)" }}>
          <span style={{ color }}>{icon}</span>{label}
        </div>
        <div className="text-sm" style={{ color: "var(--muted)" }}>
          <span style={{ color: over ? "var(--green)" : "var(--text)", fontWeight: 600 }}>{fmt(actual)}</span>
          <span> / {fmt(target)} {unit}</span>
        </div>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%`, background: pct >= 100 ? "var(--green)" : color }} />
      </div>
    </div>
  );
}

// ─── Activity Row ─────────────────────────────────────────────────────────────

function ActivityRow({ a }: { a: StravaActivity }) {
  const sport = a.type.toLowerCase();
  const isSwim = sport.includes("swim");
  const isBike = sport.includes("ride") || sport.includes("bike");
  const isRun  = sport.includes("run");
  const isStrength = ["weighttraining", "workout", "crossfit"].some((t) => sport.includes(t));
  const color = isSwim ? "var(--cyan)" : isBike ? "var(--orange)" : isRun ? "var(--green)" : isStrength ? "#D29922" : "var(--muted)";

  const mins = Math.round(a.duration_seconds / 60);
  const distMi = (a.distance_meters || 0) / 1609.34;
  const distM  = a.distance_meters || 0;
  const distStr = isSwim && distM > 0 ? `${Math.round(distM)}m`
    : distMi > 0.1 ? `${distMi.toFixed(1)}mi` : "";

  const pace = isRun && distMi > 0.1
    ? `${Math.floor(mins/distMi)}:${Math.round((mins/distMi%1)*60).toString().padStart(2,"0")}/mi`
    : isBike && distMi > 0.1 ? `${(distMi/(mins/60)).toFixed(1)}mph`
    : isSwim && distM > 50 ? `${Math.floor(mins/(distM/100))}:${Math.round((mins/(distM/100)%1)*60).toString().padStart(2,"0")}/100m`
    : "";

  const date = new Date(a.start_date);
  const dateStr = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  return (
    <a href={a.strava_url} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-3 py-3 px-4 card-hover cursor-pointer"
      style={{ borderBottom: "1px solid var(--border)" }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: color + "20", color }}>
        {isStrength ? <StrengthIcon /> : isSwim ? <SwimIcon /> : isBike ? <BikeIcon /> : <RunIcon />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>{a.name}</div>
        <div className="text-xs" style={{ color: "var(--muted)" }}>{dateStr}</div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-sm font-medium" style={{ color: "var(--text)" }}>{distStr}</div>
        <div className="text-xs" style={{ color: "var(--muted)" }}>
          {mins}min{pace ? ` · ${pace}` : ""}{a.avg_heartrate ? ` · ${Math.round(a.avg_heartrate)}bpm` : ""}
        </div>
      </div>
    </a>
  );
}

// ─── Fitness Profile ──────────────────────────────────────────────────────────

function FitnessProfileCard({ profile }: { profile: FitnessProfile }) {
  if (!profile.avgRunPacePerMile && !profile.avgBikeSpeedMph && !profile.avgSwimPacePer100m) return null;
  const z2Lo = profile.avgRunPacePerMile ? fmtPace(profile.avgRunPacePerMile + 90) : null;
  const z2Hi = profile.avgRunPacePerMile ? fmtPace(profile.avgRunPacePerMile + 150) : null;
  const tempo = profile.avgRunPacePerMile ? fmtPace(profile.avgRunPacePerMile - 30) : null;

  return (
    <div className="card p-5">
      <div className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--muted)" }}>
        YOUR FITNESS PROFILE <span className="badge badge-green">from Strava</span>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {profile.avgRunPacePerMile && (
          <div className="rounded-xl p-3 text-center" style={{ background: "var(--green-dim)" }}>
            <div className="text-base font-bold" style={{ color: "var(--green)" }}>{fmtPace(profile.avgRunPacePerMile)}</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>avg run</div>
          </div>
        )}
        {profile.avgBikeSpeedMph && (
          <div className="rounded-xl p-3 text-center" style={{ background: "var(--orange-dim)" }}>
            <div className="text-base font-bold" style={{ color: "var(--orange)" }}>{profile.avgBikeSpeedMph.toFixed(1)}mph</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>avg bike</div>
          </div>
        )}
        {profile.avgSwimPacePer100m && (
          <div className="rounded-xl p-3 text-center" style={{ background: "var(--cyan-dim)" }}>
            <div className="text-base font-bold" style={{ color: "var(--cyan)" }}>{fmtPacePer100m(profile.avgSwimPacePer100m)}</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>avg swim</div>
          </div>
        )}
      </div>
      {profile.avgRunPacePerMile && (
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between"><span style={{ color: "var(--muted)" }}>Z2 run (base building)</span><span style={{ color: "var(--green)", fontWeight: 600 }}>{z2Lo} – {z2Hi}</span></div>
          <div className="flex justify-between"><span style={{ color: "var(--muted)" }}>Tempo (Z3–Z4)</span><span style={{ color: "var(--orange)", fontWeight: 600 }}>{tempo} – {fmtPace(profile.avgRunPacePerMile)}</span></div>
          <div className="flex justify-between"><span style={{ color: "var(--muted)" }}>Race pace target</span><span style={{ color: "var(--text)", fontWeight: 600 }}>10:30–11:30/mi</span></div>
          {profile.avgRunHR && <div className="flex justify-between"><span style={{ color: "var(--muted)" }}>Avg run HR</span><span style={{ color: "var(--text)", fontWeight: 600 }}>{Math.round(profile.avgRunHR)}bpm</span></div>}
          {profile.avgBikeWatts && <div className="flex justify-between"><span style={{ color: "var(--muted)" }}>Avg bike power</span><span style={{ color: "var(--text)", fontWeight: 600 }}>{Math.round(profile.avgBikeWatts)}W</span></div>}
        </div>
      )}
      <div className="mt-3 pt-3 text-xs italic" style={{ borderTop: "1px solid var(--border)", color: "var(--muted)" }}>
        Longest run: {profile.longestRunMiles.toFixed(1)}mi · Longest bike: {profile.longestBikeMiles.toFixed(1)}mi
      </div>
    </div>
  );
}

// ─── Workout Detail Cards ─────────────────────────────────────────────────────

function WorkoutDetailCard({ week }: { week: TrainingWeek }) {
  const sportColors: Record<string, string> = { swim: "var(--cyan)", bike: "var(--orange)", run: "var(--green)" };
  const sportIcons: Record<string, React.ReactNode> = { swim: <SwimIcon />, bike: <BikeIcon />, run: <RunIcon /> };

  return (
    <div className="card p-5">
      <div className="text-xs font-semibold mb-4" style={{ color: "var(--muted)" }}>KEY WORKOUTS — PRESCRIPTIONS</div>
      <div className="space-y-4">
        {week.keyWorkouts.map((w, i) => (
          <div key={i} className="rounded-xl p-4" style={{ background: "var(--surface2)", border: `1px solid ${sportColors[w.sport]}30` }}>
            <div className="flex items-center gap-2 mb-2">
              <span style={{ color: sportColors[w.sport] }}>{sportIcons[w.sport]}</span>
              <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>{w.label}</span>
            </div>
            <div className="text-xs mb-2 leading-relaxed" style={{ color: "#C9D1D9" }}>
              <span className="font-semibold" style={{ color: "var(--muted)" }}>Structure: </span>{w.structure}
            </div>
            <div className="text-xs mb-2 leading-relaxed" style={{ color: "#C9D1D9" }}>
              <span className="font-semibold" style={{ color: "var(--muted)" }}>Effort zone: </span>{w.zone}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {w.targetPace && <span className="badge" style={{ background: "var(--green-dim)", color: "var(--green)" }}>🎯 {w.targetPace}</span>}
              {w.targetSpeed && <span className="badge" style={{ background: "var(--orange-dim)", color: "var(--orange)" }}>🎯 {w.targetSpeed}</span>}
              {w.targetPacePer100yd && <span className="badge" style={{ background: "var(--cyan-dim)", color: "var(--cyan)" }}>🎯 {w.targetPacePer100yd}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Markdown renderer (simple, safe) ─────────────────────────────────────────

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^### (.+)$/gm, '<h3 style="font-size:0.85rem;font-weight:700;margin:1em 0 0.3em;color:var(--text)">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:0.9rem;font-weight:700;margin:1.2em 0 0.4em;color:var(--text)">$1</h2>')
    .replace(/^• (.+)$/gm, "<li>$1</li>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .split("\n\n")
    .map((p) => {
      if (p.startsWith("<h2>") || p.startsWith("<h3>") || p.startsWith("<li>")) return p;
      if (p.trim() === "") return "";
      return `<p style="margin:0.4em 0">${p}</p>`;
    })
    .join("\n");
}

// ─── Tool event card ───────────────────────────────────────────────────────────

function ToolEventCard({ event }: { event: ToolEvent }) {
  if (!event.ok) return null;
  const d = event.display;
  return (
    <div className="my-2 rounded-xl px-4 py-3 text-xs"
      style={{ background: "var(--orange-dim)", border: "1px solid var(--orange)30" }}>
      <div className="font-semibold mb-1" style={{ color: "var(--orange)" }}>
        Schedule updated — Week {d.week_number}
      </div>
      {d.changes?.map((c, i) => (
        <div key={i} style={{ color: "var(--text)" }}>{c}</div>
      ))}
      {d.reason && (
        <div className="mt-1.5 italic" style={{ color: "var(--muted)" }}>{d.reason}</div>
      )}
    </div>
  );
}

// ─── Coach Chat ────────────────────────────────────────────────────────────────

function CoachChat({ onScheduleChanged }: { onScheduleChanged: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load history on mount
  useEffect(() => {
    fetch("/api/coach/chat")
      .then((r) => r.json())
      .then((data) => {
        if (data.messages?.length) {
          setMessages(
            data.messages.map((m: { id: string; role: "user" | "assistant"; content: string; tool_events?: ToolEvent[] }) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              toolEvents: m.tool_events || [],
            }))
          );
        }
        setHistoryLoaded(true);
      })
      .catch(() => setHistoryLoaded(true));
  }, []);

  // Auto-scroll on new content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };

    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setStreaming(true);

    const assistantId = crypto.randomUUID();
    setMessages((m) => [
      ...m,
      { id: assistantId, role: "assistant", content: "", streaming: true, toolEvents: [] },
    ]);

    try {
      const res = await fetch("/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok || !res.body) {
        setMessages((m) =>
          m.map((msg) =>
            msg.id === assistantId
              ? { ...msg, content: "Something went wrong. Please try again.", streaming: false }
              : msg
          )
        );
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let scheduleChanged = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        // Process complete SSE events (split on \n\n)
        let idx: number;
        while ((idx = buf.indexOf("\n\n")) !== -1) {
          const eventStr = buf.slice(0, idx);
          buf = buf.slice(idx + 2);
          if (!eventStr.startsWith("data: ")) continue;
          const json = eventStr.slice(6);
          let parsed: { t: string; v?: string; name?: string; ok?: boolean; msg?: string; display?: ToolEvent["display"] };
          try { parsed = JSON.parse(json); } catch { continue; }

          if (parsed.t === "text") {
            setMessages((m) =>
              m.map((msg) =>
                msg.id === assistantId
                  ? { ...msg, content: msg.content + (parsed.v || "") }
                  : msg
              )
            );
          } else if (parsed.t === "tool") {
            const toolEvent: ToolEvent = {
              t: "tool",
              name: parsed.name || "",
              ok: parsed.ok ?? false,
              msg: parsed.msg || "",
              display: parsed.display || {},
            };
            setMessages((m) =>
              m.map((msg) =>
                msg.id === assistantId
                  ? { ...msg, toolEvents: [...(msg.toolEvents || []), toolEvent] }
                  : msg
              )
            );
            if (parsed.ok) scheduleChanged = true;
          } else if (parsed.t === "end") {
            setMessages((m) =>
              m.map((msg) =>
                msg.id === assistantId ? { ...msg, streaming: false } : msg
              )
            );
          } else if (parsed.t === "error") {
            setMessages((m) =>
              m.map((msg) =>
                msg.id === assistantId
                  ? { ...msg, content: parsed.msg || "Error", streaming: false }
                  : msg
              )
            );
          }
        }
      }

      if (scheduleChanged) onScheduleChanged();
    } catch {
      setMessages((m) =>
        m.map((msg) =>
          msg.id === assistantId
            ? { ...msg, content: "Connection error. Try again.", streaming: false }
            : msg
        )
      );
    } finally {
      setStreaming(false);
    }
  }, [input, messages, streaming, onScheduleChanged]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedPrompts = [
    "How did I do this week vs the plan?",
    "Was my last run in the right zone?",
    "I'm feeling fatigued — should I back off?",
    "What should I focus on this week?",
  ];

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 200px)", minHeight: 480 }}>
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4" style={{ paddingRight: 2 }}>
        {!historyLoaded && (
          <div className="text-center py-8 text-sm" style={{ color: "var(--muted)" }}>
            Loading chat history...
          </div>
        )}

        {historyLoaded && messages.length === 0 && (
          <div className="py-6 text-center">
            <div className="text-2xl font-black mb-2" style={{ color: "var(--text)" }}>
              Your AI Coach
            </div>
            <div className="text-sm mb-6 max-w-md mx-auto" style={{ color: "var(--muted)" }}>
              PhD exercise science · 12 Ironman finishes · grounded in Friel, Dixon & Seiler.
              Ask anything about your training, pace zones, recovery, or schedule.
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestedPrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => { setInput(p); inputRef.current?.focus(); }}
                  className="px-4 py-2 rounded-full text-xs font-medium"
                  style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--muted)" }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.role === "user" ? (
              <div className="flex justify-end">
                <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-tr-sm text-sm"
                  style={{ background: "var(--orange)", color: "#fff" }}>
                  {msg.content}
                </div>
              </div>
            ) : (
              <div className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-black mt-0.5"
                  style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--orange)" }}>
                  C
                </div>
                <div className="flex-1 min-w-0">
                  {/* Tool events above text */}
                  {(msg.toolEvents || []).map((ev, i) => (
                    <ToolEventCard key={i} event={ev} />
                  ))}
                  <div
                    className="text-sm leading-relaxed analysis-content"
                    style={{ color: "var(--text)" }}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                  />
                  {msg.streaming && (
                    <span className="inline-block w-2 h-4 ml-0.5 rounded-sm animate-pulse"
                      style={{ background: "var(--orange)", verticalAlign: "text-bottom" }} />
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="pt-3" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask your coach… (Enter to send, Shift+Enter for new line)"
            rows={2}
            disabled={streaming}
            className="flex-1 rounded-xl px-4 py-3 text-sm resize-none"
            style={{
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              outline: "none",
              opacity: streaming ? 0.7 : 1,
            }}
          />
          <button
            onClick={sendMessage}
            disabled={streaming || !input.trim()}
            className="px-4 py-3 rounded-xl text-sm font-semibold flex-shrink-0"
            style={{
              background: streaming || !input.trim() ? "var(--surface2)" : "var(--orange)",
              color: streaming || !input.trim() ? "var(--muted)" : "#fff",
              border: "1px solid var(--border)",
              transition: "all 0.15s",
            }}>
            {streaming ? "···" : "Send"}
          </button>
        </div>
        <div className="mt-1.5 text-xs text-center" style={{ color: "var(--muted)" }}>
          Your coach can adjust your training plan directly from this chat.
        </div>
      </div>
    </div>
  );
}

// ─── Strength Full Page ───────────────────────────────────────────────────────

function StrengthFullPage({ week }: { week: TrainingWeek }) {
  const s = week.strengthWork;
  return (
    <div className="max-w-2xl space-y-5">
      <div className="card p-5" style={{ background: "#D2992215", borderColor: "#D2992230" }}>
        <div className="text-sm font-semibold mb-2" style={{ color: "#D29922" }}>Triathlon Strength — Why It Matters</div>
        <div className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
          Strength is <strong style={{ color: "var(--text)" }}>not optional</strong> — it prevents injury, builds bike power, improves run economy, and protects your shoulders.
          Periodized across 4 phases. Log sessions as <strong style={{ color: "var(--text)" }}>"Weight Training"</strong> on Strava to track completion.
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2 text-xs text-center">
          {[["Base Wks 1–4","Foundation","2x/wk · 3×12–15"],["Build Wks 5–7","Strength","2x/wk · 4×6–8"],["Peak Wks 8–17","Power","1x/wk · 3×5–8"],["Taper Wks 18+","Activation","1x/wk · light"]].map(([ph,lb,dt]) => (
            <div key={ph} className="rounded-xl p-3" style={{ background: "var(--surface)" }}>
              <div className="font-semibold mb-0.5" style={{ color: "var(--text)" }}>{lb}</div>
              <div style={{ color: "var(--muted)" }}>{ph}</div>
              <div className="mt-1" style={{ color: "#D29922" }}>{dt}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>
            {s.label} — Week {week.weekNumber}
          </div>
          <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
            {s.frequency}×/week · {s.duration}min · {s.exercises.length} exercises
          </div>
        </div>
        <div className="p-5 space-y-3">
          {s.exercises.map((ex, i) => (
            <div key={i} className="flex gap-3 rounded-xl p-3" style={{ background: "var(--surface2)" }}>
              <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                style={{ background: "#D2992220", color: "#D29922" }}>{i + 1}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>{ex.name}</span>
                  <span className="badge" style={{ background: "#D2992220", color: "#D29922" }}>{ex.sets}×{ex.reps}</span>
                </div>
                {ex.cues && <div className="text-xs italic" style={{ color: "var(--muted)" }}>{ex.cues}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs font-semibold px-1" style={{ color: "var(--muted)" }}>JUMP TO WEEK</div>
      <div className="grid grid-cols-7 gap-1">
        {TRAINING_PLAN.map((w) => (
          <div key={w.weekNumber} className="py-2 rounded-lg text-xs font-bold text-center"
            style={w.weekNumber === week.weekNumber
              ? { background: "#D29922", color: "#fff" }
              : { background: "var(--surface2)", color: "var(--muted)" }}>
            {w.weekNumber}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Activity Log (collapsible, combines this-week + recent) ─────────────────

function ActivityLog({
  weekActuals,
  allActivities,
  lastSync,
}: {
  weekActuals: WeekActuals;
  allActivities: StravaActivity[];
  lastSync: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const thisWeek = [
    ...weekActuals.swimSessions,
    ...weekActuals.bikeSessions,
    ...weekActuals.runSessions,
    ...weekActuals.strengthSessions,
    ...weekActuals.otherSessions,
  ].sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());

  const thisWeekIds = new Set(thisWeek.map((a) => a.strava_activity_id));
  const recent = allActivities
    .filter((a) => !thisWeekIds.has(a.strava_activity_id))
    .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
    .slice(0, 10);

  const displayList = showAll ? [...thisWeek, ...recent] : thisWeek;
  const totalCount = thisWeek.length + recent.length;

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        style={{ borderBottom: open ? "1px solid var(--border)" : "none" }}>
        <div>
          <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>Activities</span>
          {thisWeek.length > 0 && (
            <span className="ml-2 badge" style={{ background: "var(--green-dim)", color: "var(--green)" }}>
              {thisWeek.length} this week
            </span>
          )}
        </div>
        <span style={{ color: "var(--muted)", fontSize: 18 }}>{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div>
          {thisWeek.length > 0 && (
            <div className="px-4 py-2 text-xs font-semibold" style={{ color: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
              THIS WEEK
            </div>
          )}
          {thisWeek.length === 0 && (
            <div className="px-4 py-6 text-xs text-center" style={{ color: "var(--muted)" }}>
              No activities yet this week — go train!
            </div>
          )}
          {displayList.map((a, i) => {
            const isFirstRecent = !showAll ? false : i === thisWeek.length;
            return (
              <div key={a.strava_activity_id}>
                {isFirstRecent && recent.length > 0 && (
                  <div className="px-4 py-2 text-xs font-semibold" style={{ color: "var(--muted)", borderBottom: "1px solid var(--border)", borderTop: "1px solid var(--border)" }}>
                    PREVIOUS WEEKS
                  </div>
                )}
                <ActivityRow a={a} />
              </div>
            );
          })}
          {recent.length > 0 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full py-2.5 text-xs font-medium"
              style={{ color: "var(--muted)", borderTop: "1px solid var(--border)" }}>
              {showAll ? "Show less" : `+ ${recent.length} previous activities`}
            </button>
          )}
          {lastSync && (
            <div className="px-4 py-2 text-xs text-center" style={{ color: "var(--muted)", borderTop: "1px solid var(--border)" }}>
              Last synced {lastSync}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<TrainingWeek | null>(null);
  const [tab, setTab] = useState<"week" | "plan" | "strength" | "coach">("week");
  const [fitnessProfile, setFitnessProfile] = useState<FitnessProfile | null>(null);
  const [weekOverrides, setWeekOverrides] = useState<Record<number, WeekOverride>>({});

  const currentWeek = getCurrentWeek();
  const daysLeft = getDaysUntilRace();
  const displayWeek = selectedWeek || currentWeek || TRAINING_PLAN[0];

  const loadActivities = useCallback(async () => {
    const res = await fetch("/api/strava/sync");
    if (res.ok) {
      const { activities: acts } = await res.json();
      const list = acts || [];
      setActivities(list);
      if (list.length > 0) setFitnessProfile(buildFitnessProfile(list));
    }
  }, []);

  const loadOverrides = useCallback(async () => {
    try {
      const r = await fetch("/api/coach/overrides");
      if (r.ok) {
        const { overrides } = await r.json();
        const map: Record<number, WeekOverride> = {};
        for (const ov of overrides || []) map[ov.week_number] = ov;
        setWeekOverrides(map);
      }
    } catch {}
  }, []);

  useEffect(() => {
    loadActivities();
    loadOverrides();
  }, [loadActivities, loadOverrides]);

  const syncStrava = async () => {
    setSyncing(true);
    await fetch("/api/strava/sync", { method: "POST" });
    await loadActivities();
    setLastSync(new Date().toLocaleTimeString());
    setSyncing(false);
  };

  // Apply any coach-applied overrides to the week for display
  const effectiveWeek = displayWeek ? {
    ...displayWeek,
    swimMeters: weekOverrides[displayWeek.weekNumber]?.swim_meters ?? displayWeek.swimMeters,
    bikeMiles: weekOverrides[displayWeek.weekNumber]?.bike_miles ?? displayWeek.bikeMiles,
    runMiles: weekOverrides[displayWeek.weekNumber]?.run_miles ?? displayWeek.runMiles,
  } : displayWeek;

  const weekActuals = effectiveWeek ? getWeekActivities(activities, effectiveWeek) : null;
  const weekSchedule = effectiveWeek ? generateWeekSchedule(effectiveWeek) : null;

  const totalCompliance = effectiveWeek && weekActuals && effectiveWeek.totalHours > 0
    ? Math.min(Math.round(((weekActuals.totalMinutes / 60) / effectiveWeek.totalHours) * 100), 120) : 0;

  const phaseColors: Record<string, string> = {
    base: "var(--cyan)", build: "var(--orange)", peak: "var(--red)",
    taper: "var(--yellow)", race: "var(--green)",
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <header className="sticky top-0 z-50 px-6 h-14 flex items-center justify-between"
        style={{ background: "rgba(13,17,23,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black" style={{ background: "var(--orange)", color: "#fff" }}>IS</div>
          <span className="font-bold text-sm" style={{ color: "var(--text)" }}>IronSuhba</span>
          {displayWeek && (
            <span className="badge" style={{ background: phaseColors[displayWeek.phase] + "20", color: phaseColors[displayWeek.phase] }}>
              Wk {displayWeek.weekNumber} · {displayWeek.phase.toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold" style={{ color: "var(--orange)" }}>{daysLeft}d to race</span>
          <button onClick={syncStrava} disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)" }}>
            <SyncIcon spinning={syncing} />
            {syncing ? "Syncing..." : "Sync Strava"}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Race banner */}
        <div className="card p-4 mb-5 flex items-center justify-between"
          style={{ borderColor: "var(--orange)30", background: "var(--orange-dim)" }}>
          <div>
            <div className="text-xs font-semibold mb-0.5" style={{ color: "var(--orange)" }}>AUGUSTA 70.3 — SEPTEMBER 27, 2026</div>
            <div className="text-2xl font-black" style={{ color: "var(--text)" }}>{daysLeft} days to race day</div>
          </div>
          <div className="text-right text-xs" style={{ color: "var(--muted)" }}>
            <div>Swim 1.2mi · Bike 56mi · Run 13.1mi</div>
            <div className="mt-1">Target: 6:30–7:00 finish</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 p-1 rounded-xl w-fit" style={{ background: "var(--surface)" }}>
          {(["week", "plan", "strength", "coach"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all"
              style={tab === t ? { background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)" } : { color: "var(--muted)" }}>
              {t === "week" ? "This Week" : t === "plan" ? "Full Plan" : t === "strength" ? "Strength" : "Coach"}
            </button>
          ))}
        </div>

        {/* ── THIS WEEK ── */}
        {tab === "week" && effectiveWeek && weekActuals && weekSchedule && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              {/* Weekly schedule calendar */}
              <WeeklySchedule schedule={weekSchedule} activities={activities} weekStart={effectiveWeek.startDate} />

              {/* Strength tracker */}
              <StrengthTracker week={effectiveWeek} actuals={weekActuals} />

              {/* Volume bars */}
              <div className="card p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xs font-semibold mb-0.5" style={{ color: "var(--muted)" }}>
                      {new Date(effectiveWeek.startDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })} –{" "}
                      {new Date(effectiveWeek.endDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                    <div className="font-bold text-lg" style={{ color: "var(--text)" }}>
                      Week {effectiveWeek.weekNumber} — {effectiveWeek.phase.charAt(0).toUpperCase() + effectiveWeek.phase.slice(1)} phase
                    </div>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {effectiveWeek.isResidencyConstrained && (
                        <span className="badge" style={{ background: "#D2992220", color: "#D29922" }}>Residency week</span>
                      )}
                      {weekOverrides[effectiveWeek.weekNumber] && (
                        <span className="badge" style={{ background: "var(--orange-dim)", color: "var(--orange)" }}>Coach adjusted</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black"
                      style={{ color: totalCompliance >= 80 ? "var(--green)" : totalCompliance >= 50 ? "var(--yellow)" : "var(--red)" }}>
                      {totalCompliance}%
                    </div>
                    <div className="text-xs" style={{ color: "var(--muted)" }}>volume</div>
                  </div>
                </div>

                <SportBar label="Swim" icon={<SwimIcon />} actual={weekActuals.swimMeters} target={effectiveWeek.swimMeters} unit="m" color="var(--cyan)" />
                <SportBar label="Bike" icon={<BikeIcon />} actual={weekActuals.bikeMiles} target={effectiveWeek.bikeMiles} unit="mi" color="var(--orange)" />
                <SportBar label="Run"  icon={<RunIcon />}  actual={weekActuals.runMiles}  target={effectiveWeek.runMiles}  unit="mi" color="var(--green)" />

                <div className="mt-3 pt-4 flex justify-between text-sm" style={{ borderTop: "1px solid var(--border)" }}>
                  <span style={{ color: "var(--muted)" }}>Total training time</span>
                  <span style={{ color: "var(--text)", fontWeight: 600 }}>
                    {(weekActuals.totalMinutes / 60).toFixed(1)}h
                    <span style={{ color: "var(--muted)", fontWeight: 400 }}> / {effectiveWeek.totalHours}h target</span>
                  </span>
                </div>
              </div>

              {/* Coach notes */}
              <div className="card p-5">
                <div className="text-xs font-semibold mb-3" style={{ color: "var(--muted)" }}>WEEKLY FOCUS</div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {effectiveWeek.focusAreas.map((f) => <span key={f} className="badge badge-cyan">{f}</span>)}
                </div>
                <div className="text-sm italic leading-relaxed" style={{ color: "var(--muted)" }}>{effectiveWeek.notes}</div>
              </div>

            </div>

            {/* Right sidebar */}
            <div className="space-y-4">
              {/* Week picker */}
              <div className="card p-4">
                <div className="text-xs font-semibold mb-3" style={{ color: "var(--muted)" }}>JUMP TO WEEK</div>
                <div className="grid grid-cols-4 gap-1">
                  {TRAINING_PLAN.map((w) => {
                    const isCurrent = w.weekNumber === currentWeek?.weekNumber;
                    const isSelected = w.weekNumber === effectiveWeek.weekNumber;
                    const color = phaseColors[w.phase];
                    return (
                      <button key={w.weekNumber} onClick={() => setSelectedWeek(w)}
                        className="h-9 w-full rounded-lg text-xs font-bold transition-all"
                        style={isSelected ? { background: color, color: "#fff" }
                          : isCurrent ? { background: color + "30", color, border: `1px solid ${color}` }
                          : { background: "var(--surface2)", color: "var(--muted)" }}>
                        {w.weekNumber}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {Object.entries(phaseColors).map(([phase, color]) => (
                    <span key={phase} className="flex items-center gap-1" style={{ color: "var(--muted)" }}>
                      <span className="w-2 h-2 rounded-full" style={{ background: color }} />{phase}
                    </span>
                  ))}
                </div>
              </div>

              {fitnessProfile && <FitnessProfileCard profile={fitnessProfile} />}

              <ActivityLog weekActuals={weekActuals} allActivities={activities} lastSync={lastSync} />
            </div>
          </div>
        )}

        {/* ── FULL PLAN ── */}
        {tab === "plan" && (
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 px-4 pb-2 text-xs font-semibold uppercase" style={{ color: "var(--muted)" }}>
              <div className="col-span-1">Wk</div><div className="col-span-2">Dates</div>
              <div className="col-span-2">Phase</div><div className="col-span-2">Swim</div>
              <div className="col-span-2">Bike</div><div className="col-span-2">Run</div>
              <div className="col-span-1">Hrs</div>
            </div>
            {TRAINING_PLAN.map((w) => {
              const isCurrent = w.weekNumber === currentWeek?.weekNumber;
              const color = phaseColors[w.phase];
              const wa = getWeekActivities(activities, w);
              const hasData = wa.totalMinutes > 0;
              const ov = weekOverrides[w.weekNumber];
              const swimTarget = ov?.swim_meters ?? w.swimMeters;
              const bikeTarget = ov?.bike_miles ?? w.bikeMiles;
              const runTarget = ov?.run_miles ?? w.runMiles;
              return (
                <button key={w.weekNumber} onClick={() => { setSelectedWeek(w); setTab("week"); }}
                  className="w-full card card-hover p-3 text-left grid grid-cols-12 gap-2 items-center"
                  style={isCurrent ? { borderColor: color, background: color + "08" } : {}}>
                  <div className="col-span-1">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: color + "20", color }}>{w.weekNumber}</div>
                  </div>
                  <div className="col-span-2 text-xs" style={{ color: "var(--muted)" }}>
                    {new Date(w.startDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    {ov && <span className="ml-1" style={{ color: "var(--orange)" }}>✎</span>}
                  </div>
                  <div className="col-span-2">
                    <span className="badge text-xs" style={{ background: color + "20", color }}>{w.phase}{w.isResidencyConstrained ? " ⚕" : ""}</span>
                  </div>
                  <div className="col-span-2 text-xs" style={{ color: hasData ? "var(--cyan)" : "var(--muted)" }}>
                    {hasData ? `${Math.round(wa.swimMeters)}m` : `${swimTarget}m`}
                  </div>
                  <div className="col-span-2 text-xs" style={{ color: hasData ? "var(--orange)" : "var(--muted)" }}>
                    {hasData ? `${wa.bikeMiles.toFixed(1)}mi` : `${bikeTarget}mi`}
                  </div>
                  <div className="col-span-2 text-xs" style={{ color: hasData ? "var(--green)" : "var(--muted)" }}>
                    {hasData ? `${wa.runMiles.toFixed(1)}mi` : `${runTarget}mi`}
                  </div>
                  <div className="col-span-1 text-xs font-semibold" style={{ color: "var(--text)" }}>{w.totalHours}h</div>
                </button>
              );
            })}
          </div>
        )}

        {/* ── STRENGTH ── */}
        {tab === "strength" && effectiveWeek && <StrengthFullPage week={effectiveWeek} />}

        {/* ── COACH CHAT ── */}
        {tab === "coach" && (
          <div className="max-w-2xl">
            <CoachChat onScheduleChanged={loadOverrides} />
          </div>
        )}
      </main>
    </div>
  );
}
