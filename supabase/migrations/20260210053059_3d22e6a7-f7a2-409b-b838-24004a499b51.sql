
-- Create travel_intel_cache table
CREATE TABLE public.travel_intel_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  intel_type TEXT NOT NULL,
  citizenship TEXT,
  destination TEXT NOT NULL,
  result_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.travel_intel_cache ENABLE ROW LEVEL SECURITY;

-- Public read-only access (same pattern as cached_reviews)
CREATE POLICY "Anyone can read travel intel cache"
ON public.travel_intel_cache
FOR SELECT
USING (true);
