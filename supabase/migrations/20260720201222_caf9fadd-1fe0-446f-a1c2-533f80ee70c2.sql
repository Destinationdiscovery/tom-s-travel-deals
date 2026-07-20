
ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS public_slug text UNIQUE,
  ADD COLUMN IF NOT EXISTS list_in_gallery boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS hidden_by_admin boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS author_display_name text,
  ADD COLUMN IF NOT EXISTS cover_image_url text,
  ADD COLUMN IF NOT EXISTS view_count int NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS trips_public_gallery_idx
  ON public.trips (published_at DESC)
  WHERE is_published AND list_in_gallery AND NOT hidden_by_admin;

CREATE TABLE IF NOT EXISTS public.trip_hotel_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_hotel_id uuid NOT NULL UNIQUE REFERENCES public.trip_hotels(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  overall_rating numeric(2,1),
  verdict text,
  pros text[] NOT NULL DEFAULT '{}',
  cons text[] NOT NULL DEFAULT '{}',
  notes text,
  stayed_from date,
  stayed_to date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.trip_hotel_reviews TO authenticated;
GRANT SELECT ON public.trip_hotel_reviews TO anon;
GRANT ALL ON public.trip_hotel_reviews TO service_role;

ALTER TABLE public.trip_hotel_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage their hotel reviews"
  ON public.trip_hotel_reviews FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can read reviews on published trips"
  ON public.trip_hotel_reviews FOR SELECT
  TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.trip_hotels th
    JOIN public.trips t ON t.id = th.trip_id
    WHERE th.id = trip_hotel_reviews.trip_hotel_id
      AND t.is_published
      AND NOT t.hidden_by_admin
  ));

CREATE TRIGGER trip_hotel_reviews_updated_at
  BEFORE UPDATE ON public.trip_hotel_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.get_public_trip(_slug text)
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'trip', jsonb_build_object(
      'id', t.id,
      'slug', t.slug,
      'public_slug', t.public_slug,
      'trip_name', t.trip_name,
      'destination', t.destination,
      'start_date', t.start_date,
      'end_date', t.end_date,
      'trip_type', t.trip_type,
      'status', t.status,
      'author_display_name', t.author_display_name,
      'cover_image_url', t.cover_image_url,
      'published_at', t.published_at,
      'view_count', t.view_count
    ),
    'hotels', COALESCE((
      SELECT jsonb_agg(
        to_jsonb(h.*) || jsonb_build_object(
          'personal_review', (SELECT to_jsonb(r.*) FROM public.trip_hotel_reviews r WHERE r.trip_hotel_id = h.id)
        )
        ORDER BY h.sort_order, h.created_at
      )
      FROM public.trip_hotels h WHERE h.trip_id = t.id
    ), '[]'::jsonb),
    'itinerary', COALESCE((
      SELECT jsonb_agg(to_jsonb(d.*) ORDER BY d.day_number)
      FROM public.trip_itinerary_days d WHERE d.trip_id = t.id
    ), '[]'::jsonb),
    'legs', COALESCE((
      SELECT jsonb_agg(to_jsonb(l.*) ORDER BY l.leg_number)
      FROM public.trip_legs l WHERE l.trip_id = t.id
    ), '[]'::jsonb),
    'transit', COALESCE((
      SELECT jsonb_agg(to_jsonb(tr.*))
      FROM public.trip_transit tr WHERE tr.trip_id = t.id
    ), '[]'::jsonb),
    'packing', COALESCE((
      SELECT jsonb_agg(to_jsonb(p.*) ORDER BY p.sort_order, p.created_at)
      FROM public.trip_packing_items p WHERE p.trip_id = t.id
    ), '[]'::jsonb),
    'gear', COALESCE((
      SELECT jsonb_agg(to_jsonb(g.*) ORDER BY g.created_at)
      FROM public.trip_gear_items g WHERE g.trip_id = t.id
    ), '[]'::jsonb),
    'logistics', (SELECT to_jsonb(l.*) FROM public.trip_logistics l WHERE l.trip_id = t.id)
  )
  FROM public.trips t
  WHERE t.public_slug = _slug
    AND t.is_published
    AND NOT t.hidden_by_admin
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_trip(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.list_public_trips(_limit int DEFAULT 24, _offset int DEFAULT 0, _destination text DEFAULT NULL)
RETURNS TABLE(
  id uuid,
  public_slug text,
  trip_name text,
  destination text,
  start_date date,
  end_date date,
  trip_type text,
  cover_image_url text,
  author_display_name text,
  published_at timestamptz,
  view_count int,
  hotel_count bigint
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT t.id, t.public_slug, t.trip_name, t.destination, t.start_date, t.end_date,
         t.trip_type, t.cover_image_url, t.author_display_name, t.published_at, t.view_count,
         (SELECT count(*) FROM public.trip_hotels h WHERE h.trip_id = t.id) AS hotel_count
  FROM public.trips t
  WHERE t.is_published
    AND t.list_in_gallery
    AND NOT t.hidden_by_admin
    AND (_destination IS NULL OR t.destination ILIKE '%' || _destination || '%')
  ORDER BY t.published_at DESC NULLS LAST
  LIMIT _limit OFFSET _offset;
$$;

GRANT EXECUTE ON FUNCTION public.list_public_trips(int, int, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.increment_trip_view(_slug text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.trips SET view_count = view_count + 1
  WHERE public_slug = _slug AND is_published AND NOT hidden_by_admin;
$$;

GRANT EXECUTE ON FUNCTION public.increment_trip_view(text) TO anon, authenticated;
