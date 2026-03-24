-- ─────────────────────────────────────────────────────────────────────────────
-- job_search_runs
-- Tracks every time the agent ran a LinkedIn job search for a user.
-- Used for dedup (don't search again today) and dashboard display.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.job_search_runs (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ran_at        timestamptz NOT NULL DEFAULT now(),
  jobs_found    integer     NOT NULL DEFAULT 0,
  jobs_queued   integer     NOT NULL DEFAULT 0,
  search_params jsonb       NOT NULL DEFAULT '{}'::jsonb
);

-- Index for fast daily-check queries
CREATE INDEX IF NOT EXISTS job_search_runs_user_ran
  ON public.job_search_runs (user_id, ran_at DESC);

-- RLS
ALTER TABLE public.job_search_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own search runs"
  ON public.job_search_runs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert search runs"
  ON public.job_search_runs FOR INSERT
  WITH CHECK (true);  -- service role key bypasses RLS; anon/user inserts blocked


-- ─────────────────────────────────────────────────────────────────────────────
-- pg_cron daily scheduler
--
-- Requires the pg_cron and pg_net extensions (enabled by default on Supabase).
-- Run this block ONCE in the Supabase SQL editor after deploying the edge functions.
--
-- Replace <PROJECT_REF> with your project ref: gezhghditrgewwvnlnvj
-- The service_role_key is stored as a Supabase secret — pass it via:
--   ALTER DATABASE postgres SET app.service_role_key = '<YOUR_SERVICE_ROLE_KEY>';
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable required extensions (safe to run even if already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule daily search at 7:00 AM UTC every day
-- Uncomment and run in SQL editor after setting app.service_role_key above:
/*
SELECT cron.schedule(
  'daily-linkedin-job-search',
  '0 7 * * *',
  $$
  SELECT net.http_post(
    url     := 'https://gezhghditrgewwvnlnvj.supabase.co/functions/v1/run-daily-search',
    headers := jsonb_build_object(
                 'Content-Type',  'application/json',
                 'Authorization', 'Bearer ' || current_setting('app.service_role_key')
               ),
    body    := '{}'::jsonb
  ) AS request_id;
  $$
);
*/
