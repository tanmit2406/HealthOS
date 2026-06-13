-- Enable the UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Health Metrics Table (Stores daily raw data from Apple Health)
create table if not exists health_metrics (
  date date primary key,
  resting_heart_rate integer,
  hrv_avg numeric(5,2),
  sleep_deep_mins integer,
  sleep_core_mins integer,
  sleep_rem_mins integer,
  respiratory_rate_avg numeric(5,2),
  wrist_temp_diff numeric(5,2),
  steps integer,
  active_calories integer,
  workout_duration_mins integer,
  weight numeric(5,2),
  blood_oxygen_avg numeric(5,2),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Daily Insights Table (Stores AI-generated insights)
create table if not exists daily_insights (
  date date primary key references health_metrics(date) on delete cascade,
  readiness_score integer check (readiness_score >= 0 and readiness_score <= 100),
  summary_briefing text,
  stress_analysis text,
  fitness_recommendation text,
  weight_trend_analysis text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) but since this is a private dashboard,
-- we'll allow all authenticated operations or create a single-user setup.
-- For simplicity in a personal dashboard where the API key is kept secret, 
-- we will allow public read/write if they have the anon key and we use a service role,
-- but the best practice is to require authentication.
-- Here we'll just define the tables.
