-- Complete Hirea 15-Module Ecosystem Migration (v3)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS user_score INTEGER NOT NULL DEFAULT 820,
  ADD COLUMN IF NOT EXISTS ats_score INTEGER NOT NULL DEFAULT 78,
  ADD COLUMN IF NOT EXISTS tier_badge TEXT NOT NULL DEFAULT 'Gold Badge',
  ADD COLUMN IF NOT EXISTS referral_count INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS interview_passed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS resume_template TEXT NOT NULL DEFAULT 'royal';

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS sponsored BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.virtual_pods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  rate TEXT NOT NULL,
  members TEXT[] NOT NULL DEFAULT '{}',
  splits INTEGER[] NOT NULL DEFAULT '{40,30,30}',
  avg_score INTEGER NOT NULL DEFAULT 900,
  verified BOOLEAN NOT NULL DEFAULT true,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.startups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sector TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'Seed Round',
  ask_lakhs INTEGER NOT NULL DEFAULT 45,
  raised_lakhs INTEGER NOT NULL DEFAULT 30,
  equity TEXT NOT NULL DEFAULT '8% Equity',
  traction TEXT NOT NULL,
  founders TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.escrow_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client TEXT NOT NULL,
  talent TEXT NOT NULL,
  milestone TEXT NOT NULL,
  gross_amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'Funded in Escrow',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hirea_bites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL,
  topic TEXT NOT NULL DEFAULT 'Trending',
  media_type TEXT NOT NULL DEFAULT 'post',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  likes INTEGER NOT NULL DEFAULT 12,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.webinars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  speaker TEXT NOT NULL,
  scheduled_for TEXT NOT NULL,
  attendees_count INTEGER NOT NULL DEFAULT 250,
  xp_reward INTEGER NOT NULL DEFAULT 50,
  badge_reward TEXT NOT NULL DEFAULT 'Webinar Insider',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Massive-Scale Leaderboard Tier Resolver (Top 500 Platinum, Top 5k Gold, Top 50k Silver, 50k+ Bronze)
CREATE OR REPLACE FUNCTION public.resolve_leaderboard_tier(_rank BIGINT)
RETURNS TEXT
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT CASE
    WHEN _rank <= 500 THEN 'Platinum (Top 500)'
    WHEN _rank <= 5000 THEN 'Gold (Top 5k)'
    WHEN _rank <= 50000 THEN 'Silver (Top 50k)'
    ELSE 'Bronze (50k+)'
  END;
$$;
