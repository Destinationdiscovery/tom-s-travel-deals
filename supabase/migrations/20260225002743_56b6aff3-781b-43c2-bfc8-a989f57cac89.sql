
-- Create featured_gear_cards table
CREATE TABLE public.featured_gear_cards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_number integer NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  price text NOT NULL DEFAULT '',
  affiliate_url text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Validation trigger: slot_number must be 1-4
CREATE OR REPLACE FUNCTION public.validate_gear_slot_number()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF NEW.slot_number < 1 OR NEW.slot_number > 4 THEN
    RAISE EXCEPTION 'slot_number must be between 1 and 4';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_gear_slot_number_trigger
  BEFORE INSERT OR UPDATE ON public.featured_gear_cards
  FOR EACH ROW EXECUTE FUNCTION public.validate_gear_slot_number();

-- updated_at trigger
CREATE TRIGGER update_featured_gear_cards_updated_at
  BEFORE UPDATE ON public.featured_gear_cards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.featured_gear_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read featured gear cards"
  ON public.featured_gear_cards FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage featured gear cards"
  ON public.featured_gear_cards FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
