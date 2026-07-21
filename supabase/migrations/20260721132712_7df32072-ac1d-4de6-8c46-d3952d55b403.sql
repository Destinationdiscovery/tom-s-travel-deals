
CREATE TABLE public.social_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL CHECK (platform IN ('tiktok','instagram','youtube')),
  video_url TEXT NOT NULL,
  embed_url TEXT,
  profile_url TEXT,
  thumbnail_url TEXT,
  caption TEXT,
  review_slug TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.social_videos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_videos TO authenticated;
GRANT ALL ON public.social_videos TO service_role;

ALTER TABLE public.social_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active social videos"
  ON public.social_videos FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all social videos"
  ON public.social_videos FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert social videos"
  ON public.social_videos FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update social videos"
  ON public.social_videos FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete social videos"
  ON public.social_videos FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX social_videos_active_sort_idx ON public.social_videos (is_active, sort_order DESC, created_at DESC);
CREATE INDEX social_videos_review_slug_idx ON public.social_videos (review_slug) WHERE review_slug IS NOT NULL;

CREATE TRIGGER update_social_videos_updated_at
  BEFORE UPDATE ON public.social_videos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
