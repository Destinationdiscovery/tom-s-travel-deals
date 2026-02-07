
-- Create cached_reviews table for storing AI-generated reviews
CREATE TABLE public.cached_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  location TEXT,
  property_type TEXT,
  review_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index on property_name for fast lookups
CREATE INDEX idx_cached_reviews_property_name ON public.cached_reviews USING btree (lower(property_name));

-- Enable RLS (public read, edge function writes via service role)
ALTER TABLE public.cached_reviews ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read cached reviews
CREATE POLICY "Anyone can read cached reviews"
ON public.cached_reviews
FOR SELECT
USING (true);

-- Create search_suggestions table for autocomplete
CREATE TABLE public.search_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  property_type TEXT,
  search_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index on name for fast autocomplete lookups
CREATE INDEX idx_search_suggestions_name ON public.search_suggestions USING btree (lower(name));

-- Create unique index on lowercase name to prevent duplicates
CREATE UNIQUE INDEX idx_search_suggestions_name_unique ON public.search_suggestions (lower(name));

-- Enable RLS
ALTER TABLE public.search_suggestions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read suggestions
CREATE POLICY "Anyone can read search suggestions"
ON public.search_suggestions
FOR SELECT
USING (true);
