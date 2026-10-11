/*
# Create meetings table (single-tenant, no auth)

1. New Tables
- `meetings`
  - `id` (uuid, primary key)
  - `title` (text, not null) — meeting name/subject
  - `date` (timestamptz, not null) — when the meeting took place
  - `duration_minutes` (integer, not null) — meeting length
  - `participants` (text[], default empty array) — list of participant names
  - `transcript` (text, not null) — the raw meeting transcript
  - `status` (text, default 'pending') — analysis status: pending, completed
  - `summary` (text) — generated summary
  - `key_points` (jsonb, default '[]') — key discussion points
  - `action_items` (jsonb, default '[]') — action items with owner, deadline, status
  - `decisions` (jsonb, default '[]') — decisions made
  - `questions` (jsonb, default '[]') — open questions
  - `topics` (jsonb, default '[]') — topic tags
  - `sentiment` (text) — overall sentiment: positive, neutral, negative
  - `sentiment_score` (real) — sentiment score -1 to 1
  - `talk_ratios` (jsonb, default '{}') — per-participant talk percentage
  - `keywords` (jsonb, default '[]') — extracted keywords
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on `meetings`.
- Allow anon + authenticated CRUD because the data is intentionally shared/public (no sign-in).
*/

CREATE TABLE IF NOT EXISTS meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  date timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 30,
  participants text[] NOT NULL DEFAULT '{}',
  transcript text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  summary text,
  key_points jsonb NOT NULL DEFAULT '[]',
  action_items jsonb NOT NULL DEFAULT '[]',
  decisions jsonb NOT NULL DEFAULT '[]',
  questions jsonb NOT NULL DEFAULT '[]',
  topics jsonb NOT NULL DEFAULT '[]',
  sentiment text,
  sentiment_score real,
  talk_ratios jsonb NOT NULL DEFAULT '{}',
  keywords jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_meetings" ON meetings;
CREATE POLICY "anon_select_meetings" ON meetings FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_meetings" ON meetings;
CREATE POLICY "anon_insert_meetings" ON meetings FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_meetings" ON meetings;
CREATE POLICY "anon_update_meetings" ON meetings FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_meetings" ON meetings;
CREATE POLICY "anon_delete_meetings" ON meetings FOR DELETE
TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings (date DESC);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings (status);
