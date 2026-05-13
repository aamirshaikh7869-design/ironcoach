import { TrainingWeek } from "./types";
import {
  BASE_STRENGTH,
  BUILD_STRENGTH,
  PEAK_STRENGTH,
  TAPER_STRENGTH,
  RACE_WEEK_STRENGTH,
} from "./strength";

// ─── Race & Athlete Info ─────────────────────────────────────────────────────
// Race: Augusta 70.3 — September 27, 2026
// Plan Start: May 4, 2026 (21 weeks out)
// Residency starts: June 22 (Week 8+)
//
// Race distances: Swim 1.2mi (2112yd) · Bike 56mi · Run 13.1mi
//
// Baseline fitness:
//   Swim: beginner (est. 2:45–3:15/100yd)
//   Bike: comfortable 25mi, casual pace (~13–15mph)
//   Run:  4–5mi comfortable at ~9:00/mi (est. aerobic HR ~150–165)
//
// Target finish: 6:30–7:00
//   Swim: ~45–50min → target 2:05–2:15/100yd
//   Bike: ~3:00–3:15 → target 17–18.5mph
//   Run:  ~2:20–2:45 → target 10:40–12:35/mi
//
// Training zones (HR-based, to be refined once Strava data available):
//   Z1 Recovery:   easy conversational, could sing
//   Z2 Aerobic:    nose breathing, long sentences, base building zone
//   Z3 Tempo:      somewhat hard, short sentences, sustainable ~60min
//   Z4 Threshold:  hard, few words, 20–30min max
//   Z5 VO2max:     very hard, can't speak, <8min

export const RACE_DATE = "2026-09-27";
export const PLAN_START = "2026-05-04";

export const ATHLETE_PROFILE = {
  name: "Aamir",
  currentFitness: {
    swim: "Beginner — est. 2:45–3:15/100yd, working on technique",
    bike: "25mi comfortable at ~13–15mph, casual pace",
    run: "4–5mi comfortable at ~9:00/mi",
  },
  raceGoal: "Finish strong — target 6:30–7:00 total",
  raceTargets: {
    swimPacePer100yd: "2:05–2:15",
    bikeSpeedMph: "17–18.5",
    runPacePerMile: "10:40–12:35",
  },
};

export const TRAINING_PLAN: TrainingWeek[] = [
  // ═══════════════════════════════════════════════════════════════
  // PHASE 1: BASE (Weeks 1–4, May 4–31)
  // Goal: establish aerobic base in all 3 sports, build strength foundation,
  //       get comfortable in the pool, nail Zone 2 effort.
  // ═══════════════════════════════════════════════════════════════
  {
    weekNumber: 1,
    startDate: "2026-05-04",
    endDate: "2026-05-10",
    phase: "base",
    isResidencyConstrained: false,
    swimMinutes: 60,
    bikeMinutes: 90,
    runMinutes: 75,
    strengthMinutes: 90,
    swimMeters: 1200,
    bikeMiles: 18,
    runMiles: 8,
    totalHours: 5.25,
    focusAreas: ["Swim technique + breathing", "Zone 2 aerobic base", "Strength foundation"],
    keyWorkouts: [
      {
        sport: "swim",
        label: "Technique Session",
        structure: "200yd easy warm-up → 6×50yd drill sets (catch-up drill, fingertip drag, bilateral breathing) → 200yd easy cool-down",
        zone: "Z1–Z2 — effortless, focus on form not speed",
        targetPacePer100yd: "2:45–3:15 (no pace pressure this week)",
      },
      {
        sport: "run",
        label: "Zone 2 Base Run",
        structure: "3–4mi continuous at easy effort",
        zone: "Z2 — you should be able to hold a full conversation, nose-breathe for 80% of it",
        targetPace: "9:30–10:30/mi (slower than you think you need to go)",
      },
      {
        sport: "bike",
        label: "Aerobic Ride",
        structure: "45–60min steady ride outdoors or trainer",
        zone: "Z2 — flat terrain or easy hills, no hammering",
        targetSpeed: "13–16mph",
      },
    ],
    strengthWork: BASE_STRENGTH,
    notes: "Week 1 is assessment. Go slower than feels right on every session — you're building the aerobic engine, not testing it. If you're out of breath, you're going too hard. Strength: 2 sessions, Mon + Thu.",
  },
  {
    weekNumber: 2,
    startDate: "2026-05-11",
    endDate: "2026-05-17",
    phase: "base",
    isResidencyConstrained: false,
    swimMinutes: 90,
    bikeMinutes: 160,
    runMinutes: 65,
    strengthMinutes: 80,
    swimMeters: 2600,
    bikeMiles: 36,
    runMiles: 4,
    totalHours: 6.5,
    focusAreas: ["HR-gated run/walk (140→130bpm)", "Z2 swim intervals", "Double-session aerobic base"],
    keyWorkouts: [
      {
        sport: "swim",
        label: "Z2 Interval Set",
        structure: "200m warmup → 4×100m Z2 with 20sec rest → 200m cooldown (total 800m). Two sessions per week.",
        zone: "Z2 — full sentences possible, controlled breathing",
        targetPacePer100yd: "2:30–3:00",
      },
      {
        sport: "bike",
        label: "Z1–Z2 Base Rides",
        structure: "Easy road ride 23min (morning) + trainer easy spin 45min + Saturday road ride 90min. All strictly aerobic.",
        zone: "Z1–Z2 — HR under 140bpm the entire time",
        targetSpeed: "12–15mph",
      },
      {
        sport: "run",
        label: "HR-Gated Run/Walk",
        structure: "Walk immediately when HR hits 140bpm. Resume running only when HR drops to 130bpm. No exceptions.",
        zone: "Z1–Z2 — pace is irrelevant, HR discipline is the workout",
        targetPace: "HR 130–140bpm zone",
      },
    ],
    strengthWork: BASE_STRENGTH,
    notes: "First week of AM/PM double-session days. The run/walk HR protocol (walk at 140, resume at 130) is Maffetone aerobic conditioning — it feels embarrassingly slow and that's exactly right. Aerobic base is built in Z1-Z2 only. You can't buy your way out of this foundation.",
  },
  {
    weekNumber: 3,
    startDate: "2026-05-18",
    endDate: "2026-05-24",
    phase: "base",
    isResidencyConstrained: false,
    swimMinutes: 110,
    bikeMinutes: 240,
    runMinutes: 150,
    strengthMinutes: 80,
    swimMeters: 2800,
    bikeMiles: 55,
    runMiles: 9,
    totalHours: 9.7,
    focusAreas: ["Volume build +10%", "Double run days Z1-Z2", "Saturday long bike 2hrs"],
    keyWorkouts: [
      {
        sport: "swim",
        label: "Z2 Volume Build",
        structure: "200m warmup → 5–6×100m Z2 with 20sec rest → 200m cooldown. Three swim sessions this week.",
        zone: "Z2 — aerobic, not race pace",
        targetPacePer100yd: "2:25–2:50",
      },
      {
        sport: "bike",
        label: "Saturday Long Ride — 2hrs",
        structure: "2hr road ride Z1-Z2. This is your longest ride yet — pace conservatively, fuel every 30min.",
        zone: "Z1–Z2 — if you can't hold a conversation, slow down",
        targetSpeed: "14–16mph",
      },
      {
        sport: "run",
        label: "Double Run Days",
        structure: "Run/walk 3mi on three separate days (Mon, Tue PM, Wed PM). Walk at 140bpm, resume at 130bpm.",
        zone: "Z1–Z2 — HR protocol same as last week",
        targetPace: "HR 130–140bpm",
      },
    ],
    strengthWork: BASE_STRENGTH,
    notes: "Biggest aerobic week yet. Volume jumps ~50% from week 2 — this is intentional pre-residency loading. The 2hr Saturday ride is your key session: go slow, fuel well, and practice drinking while riding. Three run sessions builds aerobic economy without injury risk because all are Z1-Z2.",
  },
  {
    weekNumber: 4,
    startDate: "2026-05-25",
    endDate: "2026-05-31",
    phase: "base",
    isResidencyConstrained: false,
    swimMinutes: 90,
    bikeMinutes: 120,
    runMinutes: 135,
    strengthMinutes: 70,
    swimMeters: 2900,
    bikeMiles: 25,
    runMiles: 8,
    totalHours: 7.0,
    focusAreas: ["Active recovery", "Maintain frequency, drop intensity", "Sleep priority"],
    keyWorkouts: [
      {
        sport: "swim",
        label: "Easy Recovery Swims",
        structure: "Four short easy sessions (700–800m each). No intervals — just steady Z1-Z2 laps. Technique focus.",
        zone: "Z1–Z2 — should feel like active recovery, not training",
        targetPacePer100yd: "No target — just move through the water",
      },
      {
        sport: "bike",
        label: "Easy Spin + Short Road",
        structure: "Trainer easy spin 45min (Z1 only) + Saturday easy road ride 75min. No intensity.",
        zone: "Z1 — legs turning over, nothing more",
        targetSpeed: "12–14mph",
      },
      {
        sport: "run",
        label: "Short Run/Walk",
        structure: "2mi max per session, walk at 140bpm. Three sessions spread through the week.",
        zone: "Z1–Z2 — keep it easy",
        targetPace: "HR under 140bpm",
      },
    ],
    strengthWork: { ...BASE_STRENGTH, frequency: 2, label: "Foundation (Reduced Volume)", duration: 35 },
    notes: "RECOVERY WEEK — volume drops ~25% from week 3. The swim frequency stays high (4 sessions) to maintain water feel, but intensity is gone. Seiler's research: recovery weeks are when adaptation happens. Sleep 8hrs minimum. Don't add sessions.",
  },

  // ═══════════════════════════════════════════════════════════════
  // PHASE 2: BUILD BLOCK 2 (Weeks 5–7, Jun 1–21)
  // Goal: progressive volume before residency, double sessions, aerobic expansion.
  // ═══════════════════════════════════════════════════════════════
  {
    weekNumber: 5,
    startDate: "2026-06-01",
    endDate: "2026-06-07",
    phase: "build",
    isResidencyConstrained: false,
    swimMinutes: 115,
    bikeMinutes: 240,
    runMinutes: 150,
    strengthMinutes: 80,
    swimMeters: 3300,
    bikeMiles: 55,
    runMiles: 9,
    totalHours: 9.7,
    focusAreas: ["Z2 swim progression 6–8×100m", "Trainer + road bike double", "Run/walk 3.5mi sessions"],
    keyWorkouts: [
      {
        sport: "swim",
        label: "Progressive Z2 Intervals",
        structure: "200m warmup → 6–8×100m Z2 with 20sec rest → 200m cooldown. Three sessions, each slightly longer.",
        zone: "Z2 — pace should feel controlled and repeatable",
        targetPacePer100yd: "2:20–2:45",
      },
      {
        sport: "bike",
        label: "Trainer + Long Road",
        structure: "Two 75min trainer sessions (Tue PM, Thu AM) + Saturday long road ride 90min.",
        zone: "Z1–Z2 — cadence 85–95rpm on trainer",
        targetSpeed: "14–16mph",
      },
      {
        sport: "run",
        label: "Run/Walk 3.5mi",
        structure: "Three sessions at 3.5mi (Mon, Tue PM, Wed PM). Walk at 140bpm, resume at 130bpm.",
        zone: "Z1–Z2 — same HR protocol as weeks 2–4",
        targetPace: "HR 130–140bpm",
      },
    ],
    strengthWork: BASE_STRENGTH,
    notes: "Week 5 matches week 3 volume — you've earned this load. The 3.5mi run/walk sessions are your longest runs yet. Keep the HR discipline: any session where you ignore the walk cues is a junk mile that builds fatigue without aerobic adaptation.",
  },
  {
    weekNumber: 6,
    startDate: "2026-06-08",
    endDate: "2026-06-14",
    phase: "build",
    isResidencyConstrained: false,
    swimMinutes: 110,
    bikeMinutes: 165,
    runMinutes: 110,
    strengthMinutes: 90,
    swimMeters: 2700,
    bikeMiles: 42,
    runMiles: 12,
    totalHours: 7.9,
    focusAreas: ["Swim the race distance", "Major brick session", "Half-marathon pace work"],
    keyWorkouts: [
      {
        sport: "swim",
        label: "Race Distance Swim",
        structure: "300yd warm-up → 2100yd continuous (race distance) at steady pace, no stopping → 200yd easy",
        zone: "Z2–Z3 — controlled, settle into a rhythm. If you need to rest, rest at the wall.",
        targetPacePer100yd: "2:15–2:30",
      },
      {
        sport: "bike",
        label: "Big Brick",
        structure: "45mi ride at Z2–Z3 → immediately run 5mi at race effort",
        zone: "Z2–Z3 bike, Z3 run. Practice eating/drinking on the bike.",
        targetSpeed: "15–17mph bike",
        targetPace: "10:30–11:30/mi run-off-bike",
      },
      {
        sport: "run",
        label: "Race Pace Run",
        structure: "3mi easy warm-up → 4mi at goal race pace → 2mi easy cool-down",
        zone: "Z3–Z4 for race pace miles",
        targetPace: "10:30–11:30/mi race pace",
      },
    ],
    strengthWork: BUILD_STRENGTH,
    notes: "You swim the full race distance this week (2100yd). Cross it off mentally — you've done it. The big brick is your confidence builder. Run off the bike at race pace — notice how much harder it is than a fresh run.",
  },
  {
    weekNumber: 7,
    startDate: "2026-06-15",
    endDate: "2026-06-21",
    phase: "build",
    isResidencyConstrained: false,
    swimMinutes: 90,
    bikeMinutes: 120,
    runMinutes: 90,
    strengthMinutes: 45,
    swimMeters: 2100,
    bikeMiles: 32,
    runMiles: 10,
    totalHours: 5.75,
    focusAreas: ["Residency prep", "Schedule blocking", "Recovery + mental reset"],
    keyWorkouts: [
      {
        sport: "swim",
        label: "Speed Work",
        structure: "400yd warm-up → 8×50yd fast with 20sec rest → 4×100yd at race pace → 200yd easy",
        zone: "Z4–Z5 on the 50s, Z3 on the 100s",
        targetPacePer100yd: "sub-2:10 on fast 50s, 2:10–2:25 on 100s",
      },
      {
        sport: "bike",
        label: "Easy Long Ride",
        structure: "2hr comfortable ride, Z2 throughout",
        zone: "Z2 — recovery ride pace after big week",
        targetSpeed: "14–16mph",
      },
      {
        sport: "run",
        label: "Fartlek Run",
        structure: "2mi easy → 5×(2min hard / 2min easy) → 2mi easy",
        zone: "Z4–Z5 for hard intervals, Z1 recovery",
        targetPace: "7:30–8:30/mi during hard intervals",
      },
    ],
    strengthWork: { ...BASE_STRENGTH, frequency: 1, label: "Transition (reduced volume)", duration: 45 },
    notes: "TRANSITION WEEK. Residency starts Monday. This week: block your 5am pool slots, weekend long sessions, and lunch runs in your hospital schedule. These blocks are sacred — protect them.",
  },

  // ═══════════════════════════════════════════════════════════════
  // PHASE 3: PEAK (Weeks 8–17, Jun 22–Aug 30)
  // Residency-constrained. Quality > quantity. 5–7 hours/week.
  // Every session must count — no junk miles.
  // ═══════════════════════════════════════════════════════════════
  {
    weekNumber: 8,
    startDate: "2026-06-22",
    endDate: "2026-06-28",
    phase: "peak",
    isResidencyConstrained: true,
    swimMinutes: 90,
    bikeMinutes: 165,
    runMinutes: 110,
    strengthMinutes: 40,
    swimMeters: 2300,
    bikeMiles: 45,
    runMiles: 12,
    totalHours: 6.8,
    focusAreas: ["5am session discipline", "Indoor trainer efficiency", "Race specificity"],
    keyWorkouts: [
      {
        sport: "swim",
        label: "Aerobic Threshold Swim",
        structure: "300yd warm-up → 3×500yd at race pace effort with 45sec rest → 200yd easy",
        zone: "Z3 sustained — this is your race effort",
        targetPacePer100yd: "2:10–2:25",
      },
      {
        sport: "bike",
        label: "Trainer Threshold Intervals",
        structure: "15min warm-up → 3×15min at race effort (17–18mph equivalent) with 5min easy → 10min cool-down",
        zone: "Z3–Z4 — this replaces long ride when time-constrained",
        targetSpeed: "17–18mph equivalent power",
      },
      {
        sport: "run",
        label: "Race Pace Run",
        structure: "2mi easy → 5mi at goal race pace → 1mi easy",
        zone: "Z3 for race pace miles",
        targetPace: "10:30–11:30/mi",
      },
    ],
    strengthWork: PEAK_STRENGTH,
    notes: "Residency week 1. Strength drops to 1x/week — keep it. 5am alarms are non-negotiable. Quality sessions > long easy sessions. Every minute of training counts now.",
  },
  {
    weekNumber: 9,
    startDate: "2026-06-29",
    endDate: "2026-07-05",
    phase: "peak",
    isResidencyConstrained: true,
    swimMinutes: 90,
    bikeMinutes: 180,
    runMinutes: 110,
    strengthMinutes: 40,
    swimMeters: 2500,
    bikeMiles: 50,
    runMiles: 13,
    totalHours: 7.0,
    focusAreas: ["First 40mi long ride", "July 4th long session", "Nutrition practice on long efforts"],
    keyWorkouts: [
      {
        sport: "swim",
        label: "Negative Split Swim",
        structure: "300yd easy → 1600yd (4×400yd) making each 400yd slightly faster → 200yd easy",
        zone: "Z2 → Z3 progression — practice going out easy and building",
        targetPacePer100yd: "start 2:20–2:30, finish 2:05–2:15",
      },
      {
        sport: "bike",
        label: "First 40mi Long Ride",
        structure: "40mi at Z2–Z3. First time going this distance. Fuel every 30min, hydrate every 15min, practice your race-day nutrition exactly.",
        zone: "Z2–Z3 — sustainable, 17–18mph. If HR climbs above Z3 on hills, back off.",
        targetSpeed: "17–18mph",
      },
      {
        sport: "run",
        label: "Long Run",
        structure: "10mi easy with 4×100m strides at mile 8",
        zone: "Z2 throughout, strides at Z5",
        targetPace: "10:00–11:00/mi",
      },
    ],
    strengthWork: PEAK_STRENGTH,
    notes: "July 4th weekend — use the holiday to get in your first 40mi ride. This is a milestone: it's the longest single effort of the block so far. Execute it at 17–18mph, fueled exactly as race day. The 45–48mi rides come in peak phase.",
  },
  {
    weekNumber: 10,
    startDate: "2026-07-06",
    endDate: "2026-07-12",
    phase: "peak",
    isResidencyConstrained: true,
    swimMinutes: 60,
    bikeMinutes: 90,
    runMinutes: 60,
    strengthMinutes: 40,
    swimMeters: 1600,
    bikeMiles: 26,
    runMiles: 7,
    totalHours: 4.2,
    focusAreas: ["Full recovery", "Sleep banking", "Maintain movement"],
    keyWorkouts: [
      {
        sport: "swim",
        label: "Easy Technique",
        structure: "800yd easy with focus on catch and pull mechanics",
        zone: "Z1 — just moving in the water",
        targetPacePer100yd: "no target",
      },
      {
        sport: "bike",
        label: "Recovery Spin",
        structure: "45min easy flat spin",
        zone: "Z1",
        targetSpeed: "13–15mph",
      },
      {
        sport: "run",
        label: "Easy Run",
        structure: "6mi easy",
        zone: "Z1–Z2",
        targetPace: "10:00–11:00/mi",
      },
    ],
    strengthWork: PEAK_STRENGTH,
    notes: "RECOVERY WEEK. 11 weeks to race. The fitness you built in weeks 1–9 is now being absorbed. Fighting the urge to train harder this week is itself a performance skill. Sleep 8+ hours every night.",
  },
  {
    weekNumber: 11,
    startDate: "2026-07-13",
    endDate: "2026-07-19",
    phase: "peak",
    isResidencyConstrained: true,
    swimMinutes: 100,
    bikeMinutes: 195,
    runMinutes: 120,
    strengthMinutes: 40,
    swimMeters: 2600,
    bikeMiles: 54,
    runMiles: 14,
    totalHours: 7.6,
    focusAreas: ["Full race-distance swim", "43mi brick ride", "First 10mi training run"],
    keyWorkouts: [
      {
        sport: "swim",
        label: "Full Race Distance",
        structure: "300yd warm-up → 2112yd continuous (full race distance, no stopping) → 200yd easy",
        zone: "Z2–Z3 sustained — settle into your race rhythm",
        targetPacePer100yd: "2:10–2:20",
      },
      {
        sport: "bike",
        label: "43mi Brick Ride",
        structure: "43mi at race pace → rack bike → immediately run 6mi at race pace. Practice all T2 logistics.",
        zone: "Z2–Z3 bike, Z3 run. This is your biggest confidence session to date.",
        targetSpeed: "17–18mph bike",
        targetPace: "10:40–11:30/mi run-off-bike",
      },
      {
        sport: "run",
        label: "Long Run with Race Miles",
        structure: "2mi easy → 8mi at goal race pace → 2mi easy",
        zone: "Z3 for race pace section",
        targetPace: "10:30–11:30/mi",
      },
    ],
    strengthWork: PEAK_STRENGTH,
    notes: "This is the peak confidence week. Swim the full 2112yd. Complete the big brick. Run 12mi. After this week you should feel — not think, feel — that you can complete this race.",
  },
  {
    weekNumber: 12,
    startDate: "2026-07-20",
    endDate: "2026-07-26",
    phase: "peak",
    isResidencyConstrained: true,
    swimMinutes: 100,
    bikeMinutes: 200,
    runMinutes: 130,
    strengthMinutes: 40,
    swimMeters: 2700,
    bikeMiles: 56,
    runMiles: 15,
    totalHours: 7.8,
    focusAreas: ["45mi long ride", "First 10+ mile training run", "Nutrition finalization"],
    keyWorkouts: [
      {
        sport: "swim",
        label: "Pyramid Intervals",
        structure: "300yd warm-up → 100-200-300-400-300-200-100yd with 20sec rest each → 200yd easy",
        zone: "Z3 throughout — controlled pace, build and descend",
        targetPacePer100yd: "2:10–2:25",
      },
      {
        sport: "bike",
        label: "Power Intervals",
        structure: "15min warm-up → 4×15min at race effort (17–18mph) with 5min easy → 15min cool-down",
        zone: "Z3–Z4 for intervals — this builds specific race fitness",
        targetSpeed: "17–18mph during intervals",
      },
      {
        sport: "run",
        label: "First 10+ Mile Training Run",
        structure: "15mi with miles 11–13 at race pace — your longest run of the training block",
        zone: "Z2 base, Z3 for race miles",
        targetPace: "10:00–11:00/mi easy, 10:30–11:30 race miles",
      },
    ],
    strengthWork: PEAK_STRENGTH,
    notes: "Two months to race. Lock in your nutrition: brand of gel, quantity, timing, salt tabs. Your gut needs to be trained just like your legs. Anything new on race day will cause GI issues. This week you also hit 10+ miles on your long run for the first time — that's a major confidence milestone.",
  },
  {
    weekNumber: 13,
    startDate: "2026-07-27",
    endDate: "2026-08-02",
    phase: "peak",
    isResidencyConstrained: true,
    swimMinutes: 100,
    bikeMinutes: 210,
    runMinutes: 140,
    strengthMinutes: 40,
    swimMeters: 2900,
    bikeMiles: 60,
    runMiles: 16,
    totalHours: 8.2,
    focusAreas: ["Peak volume week", "48mi race-sim ride", "11mi long run — longest of the block"],
    keyWorkouts: [
      {
        sport: "swim",
        label: "Over-Distance Swim",
        structure: "300yd warm-up → 2500yd continuous → 200yd easy (over-distance builds race-day confidence)",
        zone: "Z2 — controlled, don't blow up early",
        targetPacePer100yd: "2:15–2:25",
      },
      {
        sport: "bike",
        label: "Race Simulation (Day 1)",
        structure: "Swim 2112m → T1 practice → bike 48mi at race pace. This is as close to race day as it gets.",
        zone: "Z2–Z3 bike, practice all race-day logistics — kit, nutrition, transitions",
        targetSpeed: "17–18mph",
      },
      {
        sport: "run",
        label: "Race Simulation (Day 2)",
        structure: "Next morning: 8mi run at race pace, simulating a fatigued run from previous day",
        zone: "Z3 — expect to feel yesterday's ride",
        targetPace: "10:40–11:30/mi",
      },
    ],
    strengthWork: PEAK_STRENGTH,
    notes: "PEAK TRAINING WEEK — the hardest week of the block. Two-day race sim: swim 2112m + bike 48mi Saturday, then run 11mi Sunday on fatigued legs. That Saturday-Sunday back-to-back is the most race-specific training you can do. Set up your transition bag, gear, and nutrition exactly as race day. If you can execute this week, the race is within reach.",
  },
  {
    weekNumber: 14,
    startDate: "2026-08-03",
    endDate: "2026-08-09",
    phase: "peak",
    isResidencyConstrained: true,
    swimMinutes: 60,
    bikeMinutes: 90,
    runMinutes: 60,
    strengthMinutes: 40,
    swimMeters: 1600,
    bikeMiles: 25,
    runMiles: 7,
    totalHours: 4.2,
    focusAreas: ["Full recovery post-peak", "Race logistics planning", "Mental rehearsal"],
    keyWorkouts: [
      {
        sport: "swim",
        label: "Recovery Swim",
        structure: "1000yd easy, mix of strokes if desired",
        zone: "Z1",
        targetPacePer100yd: "no target",
      },
      {
        sport: "bike",
        label: "Easy Spin",
        structure: "45min easy, flat, no intervals",
        zone: "Z1",
        targetSpeed: "13–15mph",
      },
      {
        sport: "run",
        label: "Easy Recovery Run",
        structure: "6mi easy",
        zone: "Z1–Z2",
        targetPace: "10:30–11:30/mi",
      },
    ],
    strengthWork: PEAK_STRENGTH,
    notes: "RECOVERY WEEK. 7 weeks out. Your fitness is set. Book Augusta hotel, read the athlete guide, memorize the course. This is also a great week to mentally rehearse every stage of race day from alarm to finish line.",
  },
  {
    weekNumber: 15,
    startDate: "2026-08-10",
    endDate: "2026-08-16",
    phase: "peak",
    isResidencyConstrained: true,
    swimMinutes: 100,
    bikeMinutes: 195,
    runMinutes: 115,
    strengthMinutes: 40,
    swimMeters: 2600,
    bikeMiles: 54,
    runMiles: 13,
    totalHours: 7.5,
    focusAreas: ["Sharpening phase", "43mi race-effort ride", "Open water if possible"],
    keyWorkouts: [
      {
        sport: "swim",
        label: "Open Water or Pace Swim",
        structure: "If open water available: 30min continuous sighting practice. Pool: 300yd warm-up → 8×200yd at race pace → 200yd easy",
        zone: "Z3 — race effort throughout",
        targetPacePer100yd: "2:10–2:20",
      },
      {
        sport: "bike",
        label: "Threshold Intervals",
        structure: "15min warm-up → 5×10min at Z4 (hard) with 4min easy → 15min cool-down",
        zone: "Z4 — this is where race fitness is sharpened",
        targetSpeed: "18–19mph during intervals",
      },
      {
        sport: "run",
        label: "Fartlek + Long Run",
        structure: "8mi with 6×1min at 5k effort scattered throughout after mile 3",
        zone: "Z2 base, Z5 for the 1min efforts",
        targetPace: "10:00–11:00 easy, 7:30–8:00 hard efforts",
      },
    ],
    strengthWork: PEAK_STRENGTH,
    notes: "Sharpening begins. You've built the base, now sharpen the blade. If you can find open water (lake, reservoir), swim there at least once — sighting in open water with no lane lines is a skill you need to practice.",
  },
  {
    weekNumber: 16,
    startDate: "2026-08-17",
    endDate: "2026-08-23",
    phase: "peak",
    isResidencyConstrained: true,
    swimMinutes: 90,
    bikeMinutes: 180,
    runMinutes: 105,
    strengthMinutes: 40,
    swimMeters: 2300,
    bikeMiles: 50,
    runMiles: 12,
    totalHours: 7.0,
    focusAreas: ["Mini-race rehearsal", "40mi last long ride before taper", "Gear finalization"],
    keyWorkouts: [
      {
        sport: "swim",
        label: "Race-Pace Time Trial",
        structure: "400yd warm-up → 1500yd time trial (note your time) → 400yd easy",
        zone: "Z3–Z4 — race effort, check your current pace against your target",
        targetPacePer100yd: "2:05–2:20",
      },
      {
        sport: "bike",
        label: "Mini-Race Brick",
        structure: "Swim 1000yd → T1 → bike 40mi → T2 → run 6mi at race pace",
        zone: "Z2–Z3 throughout, race-day intensity",
        targetSpeed: "17–18mph bike",
        targetPace: "10:40–11:30/mi run",
      },
      {
        sport: "run",
        label: "Final Long Run",
        structure: "10mi with last 3mi at race pace",
        zone: "Z2 base, Z3 finish",
        targetPace: "10:00–11:00/mi easy, 10:30–11:30 race pace",
      },
    ],
    strengthWork: PEAK_STRENGTH,
    notes: "5 weeks out. Mini-race rehearsal — complete race gear, real transitions, race pace throughout. After this, you are ready. Finalize every item in your race bag. Don't improvise on race day.",
  },
  {
    weekNumber: 17,
    startDate: "2026-08-24",
    endDate: "2026-08-30",
    phase: "peak",
    isResidencyConstrained: true,
    swimMinutes: 75,
    bikeMinutes: 120,
    runMinutes: 75,
    strengthMinutes: 40,
    swimMeters: 2000,
    bikeMiles: 32,
    runMiles: 9,
    totalHours: 5.2,
    focusAreas: ["Last hard week", "Freshness entering taper", "Race-day mental prep"],
    keyWorkouts: [
      {
        sport: "swim",
        label: "Speed Session",
        structure: "400yd warm-up → 10×100yd at sprint effort with 15sec rest → 300yd easy",
        zone: "Z4–Z5 for the 100s — go fast, get sharp",
        targetPacePer100yd: "sub-2:05",
      },
      {
        sport: "bike",
        label: "Race Effort Ride",
        structure: "30mi with 20mi at race pace",
        zone: "Z3 for race miles",
        targetSpeed: "17–18mph",
      },
      {
        sport: "run",
        label: "Tempo Run",
        structure: "2mi easy → 5mi at tempo (Z4) → 2mi easy",
        zone: "Z4 for tempo — comfortably hard, 30min effort",
        targetPace: "8:30–9:00/mi tempo",
      },
    ],
    strengthWork: TAPER_STRENGTH,
    notes: "Last significant training week. 4 weeks to race. After Sunday, volume drops dramatically. Confirm: hotel, check-in time, bike check-in requirements, wetsuit legality. Your body is ready.",
  },

  // ═══════════════════════════════════════════════════════════════
  // PHASE 4: TAPER (Weeks 18–20, Aug 31–Sep 20)
  // Volume drops 50%+. Intensity maintained short. Feel fresh.
  // ═══════════════════════════════════════════════════════════════
  {
    weekNumber: 18,
    startDate: "2026-08-31",
    endDate: "2026-09-06",
    phase: "taper",
    isResidencyConstrained: true,
    swimMinutes: 60,
    bikeMinutes: 90,
    runMinutes: 60,
    strengthMinutes: 0,
    swimMeters: 1600,
    bikeMiles: 24,
    runMiles: 7,
    totalHours: 3.5,
    focusAreas: ["Freshness", "Short race-sharp intervals", "No heavy lifting"],
    keyWorkouts: [
      {
        sport: "swim",
        label: "Sharp Swim",
        structure: "400yd warm-up → 4×200yd at race pace → 200yd easy",
        zone: "Z3 for the 200s — stay sharp, don't fatigue",
        targetPacePer100yd: "2:10–2:20",
      },
      {
        sport: "bike",
        label: "Tune-Up Ride",
        structure: "45min with 4×5min at race effort",
        zone: "Z3 for the efforts",
        targetSpeed: "17–18mph efforts",
      },
      {
        sport: "run",
        label: "Strides Run",
        structure: "4mi easy → 6×20sec strides at mile effort → 2mi easy",
        zone: "Z2 base, Z5 strides",
        targetPace: "10:30–11:30 easy",
      },
    ],
    strengthWork: RACE_WEEK_STRENGTH,
    notes: "TAPER begins. Volume -40%. No strength training. Your legs will feel restless and heavy alternately — this is normal taper physiology. Carb intake can start trending slightly higher. Sleep is your #1 tool.",
  },
  {
    weekNumber: 19,
    startDate: "2026-09-07",
    endDate: "2026-09-13",
    phase: "taper",
    isResidencyConstrained: true,
    swimMinutes: 45,
    bikeMinutes: 60,
    runMinutes: 45,
    strengthMinutes: 0,
    swimMeters: 1200,
    bikeMiles: 16,
    runMiles: 5,
    totalHours: 2.5,
    focusAreas: ["Sharpness not fitness", "Visualization", "Gear verification"],
    keyWorkouts: [
      {
        sport: "swim",
        label: "Pace Check",
        structure: "300yd warm-up → 4×100yd at race pace → 200yd easy",
        zone: "Z3 — just confirming your pace",
        targetPacePer100yd: "2:05–2:20",
      },
      {
        sport: "bike",
        label: "Spin",
        structure: "30min easy with 2×5min at race effort",
        zone: "Z1–Z3",
        targetSpeed: "easy spin",
      },
      {
        sport: "run",
        label: "Easy Run + Strides",
        structure: "4mi easy + 4×20sec strides",
        zone: "Z1–Z2",
        targetPace: "10:30–11:30/mi",
      },
    ],
    strengthWork: RACE_WEEK_STRENGTH,
    notes: "2 weeks out. Pack your race bag. Mentally walk through the race start to finish — swim start, T1, first miles of bike, T2, first mile of run, crossing the finish. You've done the work.",
  },
  {
    weekNumber: 20,
    startDate: "2026-09-14",
    endDate: "2026-09-20",
    phase: "taper",
    isResidencyConstrained: true,
    swimMinutes: 30,
    bikeMinutes: 40,
    runMinutes: 25,
    strengthMinutes: 0,
    swimMeters: 700,
    bikeMiles: 10,
    runMiles: 3,
    totalHours: 1.6,
    focusAreas: ["Stay moving, not training", "Carb load starts Thursday", "Sleep 8hrs+"],
    keyWorkouts: [
      {
        sport: "swim",
        label: "Easy Shakeout",
        structure: "500yd very easy, any stroke",
        zone: "Z1 — water time, not training",
        targetPacePer100yd: "no target",
      },
      {
        sport: "bike",
        label: "10-Min Spin",
        structure: "20min very easy, just to move the legs",
        zone: "Z1",
        targetSpeed: "no target",
      },
      {
        sport: "run",
        label: "Easy 3mi",
        structure: "3mi very easy",
        zone: "Z1",
        targetPace: "10:30–11:30/mi",
      },
    ],
    strengthWork: RACE_WEEK_STRENGTH,
    notes: "Race week approach. Thursday: begin carb-loading (pasta, rice, sweet potato — aim for ~8–10g carb/kg body weight). Drink 3+ liters of water daily. Sleep is everything. Don't do anything new.",
  },

  // ═══════════════════════════════════════════════════════════════
  // RACE WEEK (Week 21, Sep 21–27)
  // ═══════════════════════════════════════════════════════════════
  {
    weekNumber: 21,
    startDate: "2026-09-21",
    endDate: "2026-09-27",
    phase: "race",
    isResidencyConstrained: false,
    swimMinutes: 20,
    bikeMinutes: 20,
    runMinutes: 10,
    strengthMinutes: 0,
    swimMeters: 350,
    bikeMiles: 6,
    runMiles: 2,
    totalHours: 0.8,
    focusAreas: ["Execute the race plan", "Calm and confident", "Trust 21 weeks of work"],
    keyWorkouts: [
      {
        sport: "swim",
        label: "Shakeout Swim (Thu or Fri)",
        structure: "400yd easy with 4×25yd at race pace. Just feel the water.",
        zone: "Z1–Z2",
        targetPacePer100yd: "whatever feels smooth",
      },
      {
        sport: "bike",
        label: "Shakeout Spin (Sat)",
        structure: "15–20min easy spin after bike check-in. Shift through gears.",
        zone: "Z1",
        targetSpeed: "no target",
      },
      {
        sport: "run",
        label: "Race Day — Augusta 70.3 🏁",
        structure: "Start conservative on swim (let the crowd go). Bike: first 10mi easy, build to race pace. Run: first mile SLOW — don't blow up.",
        zone: "Race execution",
        targetPace: "First run mile: 11:30–12:00/mi. Build from there.",
      },
    ],
    strengthWork: RACE_WEEK_STRENGTH,
    notes: "RACE WEEK. Arrive Thursday. Check-in Friday. Shakeout Saturday. RACE SUNDAY. Race plan: swim Z2, bike Z2–Z3 (don't go out hard), run first mile slow then build. You've done 20 weeks. This is the fun part.",
  },
];

// ─── Utility Functions ────────────────────────────────────────────────────────

export function getCurrentWeek(): TrainingWeek | null {
  const today = new Date();
  return (
    TRAINING_PLAN.find((w) => {
      const start = new Date(w.startDate);
      const end = new Date(w.endDate);
      end.setHours(23, 59, 59);
      return today >= start && today <= end;
    }) ?? null
  );
}

export function getWeek(weekNumber: number): TrainingWeek | null {
  return TRAINING_PLAN.find((w) => w.weekNumber === weekNumber) ?? null;
}

export function getDaysUntilRace(): number {
  const today = new Date();
  const race = new Date(RACE_DATE);
  const diff = race.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getWeekActivities(
  activities: import("./types").StravaActivity[],
  week: TrainingWeek
): import("./types").WeekActuals {
  const start = new Date(week.startDate + "T00:00:00");
  const end = new Date(week.endDate + "T23:59:59");

  const weekActivities = activities.filter((a) => {
    const d = new Date(a.start_date);
    return d >= start && d <= end;
  });

  const swimSessions = weekActivities.filter((a) =>
    a.type.toLowerCase().includes("swim")
  );
  const bikeSessions = weekActivities.filter((a) =>
    ["ride", "virtualride", "bike"].some((t) => a.type.toLowerCase().includes(t))
  );
  const runSessions = weekActivities.filter((a) =>
    a.type.toLowerCase().includes("run")
  );
  const otherSessions = weekActivities.filter(
    (a) =>
      !swimSessions.includes(a) &&
      !bikeSessions.includes(a) &&
      !runSessions.includes(a)
  );

  const sumMinutes = (arr: import("./types").StravaActivity[]) =>
    Math.round(arr.reduce((s, a) => s + a.duration_seconds / 60, 0));

  const swimMinutes = sumMinutes(swimSessions);
  const bikeMinutes = sumMinutes(bikeSessions);
  const runMinutes = sumMinutes(runSessions);

  const strengthSessions = weekActivities.filter((a) =>
    ["weighttraining", "workout", "crossfit", "weights"].some((t) =>
      a.type.toLowerCase().includes(t)
    )
  );

  const swimMeters = swimSessions.reduce((s, a) => s + (a.distance_meters || 0), 0);
  const bikeMiles = bikeSessions.reduce((s, a) => s + (a.distance_meters || 0) / 1609.34, 0);
  const runMiles = runSessions.reduce((s, a) => s + (a.distance_meters || 0) / 1609.34, 0);
  const strengthMinutes = sumMinutes(strengthSessions);

  return {
    swimSessions,
    bikeSessions,
    runSessions,
    strengthSessions,
    otherSessions: weekActivities.filter(
      (a) => !swimSessions.includes(a) && !bikeSessions.includes(a) &&
              !runSessions.includes(a) && !strengthSessions.includes(a)
    ),
    swimMinutes,
    bikeMinutes,
    runMinutes,
    strengthMinutes,
    totalMinutes: swimMinutes + bikeMinutes + runMinutes,
    swimMeters,
    bikeMiles,
    runMiles,
  };
}

// Derive fitness profile from all synced activities
export function buildFitnessProfile(
  activities: import("./types").StravaActivity[]
): import("./types").FitnessProfile {
  const runs = activities.filter((a) => a.type.toLowerCase().includes("run") && a.distance_meters > 1000);
  const bikes = activities.filter((a) =>
    ["ride", "virtualride"].some((t) => a.type.toLowerCase().includes(t)) && a.distance_meters > 5000
  );
  const swims = activities.filter((a) => a.type.toLowerCase().includes("swim") && a.distance_meters > 200);

  const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;

  const runPaces = runs.map((r) => (r.duration_seconds / 60) / (r.distance_meters / 1609.34));
  const bikeSpeedsRaw = bikes.map((b) => (b.distance_meters / 1609.34) / (b.duration_seconds / 3600));
  const swimPacesRaw = swims.map((s) => (s.duration_seconds / 60) / (s.distance_meters / 100)); // min per 100m

  return {
    avgRunPacePerMile: avg(runPaces) ? avg(runPaces)! * 60 : null,
    avgRunHR: avg(runs.filter((r) => r.avg_heartrate).map((r) => r.avg_heartrate!)),
    avgBikeSpeedMph: avg(bikeSpeedsRaw),
    avgBikeHR: avg(bikes.filter((b) => b.avg_heartrate).map((b) => b.avg_heartrate!)),
    avgBikeWatts: avg(bikes.filter((b) => b.average_watts).map((b) => b.average_watts!)),
    avgSwimPacePer100m: avg(swimPacesRaw),
    longestRunMiles: runs.length ? Math.max(...runs.map((r) => r.distance_meters / 1609.34)) : 0,
    longestBikeMiles: bikes.length ? Math.max(...bikes.map((b) => b.distance_meters / 1609.34)) : 0,
    recentActivities: activities.slice(0, 20),
  };
}

// ─── Weekly Schedule Generator ────────────────────────────────────────────────
// Produces a Mon–Sun session plan that splits weekly volume into individual
// workouts with specific distances/durations and where to fit strength.

import { DaySchedule, ScheduledSession } from "./types";

function s(
  sport: ScheduledSession["sport"],
  label: string,
  duration: number,
  opts: Partial<ScheduledSession> = {}
): ScheduledSession {
  return { sport, label, duration, ...opts };
}

export function generateWeekSchedule(week: TrainingWeek): DaySchedule[] {
  const { phase, isResidencyConstrained, swimMeters, bikeMiles, runMiles, strengthWork } = week;

  // Helpers
  const r = (n: number) => Math.round(n);
  const hasStrength = strengthWork.frequency > 0;

  // ── Week-specific explicit schedules (pre-residency double sessions) ──────

  if (week.weekNumber === 2) {
    return [
      { day: "Mon", sessions: [
        s("bike", "Easy road ride", 95, { distance: 23, distanceUnit: "mi", note: "7am · Z1 — just spin, keep HR low" }),
      ]},
      { day: "Tue", sessions: [
        s("run", "Run/Walk 1.5mi", 25, { distance: 1.5, distanceUnit: "mi", note: "7am · walk at 140bpm, resume at 130bpm. Z1-Z2." }),
        s("strength", "Upper Body", 40, { note: "6pm · Chest, back, shoulders, arms" }),
      ]},
      { day: "Wed", sessions: [
        s("swim", "Swim drills + easy laps", 45, { distance: 1000, distanceUnit: "m", note: "7am · drills + easy Z2 laps" }),
        s("strength", "Lower Body", 40, { note: "6pm · Squats, lunges, hamstrings, calves" }),
      ]},
      { day: "Thu", sessions: [
        s("bike", "Trainer ride", 50, { distance: 13, distanceUnit: "mi", note: "7am · Z1-Z2 · easy cadence work" }),
        s("run", "Run/Walk 1.5mi", 25, { distance: 1.5, distanceUnit: "mi", note: "6pm · Maffetone walk/run — same HR rules" }),
      ]},
      { day: "Fri", sessions: [
        s("swim", "Swim endurance", 50, { distance: 1600, distanceUnit: "m", note: "7am · build to continuous Z2 laps" }),
        s("strength", "Core + Full Body", 40, { note: "6pm · Core, compound lifts, mobility" }),
      ]},
      { day: "Sat", sessions: [
        s("bike", "Long ride", 120, { distance: 23, distanceUnit: "mi", note: "7am · Z1-Z2. Build to a stop-free 25mi over weeks." }),
      ]},
      { day: "Sun", sessions: [
        s("rest", "Rest / Active Recovery", 0, { note: "Walk, stretch, foam roll" }),
      ]},
    ];
  }

  if (week.weekNumber === 3) {
    return [
      { day: "Mon", sessions: [
        s("bike", "Easy road ride", 95, { distance: 25, distanceUnit: "mi", note: "7am · Z1 — comfortable aerobic spin" }),
      ]},
      { day: "Tue", sessions: [
        s("run", "Run/Walk 3mi", 40, { distance: 3, distanceUnit: "mi", note: "7am · Maffetone walk/run. Z1-Z2." }),
        s("strength", "Upper Body", 40, { note: "6pm · Chest, back, shoulders, arms" }),
      ]},
      { day: "Wed", sessions: [
        s("swim", "Swim drills + laps", 50, { distance: 1200, distanceUnit: "m", note: "7am · drills + continuous Z2" }),
        s("strength", "Lower Body", 40, { note: "6pm · Squats, lunges, hamstrings, calves" }),
      ]},
      { day: "Thu", sessions: [
        s("bike", "Trainer ride", 55, { distance: 15, distanceUnit: "mi", note: "7am · Z2 steady cadence" }),
        s("run", "Run/Walk 3mi", 40, { distance: 3, distanceUnit: "mi", note: "6pm · Maffetone walk/run" }),
      ]},
      { day: "Fri", sessions: [
        s("swim", "Swim endurance", 55, { distance: 1600, distanceUnit: "m", note: "7am · continuous Z2, build confidence" }),
        s("strength", "Core + Full Body", 40, { note: "6pm · Core, compound lifts, mobility" }),
      ]},
      { day: "Sat", sessions: [
        s("bike", "Long ride", 135, { distance: 30, distanceUnit: "mi", note: "7am · Z1-Z2. Target 17–18mph average." }),
      ]},
      { day: "Sun", sessions: [
        s("run", "Long run/walk", 55, { distance: 3, distanceUnit: "mi", note: "7am · Maffetone HR rules. Easy effort." }),
      ]},
    ];
  }

  if (week.weekNumber === 4) {
    // Recovery week — reduced volume, maintain frequency
    return [
      { day: "Mon", sessions: [
        s("bike", "Easy recovery ride", 60, { distance: 15, distanceUnit: "mi", note: "7am · Z1 only. Flush legs." }),
      ]},
      { day: "Tue", sessions: [
        s("run", "Easy run/walk 2mi", 30, { distance: 2, distanceUnit: "mi", note: "7am · HR-gated, very easy" }),
        s("strength", "Light Upper Body", 30, { note: "6pm · Reduced weight, higher reps. Maintenance only." }),
      ]},
      { day: "Wed", sessions: [
        s("swim", "Easy swim", 40, { distance: 1000, distanceUnit: "m", note: "7am · Z1-Z2 only. Feel good in water." }),
      ]},
      { day: "Thu", sessions: [
        s("bike", "Trainer spin", 40, { distance: 10, distanceUnit: "mi", note: "7am · easy cadence, no effort" }),
        s("strength", "Core + Mobility", 30, { note: "6pm · Core and mobility work only" }),
      ]},
      { day: "Fri", sessions: [
        s("swim", "Short swim", 35, { distance: 900, distanceUnit: "m", note: "7am · drills and easy laps" }),
      ]},
      { day: "Sat", sessions: [
        s("bike", "Moderate ride", 75, { distance: 20, distanceUnit: "mi", note: "7am · Z1-Z2. No pushing today." }),
      ]},
      { day: "Sun", sessions: [
        s("rest", "Rest / Active Recovery", 0, { note: "Full rest. Sleep, eat, recover." }),
      ]},
    ];
  }

  if (week.weekNumber === 5) {
    return [
      { day: "Mon", sessions: [
        s("bike", "Road ride", 100, { distance: 28, distanceUnit: "mi", note: "7am · Z1-Z2. Build on week 3." }),
      ]},
      { day: "Tue", sessions: [
        s("run", "Run/Walk 3mi", 40, { distance: 3, distanceUnit: "mi", note: "7am · Maffetone walk/run. Z1-Z2." }),
        s("strength", "Upper Body", 40, { note: "6pm · Chest, back, shoulders, arms" }),
      ]},
      { day: "Wed", sessions: [
        s("swim", "Swim drills + laps", 55, { distance: 1400, distanceUnit: "m", note: "7am · drills + continuous Z2" }),
        s("strength", "Lower Body", 40, { note: "6pm · Squats, lunges, hamstrings, calves" }),
      ]},
      { day: "Thu", sessions: [
        s("bike", "Trainer ride", 60, { distance: 17, distanceUnit: "mi", note: "7am · Z2 steady effort" }),
        s("run", "Run/Walk 3mi", 40, { distance: 3, distanceUnit: "mi", note: "6pm · Maffetone walk/run" }),
      ]},
      { day: "Fri", sessions: [
        s("swim", "Swim endurance", 60, { distance: 1900, distanceUnit: "m", note: "7am · continuous Z2 laps" }),
        s("strength", "Core + Full Body", 40, { note: "6pm · Core, compound lifts, mobility" }),
      ]},
      { day: "Sat", sessions: [
        s("bike", "Long ride", 150, { distance: 33, distanceUnit: "mi", note: "7am · Z1-Z2. Push toward 35mi stop-free." }),
      ]},
      { day: "Sun", sessions: [
        s("run", "Long run/walk", 55, { distance: 3, distanceUnit: "mi", note: "7am · Maffetone HR rules. Building week." }),
      ]},
    ];
  }

  if (phase === "race") {
    return [
      { day: "Mon", sessions: [s("rest", "Rest — travel day", 0)] },
      { day: "Tue", sessions: [s("rest", "Rest", 0)] },
      { day: "Wed", sessions: [s("rest", "Rest + athlete check-in", 0)] },
      { day: "Thu", sessions: [s("swim", "Shakeout swim", 20, { distance: 350, distanceUnit: "m", note: "Easy, just feel the water" })] },
      { day: "Fri", sessions: [s("bike", "Gear check spin", 15, { distance: 6, distanceUnit: "mi", note: "Shift through all gears after bike check-in" })] },
      { day: "Sat", sessions: [s("run", "2-min easy shakeout jog", 10, { note: "Stay off your feet today. Sleep early." })] },
      { day: "Sun", sessions: [s("run", "RACE DAY — Augusta 70.3 🏁", 0, { isKeyWorkout: true, note: "Start easy. Build on the run. Enjoy it." })] },
    ];
  }

  if (phase === "taper") {
    // Short, sharp sessions. No heavy lifting. Stay sharp not tired.
    const swimA = r(swimMeters * 0.55);
    const swimB = r(swimMeters * 0.45);
    const bikeA = +(bikeMiles * 0.6).toFixed(1);
    const runA  = +(runMiles  * 0.55).toFixed(1);
    const runB  = +(runMiles  * 0.45).toFixed(1);
    return [
      { day: "Mon", sessions: [
          hasStrength ? s("strength", "Activation (light)", strengthWork.duration, { note: "Light weight, activation only — no soreness" }) : s("rest", "Rest", 0),
        ] },
      { day: "Tue", sessions: [s("swim", "Pace swim", week.swimMinutes, { distance: swimA, distanceUnit: "m", note: "Z3 for the main set, otherwise Z1" })] },
      { day: "Wed", sessions: [s("bike", "Tune-up ride", week.bikeMinutes, { distance: bikeA, distanceUnit: "mi", note: "A few Z3 efforts, mostly easy" })] },
      { day: "Thu", sessions: [s("run", "Strides run", week.runMinutes, { distance: runA, distanceUnit: "mi", note: "Easy pace + 4–6×20sec strides" })] },
      { day: "Fri", sessions: [s("rest", "Rest", 0)] },
      { day: "Sat", sessions: [s("swim", "Easy shakeout", 20, { distance: swimB, distanceUnit: "m" })] },
      { day: "Sun", sessions: [s("run", "Easy shake-out run", 25, { distance: runB, distanceUnit: "mi" })] },
    ];
  }

  if (isResidencyConstrained) {
    // Residency schedule: 1 strength, 2 swim, 2 bike, 2 run
    // Mon: Strength
    // Tue: Swim (5am)
    // Wed: Bike (trainer)
    // Thu: Run (quality)
    // Fri: Swim (optional / 5am)
    // Sat: Long Bike (main event)
    // Sun: Long Run
    const swimA = r(swimMeters * 0.35); // Tuesday
    const swimB = r(swimMeters * 0.65); // Friday
    const bikeA = +(bikeMiles * 0.20).toFixed(1); // Wednesday trainer (short — save legs for Saturday)
    const bikeB = +(bikeMiles * 0.80).toFixed(1); // Saturday long ride (priority — must build to 40–50mi single ride)
    const runA  = +(runMiles  * 0.30).toFixed(1); // Thursday quality
    const runB  = +(runMiles  * 0.70).toFixed(1); // Sunday long (must build to 10–12mi single runs)

    // In peak phase, Saturday is sometimes a brick
    const satIsBrick = phase === "peak" && week.weekNumber >= 11;
    const brickRunMi = +(runA * 0.7).toFixed(1);

    return [
      { day: "Mon", sessions: [
          hasStrength
            ? s("strength", strengthWork.label, strengthWork.duration, { note: "Before or after work. Do not skip — 1x/week is minimum." })
            : s("rest", "Rest", 0),
        ] },
      { day: "Tue", sessions: [s("swim", "Morning swim (5am)", week.swimMinutes > 60 ? 60 : week.swimMinutes, { distance: swimA, distanceUnit: "m", note: "Pool is quiet at 5am. Main set + warm-up/cool-down." })] },
      { day: "Wed", sessions: [s("bike", "Trainer intervals", week.bikeMinutes > 75 ? 75 : week.bikeMinutes, { distance: bikeA, distanceUnit: "mi", note: "Trainer or outdoor. Quality over distance — hit your zones." })] },
      { day: "Thu", sessions: [s("run", "Quality run", week.runMinutes > 60 ? 55 : week.runMinutes, { distance: runA, distanceUnit: "mi", note: "Your quality run day — tempo, intervals, or race pace depending on week focus." })] },
      { day: "Fri", sessions: [s("swim", "Swim (optional — 5am or evening)", 45, { distance: swimB, distanceUnit: "m", note: "If life gets in the way, this is the first session to drop. Don't drop Saturday." })] },
      { day: "Sat", sessions: satIsBrick
          ? [
              s("bike", "Long ride", 120, { distance: bikeB, distanceUnit: "mi", isKeyWorkout: true, note: "Most important session of the week. Fuel every 30min." }),
              s("run", "Brick run (off bike)", 25, { distance: brickRunMi, distanceUnit: "mi", isKeyWorkout: true, note: "Immediately after racking bike. Legs will feel heavy — that's the point." }),
            ]
          : [s("bike", "Long ride", 130, { distance: bikeB, distanceUnit: "mi", isKeyWorkout: true, note: "Most important session of the week. Protect this time." })] },
      { day: "Sun", sessions: [s("run", "Long run", week.runMinutes > 70 ? 75 : week.runMinutes, { distance: runB, distanceUnit: "mi", isKeyWorkout: true, note: "Easy Z2 pace. Run-walk if needed. Build your longest run of the week here." })] },
    ];
  }

  // Free schedule (base + build, no residency)
  // Base: 2 strength, 3 swim, 2 bike, 2 run — no brick
  // Build: 2 strength, 2 swim, 2 bike, 2 run + brick Saturday
  const isBuild = phase === "build";
  const swimA = r(swimMeters * 0.4);  // Tuesday
  const swimB = r(swimMeters * 0.6);  // Thursday
  const bikeA = +(bikeMiles * 0.25).toFixed(1); // Wednesday
  const bikeB = +(bikeMiles * 0.75).toFixed(1); // Saturday
  const runA  = +(runMiles  * 0.30).toFixed(1); // Wednesday or Thursday
  const runB  = +(runMiles  * 0.70).toFixed(1); // Sunday (long run — must build to 10–12mi)

  if (isBuild) {
    // Build: Saturday = brick (bike + run combined)
    const brickBike = +(bikeMiles * 0.75).toFixed(1); // 75% of weekly bike to brick (midweek accounts for 25%)
    const brickRun  = +(runMiles  * 0.28).toFixed(1);
    return [
      { day: "Mon", sessions: [s("strength", strengthWork.label, strengthWork.duration, { note: "Session 1 of 2 this week. Do before evening fatigue sets in." })] },
      { day: "Tue", sessions: [
          s("swim", "Interval swim", week.swimMinutes > 60 ? 60 : week.swimMinutes, { distance: swimA, distanceUnit: "m", isKeyWorkout: true, note: "Main quality swim session — follow key workout structure." }),
        ] },
      { day: "Wed", sessions: [
          s("bike", "Moderate ride", 75, { distance: bikeA, distanceUnit: "mi", note: "Z2–Z3. Cadence 85–95rpm. Build aerobic base on the bike." }),
        ] },
      { day: "Thu", sessions: [
          s("strength", strengthWork.label, strengthWork.duration, { note: "Session 2 of 2. Heavy lifts — Bulgarian split squat, hip thrust." }),
          s("run", "Quality run", 50, { distance: runA, distanceUnit: "mi", note: "Run after strength or separate. Tempo or race pace depending on week." }),
        ] },
      { day: "Fri", sessions: [s("swim", "Endurance swim", 55, { distance: swimB, distanceUnit: "m", note: "Longer, steadier swim. Build aerobic endurance in the water." })] },
      { day: "Sat", sessions: [
          s("brick", "Brick session", 150, { isKeyWorkout: true, note: `Bike ${brickBike}mi → rack → immediately run ${brickRun}mi. Practice T2 transition.` }),
        ] },
      { day: "Sun", sessions: [s("run", "Long run", 80, { distance: runB, distanceUnit: "mi", isKeyWorkout: true, note: "Easy Z2 pace. No watch pressure. Build time on feet." })] },
    ];
  }

  // Base schedule
  return [
    { day: "Mon", sessions: [s("strength", strengthWork.label, strengthWork.duration, { note: "Strength session 1 of 2. Foundation lifts — learn the movements." })] },
    { day: "Tue", sessions: [
        s("swim", "Technique swim", 40, { distance: swimA, distanceUnit: "m", note: "Drills + easy laps. Focus on catch and bilateral breathing." }),
        s("run", "Easy run", 40, { distance: runA, distanceUnit: "mi", note: "Z2 only — conversational pace. Slower than you think." }),
      ] },
    { day: "Wed", sessions: [s("bike", "Aerobic ride", 65, { distance: bikeA, distanceUnit: "mi", note: "Z2. Cadence 85–95rpm. Flat or rolling terrain." })] },
    { day: "Thu", sessions: [
        s("strength", strengthWork.label, strengthWork.duration, { note: "Strength session 2 of 2. Same exercises — add a little weight vs Monday." }),
        s("swim", "Endurance swim", 45, { distance: swimB, distanceUnit: "m", note: "Continuous laps with minimal rest. Build your aerobic base in the pool." }),
      ] },
    { day: "Fri", sessions: [s("rest", "Rest day", 0, { note: "Full rest. Walk if you want movement. Sleep 8hrs." })] },
    { day: "Sat", sessions: [s("bike", "Long ride", 80, { distance: bikeB, distanceUnit: "mi", isKeyWorkout: true, note: "Longest ride of the week. Z2 pace. Fuel every 30min. No heroics." })] },
    { day: "Sun", sessions: [s("run", "Long run", 65, { distance: runB, distanceUnit: "mi", isKeyWorkout: true, note: "Easy Z2 long run. Run/walk intervals are fine." })] },
  ];
}
