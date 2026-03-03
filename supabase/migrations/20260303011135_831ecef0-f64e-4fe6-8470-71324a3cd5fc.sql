
-- Create featured_reviews table for the 4 homepage review card slots
CREATE TABLE public.featured_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_number integer NOT NULL,
  property_name text NOT NULL,
  location text,
  slug text NOT NULL,
  rating numeric DEFAULT 4.0,
  summary text,
  image_url text,
  affiliate_url text,
  sale_label text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(slot_number)
);

-- Validation trigger for slot_number 1-4
CREATE OR REPLACE FUNCTION public.validate_review_slot_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.slot_number < 1 OR NEW.slot_number > 4 THEN
    RAISE EXCEPTION 'slot_number must be between 1 and 4';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_featured_review_slot
BEFORE INSERT OR UPDATE ON public.featured_reviews
FOR EACH ROW EXECUTE FUNCTION public.validate_review_slot_number();

-- Auto-update updated_at
CREATE TRIGGER update_featured_reviews_updated_at
BEFORE UPDATE ON public.featured_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.featured_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage featured_reviews"
ON public.featured_reviews FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public read featured_reviews"
ON public.featured_reviews FOR SELECT TO anon
USING (true);
