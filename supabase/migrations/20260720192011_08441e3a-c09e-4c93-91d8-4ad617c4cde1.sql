ALTER TABLE public.trip_packing_items ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.trip_gear_items ADD COLUMN IF NOT EXISTS notes text;