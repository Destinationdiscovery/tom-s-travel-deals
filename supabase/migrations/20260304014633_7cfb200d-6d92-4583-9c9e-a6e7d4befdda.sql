
-- Create banner_deals table for 2 promotional banner slots
CREATE TABLE public.banner_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_number INTEGER NOT NULL UNIQUE,
  image_url TEXT NOT NULL,
  affiliate_url TEXT NOT NULL,
  sale_label TEXT,
  alt_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Validation trigger for slot_number (1-2 only)
CREATE OR REPLACE FUNCTION public.validate_banner_slot_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.slot_number < 1 OR NEW.slot_number > 2 THEN
    RAISE EXCEPTION 'slot_number must be between 1 and 2';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_banner_slot
  BEFORE INSERT OR UPDATE ON public.banner_deals
  FOR EACH ROW EXECUTE FUNCTION public.validate_banner_slot_number();

-- Auto-update updated_at
CREATE TRIGGER update_banner_deals_updated_at
  BEFORE UPDATE ON public.banner_deals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.banner_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read banner deals"
  ON public.banner_deals FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage banner deals"
  ON public.banner_deals FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
