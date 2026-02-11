-- Fix gear_intel_cache: enable RLS (edge function uses service_role, bypasses RLS)
ALTER TABLE public.gear_intel_cache ENABLE ROW LEVEL SECURITY;

-- Subscribers table already has RLS enabled but no policies.
-- The subscribe edge function uses service_role key which bypasses RLS.
-- No public API access is needed, so having RLS enabled with no policies
-- is the correct secure configuration: blocks all direct API access.
