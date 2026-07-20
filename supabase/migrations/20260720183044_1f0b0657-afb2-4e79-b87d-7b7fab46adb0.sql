
-- trip_logistics: switch primary key so we can have one row per leg
ALTER TABLE public.trip_logistics DROP CONSTRAINT trip_logistics_pkey;
ALTER TABLE public.trip_logistics ADD COLUMN IF NOT EXISTS id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.trip_logistics ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX trip_logistics_trip_no_leg_uniq ON public.trip_logistics(trip_id) WHERE leg_id IS NULL;
CREATE UNIQUE INDEX trip_logistics_leg_uniq ON public.trip_logistics(leg_id) WHERE leg_id IS NOT NULL;

-- trip_itinerary_days: allow same day_number across different legs
ALTER TABLE public.trip_itinerary_days DROP CONSTRAINT trip_itinerary_days_trip_id_day_number_key;
CREATE UNIQUE INDEX trip_itin_trip_day_uniq ON public.trip_itinerary_days(trip_id, day_number) WHERE leg_id IS NULL;
CREATE UNIQUE INDEX trip_itin_leg_day_uniq ON public.trip_itinerary_days(leg_id, day_number) WHERE leg_id IS NOT NULL;
