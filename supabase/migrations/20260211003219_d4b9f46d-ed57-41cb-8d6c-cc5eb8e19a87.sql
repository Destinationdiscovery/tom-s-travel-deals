-- Enable RLS on subscribers (may already be enabled, safe to re-run)
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Allow edge functions (service_role) to insert subscribers
CREATE POLICY "Service role can insert subscribers"
  ON public.subscribers
  FOR INSERT
  WITH CHECK (true);

-- Allow edge functions (service_role) to select subscribers
CREATE POLICY "Service role can select subscribers"
  ON public.subscribers
  FOR SELECT
  USING (true);

-- Note: The above policies apply to all roles, but since there are no
-- public-facing SELECT/INSERT needs beyond the edge function (which uses
-- service_role key and bypasses RLS), we restrict to authenticated only
-- and rely on the edge function's service_role to manage data.

-- Actually, let's be more restrictive: only authenticated users can subscribe themselves
DROP POLICY IF EXISTS "Service role can insert subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "Service role can select subscribers" ON public.subscribers;

-- Edge functions using service_role key bypass RLS entirely, so we don't need policies for them.
-- We just need to make sure no anonymous/public access exists.
-- No SELECT policy = no one can read emails via the API (service_role bypasses RLS)
-- INSERT policy for authenticated users only (optional, since subscribe function uses service_role)
