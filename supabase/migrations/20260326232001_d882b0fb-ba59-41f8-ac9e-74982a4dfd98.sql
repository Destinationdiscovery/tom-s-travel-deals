CREATE TABLE public.page_view_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.page_view_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can read page view events"
  ON public.page_view_events FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_page_view_events_created ON public.page_view_events(created_at DESC);
CREATE INDEX idx_page_view_events_slug ON public.page_view_events(slug);