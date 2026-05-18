CREATE TABLE public.tool_search_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_name text NOT NULL,
  query text,
  cache_hit boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_tool_search_events_tool_created ON public.tool_search_events (tool_name, created_at DESC);
CREATE INDEX idx_tool_search_events_created ON public.tool_search_events (created_at DESC);

ALTER TABLE public.tool_search_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can read tool search events"
ON public.tool_search_events
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));