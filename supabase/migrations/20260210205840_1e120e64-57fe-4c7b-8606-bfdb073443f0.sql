
CREATE TABLE public.gear_intel_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  intel_type TEXT NOT NULL,
  query TEXT NOT NULL,
  result_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.gear_intel_cache DISABLE ROW LEVEL SECURITY;
