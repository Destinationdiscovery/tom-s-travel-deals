ALTER TABLE public.featured_packing_lists ADD COLUMN IF NOT EXISTS narrative TEXT;
ALTER TABLE public.featured_packing_lists ADD COLUMN IF NOT EXISTS source_query TEXT;