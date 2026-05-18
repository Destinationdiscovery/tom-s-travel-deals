-- Trip workspace data model
-- Trips: a named container for a logged-in user's plan
CREATE TABLE IF NOT EXISTS public.trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug text NOT NULL,
  trip_name text NOT NULL,
  destination text,
  start_date date,
  end_date date,
  trip_type text CHECK (trip_type IN ('family','couple','solo','group')),
  status text NOT NULL DEFAULT 'planning' CHECK (status IN ('dreaming','planning','booked','completed')),
  notes text,
  share_token uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, slug)
);
CREATE INDEX IF NOT EXISTS trips_user_id_idx ON public.trips(user_id);
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trips_owner_select" ON public.trips FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "trips_owner_insert" ON public.trips FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "trips_owner_update" ON public.trips FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "trips_owner_delete" ON public.trips FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER trips_set_updated_at BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Hotels saved into a trip
CREATE TABLE IF NOT EXISTS public.trip_hotels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  slug text,
  property_name text NOT NULL,
  location text,
  overall_rating numeric,
  ratings jsonb NOT NULL DEFAULT '{}'::jsonb,
  summary text,
  best_for text[] NOT NULL DEFAULT '{}',
  pros text[] NOT NULL DEFAULT '{}',
  cons text[] NOT NULL DEFAULT '{}',
  source_url text,
  top_pick boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS trip_hotels_trip_id_idx ON public.trip_hotels(trip_id);
ALTER TABLE public.trip_hotels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trip_hotels_owner_all" ON public.trip_hotels FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.user_id = auth.uid()));

-- Itinerary days
CREATE TABLE IF NOT EXISTS public.trip_itinerary_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  day_number integer NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (trip_id, day_number)
);
CREATE INDEX IF NOT EXISTS trip_itinerary_days_trip_id_idx ON public.trip_itinerary_days(trip_id);
ALTER TABLE public.trip_itinerary_days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trip_itinerary_owner_all" ON public.trip_itinerary_days FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.user_id = auth.uid()));

-- Packing items
CREATE TABLE IF NOT EXISTS public.trip_packing_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  label text NOT NULL,
  checked boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS trip_packing_items_trip_id_idx ON public.trip_packing_items(trip_id);
ALTER TABLE public.trip_packing_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trip_packing_owner_all" ON public.trip_packing_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.user_id = auth.uid()));

-- Gear items
CREATE TABLE IF NOT EXISTS public.trip_gear_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  product jsonb NOT NULL DEFAULT '{}'::jsonb,
  purchased boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS trip_gear_items_trip_id_idx ON public.trip_gear_items(trip_id);
ALTER TABLE public.trip_gear_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trip_gear_owner_all" ON public.trip_gear_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.user_id = auth.uid()));

-- Logistics (1:1 with trip)
CREATE TABLE IF NOT EXISTS public.trip_logistics (
  trip_id uuid PRIMARY KEY REFERENCES public.trips(id) ON DELETE CASCADE,
  visa jsonb,
  safety jsonb,
  best_time jsonb,
  currency jsonb,
  visa_checked boolean NOT NULL DEFAULT false,
  safety_checked boolean NOT NULL DEFAULT false,
  best_time_confirmed boolean NOT NULL DEFAULT false,
  currency_checked boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.trip_logistics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trip_logistics_owner_all" ON public.trip_logistics FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.user_id = auth.uid()));

CREATE TRIGGER trip_logistics_set_updated_at BEFORE UPDATE ON public.trip_logistics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Public share function: returns the full trip by share_token but never the notes field
CREATE OR REPLACE FUNCTION public.get_shared_trip(_token uuid)
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'trip', jsonb_build_object(
      'id', t.id,
      'slug', t.slug,
      'trip_name', t.trip_name,
      'destination', t.destination,
      'start_date', t.start_date,
      'end_date', t.end_date,
      'trip_type', t.trip_type,
      'status', t.status,
      'created_at', t.created_at,
      'updated_at', t.updated_at
    ),
    'hotels', COALESCE((
      SELECT jsonb_agg(to_jsonb(h.*) ORDER BY h.sort_order, h.created_at)
      FROM public.trip_hotels h WHERE h.trip_id = t.id
    ), '[]'::jsonb),
    'itinerary', COALESCE((
      SELECT jsonb_agg(to_jsonb(d.*) ORDER BY d.day_number)
      FROM public.trip_itinerary_days d WHERE d.trip_id = t.id
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
  WHERE t.share_token = _token
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_shared_trip(uuid) TO anon, authenticated;