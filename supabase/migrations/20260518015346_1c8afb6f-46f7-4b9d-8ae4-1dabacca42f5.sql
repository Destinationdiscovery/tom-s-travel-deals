
CREATE TABLE public.tool_search_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_name text NOT NULL,
  cache_key text NOT NULL,
  query text NOT NULL,
  result_data jsonb NOT NULL,
  hit_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  CONSTRAINT tool_search_cache_unique UNIQUE (tool_name, cache_key)
);

CREATE INDEX idx_tool_search_cache_expires ON public.tool_search_cache (expires_at);
CREATE INDEX idx_tool_search_cache_lookup ON public.tool_search_cache (tool_name, cache_key, expires_at);

ALTER TABLE public.tool_search_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tool search cache"
  ON public.tool_search_cache
  FOR SELECT
  USING (true);
