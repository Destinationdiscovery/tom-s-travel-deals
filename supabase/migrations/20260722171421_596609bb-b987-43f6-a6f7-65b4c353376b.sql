
-- FEATURED PACKING LISTS
CREATE TABLE public.featured_packing_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  cover_image_url text,
  source text NOT NULL DEFAULT 'curated',
  source_trip_id uuid REFERENCES public.trips(id) ON DELETE SET NULL,
  season text,
  trip_types text[] DEFAULT '{}'::text[],
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  sort_order integer NOT NULL DEFAULT 0,
  view_count integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.featured_packing_lists TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.featured_packing_lists TO authenticated;
GRANT ALL ON public.featured_packing_lists TO service_role;

ALTER TABLE public.featured_packing_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published packing lists"
  ON public.featured_packing_lists FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can view all packing lists"
  ON public.featured_packing_lists FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert packing lists"
  ON public.featured_packing_lists FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update packing lists"
  ON public.featured_packing_lists FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete packing lists"
  ON public.featured_packing_lists FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_featured_packing_lists_updated_at
  BEFORE UPDATE ON public.featured_packing_lists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- FEATURED PACKING LIST ITEMS
CREATE TABLE public.featured_packing_list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL REFERENCES public.featured_packing_lists(id) ON DELETE CASCADE,
  label text NOT NULL,
  category text,
  quantity integer DEFAULT 1,
  notes text,
  amazon_url text,
  image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.featured_packing_list_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.featured_packing_list_items TO authenticated;
GRANT ALL ON public.featured_packing_list_items TO service_role;

ALTER TABLE public.featured_packing_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view items of published lists"
  ON public.featured_packing_list_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.featured_packing_lists l
    WHERE l.id = list_id AND l.is_published = true
  ));

CREATE POLICY "Admins can view all list items"
  ON public.featured_packing_list_items FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert list items"
  ON public.featured_packing_list_items FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update list items"
  ON public.featured_packing_list_items FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete list items"
  ON public.featured_packing_list_items FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_featured_packing_list_items_list ON public.featured_packing_list_items(list_id);

-- FEATURED GEAR REVIEWS
CREATE TABLE public.featured_gear_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  product_name text NOT NULL,
  brand text,
  category text,
  hero_image_url text,
  rating numeric(2,1) CHECK (rating >= 0 AND rating <= 5),
  pros text[] DEFAULT '{}'::text[],
  cons text[] DEFAULT '{}'::text[],
  notes text,
  used_on text,
  first_used_at date,
  affiliate_url text,
  price_range text,
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  sort_order integer NOT NULL DEFAULT 0,
  view_count integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.featured_gear_reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.featured_gear_reviews TO authenticated;
GRANT ALL ON public.featured_gear_reviews TO service_role;

ALTER TABLE public.featured_gear_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published gear reviews"
  ON public.featured_gear_reviews FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can view all gear reviews"
  ON public.featured_gear_reviews FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert gear reviews"
  ON public.featured_gear_reviews FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update gear reviews"
  ON public.featured_gear_reviews FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete gear reviews"
  ON public.featured_gear_reviews FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_featured_gear_reviews_updated_at
  BEFORE UPDATE ON public.featured_gear_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SOCIAL VIDEOS: featured flag
ALTER TABLE public.social_videos
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;
