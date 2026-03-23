-- Add LinkedIn Agent fields to user_profiles
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS cv_text text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS job_preferences jsonb DEFAULT '{}'::jsonb;

-- Add HITL approval fields + easy_apply flag to agent_workflows
-- (stored inside workflow_data jsonb — no schema change needed)

COMMENT ON COLUMN public.user_profiles.cv_text IS 'Plain-text CV content used by AI agents for fit analysis and tailoring';
COMMENT ON COLUMN public.user_profiles.linkedin_url IS 'User LinkedIn profile URL';
COMMENT ON COLUMN public.user_profiles.job_preferences IS 'JSON: { target_role, location, keywords, easy_apply_only, daily_limit }';
