
-- Blog posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Travel Tips',
  category_color TEXT NOT NULL DEFAULT 'bg-blue-500',
  hero_image_url TEXT,
  excerpt TEXT,
  author TEXT NOT NULL DEFAULT 'ReviewThenGo',
  date_published TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD'),
  read_time TEXT NOT NULL DEFAULT '5 min read',
  rich_content JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read blog posts"
  ON public.blog_posts FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage blog posts"
  ON public.blog_posts FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Featured deals table
CREATE TABLE public.featured_deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_number INTEGER NOT NULL UNIQUE,
  image_url TEXT NOT NULL,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  affiliate_url TEXT NOT NULL,
  original_price NUMERIC NOT NULL,
  sale_price NUMERIC NOT NULL,
  original_label TEXT NOT NULL,
  sale_label TEXT NOT NULL,
  rating NUMERIC NOT NULL DEFAULT 4.0,
  image_position TEXT DEFAULT 'center',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.featured_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read featured deals"
  ON public.featured_deals FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage featured deals"
  ON public.featured_deals FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Validate slot_number 1-6 via trigger
CREATE OR REPLACE FUNCTION public.validate_slot_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slot_number < 1 OR NEW.slot_number > 6 THEN
    RAISE EXCEPTION 'slot_number must be between 1 and 6';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER validate_featured_deals_slot
  BEFORE INSERT OR UPDATE ON public.featured_deals
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_slot_number();

CREATE TRIGGER update_featured_deals_updated_at
  BEFORE UPDATE ON public.featured_deals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Blog images storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true);

CREATE POLICY "Anyone can view blog images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-images');

CREATE POLICY "Admin can upload blog images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'blog-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can update blog images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'blog-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can delete blog images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'blog-images' AND has_role(auth.uid(), 'admin'::app_role));
