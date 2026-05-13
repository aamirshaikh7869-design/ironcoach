export type SportType = "swim" | "bike" | "run" | "brick" | "strength" | "rest";
export type Phase = "base" | "build" | "peak" | "taper" | "race";

export interface StrengthExercise {
  name: string;
  sets: number;
  reps: string;
  cues?: string;
}

export interface StrengthSession {
  frequency: number;
  label: string;
  duration: number;
  exercises: StrengthExercise[];
}

export interface WorkoutDetail {
  sport: "swim" | "bike" | "run";
  label: string;
  structure: string;
  zone: string;
  targetPace?: string;
  targetSpeed?: string;
  targetPacePer100yd?: string;
}

// A single planned session within a day
export interface ScheduledSession {
  sport: "swim" | "bike" | "run" | "strength" | "brick" | "rest";
  label: string;
  duration: number;       // minutes
  distance?: number;
  distanceUnit?: "mi" | "m";
  isKeyWorkout?: boolean;
  note?: string;
}

export interface DaySchedule {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  sessions: ScheduledSession[];
}

export interface TrainingWeek {
  weekNumber: number;
  startDate: string;
  endDate: string;
  phase: Phase;
  isResidencyConstrained: boolean;

  // Target volumes (minutes)
  swimMinutes: number;
  bikeMinutes: number;
  runMinutes: number;
  strengthMinutes: number;

  // Target distances
  swimMeters: number;   // meters (pool standard)
  bikeMiles: number;
  runMiles: number;

  totalHours: number;

  focusAreas: string[];
  keyWorkouts: WorkoutDetail[];
  strengthWork: StrengthSession;
  notes: string;
}

export interface StravaActivity {
  id: string;
  user_id: string;
  strava_activity_id: number;
  name: string;
  type: string;
  start_date: string;
  duration_seconds: number;
  distance_meters: number;
  avg_heartrate: number | null;
  max_heartrate: number | null;
  total_elevation_gain: number | null;
  average_speed: number | null;
  average_watts: number | null;
  suffer_score: number | null;
  strava_url: string;
}

export interface WeeklyAnalysis {
  id: string;
  user_id: string;
  week_number: number;
  analysis_text: string;
  compliance_percentage: number;
  created_at: string;
}

export interface User {
  id: string;
  strava_athlete_id: number;
  name: string;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface StravaToken {
  user_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface WeekActuals {
  swimSessions: StravaActivity[];
  bikeSessions: StravaActivity[];
  runSessions: StravaActivity[];
  strengthSessions: StravaActivity[];
  otherSessions: StravaActivity[];

  swimMinutes: number;
  bikeMinutes: number;
  runMinutes: number;
  strengthMinutes: number;
  totalMinutes: number;

  swimMeters: number;
  bikeMiles: number;
  runMiles: number;
}

export interface WeekOverride {
  week_number: number;
  swim_meters?: number;
  bike_miles?: number;
  run_miles?: number;
  reason?: string;
}

export interface DayScheduleOverride {
  week_number: number;
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  sessions: ScheduledSession[];
  reason?: string;
}

export interface ToolEvent {
  t: "tool";
  name: string;
  ok: boolean;
  msg: string;
  display: {
    week_number?: number;
    day?: string;
    changes?: string[];
    sessions?: string[];
    reason?: string;
  };
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolEvents?: ToolEvent[];
  streaming?: boolean;
  created_at?: string;
}

export interface FitnessProfile {
  avgRunPacePerMile: number | null;
  avgRunHR: number | null;
  avgBikeSpeedMph: number | null;
  avgBikeHR: number | null;
  avgBikeWatts: number | null;
  avgSwimPacePer100m: number | null;
  longestRunMiles: number;
  longestBikeMiles: number;
  recentActivities: StravaActivity[];
}
