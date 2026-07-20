
-- Add multi-destination support
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS is_multi_destination boolean NOT NULL DEFAULT false;

-- Legs table
CREATE TABLE public.trip_legs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  leg_number integer NOT NULL,
  name text NOT NULL,
  destination text,
  start_date date,
  end_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trip_legs TO authenticated;
GRANT ALL ON public.trip_legs TO service_role;
ALTER TABLE public.trip_legs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner manages trip_legs" ON public.trip_legs FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.user_id = auth.uid()));
CREATE INDEX trip_legs_trip_id_idx ON public.trip_legs(trip_id, leg_number);
CREATE TRIGGER trip_legs_updated BEFORE UPDATE ON public.trip_legs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Attach leg_id to child rows
ALTER TABLE public.trip_hotels ADD COLUMN IF NOT EXISTS leg_id uuid REFERENCES public.trip_legs(id) ON DELETE CASCADE;
ALTER TABLE public.trip_itinerary_days ADD COLUMN IF NOT EXISTS leg_id uuid REFERENCES public.trip_legs(id) ON DELETE CASCADE;
ALTER TABLE public.trip_packing_items ADD COLUMN IF NOT EXISTS leg_id uuid REFERENCES public.trip_legs(id) ON DELETE CASCADE;
ALTER TABLE public.trip_gear_items ADD COLUMN IF NOT EXISTS leg_id uuid REFERENCES public.trip_legs(id) ON DELETE CASCADE;
ALTER TABLE public.trip_logistics ADD COLUMN IF NOT EXISTS leg_id uuid REFERENCES public.trip_legs(id) ON DELETE CASCADE;

-- Transit cache
CREATE TABLE public.trip_transit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  from_leg_id uuid NOT NULL REFERENCES public.trip_legs(id) ON DELETE CASCADE,
  to_leg_id uuid NOT NULL REFERENCES public.trip_legs(id) ON DELETE CASCADE,
  distance_meters integer,
  duration_seconds integer,
  mode text NOT NULL DEFAULT 'DRIVE',
  from_address text,
  to_address text,
  options jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (from_leg_id, to_leg_id, mode)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trip_transit TO authenticated;
GRANT ALL ON public.trip_transit TO service_role;
ALTER TABLE public.trip_transit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner manages trip_transit" ON public.trip_transit FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.user_id = auth.uid()));

-- Delete old trips as requested (cached_reviews, travel_intel_cache, tool_search_cache are untouched)
DELETE FROM public.trips;
