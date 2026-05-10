-- IronSuhba — Supabase Schema
-- Run this in your Supabase SQL Editor (supabase.co → your project → SQL Editor)

-- Users (one per Strava account)
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  strava_athlete_id bigint unique not null,
  name text not null,
  email text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Strava OAuth tokens
create table if not exists strava_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade unique,
  access_token text not null,
  refresh_token text not null,
  expires_at bigint not null,
  updated_at timestamptz default now()
);

-- Strava activities (synced)
create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  strava_activity_id bigint unique not null,
  name text,
  type text,
  start_date timestamptz,
  duration_seconds integer,
  distance_meters float,
  avg_heartrate float,
  max_heartrate float,
  total_elevation_gain float,
  average_speed float,
  average_watts float,
  suffer_score integer,
  strava_url text,
  created_at timestamptz default now()
);

-- Weekly AI analyses
create table if not exists weekly_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  week_number integer not null,
  analysis_text text,
  compliance_percentage float,
  created_at timestamptz default now(),
  unique(user_id, week_number)
);

-- Indexes for common queries
create index if not exists activities_user_date on activities(user_id, start_date desc);
create index if not exists activities_strava_id on activities(strava_activity_id);
