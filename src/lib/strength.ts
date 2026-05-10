import { StrengthSession } from "./types";

// ─── Triathlon Strength Programming ──────────────────────────────────────────
// Periodized across 4 phases. Each phase builds on the last.
// Sessions: 40–50min, 2x/week during base/build, 1x/week during peak/taper.
// Key principles:
//   - Prioritize unilateral work (single-leg/arm) → injury prevention + sport specificity
//   - Hip hinge patterns → run economy + bike power
//   - Pull > Push ratio 2:1 → swim strength + shoulder health
//   - Core = anti-rotation, not sit-ups → triathlon core is all about stability

export const BASE_STRENGTH: StrengthSession = {
  frequency: 2,
  label: "Foundation Strength",
  duration: 45,
  exercises: [
    {
      name: "Goblet Squat",
      sets: 3,
      reps: "12–15",
      cues: "Hold DB at chest. Knees track toes. Drive floor away on the way up.",
    },
    {
      name: "Romanian Deadlift (DB)",
      sets: 3,
      reps: "12–15",
      cues: "Hinge at hips, soft knee bend. Feel the hamstring stretch. Big glute squeeze at top.",
    },
    {
      name: "Single-Leg Glute Bridge",
      sets: 3,
      reps: "12 each leg",
      cues: "Flat back on floor. Drive through heel. Hold 1 sec at top. Key for run economy.",
    },
    {
      name: "Dumbbell Row (3-point)",
      sets: 3,
      reps: "12–15 each",
      cues: "Elbow drives to hip, not flared out. This builds your swim pull.",
    },
    {
      name: "Band Pull-Apart",
      sets: 3,
      reps: "20",
      cues: "Arms straight. Pull band to chest width. Squeeze shoulder blades. Critical for swim shoulder health.",
    },
    {
      name: "Dead Bug",
      sets: 3,
      reps: "8 each side",
      cues: "Lower back pressed INTO floor the entire time. Slow and controlled. Breathe out as you extend.",
    },
    {
      name: "Calf Raise (single-leg)",
      sets: 3,
      reps: "15 each",
      cues: "Full range — all the way down, all the way up. Prevents Achilles issues from run volume ramp.",
    },
    {
      name: "Plank",
      sets: 3,
      reps: "30–45 sec",
      cues: "Squeeze glutes, brace abs, don't let hips drop. Quality over duration.",
    },
  ],
};

export const BUILD_STRENGTH: StrengthSession = {
  frequency: 2,
  label: "Strength Development",
  duration: 50,
  exercises: [
    {
      name: "Bulgarian Split Squat (DB)",
      sets: 4,
      reps: "8 each leg",
      cues: "Rear foot elevated. Torso slightly forward. This is the best single exercise for triathletes. Go heavy.",
    },
    {
      name: "Single-Leg Romanian Deadlift (DB)",
      sets: 4,
      reps: "8 each leg",
      cues: "Balance on one foot. Hinge to parallel, back flat. Develops hip stability for running.",
    },
    {
      name: "Hip Thrust (barbell or DB)",
      sets: 4,
      reps: "10–12",
      cues: "Upper back on bench, drive hips up explosively. Glutes are the engine of your run. Load this heavy.",
    },
    {
      name: "Pull-Up or Assisted Pull-Up",
      sets: 4,
      reps: "6–8",
      cues: "Dead hang start. Lead with chest, not chin. This is your swim power generator.",
    },
    {
      name: "Dumbbell Bench Press",
      sets: 3,
      reps: "10",
      cues: "Chest press angle mimics swim stroke recovery phase. Keep shoulders packed.",
    },
    {
      name: "Pallof Press",
      sets: 3,
      reps: "10 each side",
      cues: "Cable or band at chest height. Press out, hold 2 sec, return. Anti-rotation = triathlon core.",
    },
    {
      name: "Step-Up with Knee Drive (DB)",
      sets: 3,
      reps: "10 each leg",
      cues: "Controlled step up, drive opposite knee to 90°. Mimics running mechanics.",
    },
    {
      name: "Copenhagen Side Plank",
      sets: 3,
      reps: "20 sec each",
      cues: "Top foot on bench, bottom leg floating. Adductor strength → run injury prevention.",
    },
  ],
};

export const PEAK_STRENGTH: StrengthSession = {
  frequency: 1,
  label: "Power Maintenance",
  duration: 40,
  exercises: [
    {
      name: "Trap Bar Deadlift or Goblet Squat",
      sets: 3,
      reps: "5–6 (heavy)",
      cues: "Low volume, high intent. Keep the neural drive without accumulating fatigue.",
    },
    {
      name: "Hip Thrust",
      sets: 3,
      reps: "8",
      cues: "Maintain glute strength — critical for run off the bike when legs are pre-fatigued.",
    },
    {
      name: "Pull-Up or Cable Row",
      sets: 3,
      reps: "8",
      cues: "Swim pull maintenance. Don't lose what you've built.",
    },
    {
      name: "Box Jump or Jump Squat",
      sets: 3,
      reps: "5 (explosive)",
      cues: "Full reset between reps. Quality only. Develops race-day power and neuromuscular sharpness.",
    },
    {
      name: "Single-Leg RDL",
      sets: 2,
      reps: "10 each",
      cues: "Lighter than build phase. Maintain the pattern, not the load.",
    },
    {
      name: "Dead Bug + Pallof Press circuit",
      sets: 2,
      reps: "8 each",
      cues: "Core maintenance. 5 min at end of session.",
    },
  ],
};

export const TAPER_STRENGTH: StrengthSession = {
  frequency: 1,
  label: "Activation Only",
  duration: 25,
  exercises: [
    {
      name: "Goblet Squat",
      sets: 2,
      reps: "10 (light)",
      cues: "Just waking up the pattern. No soreness allowed race week.",
    },
    {
      name: "Single-Leg Glute Bridge",
      sets: 2,
      reps: "12 each",
      cues: "Activate glutes before runs and rides this week.",
    },
    {
      name: "Band Pull-Apart",
      sets: 2,
      reps: "15",
      cues: "Shoulder warm-up for swims.",
    },
    {
      name: "Dead Bug",
      sets: 2,
      reps: "6 each",
      cues: "Core activation only.",
    },
    {
      name: "Calf Raise",
      sets: 2,
      reps: "15",
      cues: "Keep Achilles ready.",
    },
  ],
};

export const RACE_WEEK_STRENGTH: StrengthSession = {
  frequency: 0,
  label: "Rest",
  duration: 0,
  exercises: [],
};
