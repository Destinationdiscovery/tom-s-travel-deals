
-- Part A: Add CMS columns to cached_reviews
ALTER TABLE public.cached_reviews
  ADD COLUMN IF NOT EXISTS gallery_urls text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tips text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS best_for text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS ratings jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS date_visited text,
  ADD COLUMN IF NOT EXISTS duration text,
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS full_review text[] DEFAULT '{}';

-- Part C: Create review_views table
CREATE TABLE public.review_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  view_count integer NOT NULL DEFAULT 0,
  last_viewed_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.review_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read review views" ON public.review_views FOR SELECT USING (true);

-- Part C: Create review_reactions table
CREATE TABLE public.review_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  reaction text NOT NULL CHECK (reaction IN ('helpful', 'not_helpful')),
  session_id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (slug, session_id)
);
ALTER TABLE public.review_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read review reactions" ON public.review_reactions FOR SELECT USING (true);

-- Part D: Add interests column to subscribers
ALTER TABLE public.subscribers
  ADD COLUMN IF NOT EXISTS interests text[] DEFAULT '{}';

-- Part E: Create affiliate_clicks table
CREATE TABLE public.affiliate_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  page text NOT NULL,
  position text,
  user_agent text,
  country text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can read affiliate clicks" ON public.affiliate_clicks FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Part F: Create web_vitals table
CREATE TABLE public.web_vitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name text NOT NULL,
  value numeric NOT NULL,
  page text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.web_vitals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can read web vitals" ON public.web_vitals FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
