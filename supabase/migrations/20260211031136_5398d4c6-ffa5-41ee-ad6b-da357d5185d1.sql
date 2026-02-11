
-- Lookup table for product keyword → image URL mapping
CREATE TABLE public.gear_product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_keyword text NOT NULL UNIQUE,
  image_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.gear_product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read gear images"
  ON public.gear_product_images FOR SELECT USING (true);

-- Storage bucket for gear product images
INSERT INTO storage.buckets (id, name, public) VALUES ('gear-images', 'gear-images', true);

CREATE POLICY "Public read gear images"
  ON storage.objects FOR SELECT USING (bucket_id = 'gear-images');

CREATE POLICY "Auth users upload gear images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'gear-images' AND auth.role() = 'authenticated');

CREATE POLICY "Auth users delete gear images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'gear-images' AND auth.role() = 'authenticated');
